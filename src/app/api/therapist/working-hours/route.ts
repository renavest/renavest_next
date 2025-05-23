import { auth, currentUser } from '@clerk/nextjs/server';
import { eq, and } from 'drizzle-orm';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

import { db } from '@/src/db';
import { therapists, therapistAvailability } from '@/src/db/schema';

// Validation schemas
const WorkingHoursSchema = z.object({
  therapistId: z.number(),
  workingHours: z.array(
    z.object({
      id: z.number().optional(),
      dayOfWeek: z.number().min(0).max(6),
      startTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
      endTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
      isRecurring: z.boolean().default(true),
    }),
  ),
});

// GET - Fetch working hours for a therapist
export async function GET(req: NextRequest) {
  try {
    auth.protect();
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = req.nextUrl.searchParams;
    const therapistIdParam = searchParams.get('therapistId');

    if (!therapistIdParam) {
      return NextResponse.json({ error: 'Therapist ID is required' }, { status: 400 });
    }

    const therapistId = parseInt(therapistIdParam);

    // Verify the therapist exists and belongs to the current user
    const therapist = await db.query.therapists.findFirst({
      where: (therapists, { eq, and }) =>
        and(
          eq(therapists.id, therapistId),
          eq(therapists.email, user.emailAddresses[0]?.emailAddress || ''),
        ),
    });

    if (!therapist) {
      return NextResponse.json({ error: 'Therapist not found or unauthorized' }, { status: 404 });
    }

    // Fetch working hours
    const workingHours = await db.query.therapistAvailability.findMany({
      where: (availability, { eq }) => eq(availability.therapistId, therapistId),
      orderBy: (availability, { asc }) => [
        asc(availability.dayOfWeek),
        asc(availability.startTime),
      ],
    });

    return NextResponse.json({
      success: true,
      workingHours: workingHours.map((hour) => ({
        id: hour.id,
        dayOfWeek: hour.dayOfWeek,
        startTime: hour.startTime,
        endTime: hour.endTime,
        isRecurring: hour.isRecurring,
      })),
    });
  } catch (error) {
    console.error('Error fetching working hours:', error);
    return NextResponse.json({ error: 'Failed to fetch working hours' }, { status: 500 });
  }
}

// POST - Save working hours for a therapist
export async function POST(req: NextRequest) {
  try {
    auth.protect();
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const validatedData = WorkingHoursSchema.parse(body);

    // Verify the therapist exists and belongs to the current user
    const therapist = await db.query.therapists.findFirst({
      where: (therapists, { eq, and }) =>
        and(
          eq(therapists.id, validatedData.therapistId),
          eq(therapists.email, user.emailAddresses[0]?.emailAddress || ''),
        ),
    });

    if (!therapist) {
      return NextResponse.json({ error: 'Therapist not found or unauthorized' }, { status: 404 });
    }

    // Delete existing working hours for this therapist
    await db
      .delete(therapistAvailability)
      .where(eq(therapistAvailability.therapistId, validatedData.therapistId));

    // Insert new working hours
    const newWorkingHours = [];
    for (const hours of validatedData.workingHours) {
      const [inserted] = await db
        .insert(therapistAvailability)
        .values({
          therapistId: validatedData.therapistId,
          dayOfWeek: hours.dayOfWeek,
          startTime: hours.startTime,
          endTime: hours.endTime,
          isRecurring: hours.isRecurring,
        })
        .returning();

      newWorkingHours.push({
        id: inserted.id,
        dayOfWeek: inserted.dayOfWeek,
        startTime: inserted.startTime,
        endTime: inserted.endTime,
        isRecurring: inserted.isRecurring,
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Working hours saved successfully',
      workingHours: newWorkingHours,
    });
  } catch (error) {
    console.error('Error saving working hours:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid working hours data', details: error.errors },
        { status: 400 },
      );
    }

    return NextResponse.json({ error: 'Failed to save working hours' }, { status: 500 });
  }
}
