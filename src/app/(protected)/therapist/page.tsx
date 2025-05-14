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
    // Get the user's email
    const email = user.emailAddresses[0]?.emailAddress;

    if (!email) {
      console.log('No email found for user');
      redirect('/therapist-signup/error');
    }

    // Directly check if the therapist exists in the database
    const therapistResult = await db
      .select({ id: therapists.id })
      .from(therapists)
      .where(eq(therapists.email, email))
      .limit(1);

    // If no therapist found, redirect to error page
    if (!therapistResult.length) {
      console.log('No pre-approved therapist found');
      redirect('/therapist-signup/error');
    } else {
      // Update user metadata to mark as therapist
      await (
        await clerkClient()
      ).users.updateUserMetadata(user.id, {
        publicMetadata: {
          role: 'therapist',
        },
      });
    }

    const therapistId = therapistResult[0].id;

    // Fetch clients for this therapist
    const clientsResult = await db
      .select({
        id: users.clerkId,
        firstName: users.firstName,
        lastName: users.lastName,
        email: users.email,
      })
      .from(users)
      .where(eq(users.therapistId, therapistId));

    const clients: Client[] = clientsResult.map((client) => ({
      id: client.id,
      firstName: client.firstName || '',
      lastName: client.lastName || undefined,
      email: client.email || '',
    }));

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
      .leftJoin(users, eq(bookingSessions.userId, users.clerkId))
      .where(eq(bookingSessions.therapistId, therapistId))
      .orderBy(desc(bookingSessions.sessionDate))
      .limit(10);

    const upcomingSessions: UpcomingSession[] = sessionsResult.map((session) => ({
      id: session.id.toString(),
      clientId: session.clientId,
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
      .selectDistinct({ count: count() })
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
