import { auth } from '@clerk/nextjs/server';
import { eq, and, desc, isNull } from 'drizzle-orm';
import { NextRequest, NextResponse } from 'next/server';

import { db } from '@/src/db';
import { therapists, users, chatChannels, chatMessages } from '@/src/db/schema';

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
  try {
    // Feature flag check
    if (!CHAT_FEATURE_ENABLED) {
      return NextResponse.json(
        {
          error: 'Chat feature is not currently available',
        },
        { status: 503 },
      );
    }

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
      case 'list_channels':
        return await listChannels(userId);
      case 'get_messages':
        return await getChannelMessages(body as GetMessagesBody, userId);
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

    const therapist = await db
      .select()
      .from(therapists)
      .where(eq(therapists.id, therapistId))
      .limit(1);

    if (!therapist.length) {
      return NextResponse.json({ error: 'Therapist not found' }, { status: 404 });
    }

    const prospect = await db.select().from(users).where(eq(users.id, prospectUserId)).limit(1);

    if (!prospect.length) {
      return NextResponse.json({ error: 'Prospect not found' }, { status: 404 });
    }

    // Verify user is either the therapist or the prospect
    const isTherapist = therapist[0].userId === user[0].id;
    const isProspect = prospect[0].id === user[0].id;

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

    // Create channel with simple identifier
    const channelIdentifier = `channel-${therapistId}-${prospectUserId}-${Date.now()}`;
    const [newChannel] = await db
      .insert(chatChannels)
      .values({
        chimeChannelArn: channelIdentifier, // Repurpose this field as simple channel identifier
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

    return NextResponse.json({
      success: true,
      channelId: newChannel.id,
      channelIdentifier: channelIdentifier,
      message: 'Channel created successfully',
    });
  } catch (error) {
    console.error('Error creating channel:', error);
    return NextResponse.json({ error: 'Failed to create channel' }, { status: 500 });
  }
}

async function sendMessage(body: SendMessageBody, userId: string) {
  const { channelId, content, messageType = 'STANDARD' } = body;

  try {
    // Get channel info and verify access
    const channel = await db
      .select({
        id: chatChannels.id,
        therapistId: chatChannels.therapistId,
        prospectUserId: chatChannels.prospectUserId,
        status: chatChannels.status,
        unreadCountTherapist: chatChannels.unreadCountTherapist,
        unreadCountProspect: chatChannels.unreadCountProspect,
      })
      .from(chatChannels)
      .where(eq(chatChannels.id, channelId))
      .limit(1);

    if (!channel.length) {
      return NextResponse.json({ error: 'Channel not found' }, { status: 404 });
    }

    if (channel[0].status !== 'active') {
      return NextResponse.json({ error: 'Channel is not active' }, { status: 400 });
    }

    // Get user info and verify they are part of this channel
    const user = await db.select().from(users).where(eq(users.clerkId, userId)).limit(1);

    if (!user.length) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check if user is therapist
    const therapist = await db
      .select()
      .from(therapists)
      .where(eq(therapists.userId, user[0].id))
      .limit(1);

    const isTherapist = therapist.length > 0 && therapist[0].id === channel[0].therapistId;
    const isProspect = user[0].id === channel[0].prospectUserId;

    if (!isTherapist && !isProspect) {
      return NextResponse.json(
        { error: 'Not authorized to send messages in this channel' },
        { status: 403 },
      );
    }

    // Save message to database
    const [newMessage] = await db
      .insert(chatMessages)
      .values({
        channelId: channel[0].id,
        chimeMessageId: `msg-${Date.now()}-${user[0].id}`, // Simple message identifier
        senderId: user[0].id,
        content,
        messageType,
        status: 'sent',
        sentAt: new Date(),
        createdAt: new Date(),
      })
      .returning();

    // Update channel with last message info and unread counts
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

    // Increment unread count for the other person
    if (isTherapist) {
      updateData.unreadCountProspect = channel[0].unreadCountProspect + 1;
    } else {
      updateData.unreadCountTherapist = channel[0].unreadCountTherapist + 1;
    }

    await db.update(chatChannels).set(updateData).where(eq(chatChannels.id, channelId));

    return NextResponse.json({
      success: true,
      messageId: newMessage.id,
      message: newMessage,
    });
  } catch (error) {
    console.error('Error sending message:', error);
    return NextResponse.json({ error: 'Failed to send message' }, { status: 500 });
  }
}

async function listChannels(userId: string) {
  try {
    // Get user info
    const user = await db.select().from(users).where(eq(users.clerkId, userId)).limit(1);

    if (!user.length) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check if user is a therapist
    const therapist = await db
      .select()
      .from(therapists)
      .where(eq(therapists.userId, user[0].id))
      .limit(1);

    let userChannels;

    if (therapist.length > 0) {
      // User is a therapist - get channels where they are the therapist
      userChannels = await db
        .select({
          id: chatChannels.id,
          channelIdentifier: chatChannels.chimeChannelArn,
          therapistId: chatChannels.therapistId,
          prospectUserId: chatChannels.prospectUserId,
          status: chatChannels.status,
          lastMessageAt: chatChannels.lastMessageAt,
          lastMessagePreview: chatChannels.lastMessagePreview,
          unreadCount: chatChannels.unreadCountTherapist,
          prospectFirstName: users.firstName,
          prospectLastName: users.lastName,
          prospectEmail: users.email,
        })
        .from(chatChannels)
        .leftJoin(users, eq(chatChannels.prospectUserId, users.id))
        .where(eq(chatChannels.therapistId, therapist[0].id))
        .orderBy(desc(chatChannels.lastMessageAt));
    } else {
      // User is a prospect - get channels where they are the prospect
      userChannels = await db
        .select({
          id: chatChannels.id,
          channelIdentifier: chatChannels.chimeChannelArn,
          therapistId: chatChannels.therapistId,
          prospectUserId: chatChannels.prospectUserId,
          status: chatChannels.status,
          lastMessageAt: chatChannels.lastMessageAt,
          lastMessagePreview: chatChannels.lastMessagePreview,
          unreadCount: chatChannels.unreadCountProspect,
          therapistName: therapists.name,
          therapistTitle: therapists.title,
        })
        .from(chatChannels)
        .leftJoin(therapists, eq(chatChannels.therapistId, therapists.id))
        .where(eq(chatChannels.prospectUserId, user[0].id))
        .orderBy(desc(chatChannels.lastMessageAt));
    }

    return NextResponse.json({
      channels: userChannels,
      userRole: therapist.length > 0 ? 'therapist' : 'prospect',
    });
  } catch (error) {
    console.error('Error listing channels:', error);
    return NextResponse.json({ error: 'Failed to list channels' }, { status: 500 });
  }
}

async function getChannelMessages(body: GetMessagesBody, userId: string) {
  const { channelId, maxResults = 50 } = body;

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

    // Get user info and verify access
    const user = await db.select().from(users).where(eq(users.clerkId, userId)).limit(1);

    if (!user.length) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check if user is therapist
    const therapist = await db
      .select()
      .from(therapists)
      .where(eq(therapists.userId, user[0].id))
      .limit(1);

    const isTherapist = therapist.length > 0 && therapist[0].id === channel[0].therapistId;
    const isProspect = user[0].id === channel[0].prospectUserId;

    if (!isTherapist && !isProspect) {
      return NextResponse.json({ error: 'Not authorized to view this channel' }, { status: 403 });
    }

    // Get messages from database
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
      .leftJoin(users, eq(chatMessages.senderId, users.id))
      .where(eq(chatMessages.channelId, channelId))
      .orderBy(desc(chatMessages.sentAt))
      .limit(maxResults);

    return NextResponse.json({
      messages: messages.reverse(), // Return in chronological order
      hasMore: messages.length === maxResults,
    });
  } catch (error) {
    console.error('Error getting messages:', error);
    return NextResponse.json({ error: 'Failed to get messages' }, { status: 500 });
  }
}

async function markMessagesAsRead(body: { channelId: number }, userId: string) {
  const { channelId } = body;

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

    // Check if user is therapist
    const therapist = await db
      .select()
      .from(therapists)
      .where(eq(therapists.userId, user[0].id))
      .limit(1);

    const isTherapist = therapist.length > 0 && therapist[0].id === channel[0].therapistId;
    const isProspect = user[0].id === channel[0].prospectUserId;

    if (!isTherapist && !isProspect) {
      return NextResponse.json({ error: 'Not authorized to modify this channel' }, { status: 403 });
    }

    // Reset unread count for the appropriate user
    const updateData: {
      unreadCountTherapist?: number;
      unreadCountProspect?: number;
    } = {};

    if (isTherapist) {
      updateData.unreadCountTherapist = 0;
    } else {
      updateData.unreadCountProspect = 0;
    }

    // Update the channel
    await db.update(chatChannels).set(updateData).where(eq(chatChannels.id, channelId));

    // Mark messages as read in the messages table
    if (isTherapist) {
      await db
        .update(chatMessages)
        .set({ readByTherapistAt: new Date() })
        .where(and(eq(chatMessages.channelId, channelId), isNull(chatMessages.readByTherapistAt)));
    } else {
      await db
        .update(chatMessages)
        .set({ readByProspectAt: new Date() })
        .where(and(eq(chatMessages.channelId, channelId), isNull(chatMessages.readByProspectAt)));
    }

    return NextResponse.json({
      success: true,
      message: 'Messages marked as read',
    });
  } catch (error) {
    console.error('Error marking messages as read:', error);
    return NextResponse.json({ error: 'Failed to mark messages as read' }, { status: 500 });
  }
}
