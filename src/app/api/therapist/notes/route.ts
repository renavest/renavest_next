import { currentUser } from '@clerk/nextjs/server';
import { eq, and, desc } from 'drizzle-orm';
import { NextRequest, NextResponse } from 'next/server';

import { db } from '@/src/db';
import { clientNotes, therapists, users } from '@/src/db/schema';
import { CreateNoteRequest, ClientNoteContent } from '@/src/features/therapist-dashboard/types';

export async function GET(req: NextRequest) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get therapist ID from user
    const userRecord = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.clerkId, user.id));

    if (!userRecord[0]) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const therapistRecord = await db
      .select({ id: therapists.id })
      .from(therapists)
      .where(eq(therapists.userId, userRecord[0].id));

    if (!therapistRecord[0]) {
      return NextResponse.json({ error: 'Therapist profile not found' }, { status: 404 });
    }

    const therapistId = therapistRecord[0].id;

    // Get query parameters
    const { searchParams } = new URL(req.url);
    const clientId = searchParams.get('clientId');
    const category = searchParams.get('category');

    // Build query conditions
    const conditions = [eq(clientNotes.therapistId, therapistId)];

    if (clientId) {
      conditions.push(eq(clientNotes.userId, parseInt(clientId)));
    }

    // Fetch notes
    const notes = await db
      .select()
      .from(clientNotes)
      .where(and(...conditions))
      .orderBy(desc(clientNotes.createdAt));

    // Filter by category if specified
    const filteredNotes = category
      ? notes.filter((note) => {
          const content = note.content as ClientNoteContent;
          return content?.category === category;
        })
      : notes;

    return NextResponse.json({ notes: filteredNotes });
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

    // Get therapist ID from user
    const userRecord = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.clerkId, user.id));

    if (!userRecord[0]) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const therapistRecord = await db
      .select({ id: therapists.id })
      .from(therapists)
      .where(eq(therapists.userId, userRecord[0].id));

    if (!therapistRecord[0]) {
      return NextResponse.json({ error: 'Therapist profile not found' }, { status: 404 });
    }

    const therapistId = therapistRecord[0].id;

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
        therapistId,
        sessionId: body.sessionId || null,
        title: body.title,
        content: body.content,
        isConfidential: body.isConfidential || false,
      })
      .returning();

    return NextResponse.json({ note: newNote }, { status: 201 });
  } catch (error) {
    console.error('Error creating note:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
