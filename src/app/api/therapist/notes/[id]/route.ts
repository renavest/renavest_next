import { currentUser } from '@clerk/nextjs/server';
import { eq, and } from 'drizzle-orm';
import { NextRequest, NextResponse } from 'next/server';

import { db } from '@/src/db';
import { clientNotes, therapists, users } from '@/src/db/schema';

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
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
    const noteId = parseInt(params.id);

    if (isNaN(noteId)) {
      return NextResponse.json({ error: 'Invalid note ID' }, { status: 400 });
    }

    // Delete the note (only if it belongs to this therapist)
    const result = await db
      .delete(clientNotes)
      .where(and(eq(clientNotes.id, noteId), eq(clientNotes.therapistId, therapistId)))
      .returning();

    if (result.length === 0) {
      return NextResponse.json({ error: 'Note not found or unauthorized' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Note deleted successfully' });
  } catch (error) {
    console.error('Error deleting note:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
