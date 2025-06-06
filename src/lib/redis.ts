import { Redis } from '@upstash/redis';

export const redis = Redis.fromEnv(); // uses UPSTASH_REDIS_REST_URL/TOKEN

// Helper types for chat messages
export interface ChatMessage {
  id: string;
  text: string;
  author: string;
  authorEmail: string;
  channelId: number;
  ts: number;
  messageType?: string;
}

// Redis key helpers
export const getChatMessagesKey = (channelId: number) => `chat:messages:${channelId}`;
export const getChatChannelKey = (channelId: number) => `chat:channel:${channelId}`;
