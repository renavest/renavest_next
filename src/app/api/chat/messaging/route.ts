import { auth } from '@clerk/nextjs/server';
import { eq, and, desc } from 'drizzle-orm';
import { NextRequest, NextResponse } from 'next/server';

import { db } from '@/src/db';
import { therapists, users, chatChannels, chatMessages } from '@/src/db/schema';

import { broadcastNewMessage, broadcastChannelCreated } from '../ws/route';

// Feature flag check
const CHAT_FEATURE_ENABLED = process.env.NEXT_PUBLIC_ENABLE_CHAT_FEATURE === 'true';

// Type definitions for request bodies
interface CreateChannelBody {
  therapistId: number;
  prospectUserId: number;
  channelName?: string;
}

interface SendMessageBody {
  channelId: number;
  content: string;
  messageType?: string;
}

interface GetMessagesBody {
  channelId: number;
  maxResults?: number;
  lastMessageId?: number;
}

export async function POST(request: NextRequest) {
  if (!CHAT_FEATURE_ENABLED) {
    return NextResponse.json({ error: 'Chat feature is not enabled' }, { status: 404 });
  }

  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { action } = body;

    switch (action) {
      case 'create_channel':
        return await createChannel(body as CreateChannelBody, userId);
      case 'send_message':
        return await sendMessage(body as SendMessageBody, userId);
      case 'get_messages':
        return await getChannelMessages(body as GetMessagesBody, userId);
      case 'list_channels':
        return await listUserChannels(userId);
      case 'mark_read':
        return await markMessagesAsRead(body as { channelId: number }, userId);
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

async function createChannel(body: CreateChannelBody, userId: string) {
  const { therapistId, prospectUserId } = body;

  try {
    // Verify the user is authorized (either therapist or the prospect)
    const user = await db.select().from(users).where(eq(users.clerkId, userId)).limit(1);
    if (!user.length) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const dbUserId = user[0].id;

    // Check if user is the therapist
    const therapist = await db
      .select()
      .from(therapists)
      .where(eq(therapists.userId, dbUserId))
      .limit(1);
    const isTherapist = therapist.length > 0 && therapist[0].id === therapistId;
    const isProspect = dbUserId === prospectUserId;

    if (!isTherapist && !isProspect) {
      return NextResponse.json({ error: 'Not authorized to create this channel' }, { status: 403 });
    }

    // Check if channel already exists
    const existingChannel = await db
      .select()
      .from(chatChannels)
      .where(
        and(
          eq(chatChannels.therapistId, therapistId),
          eq(chatChannels.prospectUserId, prospectUserId),
        ),
      )
      .limit(1);

    if (existingChannel.length > 0) {
      return NextResponse.json({
        success: true,
        channelId: existingChannel[0].id,
        message: 'Channel already exists',
      });
    }

    // Create new channel
    const channelIdentifier = `therapy_${therapistId}_${prospectUserId}_${Date.now()}`;

    const newChannel = await db
      .insert(chatChannels)
      .values({
        chimeChannelArn: channelIdentifier,
        therapistId,
        prospectUserId,
        status: 'active',
        lastMessageAt: new Date(),
        lastMessagePreview: '',
        unreadCountTherapist: 0,
        unreadCountProspect: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();

    // Get channel details for broadcasting
    const channelDetails = await getChannelDetails(newChannel[0].id);

    // Broadcast channel creation to both participants
    const participantIds = await getChannelParticipantIds(therapistId, prospectUserId);
    await broadcastChannelCreated(channelDetails, participantIds);

    return NextResponse.json({
      success: true,
      channelId: newChannel[0].id,
      channel: channelDetails,
    });
  } catch (error) {
    console.error('Failed to create channel:', error);
    return NextResponse.json({ error: 'Failed to create channel' }, { status: 500 });
  }
}

async function sendMessage(body: SendMessageBody, userId: string) {
  const { channelId, content, messageType = 'STANDARD' } = body;

  try {
    // Get channel and verify user access
    const channel = await db
      .select({
        id: chatChannels.id,
        therapistId: chatChannels.therapistId,
        prospectUserId: chatChannels.prospectUserId,
      })
      .from(chatChannels)
      .where(eq(chatChannels.id, channelId))
      .limit(1);

    if (!channel.length) {
      return NextResponse.json({ error: 'Channel not found' }, { status: 404 });
    }

    // Get user info
    const user = await db.select().from(users).where(eq(users.clerkId, userId)).limit(1);
    if (!user.length) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const dbUserId = user[0].id;

    // Check if user is therapist
    const therapist = await db
      .select()
      .from(therapists)
      .where(eq(therapists.userId, dbUserId))
      .limit(1);
    const isTherapist = therapist.length > 0 && therapist[0].id === channel[0].therapistId;
    const isProspect = dbUserId === channel[0].prospectUserId;

    if (!isTherapist && !isProspect) {
      return NextResponse.json(
        { error: 'Not authorized to send messages in this channel' },
        { status: 403 },
      );
    }

    // Create message
    const messageId = `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const newMessage = await db
      .insert(chatMessages)
      .values({
        chimeMessageId: messageId,
        channelId,
        senderId: dbUserId,
        content,
        messageType,
        status: 'sent',
        sentAt: new Date(),
        createdAt: new Date(),
      })
      .returning();

    // Update channel last message info and unread counts
    const updateData: {
      lastMessageAt: Date;
      lastMessagePreview: string;
      updatedAt: Date;
      unreadCountProspect?: number;
      unreadCountTherapist?: number;
    } = {
      lastMessageAt: new Date(),
      lastMessagePreview: content.substring(0, 100),
      updatedAt: new Date(),
    };

    // Get current unread counts and increment for the other person
    const currentChannel = await db
      .select({
        unreadCountTherapist: chatChannels.unreadCountTherapist,
        unreadCountProspect: chatChannels.unreadCountProspect,
      })
      .from(chatChannels)
      .where(eq(chatChannels.id, channelId))
      .limit(1);

    if (currentChannel.length > 0) {
      if (isTherapist) {
        updateData.unreadCountProspect = currentChannel[0].unreadCountProspect + 1;
      } else {
        updateData.unreadCountTherapist = currentChannel[0].unreadCountTherapist + 1;
      }
    }

    await db.update(chatChannels).set(updateData).where(eq(chatChannels.id, channelId));

    // Get sender details for broadcasting
    const senderDetails = await db
      .select({
        id: users.id,
        firstName: users.firstName,
        lastName: users.lastName,
        email: users.email,
      })
      .from(users)
      .where(eq(users.id, dbUserId))
      .limit(1);

    // Create message object for broadcasting
    const messageForBroadcast = {
      id: newMessage[0].id,
      messageId: newMessage[0].chimeMessageId,
      senderId: newMessage[0].senderId,
      content: newMessage[0].content,
      messageType: newMessage[0].messageType,
      status: newMessage[0].status,
      sentAt: newMessage[0].sentAt.toISOString(),
      senderFirstName: senderDetails[0]?.firstName || '',
      senderLastName: senderDetails[0]?.lastName || '',
      senderEmail: senderDetails[0]?.email || '',
    };

    // Broadcast message to channel participants via WebSocket
    await broadcastNewMessage(channelId, messageForBroadcast);

    return NextResponse.json({
      success: true,
      messageId: newMessage[0].chimeMessageId,
      message: messageForBroadcast,
    });
  } catch (error) {
    console.error('Failed to send message:', error);
    return NextResponse.json({ error: 'Failed to send message' }, { status: 500 });
  }
}

async function getChannelMessages(body: GetMessagesBody, userId: string) {
  const { channelId, maxResults = 50 } = body;

  try {
    // Verify user access to channel
    const hasAccess = await verifyChannelAccess(channelId, userId);
    if (!hasAccess) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Get messages with sender details
    const messages = await db
      .select({
        id: chatMessages.id,
        messageId: chatMessages.chimeMessageId,
        senderId: chatMessages.senderId,
        content: chatMessages.content,
        messageType: chatMessages.messageType,
        status: chatMessages.status,
        sentAt: chatMessages.sentAt,
        senderFirstName: users.firstName,
        senderLastName: users.lastName,
        senderEmail: users.email,
      })
      .from(chatMessages)
      .innerJoin(users, eq(chatMessages.senderId, users.id))
      .where(eq(chatMessages.channelId, channelId))
      .orderBy(desc(chatMessages.sentAt))
      .limit(maxResults);

    // Reverse to get chronological order
    const chronologicalMessages = messages.reverse().map((msg) => ({
      ...msg,
      sentAt: msg.sentAt.toISOString(),
      senderFirstName: msg.senderFirstName || '',
      senderLastName: msg.senderLastName || '',
      senderEmail: msg.senderEmail || '',
    }));

    return NextResponse.json({
      success: true,
      messages: chronologicalMessages,
    });
  } catch (error) {
    console.error('Failed to get messages:', error);
    return NextResponse.json({ error: 'Failed to retrieve messages' }, { status: 500 });
  }
}

async function listUserChannels(userId: string) {
  try {
    const user = await db.select().from(users).where(eq(users.clerkId, userId)).limit(1);
    if (!user.length) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const dbUserId = user[0].id;

    // Check if user is a therapist
    const therapist = await db
      .select()
      .from(therapists)
      .where(eq(therapists.userId, dbUserId))
      .limit(1);
    const therapistId = therapist.length > 0 ? therapist[0].id : null;

    // Get channels with detailed information
    const channels = await getChannelsWithDetails(therapistId, dbUserId);

    return NextResponse.json({
      success: true,
      channels,
    });
  } catch (error) {
    console.error('Failed to list channels:', error);
    return NextResponse.json({ error: 'Failed to retrieve channels' }, { status: 500 });
  }
}

async function markMessagesAsRead(body: { channelId: number }, userId: string) {
  const { channelId } = body;

  try {
    // Verify user access to channel
    const hasAccess = await verifyChannelAccess(channelId, userId);
    if (!hasAccess) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Get user ID and check role
    const user = await db.select().from(users).where(eq(users.clerkId, userId)).limit(1);
    if (!user.length) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const dbUserId = user[0].id;
    const therapist = await db
      .select()
      .from(therapists)
      .where(eq(therapists.userId, dbUserId))
      .limit(1);
    const isTherapist = therapist.length > 0;

    // Reset the appropriate unread count
    const updateData = isTherapist
      ? { unreadCountTherapist: 0, updatedAt: new Date() }
      : { unreadCountProspect: 0, updatedAt: new Date() };

    await db.update(chatChannels).set(updateData).where(eq(chatChannels.id, channelId));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to mark messages as read:', error);
    return NextResponse.json({ error: 'Failed to mark messages as read' }, { status: 500 });
  }
}

// Helper functions
async function verifyChannelAccess(channelId: number, userId: string): Promise<boolean> {
  try {
    const user = await db.select().from(users).where(eq(users.clerkId, userId)).limit(1);
    if (!user.length) return false;

    const dbUserId = user[0].id;
    const therapist = await db
      .select()
      .from(therapists)
      .where(eq(therapists.userId, dbUserId))
      .limit(1);
    const therapistId = therapist.length > 0 ? therapist[0].id : null;

    const channel = await db
      .select()
      .from(chatChannels)
      .where(
        and(
          eq(chatChannels.id, channelId),
          therapistId
            ? eq(chatChannels.therapistId, therapistId)
            : eq(chatChannels.prospectUserId, dbUserId),
        ),
      )
      .limit(1);

    return channel.length > 0;
  } catch (error) {
    console.error('Error verifying channel access:', error);
    return false;
  }
}

async function getChannelsWithDetails(therapistId: number | null, userId: number) {
  // Get channels based on user role
  const channels = await db
    .select({
      id: chatChannels.id,
      channelIdentifier: chatChannels.chimeChannelArn,
      therapistId: chatChannels.therapistId,
      prospectUserId: chatChannels.prospectUserId,
      status: chatChannels.status,
      lastMessageAt: chatChannels.lastMessageAt,
      lastMessagePreview: chatChannels.lastMessagePreview,
      unreadCount: therapistId
        ? chatChannels.unreadCountTherapist
        : chatChannels.unreadCountProspect,
    })
    .from(chatChannels)
    .where(
      therapistId
        ? eq(chatChannels.therapistId, therapistId)
        : eq(chatChannels.prospectUserId, userId),
    );

  // Add therapist/prospect details to each channel
  const channelsWithDetails = await Promise.all(
    channels.map(async (channel) => {
      const therapistDetails = await getTherapistDetails(channel.therapistId);
      const prospectDetails = await getProspectDetails(channel.prospectUserId);

      return {
        ...channel,
        lastMessageAt: channel.lastMessageAt?.toISOString() || '',
        therapistName: therapistDetails?.name || '',
        therapistTitle: therapistDetails?.title || '',
        prospectFirstName: prospectDetails?.firstName || '',
        prospectLastName: prospectDetails?.lastName || '',
        prospectEmail: prospectDetails?.email || '',
      };
    }),
  );

  return channelsWithDetails;
}

async function getTherapistDetails(therapistId: number) {
  const therapist = await db
    .select({
      name: therapists.name,
      title: therapists.title,
    })
    .from(therapists)
    .where(eq(therapists.id, therapistId))
    .limit(1);

  return therapist.length > 0 ? therapist[0] : null;
}

async function getProspectDetails(prospectUserId: number) {
  const prospect = await db
    .select({
      firstName: users.firstName,
      lastName: users.lastName,
      email: users.email,
    })
    .from(users)
    .where(eq(users.id, prospectUserId))
    .limit(1);

  return prospect.length > 0 ? prospect[0] : null;
}

async function getChannelDetails(channelId: number) {
  const channel = await db
    .select()
    .from(chatChannels)
    .where(eq(chatChannels.id, channelId))
    .limit(1);

  if (!channel.length) return null;

  const therapistDetails = await getTherapistDetails(channel[0].therapistId);
  const prospectDetails = await getProspectDetails(channel[0].prospectUserId);

  return {
    ...channel[0],
    therapistName: therapistDetails?.name || '',
    therapistTitle: therapistDetails?.title || '',
    prospectFirstName: prospectDetails?.firstName || '',
    prospectLastName: prospectDetails?.lastName || '',
    prospectEmail: prospectDetails?.email || '',
  };
}

async function getChannelParticipantIds(
  therapistId: number,
  prospectUserId: number,
): Promise<string[]> {
  const participantIds: string[] = [];

  // Get therapist user ID
  const therapist = await db
    .select({ userId: therapists.userId })
    .from(therapists)
    .where(eq(therapists.id, therapistId))
    .limit(1);

  if (therapist.length) {
    const therapistUser = await db
      .select({ clerkId: users.clerkId })
      .from(users)
      .where(eq(users.id, therapist[0].userId))
      .limit(1);

    if (therapistUser.length) {
      participantIds.push(therapistUser[0].clerkId);
    }
  }

  // Get prospect user ID
  const prospectUser = await db
    .select({ clerkId: users.clerkId })
    .from(users)
    .where(eq(users.id, prospectUserId))
    .limit(1);

  if (prospectUser.length) {
    participantIds.push(prospectUser[0].clerkId);
  }

  return participantIds;
}
