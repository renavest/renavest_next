'use server';
import { currentUser } from '@clerk/nextjs/server';
import { eq, count, inArray, gt, and, or } from 'drizzle-orm';
import { redirect } from 'next/navigation';

import { db } from '@/src/db';
import { bookingSessions, therapists, users } from '@/src/db/schema';
import TherapistDashboardClient from '@/src/features/therapist-dashboard/components/dashboard/TherapistDashboardClient';
import {
  Client,
  TherapistStatistics,
  UpcomingSession,
} from '@/src/features/therapist-dashboard/types';

export default async function TherapistPage() {
  const user = await currentUser();

  if (!user) {
    redirect('/login');
  }
  try {
    // Get the user's clerkId
    const clerkId = user.id;
    if (!clerkId) {
      console.log('No Clerk ID found for user');
      redirect('/therapist-signup/error');
    }

    // Get the user's row in the users table
    const userResult = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.clerkId, clerkId));
    const userRow = userResult[0];
    if (!userRow) {
      console.log('No user found in DB for Clerk ID');
      redirect('/therapist-signup/error');
    }

    // Get the therapist's id from the therapists table
    const therapistResult = await db
      .select({ id: therapists.id })
      .from(therapists)
      .where(eq(therapists.userId, userRow.id));
    const therapist = therapistResult[0];
    if (!therapist) {
      console.log('No therapist profile found for user');
      redirect('/therapist-signup/error');
    }
    const therapistId = therapist.id;

    // Fetch clients for this therapist (users who have booked with this therapist)
    const clientUserIdsResult = await db
      .select({ userId: bookingSessions.userId })
      .from(bookingSessions)
      .where(eq(bookingSessions.therapistId, therapistId));
    const uniqueClientUserIds = [...new Set(clientUserIdsResult.map((row) => row.userId))];
    let clients: Client[] = [];
    if (uniqueClientUserIds.length > 0) {
      const clientsResult = await db
        .select({
          id: users.id,
          firstName: users.firstName,
          lastName: users.lastName,
          email: users.email,
        })
        .from(users)
        .where(inArray(users.id, uniqueClientUserIds));
      clients = clientsResult.map((client) => ({
        id: client.id.toString(),
        firstName: client.firstName || '',
        lastName: client.lastName || undefined,
        email: client.email || '',
      }));
    }

    // Fetch upcoming sessions for this therapist
    const now = new Date();
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

    const upcomingSessions: UpcomingSession[] = sessionsResult.map((session) => {
      // Extract Google Meet link and timezone info from metadata
      const metadata = session.metadata as {
        googleMeetLink?: string;
        therapistTimezone?: string;
        clientTimezone?: string;
      } | null;
      const googleMeetLink = metadata?.googleMeetLink || '';
      const therapistTimezone = metadata?.therapistTimezone || 'UTC';
      const clientTimezone = metadata?.clientTimezone || 'UTC';

      return {
        id: session.id.toString(),
        clientId: session.clientId?.toString() ?? '',
        clientName: `${session.clientName || ''} ${session.clientLastName || ''}`.trim(),
        sessionDate: session.sessionDate.toISOString(),
        sessionStartTime: session.sessionStartTime.toISOString(),
        status: session.status as 'scheduled' | 'completed' | 'cancelled' | 'rescheduled',
        googleMeetLink,
        therapistTimezone,
        clientTimezone,
      };
    });

    // Fetch statistics
    // Count upcoming sessions (same criteria as the upcoming sessions query)
    const upcomingSessionsResult = await db
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
      );

    // Count unique clients (distinct user IDs who have booked with this therapist)
    const uniqueClientsResult = await db
      .select({ userId: bookingSessions.userId })
      .from(bookingSessions)
      .where(eq(bookingSessions.therapistId, therapistId));
    const uniqueClientCount = [...new Set(uniqueClientsResult.map((row) => row.userId))].length;

    // Count completed sessions
    const completedSessionsResult = await db
      .select({ count: count() })
      .from(bookingSessions)
      .where(
        and(eq(bookingSessions.therapistId, therapistId), eq(bookingSessions.status, 'completed')),
      );

    const statistics: TherapistStatistics = {
      totalSessions: upcomingSessionsResult[0]?.count ?? 0,
      totalClients: uniqueClientCount,
      completedSessions: completedSessionsResult[0]?.count ?? 0,
    };

    return (
      <TherapistDashboardClient
        initialClients={clients}
        initialUpcomingSessions={upcomingSessions}
        initialStatistics={statistics}
        initialTherapistId={therapistId}
      />
    );
  } catch (error) {
    console.error('Therapist pre-approval check failed:', error);
    redirect('/therapist-signup/error');
  }
}
