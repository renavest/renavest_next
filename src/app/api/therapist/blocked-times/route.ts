import { currentUser } from '@clerk/nextjs/server';
import { eq, and, gte, lte } from 'drizzle-orm';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

import { db } from '@/src/db';
import { users, therapists, therapistBlockedTimes } from '@/src/db/schema';

const CreateBlockedTimeSchema = z.object({
  therapistId: z.number(),
  blockedTime: z.object({
    date: z.string(),
    startTime: z.string(),
    endTime: z.string(),
    reason: z.string().optional(),
    isRecurring: z.boolean().default(false),
  }),
});

const GetBlockedTimesSchema = z.object({
  therapistId: z.string(),
  month: z.string().optional(),
});

// GET - Fetch blocked times for a therapist
export async function GET(req: NextRequest) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = req.nextUrl.searchParams;
    const { therapistId, month } = GetBlockedTimesSchema.parse({
      therapistId: searchParams.get('therapistId'),
      month: searchParams.get('month'),
    });

    const therapistIdNum = parseInt(therapistId);

    // Get the internal user record
    const userRecord = await db.select().from(users).where(eq(users.clerkId, user.id)).limit(1);
    if (userRecord.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const userId = userRecord[0].id;

    // Verify therapist ownership or access
    const therapistRecord = await db
      .select()
      .from(therapists)
      .where(eq(therapists.id, therapistIdNum))
      .limit(1);

    if (therapistRecord.length === 0) {
      return NextResponse.json({ error: 'Therapist not found' }, { status: 404 });
    }

    // Only allow therapists to access their own blocked times
    if (therapistRecord[0].userId !== userId) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Build query conditions
    let whereConditions = eq(therapistBlockedTimes.therapistId, therapistIdNum);

    if (month) {
      // Parse month in YYYY-MM format and create Date objects for start and end
      const year = parseInt(month.split('-')[0]);
      const monthNum = parseInt(month.split('-')[1]) - 1; // JavaScript months are 0-indexed
      const monthStart = new Date(year, monthNum, 1);
      const monthEnd = new Date(year, monthNum + 1, 0, 23, 59, 59, 999);

      whereConditions = and(
        whereConditions,
        gte(therapistBlockedTimes.startTime, monthStart),
        lte(therapistBlockedTimes.startTime, monthEnd),
      )!;
    }

    // Fetch blocked times
    const blockedTimesResult = await db
      .select()
      .from(therapistBlockedTimes)
      .where(whereConditions)
      .orderBy(therapistBlockedTimes.startTime);

    const blockedTimes = blockedTimesResult.map((blocked) => {
      const startDate = new Date(blocked.startTime);
      const endDate = new Date(blocked.endTime);

      return {
        id: blocked.id,
        date: startDate.toISOString().split('T')[0], // Format as YYYY-MM-DD
        startTime: startDate.toTimeString().slice(0, 5), // Format as HH:MM
        endTime: endDate.toTimeString().slice(0, 5), // Format as HH:MM
        reason: blocked.reason,
        isRecurring: false, // This field doesn't exist in current schema
      };
    });

    return NextResponse.json({
      success: true,
      blockedTimes,
    });
  } catch (error) {
    console.error('[GET BLOCKED TIMES] Error:', error);

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

// POST - Create a new blocked time
export async function POST(req: NextRequest) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { therapistId, blockedTime } = CreateBlockedTimeSchema.parse(body);

    // Get the internal user record
    const userRecord = await db.select().from(users).where(eq(users.clerkId, user.id)).limit(1);
    if (userRecord.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const userId = userRecord[0].id;

    // Verify therapist ownership
    const therapistRecord = await db
      .select()
      .from(therapists)
      .where(eq(therapists.id, therapistId))
      .limit(1);

    if (therapistRecord.length === 0) {
      return NextResponse.json({ error: 'Therapist not found' }, { status: 404 });
    }

    if (therapistRecord[0].userId !== userId) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Validate the blocked time
    const blockedDate = new Date(blockedTime.date);
    if (isNaN(blockedDate.getTime())) {
      return NextResponse.json({ error: 'Invalid date format' }, { status: 400 });
    }

    // Check for time format validation
    const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (!timeRegex.test(blockedTime.startTime) || !timeRegex.test(blockedTime.endTime)) {
      return NextResponse.json(
        { error: 'Invalid time format. Use HH:MM format.' },
        { status: 400 },
      );
    }

    // Validate that start time is before end time
    const [startHour, startMin] = blockedTime.startTime.split(':').map(Number);
    const [endHour, endMin] = blockedTime.endTime.split(':').map(Number);
    const startMinutes = startHour * 60 + startMin;
    const endMinutes = endHour * 60 + endMin;

    if (startMinutes >= endMinutes) {
      return NextResponse.json({ error: 'Start time must be before end time' }, { status: 400 });
    }

    // Create start and end timestamps
    const startDateTime = new Date(blockedDate);
    startDateTime.setHours(startHour, startMin, 0, 0);
    const endDateTime = new Date(blockedDate);
    endDateTime.setHours(endHour, endMin, 0, 0);

    // Check for overlapping blocked times
    const existingBlockedTimes = await db
      .select()
      .from(therapistBlockedTimes)
      .where(
        and(
          eq(therapistBlockedTimes.therapistId, therapistId),
          gte(therapistBlockedTimes.endTime, startDateTime),
          lte(therapistBlockedTimes.startTime, endDateTime),
        ),
      );

    if (existingBlockedTimes.length > 0) {
      return NextResponse.json(
        { error: 'This time period overlaps with an existing blocked time' },
        { status: 409 },
      );
    }

    // Create the blocked time
    const result = await db
      .insert(therapistBlockedTimes)
      .values({
        therapistId,
        startTime: startDateTime,
        endTime: endDateTime,
        reason: blockedTime.reason,
        googleEventId: null,
      })
      .returning();

    const createdBlocked = result[0];
    const startDate = new Date(createdBlocked.startTime);
    const endDate = new Date(createdBlocked.endTime);

    return NextResponse.json({
      success: true,
      blockedTime: {
        id: createdBlocked.id,
        date: startDate.toISOString().split('T')[0],
        startTime: startDate.toTimeString().slice(0, 5),
        endTime: endDate.toTimeString().slice(0, 5),
        reason: createdBlocked.reason,
        isRecurring: false, // This field doesn't exist in current schema
      },
    });
  } catch (error) {
    console.error('[CREATE BLOCKED TIME] Error:', error);

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
