import { auth } from '@clerk/nextjs/server';
import { eq, desc } from 'drizzle-orm';

import { db } from '@/src/db';
import { clientNotes, users, bookingSessions, therapists } from '@/src/db/schema';

// Type definition for client note input
type CreateClientNoteInput = {
  userId: string;
  therapistId?: number;
  sessionId?: number;
  title: string;
  content: {
    keyObservations?: string[];
    progressNotes?: string[];
    actionItems?: string[];
    emotionalState?: string;
    additionalContext?: string;
  } | null;
  isConfidential?: boolean;
};

// Utility function to safely convert dates
function safeToISOString(date: Date | null): string {
  return date ? date.toISOString() : new Date().toISOString();
}

// Server action to fetch therapist's clients
export async function fetchTherapistClients() {
  const { userId } = await auth();

  if (!userId) {
    throw new Error('User not authenticated');
  }

  try {
    // Find the therapist ID associated with the current user
    const therapist = await db
      .select({ id: therapists.id })
      .from(therapists)
      .where(eq(therapists.userId, Number(userId)))
      .limit(1);

    if (!therapist.length) {
      throw new Error('Therapist not found');
    }

    const clients = await db
      .select({
        id: users.clerkId,
        firstName: users.firstName,
        lastName: users.lastName,
        email: users.email,
      })
      .from(users)
      .where(eq(users.therapistId, therapist[0].id));

    return clients;
  } catch (error) {
    console.error('Error fetching therapist clients:', error);
    throw error;
  }
}

// Server action to fetch client details and recent notes
export async function fetchClientDetails(clientId: string) {
  const { userId } = await auth();

  if (!userId) {
    throw new Error('User not authenticated');
  }

  try {
    // Fetch client details
    const [clientDetails] = await db
      .select({
        id: users.clerkId,
        firstName: users.firstName,
        lastName: users.lastName,
        email: users.email,
      })
      .from(users)
      .where(eq(users.clerkId, clientId));

    // Fetch recent client notes
    const recentNotes = await db
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

    // Fetch upcoming sessions
    const upcomingSessions = await db
      .select({
        id: bookingSessions.id,
        sessionDate: bookingSessions.sessionDate,
        sessionStartTime: bookingSessions.sessionStartTime,
      })
      .from(bookingSessions)
      .where(eq(bookingSessions.userId, clientId))
      .orderBy(desc(bookingSessions.sessionDate))
      .limit(3);

    return {
      clientDetails: {
        id: clientDetails.id,
        firstName: clientDetails.firstName ?? '',
        lastName: clientDetails.lastName ?? '',
        email: clientDetails.email,
      },
      recentNotes: recentNotes.map((note) => ({
        ...note,
        createdAt: safeToISOString(note.createdAt),
        isConfidential: note.isConfidential ?? false,
      })),
      upcomingSessions: upcomingSessions.map((session) => ({
        ...session,
        sessionDate: safeToISOString(session.sessionDate),
        sessionStartTime: safeToISOString(session.sessionStartTime),
      })),
    };
  } catch (error) {
    console.error('Error fetching client details:', error);
    throw error;
  }
}

// Server action to create a new client note
export async function createClientNoteAction(noteData: CreateClientNoteInput) {
  const { userId } = await auth();

  if (!userId) {
    throw new Error('User not authenticated');
  }

  try {
    // Find the therapist ID associated with the current user
    const therapist = await db
      .select({ id: therapists.id })
      .from(therapists)
      .where(eq(therapists.userId, Number(userId)))
      .limit(1);

    if (!therapist.length) {
      throw new Error('Therapist not found');
    }

    const [createdNote] = await db
      .insert(clientNotes)
      .values({
        ...noteData,
        therapistId: therapist[0].id,
        isConfidential: noteData.isConfidential ?? false,
      })
      .returning();

    return createdNote;
  } catch (error) {
    console.error('Error creating client note:', error);
    throw error;
  }
}
