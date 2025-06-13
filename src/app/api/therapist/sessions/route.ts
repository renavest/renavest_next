import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

import { db } from '@/src/db';
import { bookingSessions } from '@/src/db/schema';
import {
  getTherapistByEmail,
  getSessionsData,
  invalidateOnDataChange,
} from '@/src/services/therapistDataService';

import { requireTherapist } from '../../auth/route-guard';

// Validation schema for creating a new session
const CreateSessionSchema = z.object({
  clientId: z.string(),
  sessionDate: z.string(),
  sessionTime: z.string(),
  duration: z.number().optional().default(60),
  notes: z.string().optional(),
});

export async function GET() {
  // Use secure auth guard following Clerk best practices
  const authResult = await requireTherapist();
  if (!authResult.success) {
    return authResult.response;
  }

  const { clerkUser } = authResult;
  if (!clerkUser) {
    return NextResponse.json({ error: 'User session invalid' }, { status: 401 });
  }

  try {
    const userEmail = clerkUser.emailAddresses[0]?.emailAddress;
    if (!userEmail) {
      return NextResponse.json({ error: 'No email found' }, { status: 400 });
    }

    // Use optimized therapist lookup with caching
    const therapistLookup = await getTherapistByEmail(userEmail);
    if (!therapistLookup) {
      return NextResponse.json({ error: 'Therapist not found' }, { status: 404 });
    }

    // Use cached sessions data
    const sessionsData = await getSessionsData(therapistLookup.therapistId);

    return NextResponse.json(sessionsData, {
      headers: {
        'Cache-Control': 'public, max-age=300, stale-while-revalidate=600', // 5 min cache, 10 min stale
      },
    });
  } catch (error) {
    console.error('Error fetching therapist sessions:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  // Use secure auth guard following Clerk best practices
  const authResult = await requireTherapist();
  if (!authResult.success) {
    return authResult.response;
  }

  const { clerkUser } = authResult;
  if (!clerkUser) {
    return NextResponse.json({ error: 'User session invalid' }, { status: 401 });
  }

  try {
    const userEmail = clerkUser.emailAddresses[0]?.emailAddress;
    if (!userEmail) {
      return NextResponse.json({ error: 'No email found' }, { status: 400 });
    }

    // Use optimized therapist lookup with caching
    const therapistLookup = await getTherapistByEmail(userEmail);
    if (!therapistLookup) {
      return NextResponse.json({ error: 'Therapist not found' }, { status: 404 });
    }

    // Parse and validate input
    const body = await request.json();
    const validatedInput = CreateSessionSchema.parse(body);

    // Parse the session date and time
    const sessionDateTime = new Date(`${validatedInput.sessionDate}T${validatedInput.sessionTime}`);
    const sessionEndTime = new Date(sessionDateTime.getTime() + validatedInput.duration * 60000);

    // Create new session in the database
    const newSession = await db
      .insert(bookingSessions)
      .values({
        userId: parseInt(validatedInput.clientId),
        therapistId: therapistLookup.therapistId,
        sessionDate: sessionDateTime,
        sessionStartTime: sessionDateTime,
        sessionEndTime: sessionEndTime,
        status: 'scheduled',
        metadata: {
          notes: validatedInput.notes,
          duration: validatedInput.duration,
        },
      })
      .returning();

    // Invalidate sessions cache
    await invalidateOnDataChange(therapistLookup.therapistId, 'session');

    return NextResponse.json({ session: newSession[0] }, { status: 201 });
  } catch (error) {
    console.error('Error creating therapist session:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
