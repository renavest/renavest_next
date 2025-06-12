import { eq, count, gt, and, or, desc } from 'drizzle-orm';

import { db } from '@/src/db';
import { bookingSessions, therapists, users, clientNotes } from '@/src/db/schema';
import { ClientNoteContent } from '@/src/features/therapist-dashboard/types';
import {
  withCache,
  CACHE_KEYS,
  CACHE_TTL,
  deleteFromCache,
  deleteCachePattern,
} from '@/src/lib/cache';

export interface TherapistLookupResult {
  therapistId: number;
  userId: number;
  email: string;
}

export interface DashboardData {
  clients: Array<{
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    createdAt: string;
    lastSessionDate?: string;
    totalSessions: number;
    status: 'active' | 'inactive' | 'pending';
  }>;
  upcomingSessions: Array<{
    id: string;
    clientId: string;
    clientName: string;
    sessionDate: string;
    sessionStartTime: string;
    therapistTimezone?: string;
    clientTimezone?: string;
    duration: number;
    sessionType: 'initial' | 'follow-up' | 'emergency';
    status: 'scheduled' | 'confirmed' | 'pending';
    googleMeetLink?: string;
    notes?: string;
  }>;
  statistics: {
    totalClients: number;
    activeClients: number;
    totalSessions: number;
    upcomingSessions: number;
    totalRevenue: number;
    monthlyRevenue: number;
    averageSessionRating?: number;
    completionRate: number;
  };
}

/**
 * Optimized therapist lookup with caching
 */
export async function getTherapistByUserId(userId: number): Promise<TherapistLookupResult | null> {
  return withCache(
    CACHE_KEYS.therapistLookup(userId),
    async () => {
      // Single optimized query to get both user and therapist data
      const result = await db
        .select({
          therapistId: therapists.id,
          userId: users.id,
          email: users.email,
        })
        .from(users)
        .innerJoin(therapists, eq(therapists.userId, users.id))
        .where(eq(users.id, userId))
        .limit(1);

      return result[0] || null;
    },
    { ttl: CACHE_TTL.THERAPIST_LOOKUP },
  );
}

/**
 * Optimized therapist lookup by email with caching
 */
export async function getTherapistByEmail(email: string): Promise<TherapistLookupResult | null> {
  // We can't cache by email since it's not in our cache key structure
  // But we can cache the result by userId once we get it
  const result = await db
    .select({
      therapistId: therapists.id,
      userId: users.id,
      email: users.email,
    })
    .from(users)
    .innerJoin(therapists, eq(therapists.userId, users.id))
    .where(eq(users.email, email))
    .limit(1);

  if (result[0]) {
    // Cache for future userId-based lookups
    await withCache(CACHE_KEYS.therapistLookup(result[0].userId), async () => result[0], {
      ttl: CACHE_TTL.THERAPIST_LOOKUP,
    });
  }

  return result[0] || null;
}

/**
 * Get all dashboard data in a single optimized fetch
 */
export async function getDashboardData(therapistId: number): Promise<DashboardData> {
  return withCache(
    CACHE_KEYS.therapistDashboard(therapistId),
    async () => {
      const now = new Date();

      // Optimized query to get clients with session count
      const clientsResult = await db
        .selectDistinct({
          id: users.id,
          firstName: users.firstName,
          lastName: users.lastName,
          email: users.email,
          imageUrl: users.imageUrl,
        })
        .from(users)
        .innerJoin(bookingSessions, eq(users.id, bookingSessions.userId))
        .where(eq(bookingSessions.therapistId, therapistId))
        .orderBy(users.firstName, users.lastName);

      // Optimized query to get upcoming sessions with client names
      const sessionsResult = await db
        .select({
          id: bookingSessions.id,
          clientId: bookingSessions.userId,
          clientName: users.firstName,
          clientLastName: users.lastName,
          sessionDate: bookingSessions.sessionDate,
          sessionStartTime: bookingSessions.sessionStartTime,
          status: bookingSessions.status,
          metadata: bookingSessions.metadata,
        })
        .from(bookingSessions)
        .leftJoin(users, eq(bookingSessions.userId, users.id))
        .where(
          and(
            eq(bookingSessions.therapistId, therapistId),
            or(
              eq(bookingSessions.status, 'pending'),
              eq(bookingSessions.status, 'confirmed'),
              eq(bookingSessions.status, 'scheduled'),
            ),
            gt(bookingSessions.sessionDate, now),
          ),
        )
        .orderBy(bookingSessions.sessionDate)
        .limit(10);

      // Optimized statistics queries in parallel
      const [upcomingSessionsCount, uniqueClientsCount, completedSessionsCount] = await Promise.all(
        [
          db
            .select({ count: count() })
            .from(bookingSessions)
            .where(
              and(
                eq(bookingSessions.therapistId, therapistId),
                or(
                  eq(bookingSessions.status, 'pending'),
                  eq(bookingSessions.status, 'confirmed'),
                  eq(bookingSessions.status, 'scheduled'),
                ),
                gt(bookingSessions.sessionDate, now),
              ),
            ),
          db
            .selectDistinct({ userId: bookingSessions.userId })
            .from(bookingSessions)
            .where(eq(bookingSessions.therapistId, therapistId)),
          db
            .select({ count: count() })
            .from(bookingSessions)
            .where(
              and(
                eq(bookingSessions.therapistId, therapistId),
                eq(bookingSessions.status, 'completed'),
              ),
            ),
        ],
      );

      // Format the data
      const clients = clientsResult.map((client) => ({
        id: client.id.toString(),
        firstName: client.firstName || '',
        lastName: client.lastName || '',
        email: client.email || '',
        phone: undefined, // Not available in current schema
        createdAt: new Date().toISOString(), // Default to current time
        lastSessionDate: undefined, // Could be calculated but not needed for this optimization
        totalSessions: 0, // Could be calculated but not needed for this optimization
        status: 'active' as const, // Default to active
      }));

      const upcomingSessions = sessionsResult.map((session) => {
        const metadata = session.metadata as {
          googleMeetLink?: string;
          therapistTimezone?: string;
          clientTimezone?: string;
        } | null;

        return {
          id: session.id.toString(),
          clientId: session.clientId?.toString() ?? '',
          clientName: `${session.clientName || ''} ${session.clientLastName || ''}`.trim(),
          sessionDate: session.sessionDate.toISOString(),
          sessionStartTime: session.sessionStartTime.toISOString(),
          therapistTimezone: metadata?.therapistTimezone || 'America/New_York',
          clientTimezone: metadata?.clientTimezone || 'America/New_York',
          duration: 60, // Default 60 minutes
          sessionType: 'follow-up' as const, // Default type
          status: session.status as 'scheduled' | 'confirmed' | 'pending',
          googleMeetLink: metadata?.googleMeetLink || undefined,
          notes: undefined,
        };
      });

      const statistics = {
        totalClients: [...new Set(uniqueClientsCount.map((row) => row.userId))].length,
        activeClients: [...new Set(uniqueClientsCount.map((row) => row.userId))].length, // Same as total for now
        totalSessions: upcomingSessionsCount[0]?.count ?? 0,
        upcomingSessions: upcomingSessionsCount[0]?.count ?? 0,
        totalRevenue: 0, // Would need payment data
        monthlyRevenue: 0, // Would need payment data
        averageSessionRating: undefined,
        completionRate:
          completedSessionsCount[0]?.count > 0
            ? (completedSessionsCount[0].count /
                (completedSessionsCount[0].count + upcomingSessionsCount[0]?.count || 0)) *
              100
            : 0,
      };

      return {
        clients,
        upcomingSessions,
        statistics,
      };
    },
    { ttl: CACHE_TTL.DASHBOARD_DATA },
  );
}

/**
 * Get clients data only
 */
export async function getClientsData(therapistId: number) {
  return withCache(
    CACHE_KEYS.therapistClients(therapistId),
    async () => {
      const clientsResult = await db
        .selectDistinct({
          id: users.id,
          firstName: users.firstName,
          lastName: users.lastName,
          email: users.email,
          imageUrl: users.imageUrl,
        })
        .from(users)
        .innerJoin(bookingSessions, eq(users.id, bookingSessions.userId))
        .where(eq(bookingSessions.therapistId, therapistId))
        .orderBy(users.firstName, users.lastName);

      return {
        clients: clientsResult.map((client) => ({
          id: client.id,
          firstName: client.firstName,
          lastName: client.lastName,
          email: client.email,
          imageUrl: client.imageUrl,
          fullName: `${client.firstName || ''} ${client.lastName || ''}`.trim() || client.email,
        })),
        total: clientsResult.length,
      };
    },
    { ttl: CACHE_TTL.DASHBOARD_DATA },
  );
}

/**
 * Get sessions data only
 */
export async function getSessionsData(therapistId: number) {
  return withCache(
    CACHE_KEYS.therapistSessions(therapistId),
    async () => {
      const now = new Date();
      const sessions = await db
        .select({
          id: bookingSessions.id,
          clientId: bookingSessions.userId,
          clientName: users.firstName,
          clientLastName: users.lastName,
          sessionDate: bookingSessions.sessionDate,
          sessionStartTime: bookingSessions.sessionStartTime,
          status: bookingSessions.status,
          metadata: bookingSessions.metadata,
        })
        .from(bookingSessions)
        .leftJoin(users, eq(bookingSessions.userId, users.id))
        .where(
          and(
            eq(bookingSessions.therapistId, therapistId),
            or(
              eq(bookingSessions.status, 'pending'),
              eq(bookingSessions.status, 'confirmed'),
              eq(bookingSessions.status, 'scheduled'),
            ),
            gt(bookingSessions.sessionDate, now),
          ),
        )
        .orderBy(bookingSessions.sessionDate)
        .limit(10);

      return {
        sessions: sessions.map((session) => {
          const sessionMetadata = session.metadata as {
            therapistTimezone?: string;
            clientTimezone?: string;
            googleMeetLink?: string;
          } | null;

          return {
            id: session.id.toString(),
            clientId: session.clientId,
            clientName: `${session.clientName || ''} ${session.clientLastName || ''}`.trim(),
            sessionDate: session.sessionDate,
            sessionStartTime: session.sessionStartTime,
            status: session.status,
            therapistTimezone: sessionMetadata?.therapistTimezone || 'America/New_York',
            clientTimezone: sessionMetadata?.clientTimezone || 'America/New_York',
            googleMeetLink: sessionMetadata?.googleMeetLink || '',
          };
        }),
      };
    },
    { ttl: CACHE_TTL.DASHBOARD_DATA },
  );
}

/**
 * Get statistics data only
 */
export async function getStatisticsData(therapistId: number) {
  return withCache(
    CACHE_KEYS.therapistStatistics(therapistId),
    async () => {
      const [totalSessionsResult, uniqueClientsResult, completedSessionsResult] = await Promise.all(
        [
          db
            .select({ count: count() })
            .from(bookingSessions)
            .where(eq(bookingSessions.therapistId, therapistId)),
          db
            .selectDistinct({ userId: bookingSessions.userId })
            .from(bookingSessions)
            .where(eq(bookingSessions.therapistId, therapistId)),
          db
            .select({ count: count() })
            .from(bookingSessions)
            .where(
              and(
                eq(bookingSessions.therapistId, therapistId),
                eq(bookingSessions.status, 'completed'),
              ),
            ),
        ],
      );

      return {
        statistics: {
          totalSessions: totalSessionsResult[0]?.count ?? 0,
          totalClients: [...new Set(uniqueClientsResult.map((row) => row.userId))].length,
          completedSessions: completedSessionsResult[0]?.count ?? 0,
        },
      };
    },
    { ttl: CACHE_TTL.DASHBOARD_DATA },
  );
}

/**
 * Invalidate all cached data for a therapist
 */
export async function invalidateTherapistCache(therapistId: number): Promise<void> {
  await Promise.all([
    deleteFromCache(CACHE_KEYS.therapistDashboard(therapistId)),
    deleteFromCache(CACHE_KEYS.therapistClients(therapistId)),
    deleteFromCache(CACHE_KEYS.therapistSessions(therapistId)),
    deleteFromCache(CACHE_KEYS.therapistStatistics(therapistId)),
    deleteFromCache(CACHE_KEYS.therapistProfile(therapistId)),
    // Also clear any client notes cache
    deleteCachePattern(`therapist:${therapistId}:client:*:notes`),
  ]);
}

/**
 * Invalidate cache when data changes (call this from mutations)
 */
export async function invalidateOnDataChange(
  therapistId: number,
  type: 'client' | 'session' | 'note' | 'all' = 'all',
): Promise<void> {
  if (type === 'all') {
    await invalidateTherapistCache(therapistId);
  } else if (type === 'client' || type === 'session') {
    // Invalidate dashboard and specific data type
    await Promise.all([
      deleteFromCache(CACHE_KEYS.therapistDashboard(therapistId)),
      deleteFromCache(
        type === 'client'
          ? CACHE_KEYS.therapistClients(therapistId)
          : CACHE_KEYS.therapistSessions(therapistId),
      ),
      deleteFromCache(CACHE_KEYS.therapistStatistics(therapistId)),
    ]);
  } else if (type === 'note') {
    // Notes don't affect main dashboard data
    await deleteCachePattern(`therapist:${therapistId}:client:*:notes`);
  }
}

/**
 * Get client notes with caching
 */
export async function getClientNotes(therapistId: number, clientId?: string, category?: string) {
  const cacheKey = clientId
    ? CACHE_KEYS.therapistNotes(therapistId, clientId)
    : `therapist:${therapistId}:notes:all`;

  return withCache(
    cacheKey,
    async () => {
      const conditions = [eq(clientNotes.therapistId, therapistId)];

      if (clientId) {
        conditions.push(eq(clientNotes.userId, parseInt(clientId)));
      }

      // Fetch notes with optimized query
      const notes = await db
        .select()
        .from(clientNotes)
        .where(and(...conditions))
        .orderBy(desc(clientNotes.createdAt));

      // Filter by category if specified (done in memory for simplicity)
      const filteredNotes = category
        ? notes.filter((note) => {
            const content = note.content as ClientNoteContent;
            return content?.category === category;
          })
        : notes;

      return { notes: filteredNotes };
    },
    { ttl: CACHE_TTL.NOTES_DATA },
  );
}
