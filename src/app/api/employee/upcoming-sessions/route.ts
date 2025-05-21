import { auth } from '@clerk/nextjs/server';
import { and, eq, gt, or } from 'drizzle-orm';
import { DateTime } from 'luxon';
import { NextResponse } from 'next/server';

import { db } from '@/src/db';
import { bookingSessions, therapists, users } from '@/src/db/schema';

export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
              
    const now = DateTime.now().toJSDate();

    const upcomingSessions = await db
      .select({
        id: bookingSessions.id,
        therapistName: therapists.name,
        therapistProfileUrl: therapists.profileUrl,
        sessionDate: bookingSessions.sessionDate,
        sessionStartTime: bookingSessions.sessionStartTime,
        status: bookingSessions.status,
        metadata: bookingSessions.metadata,
      })
      .from(bookingSessions)
      .leftJoin(therapists, eq(bookingSessions.therapistId, therapists.id))
      .leftJoin(users, eq(bookingSessions.userId, users.clerkId))
      .where(
        and(
          eq(bookingSessions.userId, userId),
          or(eq(bookingSessions.status, 'confirmed'), eq(bookingSessions.status, 'scheduled')),
          gt(bookingSessions.sessionDate, now),
        ),
      )
      .orderBy(bookingSessions.sessionDate)
      .limit(3);

    const sessionsWithMeet = upcomingSessions.map((s) => {
      const meta = s.metadata as { googleMeetLink?: string } | undefined;
      return {
        ...s,
        googleMeetLink: meta?.googleMeetLink || '',
      };
    });

    return NextResponse.json({
      upcomingSessions: sessionsWithMeet,
      totalUpcomingSessions: sessionsWithMeet.length,
    });
  } catch (error) {
    console.error('Error fetching upcoming sessions:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch upcoming sessions',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}
