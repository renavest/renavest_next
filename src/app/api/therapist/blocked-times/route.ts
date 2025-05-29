import { currentUser } from '@clerk/nextjs/server';
import { eq, and, gte, lte } from 'drizzle-orm';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

import { db } from '@/src/db';
import { users, therapists, therapistBlockedTimes } from '@/src/db/schema';
import { createDate } from '@/src/utils/timezone';

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
      const monthStart = createDate(month).startOf('month');
      const monthEnd = createDate(month).endOf('month');

      whereConditions = and(
        whereConditions,
        gte(therapistBlockedTimes.date, monthStart.toJSDate()),
        lte(therapistBlockedTimes.date, monthEnd.toJSDate()),
      );
    }

    // Fetch blocked times
    const blockedTimesResult = await db
      .select()
      .from(therapistBlockedTimes)
      .where(whereConditions)
      .orderBy(therapistBlockedTimes.date, therapistBlockedTimes.startTime);

    const blockedTimes = blockedTimesResult.map((blocked) => ({
      id: blocked.id,
      date: blocked.date.toISOString().split('T')[0], // Format as YYYY-MM-DD
      startTime: blocked.startTime,
      endTime: blocked.endTime,
      reason: blocked.reason,
      isRecurring: blocked.isRecurring,
    }));

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
    const blockedDate = createDate(blockedTime.date);
    if (!blockedDate.isValid) {
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

    // Check for overlapping blocked times
    const existingBlockedTimes = await db
      .select()
      .from(therapistBlockedTimes)
      .where(
        and(
          eq(therapistBlockedTimes.therapistId, therapistId),
          eq(therapistBlockedTimes.date, blockedDate.toJSDate()),
        ),
      );

    const hasOverlap = existingBlockedTimes.some((existing) => {
      const [existingStartHour, existingStartMin] = existing.startTime.split(':').map(Number);
      const [existingEndHour, existingEndMin] = existing.endTime.split(':').map(Number);
      const existingStartMinutes = existingStartHour * 60 + existingStartMin;
      const existingEndMinutes = existingEndHour * 60 + existingEndMin;

      return startMinutes < existingEndMinutes && endMinutes > existingStartMinutes;
    });

    if (hasOverlap) {
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
        date: blockedDate.toJSDate(),
        startTime: blockedTime.startTime,
        endTime: blockedTime.endTime,
        reason: blockedTime.reason,
        isRecurring: blockedTime.isRecurring,
      })
      .returning();

    return NextResponse.json({
      success: true,
      blockedTime: {
        id: result[0].id,
        date: result[0].date.toISOString().split('T')[0],
        startTime: result[0].startTime,
        endTime: result[0].endTime,
        reason: result[0].reason,
        isRecurring: result[0].isRecurring,
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
