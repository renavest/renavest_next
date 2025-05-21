'use server';
import { currentUser } from '@clerk/nextjs/server';
import { clerkClient } from '@clerk/nextjs/server';
import { eq, desc, count } from 'drizzle-orm';
import { redirect } from 'next/navigation';

import { db } from '@/src/db';
import { bookingSessions, therapists, users } from '@/src/db/schema';
import {
  Client,
  TherapistStatistics,
  UpcomingSession,
} from '@/src/features/therapist-dashboard/types';

import TherapistDashboardClient from '../../../features/therapist-dashboard/components/TherapistDashboardClient';

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
          id: users.clerkId,
          firstName: users.firstName,
          lastName: users.lastName,
          email: users.email,
        })
        .from(users)
        .where(
          // @ts-ignore
          users.id.in(uniqueClientUserIds),
        );
      clients = clientsResult.map((client) => ({
        id: client.id,
        firstName: client.firstName || '',
        lastName: client.lastName || undefined,
        email: client.email || '',
      }));
    }

    // Fetch upcoming sessions for this therapist
    const sessionsResult = await db
      .select({
        id: bookingSessions.id,
        clientId: bookingSessions.userId,
        clientName: users.firstName,
        clientLastName: users.lastName,
        sessionDate: bookingSessions.sessionDate,
        sessionStartTime: bookingSessions.sessionStartTime,
        status: bookingSessions.status,
      })
      .from(bookingSessions)
      .leftJoin(users, eq(bookingSessions.userId, users.id))
      .where(eq(bookingSessions.therapistId, therapistId))
      .orderBy(desc(bookingSessions.sessionDate))
      .limit(10);

    const upcomingSessions: UpcomingSession[] = sessionsResult.map((session) => ({
      id: session.id.toString(),
      clientId: session.clientId?.toString() ?? '',
      clientName: `${session.clientName || ''} ${session.clientLastName || ''}`.trim(),
      sessionDate: session.sessionDate.toISOString(),
      sessionStartTime: session.sessionStartTime.toISOString(),
      status: session.status as 'scheduled' | 'completed' | 'cancelled' | 'rescheduled',
    }));

    // Fetch statistics
    const totalSessionsResult = await db
      .select({ count: count() })
      .from(bookingSessions)
      .where(eq(bookingSessions.therapistId, therapistId));

    const totalClientsResult = await db
      .select({ count: count() })
      .from(bookingSessions)
      .where(eq(bookingSessions.therapistId, therapistId));

    const completedSessionsResult = await db
      .select({ count: count() })
      .from(bookingSessions)
      .where(eq(bookingSessions.therapistId, therapistId));

    const statistics: TherapistStatistics = {
      totalSessions: totalSessionsResult[0]?.count ?? 0,
      totalClients: totalClientsResult[0]?.count ?? 0,
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
