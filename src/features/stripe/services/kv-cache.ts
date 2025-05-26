import { Redis } from '@upstash/redis';

if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
  throw new Error('UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN are required');
}

export const kv = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

// Cache key helpers
export const CACHE_KEYS = {
  userSubscription: (userId: string) => `user:${userId}:subscription`,
  stripeCustomer: (userId: string) => `user:${userId}:stripe_customer`,
  therapistAccount: (therapistId: string) => `therapist:${therapistId}:stripe_account`,
} as const;
