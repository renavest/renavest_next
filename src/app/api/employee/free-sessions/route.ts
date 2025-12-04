import { auth } from '@clerk/nextjs/server';
import { and, eq, or } from 'drizzle-orm';
import { NextRequest, NextResponse } from 'next/server';

import { db } from '@/src/db';
import { bookedSessions, users } from '@/src/db/schema';

export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Map Clerk userId to users.id and get email
    const userResult = await db
      .select({ id: users.id, email: users.email })
      .from(users)
      .where(eq(users.clerkId, userId))
      .limit(1);

    if (!userResult.length) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const dbUserId = userResult[0].id;
    const userEmail = userResult[0].email;

    // Get all free sessions booked by this user (not cancelled)
    // Match by userId OR userEmail (userEmail is always required in schema)
    const freeSessions = await db
      .select({
        therapistJsonId: bookedSessions.therapistJsonId,
      })
      .from(bookedSessions)
      .where(
        and(
          eq(bookedSessions.type, 'free'),
          eq(bookedSessions.cancelled, false),
          // Match by userId if available, otherwise by email (email is always required)
          dbUserId && userEmail
            ? or(
                eq(bookedSessions.userId, dbUserId),
                eq(bookedSessions.userEmail, userEmail),
              )
            : eq(bookedSessions.userEmail, userEmail || ''),
        ),
      );

    // Count unique therapists (therapistJsonId)
    const uniqueTherapistIds = new Set(
      freeSessions
        .map((s) => s.therapistJsonId)
        .filter((id): id is number => id !== null),
    );

    const freeSessionsCount = uniqueTherapistIds.size;

    // Get therapistJsonId from query params if provided
    const searchParams = req.nextUrl.searchParams;
    const therapistJsonIdParam = searchParams.get('therapistJsonId');

    let hasBookedWithTherapist = false;
    if (therapistJsonIdParam) {
      const therapistId = parseInt(therapistJsonIdParam, 10);
      hasBookedWithTherapist = uniqueTherapistIds.has(therapistId);
    }

    return NextResponse.json({
      freeSessionsCount,
      hasBookedWithTherapist,
      remainingFreeSessions: Math.max(0, 3 - freeSessionsCount),
    });
  } catch (error) {
    console.error('Error fetching free sessions:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch free sessions',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}
