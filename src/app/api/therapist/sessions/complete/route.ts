import { currentUser } from '@clerk/nextjs/server';
import { eq } from 'drizzle-orm';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

import { db } from '@/src/db';
import { users, therapists } from '@/src/db/schema';
import { SessionCompletionService } from '@/src/features/stripe/services/session-completion';

const CompleteSessionSchema = z.object({
  sessionId: z.number(),
});

// POST - Mark session as completed
export async function POST(req: NextRequest) {
  try {
    const user = await currentUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { sessionId } = CompleteSessionSchema.parse(body);

    // Get the internal user record
    const userRecord = await db.select().from(users).where(eq(users.clerkId, user.id)).limit(1);

    if (userRecord.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const userId = userRecord[0].id;
    const userRole = userRecord[0].role;

    // Only therapists can mark sessions as completed
    if (userRole !== 'therapist') {
      return NextResponse.json(
        { error: 'Only therapists can mark sessions as completed' },
        { status: 403 },
      );
    }

    // Get therapist record
    const therapistRecord = await db
      .select()
      .from(therapists)
      .where(eq(therapists.userId, userId))
      .limit(1);

    if (therapistRecord.length === 0) {
      return NextResponse.json({ error: 'Therapist profile not found' }, { status: 404 });
    }

    const therapistId = therapistRecord[0].id;

    // Mark session as completed
    const result = await SessionCompletionService.markSessionCompleted(sessionId, therapistId);

    if (!result.success) {
      return NextResponse.json({ error: result.message }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: 'Session marked as completed successfully',
    });
  } catch (error) {
    console.error('[COMPLETE SESSION] Error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: 'Invalid request parameters',
          details: error.errors,
        },
        { status: 400 },
      );
    }

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

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

    // Get therapist record
    const therapistRecord = await db
      .select()
      .from(therapists)
      .where(eq(therapists.userId, userId))
      .limit(1);

    if (therapistRecord.length === 0) {
      return NextResponse.json({ error: 'Therapist profile not found' }, { status: 404 });
    }

    const therapistId = therapistRecord[0].id;

    // Get completable sessions
    const sessions = await SessionCompletionService.getCompletableSessionsForTherapist(therapistId);

    return NextResponse.json({
      success: true,
      sessions,
    });
  } catch (error) {
    console.error('[GET COMPLETABLE SESSIONS] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
