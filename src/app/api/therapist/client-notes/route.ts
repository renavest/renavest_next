import { currentUser } from '@clerk/nextjs/server';
import { eq, desc } from 'drizzle-orm';
import { NextResponse } from 'next/server';

import { ALLOWED_EMAILS } from '@/src/constants';
import { db } from '@/src/db';
import { clientNotes, therapists } from '@/src/db/schema';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const clientId = searchParams.get('clientId');

    if (!clientId) {
      return NextResponse.json({ error: 'Client ID is required' }, { status: 400 });
    }

    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify the user's email is in the allowed list
    const userEmail = user.emailAddresses[0]?.emailAddress;

    if (!userEmail) {
      console.error('No email address found for user');
      return NextResponse.json({ error: 'No email address found' }, { status: 400 });
    }

    if (!ALLOWED_EMAILS.includes(userEmail)) {
      console.warn(`Unauthorized access attempt by email: ${userEmail}`);
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Find the therapist ID associated with the current user
    const therapistResult = await db
      .select({ id: therapists.id })
      .from(therapists)
      .where(eq(therapists.email, userEmail))
      .limit(1);

    if (!therapistResult.length) {
      console.error(`No therapist found for email: ${userEmail}`);
      return NextResponse.json({ error: 'Therapist not found' }, { status: 404 });
    }

    // Fetch client notes for the specific client
    const notes = await db
      .select({
        id: clientNotes.id,
        title: clientNotes.title,
        content: clientNotes.content,
        createdAt: clientNotes.createdAt,
        isConfidential: clientNotes.isConfidential,
      })
      .from(clientNotes)
      .where(eq(clientNotes.userId, clientId))
      .orderBy(desc(clientNotes.createdAt))
      .limit(5);

    return NextResponse.json({
      notes: notes.map((note) => ({
        ...note,
        createdAt: note.createdAt?.toISOString() ?? null,
        isConfidential: note.isConfidential ?? false,
      })),
    });
  } catch (error) {
    console.error('Error fetching client notes:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify the user's email is in the allowed list
    const userEmail = user.emailAddresses[0]?.emailAddress;

    if (!userEmail) {
      console.error('No email address found for user');
      return NextResponse.json({ error: 'No email address found' }, { status: 400 });
    }

    // Parse the request body
    const noteData = await request.json();

    // Validate required fields
    if (!noteData.userId || !noteData.therapistId || !noteData.title) {
      console.error('Missing required fields in note creation', { noteData });
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Find the therapist ID associated with the current user
    const therapistResult = await db
      .select({ id: therapists.id })
      .from(therapists)
      .where(eq(therapists.email, userEmail))
      .limit(1);

    if (!therapistResult.length) {
      console.error(`No therapist found for email: ${userEmail}`);
      return NextResponse.json({ error: 'Therapist not found' }, { status: 404 });
    }

    // Ensure the therapistId matches the logged-in therapist
    if (therapistResult[0].id !== noteData.therapistId) {
      console.warn(
        `Therapist ID mismatch. Expected: ${therapistResult[0].id}, Received: ${noteData.therapistId}`,
      );
      return NextResponse.json({ error: 'Unauthorized to create note' }, { status: 403 });
    }

    // Insert the client note
    const insertedNote = await db
      .insert(clientNotes)
      .values({
        userId: noteData.userId,
        therapistId: noteData.therapistId,
        sessionId: noteData.sessionId,
        title: noteData.title,
        content: noteData.content,
        isConfidential: noteData.isConfidential ?? false,
      })
      .returning({
        id: clientNotes.id,
        title: clientNotes.title,
        createdAt: clientNotes.createdAt,
      });

    return NextResponse.json(
      {
        message: 'Client note created successfully',
        note: insertedNote[0],
      },
      { status: 201 },
    );
  } catch (error) {
    console.error('Error creating client note:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
