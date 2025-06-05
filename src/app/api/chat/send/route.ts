export const runtime = 'nodejs';

import { auth } from '@clerk/nextjs/server';
import { eq, and } from 'drizzle-orm';
import { NextRequest, NextResponse } from 'next/server';

import { db } from '@/src/db';
import { therapists, users, chatChannels, chatMessages } from '@/src/db/schema';
import { redis, getChatMessagesKey, ChatMessage } from '@/src/lib/redis';

// Feature flag check
const CHAT_FEATURE_ENABLED = process.env.NEXT_PUBLIC_ENABLE_CHAT_FEATURE === 'true';

interface SendMessageBody {
  channelId: number;
  content: string;
  messageType?: string;
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

    const body = (await request.json()) as SendMessageBody;
    const { channelId, content, messageType = 'STANDARD' } = body;

    if (!content.trim()) {
      return NextResponse.json({ error: 'Message content is required' }, { status: 400 });
    }

    // Get user info
    const user = await db.select().from(users).where(eq(users.clerkId, userId)).limit(1);
    if (!user.length) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const dbUserId = user[0].id;

    // Verify user has access to this channel
    const isTherapist = await db
      .select()
      .from(therapists)
      .where(eq(therapists.userId, dbUserId))
      .limit(1);

    const channel = await db
      .select()
      .from(chatChannels)
      .where(
        and(
          eq(chatChannels.id, channelId),
          isTherapist.length > 0
            ? eq(chatChannels.therapistId, isTherapist[0].id)
            : eq(chatChannels.prospectUserId, dbUserId),
        ),
      )
      .limit(1);

    if (!channel.length) {
      return NextResponse.json({ error: 'Channel not found or access denied' }, { status: 403 });
    }

    // Generate message ID and create message
    const messageId = crypto.randomUUID();
    const now = new Date();

    // Save to database
    const newMessage = await db
      .insert(chatMessages)
      .values({
        chimeMessageId: messageId,
        senderId: dbUserId,
        channelId: channelId,
        content: content.trim(),
        messageType: messageType,
        status: 'sent',
        sentAt: now,
      })
      .returning();

    // Create Redis message
    const redisMessage: ChatMessage = {
      id: messageId,
      text: content.trim(),
      author: `${user[0].firstName} ${user[0].lastName}`.trim(),
      authorEmail: user[0].email,
      channelId: channelId,
      ts: now.getTime(),
      messageType: messageType,
    };

    // 1️⃣ Persist in Redis for real-time history
    await redis.rpush(getChatMessagesKey(channelId), JSON.stringify(redisMessage));

    // 2️⃣ Fan-out in real time via Redis pub/sub
    await redis.publish(`channel:${channelId}`, JSON.stringify(redisMessage));

    // Update channel last message info and unread counts
    const updateData: {
      lastMessageAt: Date;
      lastMessagePreview: string;
      updatedAt: Date;
      unreadCountProspect?: number;
      unreadCountTherapist?: number;
    } = {
      lastMessageAt: now,
      lastMessagePreview: content.substring(0, 100),
      updatedAt: now,
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
      if (isTherapist.length > 0) {
        updateData.unreadCountProspect = currentChannel[0].unreadCountProspect + 1;
      } else {
        updateData.unreadCountTherapist = currentChannel[0].unreadCountTherapist + 1;
      }
    }

    await db.update(chatChannels).set(updateData).where(eq(chatChannels.id, channelId));

    return NextResponse.json({
      success: true,
      messageId: messageId,
      message: {
        id: newMessage[0].id,
        messageId: messageId,
        senderId: dbUserId,
        content: content.trim(),
        messageType: messageType,
        status: 'SENT',
        sentAt: now.toISOString(),
        senderFirstName: user[0].firstName,
        senderLastName: user[0].lastName,
        senderEmail: user[0].email,
      },
    });
  } catch (error) {
    console.error('Error sending chat message:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
