import { currentUser } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';

import { db } from '@/src/db';
import { clientNotes } from '@/src/db/schema';
import { CreateNoteRequest } from '@/src/features/therapist-dashboard/types';
import {
  getTherapistByEmail,
  getClientNotes,
  invalidateOnDataChange,
} from '@/src/services/therapistDataService';

export async function GET(req: NextRequest) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userEmail = user.emailAddresses[0]?.emailAddress;
    if (!userEmail) {
      return NextResponse.json({ error: 'No email found' }, { status: 400 });
    }

    // Use optimized therapist lookup with caching
    const therapistLookup = await getTherapistByEmail(userEmail);
    if (!therapistLookup) {
      return NextResponse.json({ error: 'Therapist profile not found' }, { status: 404 });
    }

    // Get query parameters
    const { searchParams } = new URL(req.url);
    const clientId = searchParams.get('clientId');
    const category = searchParams.get('category');

    // Use cached notes data
    const notesData = await getClientNotes(
      therapistLookup.therapistId,
      clientId || undefined,
      category || undefined,
    );

    return NextResponse.json(notesData, {
      headers: {
        'Cache-Control': 'public, max-age=600, stale-while-revalidate=1200', // 10 min cache, 20 min stale
      },
    });
  } catch (error) {
    console.error('Error fetching notes:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userEmail = user.emailAddresses[0]?.emailAddress;
    if (!userEmail) {
      return NextResponse.json({ error: 'No email found' }, { status: 400 });
    }

    // Use optimized therapist lookup with caching
    const therapistLookup = await getTherapistByEmail(userEmail);
    if (!therapistLookup) {
      return NextResponse.json({ error: 'Therapist profile not found' }, { status: 404 });
    }

    // Parse request body
    const body: CreateNoteRequest = await req.json();

    // Validate required fields
    if (!body.userId || !body.title || !body.content) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Insert note - the content is already properly typed
    const [newNote] = await db
      .insert(clientNotes)
      .values({
        userId: body.userId,
        therapistId: therapistLookup.therapistId,
        sessionId: body.sessionId || null,
        title: body.title,
        content: body.content,
        isConfidential: body.isConfidential || false,
      })
      .returning();

    // Invalidate notes cache for this client
    await invalidateOnDataChange(therapistLookup.therapistId, 'note');

    return NextResponse.json({ note: newNote }, { status: 201 });
  } catch (error) {
    console.error('Error creating note:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
