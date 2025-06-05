import { IncomingMessage } from 'http';

import { eq } from 'drizzle-orm';
import { NextRequest } from 'next/server';
import { WebSocketServer, WebSocket } from 'ws';

import { db } from '@/src/db';
import { chatChannels, users, therapists } from '@/src/db/schema';

// Feature flag check
const CHAT_FEATURE_ENABLED = process.env.NEXT_PUBLIC_ENABLE_CHAT_FEATURE === 'true';

// WebSocket message types
interface WebSocketMessageData {
  type: string;
  channelId?: number;
  [key: string]: unknown;
}

interface BroadcastMessage {
  type: string;
  channelId?: number;
  message?: Record<string, unknown>;
  channel?: Record<string, unknown>;
  userId?: string;
  typing?: boolean;
}

interface MessageData {
  id?: number;
  messageId?: string;
  content?: string;
  sentAt?: string;
  [key: string]: unknown;
}

interface ChannelData {
  id?: number;
  therapistName?: string;
  [key: string]: unknown;
}

interface WebSocketConnection extends WebSocket {
  userId?: string;
  userEmail?: string;
  channelIds?: number[];
}

// Store active WebSocket connections
const connections = new Map<string, WebSocketConnection>();

// WebSocket server instance
let wss: WebSocketServer | null = null;

// Initialize WebSocket server if not already done
const initWebSocketServer = () => {
  if (!wss && typeof window === 'undefined') {
    wss = new WebSocketServer({ noServer: true });

    wss.on('connection', async (ws: WebSocketConnection, request: IncomingMessage) => {
      console.log('New WebSocket connection');

      // Parse user info from URL or headers
      const url = new URL(request.url || '', `http://${request.headers.host}`);
      const authToken = url.searchParams.get('token') || request.headers.authorization;

      if (!authToken) {
        ws.close(4001, 'Unauthorized');
        return;
      }

      try {
        // Verify authentication (you might need to adapt this based on your auth setup)
        const userId = await verifyAuthToken(authToken);
        if (!userId) {
          ws.close(4001, 'Invalid token');
          return;
        }

        // Get user info
        const user = await db.select().from(users).where(eq(users.clerkId, userId)).limit(1);
        if (!user.length) {
          ws.close(4001, 'User not found');
          return;
        }

        ws.userId = userId;
        ws.userEmail = user[0].email;
        connections.set(userId, ws);

        // Get user's channels
        const userChannels = await getUserChannels(userId);
        ws.channelIds = userChannels.map((c) => c.id);

        // Send connection confirmation
        ws.send(
          JSON.stringify({
            type: 'connection_established',
            userId,
            channels: userChannels,
          }),
        );

        // Handle incoming messages
        ws.on('message', async (data: Buffer) => {
          try {
            const message = JSON.parse(data.toString());
            await handleWebSocketMessage(ws, message);
          } catch (error) {
            console.error('Error handling WebSocket message:', error);
            ws.send(
              JSON.stringify({
                type: 'error',
                message: 'Invalid message format',
              }),
            );
          }
        });

        ws.on('close', () => {
          console.log(`WebSocket connection closed for user ${userId}`);
          if (userId) {
            connections.delete(userId);
          }
        });

        ws.on('error', (error) => {
          console.error('WebSocket error:', error);
        });
      } catch (error) {
        console.error('Error setting up WebSocket connection:', error);
        ws.close(4000, 'Setup error');
      }
    });
  }
};

// Handle WebSocket upgrade request
export async function GET(_request: NextRequest) {
  if (!CHAT_FEATURE_ENABLED) {
    return new Response('Chat feature disabled', { status: 404 });
  }

  // This is a simplified WebSocket upgrade - in production you'd need proper upgrade handling
  return new Response('WebSocket endpoint - use WebSocket protocol', {
    status: 426,
    headers: {
      Upgrade: 'websocket',
    },
  });
}

// Handle WebSocket messages
const handleWebSocketMessage = async (ws: WebSocketConnection, message: WebSocketMessageData) => {
  switch (message.type) {
    case 'join_channel':
      if (message.channelId) {
        await handleJoinChannel(ws, message.channelId);
      }
      break;

    case 'leave_channel':
      if (message.channelId) {
        await handleLeaveChannel(ws, message.channelId);
      }
      break;

    case 'typing_start':
      if (message.channelId) {
        await broadcastToChannel(
          message.channelId,
          {
            type: 'user_typing',
            userId: ws.userId,
            channelId: message.channelId,
            typing: true,
          },
          ws.userId,
        );
      }
      break;

    case 'typing_stop':
      if (message.channelId) {
        await broadcastToChannel(
          message.channelId,
          {
            type: 'user_typing',
            userId: ws.userId,
            channelId: message.channelId,
            typing: false,
          },
          ws.userId,
        );
      }
      break;

    default:
      ws.send(
        JSON.stringify({
          type: 'error',
          message: 'Unknown message type',
        }),
      );
  }
};

const handleJoinChannel = async (ws: WebSocketConnection, channelId: number) => {
  // Verify user has access to this channel
  if (!ws.channelIds?.includes(channelId)) {
    ws.send(
      JSON.stringify({
        type: 'error',
        message: 'Access denied to channel',
      }),
    );
    return;
  }

  ws.send(
    JSON.stringify({
      type: 'channel_joined',
      channelId,
    }),
  );
};

const handleLeaveChannel = async (ws: WebSocketConnection, channelId: number) => {
  ws.send(
    JSON.stringify({
      type: 'channel_left',
      channelId,
    }),
  );
};

// Broadcast message to all users in a channel
export const broadcastToChannel = async (
  channelId: number,
  message: BroadcastMessage,
  excludeUserId?: string,
) => {
  const channelUsers = await getChannelUsers(channelId);

  for (const userId of channelUsers) {
    if (excludeUserId && userId === excludeUserId) continue;

    const connection = connections.get(userId);
    if (connection && connection.readyState === WebSocket.OPEN) {
      try {
        connection.send(JSON.stringify(message));
      } catch (error) {
        console.error(`Error sending message to user ${userId}:`, error);
      }
    }
  }
};

// Broadcast new message to channel participants
export const broadcastNewMessage = async (
  channelId: number,
  messageData: Record<string, unknown>,
) => {
  await broadcastToChannel(channelId, {
    type: 'new_message',
    channelId,
    message: messageData,
  });
};

// Broadcast channel creation
export const broadcastChannelCreated = async (
  channel: Record<string, unknown>,
  participants: string[],
) => {
  for (const userId of participants) {
    const connection = connections.get(userId);
    if (connection && connection.readyState === WebSocket.OPEN) {
      try {
        connection.send(
          JSON.stringify({
            type: 'channel_created',
            channel,
          }),
        );
      } catch (error) {
        console.error(`Error broadcasting channel creation to user ${userId}:`, error);
      }
    }
  }
};

// Helper functions
const verifyAuthToken = async (token: string): Promise<string | null> => {
  try {
    // Implement your auth token verification here
    // This is a simplified version - you'd use your actual auth verification
    // For Clerk, you might need to verify the session token

    // For now, return a mock user ID - replace with actual verification
    if (token.startsWith('Bearer ')) {
      return token.substring(7); // Remove 'Bearer ' prefix
    }
    return token;
  } catch (error) {
    console.error('Error verifying auth token:', error);
    return null;
  }
};

const getUserChannels = async (userId: string) => {
  try {
    // Get user from database
    const user = await db.select().from(users).where(eq(users.clerkId, userId)).limit(1);
    if (!user.length) return [];

    const dbUserId = user[0].id;

    // Get channels where user is either therapist or prospect
    const therapist = await db
      .select()
      .from(therapists)
      .where(eq(therapists.userId, dbUserId))
      .limit(1);
    const therapistId = therapist.length > 0 ? therapist[0].id : null;

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
          : eq(chatChannels.prospectUserId, dbUserId),
      );

    return channels;
  } catch (error) {
    console.error('Error getting user channels:', error);
    return [];
  }
};

const getChannelUsers = async (channelId: number): Promise<string[]> => {
  try {
    const channel = await db
      .select({
        therapistId: chatChannels.therapistId,
        prospectUserId: chatChannels.prospectUserId,
      })
      .from(chatChannels)
      .where(eq(chatChannels.id, channelId))
      .limit(1);

    if (!channel.length) return [];

    const userIds: string[] = [];

    // Get therapist user ID
    if (channel[0].therapistId) {
      const therapist = await db
        .select({ userId: therapists.userId })
        .from(therapists)
        .where(eq(therapists.id, channel[0].therapistId))
        .limit(1);

      if (therapist.length) {
        const therapistUser = await db
          .select({ clerkId: users.clerkId })
          .from(users)
          .where(eq(users.id, therapist[0].userId))
          .limit(1);

        if (therapistUser.length) {
          userIds.push(therapistUser[0].clerkId);
        }
      }
    }

    // Get prospect user ID
    if (channel[0].prospectUserId) {
      const prospectUser = await db
        .select({ clerkId: users.clerkId })
        .from(users)
        .where(eq(users.id, channel[0].prospectUserId))
        .limit(1);

      if (prospectUser.length) {
        userIds.push(prospectUser[0].clerkId);
      }
    }

    return userIds;
  } catch (error) {
    console.error('Error getting channel users:', error);
    return [];
  }
};

// Initialize WebSocket server
initWebSocketServer();
