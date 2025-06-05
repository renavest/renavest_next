export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { auth } from '@clerk/nextjs/server';
import { eq, and, desc } from 'drizzle-orm';
import Redis from 'ioredis';

import { db } from '@/src/db';
import { therapists, users, chatChannels, chatMessages } from '@/src/db/schema';
import { redis, getChatMessagesKey } from '@/src/lib/redis';

// Feature flag check
const CHAT_FEATURE_ENABLED = process.env.NEXT_PUBLIC_ENABLE_CHAT_FEATURE === 'true';

// Redis configuration for pub/sub (requires TCP connection, not REST)
const getRedisConfig = () => {
  // For pub/sub, we need the TCP URL, not the REST URL
  const redisUrl = process.env.UPSTASH_REDIS_TCP_URL || process.env.REDIS_URL;

  if (!redisUrl) {
    console.error('Redis TCP URL not configured. Chat pub/sub will not work.');
    return null;
  }

  return redisUrl;
};

export async function GET(_req: Request, { params }: { params: { channelId: string } }) {
  if (!CHAT_FEATURE_ENABLED) {
    return new Response('Chat feature disabled', { status: 404 });
  }

  try {
    const { userId } = await auth();
    if (!userId) {
      return new Response('Unauthorized', { status: 401 });
    }

    const awaitedParams = await params;
    const channelId = parseInt(awaitedParams.channelId, 10);
    if (isNaN(channelId)) {
      return new Response('Invalid channel ID', { status: 400 });
    }

    // Verify user has access to this channel
    const user = await db.select().from(users).where(eq(users.clerkId, userId)).limit(1);
    if (!user.length) {
      return new Response('User not found', { status: 404 });
    }

    const dbUserId = user[0].id;

    // Check if user is therapist
    const isTherapist = await db
      .select()
      .from(therapists)
      .where(eq(therapists.userId, dbUserId))
      .limit(1);

    // Verify access to channel
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
      return new Response('Channel not found or access denied', { status: 403 });
    }

    console.log(`Starting SSE stream for user ${userId} on channel ${channelId}`);

    const encoder = new TextEncoder();

    // Get Redis configuration
    const redisConfig = getRedisConfig();
    if (!redisConfig) {
      // If Redis pub/sub is not available, still provide basic functionality
      console.warn('Redis pub/sub not configured, providing basic SSE without real-time updates');
    }

    let subscriber: Redis | null = null;
    if (redisConfig) {
      try {
        subscriber = new Redis(redisConfig);
        await subscriber.subscribe(`channel:${channelId}`);
      } catch (error) {
        console.error('Failed to connect to Redis for pub/sub:', error);
        subscriber = null;
      }
    }

    const stream = new ReadableStream({
      async start(controller) {
        // Send initial connection message
        controller.enqueue(
          encoder.encode(`data:${JSON.stringify({ type: 'connected', channelId })}\n\n`),
        );

        // ✅ Replay last 50 messages from Redis so the room isn't empty on reload
        try {
          const history = await redis.lrange<string>(getChatMessagesKey(channelId), -50, -1);

          console.log(`Replaying ${history.length} messages for channel ${channelId}`);

          // If no Redis history, fall back to database
          if (history.length === 0) {
            const dbMessages = await db
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
              .limit(50);

            // Convert to Redis format and send
            for (const msg of dbMessages.reverse()) {
              const redisMessage = {
                id: msg.messageId,
                text: msg.content,
                author: `${msg.senderFirstName} ${msg.senderLastName}`.trim(),
                authorEmail: msg.senderEmail,
                channelId: channelId,
                ts: msg.sentAt.getTime(),
                messageType: msg.messageType,
              };
              controller.enqueue(encoder.encode(`data:${JSON.stringify(redisMessage)}\n\n`));
            }
          } else {
            // Send Redis history
            history.forEach((messageStr) =>
              controller.enqueue(encoder.encode(`data:${messageStr}\n\n`)),
            );
          }
        } catch (error) {
          console.error('Error loading message history:', error);
        }

        // Listen for new messages
        subscriber?.on('message', (channel, payload) => {
          console.log(`Received message on channel ${channel}:`, payload);
          controller.enqueue(encoder.encode(`data:${payload}\n\n`));
        });

        subscriber?.on('error', (error) => {
          console.error('Redis subscriber error:', error);
          controller.error(error);
        });
      },
      cancel() {
        console.log(`Closing SSE stream for user ${userId} on channel ${channelId}`);
        subscriber?.disconnect();
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream; charset=utf-8',
        Connection: 'keep-alive',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Cache-Control',
      },
    });
  } catch (error) {
    console.error('SSE endpoint error:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}
