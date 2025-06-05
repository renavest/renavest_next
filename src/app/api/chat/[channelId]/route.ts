export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { auth } from '@clerk/nextjs/server';
import { eq, and, desc } from 'drizzle-orm';

import { db } from '@/src/db';
import { therapists, users, chatChannels, chatMessages } from '@/src/db/schema';
import { redis, getChatMessagesKey } from '@/src/lib/redis';

// Feature flag check
const CHAT_FEATURE_ENABLED = process.env.NEXT_PUBLIC_ENABLE_CHAT_FEATURE === 'true';

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

    console.log(`🚀 Starting real-time SSE for user ${userId} on channel ${channelId}`);

    const encoder = new TextEncoder();
    let lastMessageTimestamp = Date.now();

    const stream = new ReadableStream({
      async start(controller) {
        // Send initial connection message
        controller.enqueue(
          encoder.encode(
            `data:${JSON.stringify({
              type: 'connected',
              channelId,
              timestamp: Date.now(),
            })}\n\n`,
          ),
        );

        // Load and send initial message history
        try {
          const history = await redis.lrange<string>(getChatMessagesKey(channelId), -50, -1);
          console.log(`📚 Loaded ${history.length} messages from Redis for channel ${channelId}`);

          if (history.length === 0) {
            // Fallback to database if no Redis history
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
              lastMessageTimestamp = msg.sentAt.getTime();
            }
          } else {
            // Send Redis history
            history.forEach((messageStr) => {
              controller.enqueue(encoder.encode(`data:${messageStr}\n\n`));
              try {
                const msg = JSON.parse(messageStr);
                if (msg.ts && msg.ts > lastMessageTimestamp) {
                  lastMessageTimestamp = msg.ts;
                }
              } catch (e) {
                console.warn('Could not parse message timestamp:', e);
              }
            });
          }
        } catch (error) {
          console.error('❌ Error loading message history:', error);
        }

        // Start intelligent polling for new messages
        const startPolling = () => {
          const pollInterval = setInterval(async () => {
            try {
              // Check for new messages since our last timestamp
              const recentMessages = await redis.lrange<string>(
                getChatMessagesKey(channelId),
                -10,
                -1,
              );

              for (const messageStr of recentMessages) {
                try {
                  const message = JSON.parse(messageStr);
                  if (message.ts && message.ts > lastMessageTimestamp) {
                    console.log(`📨 New message detected: ${message.id}`);
                    controller.enqueue(encoder.encode(`data:${messageStr}\n\n`));
                    lastMessageTimestamp = message.ts;
                  }
                } catch (e) {
                  console.error('Error parsing message:', e);
                }
              }
            } catch (error) {
              console.error('❌ Polling error:', error);
            }
          }, 1000); // Poll every 1 second for responsiveness

          // Store interval for cleanup
          (
            controller as ReadableStreamDefaultController & { pollInterval: NodeJS.Timeout }
          ).pollInterval = pollInterval;
        };

        // Start polling
        startPolling();

        // Send periodic heartbeat to keep connection alive
        const heartbeatInterval = setInterval(() => {
          try {
            controller.enqueue(
              encoder.encode(
                `data:${JSON.stringify({ type: 'heartbeat', timestamp: Date.now() })}\n\n`,
              ),
            );
          } catch {
            console.log('Heartbeat failed, connection likely closed');
            clearInterval(heartbeatInterval);
          }
        }, 30000); // Every 30 seconds

        // Store heartbeat interval for cleanup
        (
          controller as ReadableStreamDefaultController & {
            pollInterval: NodeJS.Timeout;
            heartbeatInterval: NodeJS.Timeout;
          }
        ).heartbeatInterval = heartbeatInterval;
      },

      cancel() {
        console.log(`🔌 Closing SSE stream for user ${userId} on channel ${channelId}`);

        // Clean up intervals
        const extendedController = this as {
          pollInterval?: NodeJS.Timeout;
          heartbeatInterval?: NodeJS.Timeout;
        };

        if (extendedController.pollInterval) {
          clearInterval(extendedController.pollInterval);
        }
        if (extendedController.heartbeatInterval) {
          clearInterval(extendedController.heartbeatInterval);
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream; charset=utf-8',
        Connection: 'keep-alive',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Cache-Control',
        'X-Accel-Buffering': 'no', // Disable nginx buffering
      },
    });
  } catch (error) {
    console.error('❌ SSE endpoint error:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}
