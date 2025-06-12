import { Redis } from '@upstash/redis';

if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
  console.warn('Redis not configured, using in-memory cache fallback');
}

export const redis = process.env.UPSTASH_REDIS_REST_URL
  ? new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    })
  : null;

// In-memory cache fallback for development
const memoryCache = new Map<string, { data: any; expiry: number }>();

// Cache key constants
export const CACHE_KEYS = {
  therapistDashboard: (therapistId: number) => `therapist:${therapistId}:dashboard`,
  therapistClients: (therapistId: number) => `therapist:${therapistId}:clients`,
  therapistSessions: (therapistId: number) => `therapist:${therapistId}:sessions`,
  therapistStatistics: (therapistId: number) => `therapist:${therapistId}:statistics`,
  therapistProfile: (therapistId: number) => `therapist:${therapistId}:profile`,
  therapistNotes: (therapistId: number, clientId: string) =>
    `therapist:${therapistId}:client:${clientId}:notes`,
  therapistLookup: (userId: number) => `user:${userId}:therapist_id`,
} as const;

// Cache TTL constants (in seconds)
export const CACHE_TTL = {
  DASHBOARD_DATA: 300, // 5 minutes
  PROFILE_DATA: 1800, // 30 minutes
  NOTES_DATA: 600, // 10 minutes
  THERAPIST_LOOKUP: 3600, // 1 hour
} as const;

interface CacheOptions {
  ttl?: number; // TTL in seconds
  skipCache?: boolean;
}

export async function getFromCache<T>(key: string): Promise<T | null> {
  try {
    if (redis) {
      const cached = await redis.get<T>(key);
      return cached;
    } else {
      // Fallback to memory cache
      const cached = memoryCache.get(key);
      if (cached && cached.expiry > Date.now()) {
        return cached.data as T;
      }
      if (cached) {
        memoryCache.delete(key); // Clean up expired
      }
      return null;
    }
  } catch (error) {
    console.error('Cache read error:', error);
    return null;
  }
}

export async function setInCache<T>(
  key: string,
  data: T,
  ttl: number = CACHE_TTL.DASHBOARD_DATA,
): Promise<void> {
  try {
    if (redis) {
      await redis.setex(key, ttl, data);
    } else {
      // Fallback to memory cache
      memoryCache.set(key, {
        data,
        expiry: Date.now() + ttl * 1000,
      });
    }
  } catch (error) {
    console.error('Cache write error:', error);
  }
}

export async function deleteFromCache(key: string): Promise<void> {
  try {
    if (redis) {
      await redis.del(key);
    } else {
      memoryCache.delete(key);
    }
  } catch (error) {
    console.error('Cache delete error:', error);
  }
}

export async function deleteCachePattern(pattern: string): Promise<void> {
  try {
    if (redis) {
      const keys = await redis.keys(pattern);
      if (keys.length > 0) {
        await redis.del(...keys);
      }
    } else {
      // For memory cache, delete keys that match pattern
      for (const key of memoryCache.keys()) {
        if (key.includes(pattern.replace('*', ''))) {
          memoryCache.delete(key);
        }
      }
    }
  } catch (error) {
    console.error('Cache pattern delete error:', error);
  }
}

// Utility function to cache with automatic error handling
export async function withCache<T>(
  key: string,
  fetchFn: () => Promise<T>,
  options: CacheOptions = {},
): Promise<T> {
  const { ttl = CACHE_TTL.DASHBOARD_DATA, skipCache = false } = options;

  if (!skipCache) {
    const cached = await getFromCache<T>(key);
    if (cached !== null) {
      return cached;
    }
  }

  const data = await fetchFn();
  await setInCache(key, data, ttl);
  return data;
}
