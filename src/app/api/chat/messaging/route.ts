import {
  ChimeSDKIdentityClient,
  CreateAppInstanceUserCommand,
} from '@aws-sdk/client-chime-sdk-identity';
import {
  ChimeSDKMessagingClient,
  CreateChannelCommand,
  SendChannelMessageCommand,
  CreateChannelMembershipCommand,
} from '@aws-sdk/client-chime-sdk-messaging';
import { auth } from '@clerk/nextjs/server';
import { eq, and } from 'drizzle-orm';
import { NextRequest, NextResponse } from 'next/server';

import { db } from '@/src/db';
import { therapists, users, chatChannels, chatMessages } from '@/src/db/schema';

// Feature flag check
const CHAT_FEATURE_ENABLED = process.env.NEXT_PUBLIC_ENABLE_CHAT_FEATURE === 'true';

// Initialize Chime SDK clients only if enabled
const chimeMessagingClient = CHAT_FEATURE_ENABLED
  ? new ChimeSDKMessagingClient({
      region: process.env.AWS_REGION || 'us-east-1',
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
      },
    })
  : null;

const chimeIdentityClient = CHAT_FEATURE_ENABLED
  ? new ChimeSDKIdentityClient({
      region: process.env.AWS_REGION || 'us-east-1',
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
      },
    })
  : null;

const APP_INSTANCE_ARN = process.env.AWS_CHIME_APP_INSTANCE_ARN!;

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
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

async function createAppInstanceUser(userId: string, displayName: string) {
  if (!chimeIdentityClient) throw new Error('Chime identity client not initialized');

  const command = new CreateAppInstanceUserCommand({
    AppInstanceArn: APP_INSTANCE_ARN,
    AppInstanceUserId: userId,
    Name: displayName,
  });

  const response = await chimeIdentityClient.send(command);
  return response.AppInstanceUserArn!;
}

async function createChannel(body: CreateChannelBody, userId: string) {
  if (!chimeMessagingClient) {
    return NextResponse.json({
      success: true,
      channelArn: `mock-channel-arn-${Date.now()}`,
      message: 'Chat feature is not enabled - mock response',
    });
  }

  const { therapistId, prospectUserId, channelName } = body;

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
        channelArn: existingChannel[0].chimeChannelArn,
        message: 'Channel already exists',
      });
    }

    // Create AppInstance users if they don't exist
    const therapistUserArn = await createAppInstanceUser(
      therapist[0].userId.toString(),
      therapist[0].name,
    );
    const prospectDisplayName =
      `${prospect[0].firstName} ${prospect[0].lastName}`.trim() || 'Client';
    const prospectUserArn = await createAppInstanceUser(prospect[0].clerkId, prospectDisplayName);

    // Create Chime channel
    const channelNameFormatted = channelName || `Therapy Session - ${therapist[0].name}`;
    const createChannelCommand = new CreateChannelCommand({
      AppInstanceArn: APP_INSTANCE_ARN,
      Name: channelNameFormatted,
      Mode: 'RESTRICTED', // Private channel
      Privacy: 'PRIVATE',
      ClientRequestToken: `channel-${therapistId}-${prospectUserId}-${Date.now()}`,
      ChimeBearer: therapistUserArn,
    });

    const channelResponse = await chimeMessagingClient.send(createChannelCommand);
    const channelArn = channelResponse.ChannelArn!;

    // Add prospect as channel member
    const addMemberCommand = new CreateChannelMembershipCommand({
      ChannelArn: channelArn,
      MemberArn: prospectUserArn,
      Type: 'DEFAULT',
      ChimeBearer: therapistUserArn,
    });

    await chimeMessagingClient.send(addMemberCommand);

    // Save channel to database
    const [newChannel] = await db
      .insert(chatChannels)
      .values({
        chimeChannelArn: channelArn,
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
      channelArn: channelArn,
      message: 'Channel created successfully',
    });
  } catch (error) {
    console.error('Error creating channel:', error);
    return NextResponse.json({ error: 'Failed to create channel' }, { status: 500 });
  }
}

async function sendMessage(body: SendMessageBody, userId: string) {
  if (!chimeMessagingClient) {
    return NextResponse.json({
      success: true,
      messageId: `mock-message-${Date.now()}`,
    });
  }

  const { channelId, content, messageType = 'STANDARD' } = body;

  try {
    // Get channel info
    const channel = await db
      .select()
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

    // Create AppInstance user ARN
    const userArn = `${process.env.CHIME_APP_INSTANCE_USER_ARN_PREFIX}${user[0].id}`;

    // Send message via Chime
    const sendMessageCommand = new SendChannelMessageCommand({
      ChannelArn: channel[0].chimeChannelArn,
      Content: content,
      Type: messageType as 'STANDARD' | 'CONTROL',
      Persistence: 'PERSISTENT',
      ClientRequestToken: `msg-${Date.now()}-${user[0].id}`,
      ChimeBearer: userArn,
    });

    const messageResponse = await chimeMessagingClient.send(sendMessageCommand);

    // Save message to database
    await db.insert(chatMessages).values({
      channelId: channel[0].id,
      chimeMessageId: messageResponse.MessageId!,
      senderId: user[0].id,
      content,
      messageType,
      status: 'sent',
      sentAt: new Date(),
      createdAt: new Date(),
    });

    // Update channel with last message info
    await db
      .update(chatChannels)
      .set({
        lastMessageAt: new Date(),
        lastMessagePreview: content.substring(0, 100),
        updatedAt: new Date(),
      })
      .where(eq(chatChannels.id, channelId));

    return NextResponse.json({
      success: true,
      messageId: messageResponse.MessageId,
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

    // Get channels where user is either therapist or prospect
    const userChannels = await db
      .select({
        id: chatChannels.id,
        chimeChannelArn: chatChannels.chimeChannelArn,
        therapistId: chatChannels.therapistId,
        prospectUserId: chatChannels.prospectUserId,
        status: chatChannels.status,
        lastMessageAt: chatChannels.lastMessageAt,
        lastMessagePreview: chatChannels.lastMessagePreview,
        therapistName: therapists.name,
        prospectFirstName: users.firstName,
        prospectLastName: users.lastName,
      })
      .from(chatChannels)
      .leftJoin(therapists, eq(chatChannels.therapistId, therapists.id))
      .leftJoin(users, eq(chatChannels.prospectUserId, users.id))
      .where(
        // User is either the therapist or the prospect
        eq(users.clerkId, userId),
      );

    return NextResponse.json({
      channels: userChannels,
    });
  } catch (error) {
    console.error('Error listing channels:', error);
    return NextResponse.json({ error: 'Failed to list channels' }, { status: 500 });
  }
}

async function getChannelMessages(body: GetMessagesBody, _userId: string) {
  const { channelId, maxResults = 50 } = body;

  try {
    // Get channel and verify user access
    const channel = await db
      .select()
      .from(chatChannels)
      .where(eq(chatChannels.id, channelId))
      .limit(1);

    if (!channel.length) {
      return NextResponse.json({ error: 'Channel not found' }, { status: 404 });
    }

    // Get messages from database
    const messages = await db
      .select({
        id: chatMessages.id,
        chimeMessageId: chatMessages.chimeMessageId,
        senderId: chatMessages.senderId,
        content: chatMessages.content,
        messageType: chatMessages.messageType,
        status: chatMessages.status,
        sentAt: chatMessages.sentAt,
        senderFirstName: users.firstName,
        senderLastName: users.lastName,
      })
      .from(chatMessages)
      .leftJoin(users, eq(chatMessages.senderId, users.id))
      .where(eq(chatMessages.channelId, channelId))
      .orderBy(chatMessages.sentAt)
      .limit(maxResults);

    return NextResponse.json({
      messages,
    });
  } catch (error) {
    console.error('Error getting messages:', error);
    return NextResponse.json({ error: 'Failed to get messages' }, { status: 500 });
  }
}
