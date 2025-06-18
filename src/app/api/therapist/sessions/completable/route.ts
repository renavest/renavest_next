import { currentUser } from '@clerk/nextjs/server';
import { eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';

import { db } from '@/src/db';
import { users, therapists } from '@/src/db/schema';
import { SessionCompletionService } from '@/src/features/stripe/services/session-completion';

// GET - Get completable sessions for therapist
export async function GET() {
  try {
    const user = await currentUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get the internal user record
    const userRecord = await db.select().from(users).where(eq(users.clerkId, user.id)).limit(1);

    if (userRecord.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const userId = userRecord[0].id;
    const userRole = userRecord[0].role;

    // Only therapists can get completable sessions
    if (userRole !== 'therapist') {
      return NextResponse.json(
        { error: 'Only therapists can access this endpoint' },
        { status: 403 },
      );
    }

    // Get therapist record with pricing information
    const therapistRecord = await db
      .select({
        id: therapists.id,
        hourlyRateCents: therapists.hourlyRateCents,
      })
      .from(therapists)
      .where(eq(therapists.userId, userId))
      .limit(1);

    if (therapistRecord.length === 0) {
      return NextResponse.json({ error: 'Therapist profile not found' }, { status: 404 });
    }

    const therapist = therapistRecord[0];

    // Get completable sessions
    const sessions = await SessionCompletionService.getCompletableSessionsForTherapist(
      therapist.id,
    );

    // Enhance sessions with payment information
    const enhancedSessions = sessions.map((session) => ({
      ...session,
      hourlyRateCents: therapist.hourlyRateCents,
      paymentRequired: Boolean(therapist.hourlyRateCents && therapist.hourlyRateCents > 0),
    }));

    return NextResponse.json({
      success: true,
      sessions: enhancedSessions,
    });
  } catch (error) {
    console.error('[GET COMPLETABLE SESSIONS] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
