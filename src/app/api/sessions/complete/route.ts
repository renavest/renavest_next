import { currentUser } from '@clerk/nextjs/server';
import { eq, and } from 'drizzle-orm';
import { NextRequest, NextResponse } from 'next/server';

import { db } from '@/src/db';
import { users, therapists, bookingSessions, sessionPayments } from '@/src/db/schema';
import { SessionCompletionService } from '@/src/features/stripe/services/session-completion';

// POST - Mark session as completed and trigger payment
export async function POST(req: NextRequest) {
  try {
    const user = await currentUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { sessionId } = body;

    if (!sessionId) {
      return NextResponse.json({ error: 'Session ID is required' }, { status: 400 });
    }

    // Get the internal user record
    const userRecord = await db.select().from(users).where(eq(users.clerkId, user.id)).limit(1);

    if (userRecord.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const userId = userRecord[0].id;
    const userRole = userRecord[0].role;

    // Only therapists can complete sessions
    if (userRole !== 'therapist') {
      return NextResponse.json({ error: 'Only therapists can complete sessions' }, { status: 403 });
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

    // Verify the session belongs to this therapist
    const session = await db
      .select()
      .from(bookingSessions)
      .where(and(eq(bookingSessions.id, sessionId), eq(bookingSessions.therapistId, therapistId)))
      .limit(1);

    if (session.length === 0) {
      return NextResponse.json(
        { error: 'Session not found or does not belong to this therapist' },
        { status: 404 },
      );
    }

    const sessionData = session[0];

    if (sessionData.status === 'completed') {
      return NextResponse.json({ error: 'Session already completed' }, { status: 400 });
    }

    // Mark session as completed using the service
    const result = await SessionCompletionService.markSessionCompleted(
      sessionId,
      therapistId,
      true, // completedByTherapist
    );

    if (!result.success) {
      return NextResponse.json({ error: result.message }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: 'Session completed successfully',
      sessionId,
    });
  } catch (error) {
    console.error('[SESSION COMPLETE] Error completing session:', error);
    return NextResponse.json({ error: 'Failed to complete session' }, { status: 500 });
  }
}

// GET - Check if session can be completed
export async function GET(req: NextRequest) {
  try {
    const user = await currentUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const url = new URL(req.url);
    const sessionId = url.searchParams.get('sessionId');

    if (!sessionId) {
      return NextResponse.json({ error: 'Session ID is required' }, { status: 400 });
    }

    // Get the internal user record
    const userRecord = await db.select().from(users).where(eq(users.clerkId, user.id)).limit(1);

    if (userRecord.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const userId = userRecord[0].id;
    const userRole = userRecord[0].role;

    // Only therapists can check session completion status
    if (userRole !== 'therapist') {
      return NextResponse.json(
        { error: 'Only therapists can check session status' },
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

    // Check if session exists and belongs to therapist
    const session = await db
      .select({
        id: bookingSessions.id,
        status: bookingSessions.status,
        sessionDate: bookingSessions.sessionDate,
        startTime: bookingSessions.startTime,
        endTime: bookingSessions.endTime,
      })
      .from(bookingSessions)
      .where(
        and(
          eq(bookingSessions.id, parseInt(sessionId)),
          eq(bookingSessions.therapistId, therapistId),
        ),
      )
      .limit(1);

    if (session.length === 0) {
      return NextResponse.json(
        { error: 'Session not found or does not belong to this therapist' },
        { status: 404 },
      );
    }

    const sessionData = session[0];

    // Check if there's a payment record
    const payment = await db
      .select()
      .from(sessionPayments)
      .where(eq(sessionPayments.bookingSessionId, sessionData.id))
      .limit(1);

    return NextResponse.json({
      canComplete: sessionData.status !== 'completed',
      session: sessionData,
      hasPayment: payment.length > 0,
      paymentStatus: payment.length > 0 ? payment[0].status : null,
    });
  } catch (error) {
    console.error('[SESSION STATUS] Error checking session status:', error);
    return NextResponse.json({ error: 'Failed to check session status' }, { status: 500 });
  }
}
