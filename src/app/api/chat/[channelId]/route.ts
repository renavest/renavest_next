export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { auth } from '@clerk/nextjs/server';
import { eq, and, desc } from 'drizzle-orm';

import { db } from '@/src/db';
import { therapists, users, chatChannels, chatMessages } from '@/src/db/schema';
import { redis, getChatMessagesKey, ChatMessage } from '@/src/lib/redis';

// Feature flag check
const CHAT_FEATURE_ENABLED = process.env.NEXT_PUBLIC_ENABLE_CHAT_FEATURE === 'true';

// Helper function to safely parse message data from Redis
function parseRedisMessage(
  messageData: unknown,
): { messageStr: string; message: ChatMessage } | null {
  try {
    let messageStr: string;
    let message: ChatMessage;

    if (typeof messageData === 'string') {
      messageStr = messageData;
      message = JSON.parse(messageStr) as ChatMessage;
    } else if (typeof messageData === 'object' && messageData !== null) {
      // Already an object, stringify it for SSE
      message = messageData as ChatMessage;
      messageStr = JSON.stringify(messageData);
    } else {
      console.warn('Invalid message data type:', typeof messageData, messageData);
      return null;
    }

    return { messageStr, message };
  } catch (e) {
    console.error('Error parsing message:', e, messageData);
    return null;
  }
}

export async function GET(_req: Request, { params }: { params: { channelId: string } }) {
  if (!CHAT_FEATURE_ENABLED) {
    return new Response('Chat feature disabled', { status: 404 });
  }

  try {
    const { userId } = await auth();
    if (!userId) {
      return new Response('Unauthorized', { status: 401 });
    }

    const channelIdNum = parseInt(params.channelId);
    if (isNaN(channelIdNum)) {
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
          eq(chatChannels.id, channelIdNum),
          isTherapist.length > 0
            ? eq(chatChannels.therapistId, isTherapist[0].id)
            : eq(chatChannels.prospectUserId, dbUserId),
        ),
      )
      .limit(1);

    if (!channel.length) {
      return new Response('Channel not found or access denied', { status: 403 });
    }

    console.log(`🚀 Starting real-time SSE for user ${userId} on channel ${channelIdNum}`);

    const encoder = new TextEncoder();
    let lastMessageTimestamp = Date.now();
    let isClosed = false;

    const stream = new ReadableStream({
      async start(controller) {
        // Helper function to safely enqueue data
        const safeEnqueue = (data: Uint8Array) => {
          if (!isClosed) {
            try {
              controller.enqueue(data);
            } catch {
              console.log('Controller closed, stopping enqueue attempts');
              isClosed = true;
            }
          }
        };

        // Send initial connection message
        safeEnqueue(
          encoder.encode(
            `data:${JSON.stringify({
              type: 'connected',
              channelId: channelIdNum,
              timestamp: Date.now(),
            })}\n\n`,
          ),
        );

        // Load and send initial message history
        try {
          const history = await redis.lrange<string>(getChatMessagesKey(channelIdNum), -50, -1);
          console.log(
            `📚 Loaded ${history.length} messages from Redis for channel ${channelIdNum}`,
          );

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
              .where(eq(chatMessages.channelId, channelIdNum))
              .orderBy(desc(chatMessages.sentAt))
              .limit(50);

            for (const msg of dbMessages.reverse()) {
              if (isClosed) break;
              const redisMessage = {
                id: msg.messageId,
                text: msg.content,
                author: `${msg.senderFirstName} ${msg.senderLastName}`.trim(),
                authorEmail: msg.senderEmail,
                channelId: channelIdNum,
                ts: msg.sentAt.getTime(),
                messageType: msg.messageType,
              };
              safeEnqueue(encoder.encode(`data:${JSON.stringify(redisMessage)}\n\n`));
              lastMessageTimestamp = msg.sentAt.getTime();
            }
          } else {
            // Send Redis history
            history.forEach((messageData) => {
              if (isClosed) return;
              const parsedMessage = parseRedisMessage(messageData);
              if (parsedMessage) {
                safeEnqueue(encoder.encode(`data:${parsedMessage.messageStr}\n\n`));
                if (parsedMessage.message.ts && parsedMessage.message.ts > lastMessageTimestamp) {
                  lastMessageTimestamp = parsedMessage.message.ts;
                }
              }
            });
          }
        } catch (error) {
          console.error('❌ Error loading message history:', error);
        }

        // Start intelligent polling for new messages
        const pollInterval = setInterval(async () => {
          if (isClosed) {
            clearInterval(pollInterval);
            return;
          }

          try {
            // Check for new messages since our last timestamp
            const recentMessages = await redis.lrange<string>(
              getChatMessagesKey(channelIdNum),
              -10,
              -1,
            );

            for (const messageData of recentMessages) {
              if (isClosed) break;
              const parsedMessage = parseRedisMessage(messageData);
              if (parsedMessage) {
                if (parsedMessage.message.ts && parsedMessage.message.ts > lastMessageTimestamp) {
                  console.log(`📨 New message detected: ${parsedMessage.message.id}`);
                  safeEnqueue(encoder.encode(`data:${parsedMessage.messageStr}\n\n`));
                  lastMessageTimestamp = parsedMessage.message.ts;
                }
              }
            }
          } catch (error) {
            if (!isClosed) {
              console.error('❌ Polling error:', error);
            }
          }
        }, 1000); // Poll every 1 second for responsiveness

        // Send periodic heartbeat to keep connection alive
        const heartbeatInterval = setInterval(() => {
          if (isClosed) {
            clearInterval(heartbeatInterval);
            return;
          }

          safeEnqueue(
            encoder.encode(
              `data:${JSON.stringify({ type: 'heartbeat', timestamp: Date.now() })}\n\n`,
            ),
          );
        }, 30000); // Every 30 seconds

        // Store intervals for cleanup
        (
          controller as ReadableStreamDefaultController & { pollInterval: NodeJS.Timeout }
        ).pollInterval = pollInterval;
        (
          controller as ReadableStreamDefaultController & { heartbeatInterval: NodeJS.Timeout }
        ).heartbeatInterval = heartbeatInterval;
      },

      cancel() {
        console.log(`🔌 Closing SSE stream for user ${userId} on channel ${channelIdNum}`);
        isClosed = true;

        // Clean up intervals
        const extendedController = this as ReadableStreamDefaultController & {
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
