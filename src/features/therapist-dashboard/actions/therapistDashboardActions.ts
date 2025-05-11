import { auth } from '@clerk/nextjs/server';
import { eq, desc, count } from 'drizzle-orm';

import { db } from '@/src/db';
import { bookingSessions, therapists, users } from '@/src/db/schema';
export async function fetchTherapistDashboardData(therapistId: number) {
  try {
    auth.protect();
    // Fetch therapist details
    const therapist = await db.query.therapists.findFirst({
      where: eq(therapists.id, therapistId),
    });

    if (!therapist) {
      throw new Error('Therapist not found');
    }

    // Fetch upcoming booking sessions with client details
    const upcomingSessions = await db
      .select({
        id: bookingSessions.id,
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

    // Fetch client metrics
    const totalClients = await db
      .select({ count: count() })
      .from(bookingSessions)
      .where(eq(bookingSessions.therapistId, therapistId));

    const activeClients = await db
      .select({ count: count() })
      .from(bookingSessions)
      .where(eq(bookingSessions.therapistId, therapistId));

    const completedSessions = await db
      .select({ count: count() })
      .from(bookingSessions)
      .where(eq(bookingSessions.therapistId, therapistId));

    return {
      therapist,
      upcomingSessions: upcomingSessions.map((session) => ({
        ...session,
        clientName: `${session.clientName} ${session.clientLastName}`.trim(),
      })),
      clientMetrics: {
        totalClients: totalClients[0]?.count ?? 0,
        activeClients: activeClients[0]?.count ?? 0,
        completedSessions: completedSessions[0]?.count ?? 0,
      },
    };
  } catch (error) {
    console.error('Error fetching therapist dashboard data:', error);
    throw error;
  }
}
