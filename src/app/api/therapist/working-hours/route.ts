import { currentUser } from '@clerk/nextjs/server';
import { eq } from 'drizzle-orm';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

import { db } from '@/src/db';
import { users, therapists, therapistAvailability } from '@/src/db/schema';

const WorkingHoursSchema = z.object({
  dayOfWeek: z.number().min(0).max(6),
  startTime: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/),
  endTime: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/),
  isRecurring: z.boolean().default(true),
});

const GetWorkingHoursSchema = z.object({
  therapistId: z.string(),
});

const SetWorkingHoursSchema = z.object({
  therapistId: z.number(),
  workingHours: z.array(WorkingHoursSchema),
});

// GET - Fetch working hours for a therapist
export async function GET(req: NextRequest) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = req.nextUrl.searchParams;
    const { therapistId } = GetWorkingHoursSchema.parse({
      therapistId: searchParams.get('therapistId'),
    });

    const therapistIdNum = parseInt(therapistId);

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
      .where(eq(therapists.id, therapistIdNum))
      .limit(1);

    if (therapistRecord.length === 0) {
      return NextResponse.json({ error: 'Therapist not found' }, { status: 404 });
    }

    // Only allow therapists to access their own working hours
    if (therapistRecord[0].userId !== userId) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Fetch working hours
    const workingHoursResult = await db
      .select()
      .from(therapistAvailability)
      .where(eq(therapistAvailability.therapistId, therapistIdNum))
      .orderBy(therapistAvailability.dayOfWeek, therapistAvailability.startTime);

    // If no working hours are stored, return default working hours
    const workingHours =
      workingHoursResult.length > 0
        ? workingHoursResult.map((hours) => ({
            id: hours.id,
            dayOfWeek: hours.dayOfWeek,
            startTime: hours.startTime,
            endTime: hours.endTime,
            isRecurring: hours.isRecurring,
          }))
        : [
            // Default working hours (Monday to Friday, 9 AM to 5 PM)
            { dayOfWeek: 1, startTime: '09:00', endTime: '17:00', isRecurring: true },
            { dayOfWeek: 2, startTime: '09:00', endTime: '17:00', isRecurring: true },
            { dayOfWeek: 3, startTime: '09:00', endTime: '17:00', isRecurring: true },
            { dayOfWeek: 4, startTime: '09:00', endTime: '17:00', isRecurring: true },
            { dayOfWeek: 5, startTime: '09:00', endTime: '17:00', isRecurring: true },
          ];

    return NextResponse.json({
      success: true,
      workingHours,
      isDefault: workingHoursResult.length === 0, // Indicate if these are default hours
    });
  } catch (error) {
    console.error('[GET WORKING HOURS] Error:', error);

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

// POST - Update working hours for a therapist
export async function POST(req: NextRequest) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { therapistId, workingHours } = SetWorkingHoursSchema.parse(body);

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

    // Validate working hours
    for (const hours of workingHours) {
      const [startHour, startMin] = hours.startTime.split(':').map(Number);
      const [endHour, endMin] = hours.endTime.split(':').map(Number);
      const startMinutes = startHour * 60 + startMin;
      const endMinutes = endHour * 60 + endMin;

      if (startMinutes >= endMinutes) {
        return NextResponse.json(
          { error: 'Start time must be before end time for all working hours' },
          { status: 400 },
        );
      }
    }

    // Delete existing working hours
    await db
      .delete(therapistAvailability)
      .where(eq(therapistAvailability.therapistId, therapistId));

    // Insert new working hours
    if (workingHours.length > 0) {
      const workingHoursToInsert = workingHours.map((hours) => ({
        therapistId,
        dayOfWeek: hours.dayOfWeek,
        startTime: hours.startTime,
        endTime: hours.endTime,
        isRecurring: hours.isRecurring,
      }));

      await db.insert(therapistAvailability).values(workingHoursToInsert);
    }

    return NextResponse.json({
      success: true,
      message: 'Working hours updated successfully',
    });
  } catch (error) {
    console.error('[SET WORKING HOURS] Error:', error);

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
