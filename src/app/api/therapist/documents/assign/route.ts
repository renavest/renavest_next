import { auth, currentUser } from '@clerk/nextjs/server';
import { and, eq } from 'drizzle-orm';
import { NextRequest, NextResponse } from 'next/server';

import { db } from '@/src/db';
import {
  therapists,
  users,
  therapistDocuments,
  therapistDocumentAssignments,
} from '@/src/db/schema';

export async function POST(request: NextRequest) {
  try {
    const { userId, sessionClaims } = await auth();
    const metadata = sessionClaims?.metadata as { role?: string } | undefined;

    if (!userId || metadata?.role !== 'therapist') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userEmail = user.emailAddresses[0]?.emailAddress;
    const userResult = await db.select().from(users).where(eq(users.email, userEmail)).limit(1);

    if (!userResult.length) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const therapistResult = await db
      .select()
      .from(therapists)
      .where(eq(therapists.userId, userResult[0].id))
      .limit(1);

    if (!therapistResult.length) {
      return NextResponse.json({ error: 'Therapist not found' }, { status: 404 });
    }

    const { documentId, clientId, shareWithClient = false } = await request.json();

    if (!documentId || !clientId) {
      return NextResponse.json(
        { error: 'Document ID and Client ID are required' },
        { status: 400 },
      );
    }

    const therapistId = therapistResult[0].id;

    // Verify the document belongs to this therapist
    const documentResult = await db
      .select()
      .from(therapistDocuments)
      .where(
        and(
          eq(therapistDocuments.id, parseInt(documentId)),
          eq(therapistDocuments.therapistId, therapistId),
        ),
      )
      .limit(1);

    if (!documentResult.length) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }

    // Verify the client exists
    const clientResult = await db
      .select()
      .from(users)
      .where(eq(users.id, parseInt(clientId)))
      .limit(1);

    if (!clientResult.length) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 });
    }

    // Check if assignment already exists
    const existingAssignment = await db
      .select()
      .from(therapistDocumentAssignments)
      .where(
        and(
          eq(therapistDocumentAssignments.documentId, parseInt(documentId)),
          eq(therapistDocumentAssignments.userId, parseInt(clientId)),
        ),
      )
      .limit(1);

    if (existingAssignment.length > 0) {
      // Update existing assignment
      const [updatedAssignment] = await db
        .update(therapistDocumentAssignments)
        .set({
          isSharedWithClient: shareWithClient,
          sharedAt: shareWithClient ? new Date() : null,
          updatedAt: new Date(),
        })
        .where(eq(therapistDocumentAssignments.id, existingAssignment[0].id))
        .returning();

      return NextResponse.json({
        success: true,
        assignment: {
          id: updatedAssignment.id.toString(),
          documentId: updatedAssignment.documentId,
          userId: updatedAssignment.userId,
          isSharedWithClient: updatedAssignment.isSharedWithClient,
          sharedAt: updatedAssignment.sharedAt?.toISOString(),
          assignedAt: updatedAssignment.assignedAt.toISOString(),
        },
        message: shareWithClient
          ? 'Document assignment updated and shared with client'
          : 'Document assignment updated',
      });
    } else {
      // Create new assignment
      const [newAssignment] = await db
        .insert(therapistDocumentAssignments)
        .values({
          documentId: parseInt(documentId),
          userId: parseInt(clientId),
          isSharedWithClient: shareWithClient,
          sharedAt: shareWithClient ? new Date() : null,
          assignedAt: new Date(),
        })
        .returning();

      return NextResponse.json({
        success: true,
        assignment: {
          id: newAssignment.id.toString(),
          documentId: newAssignment.documentId,
          userId: newAssignment.userId,
          isSharedWithClient: newAssignment.isSharedWithClient,
          sharedAt: newAssignment.sharedAt?.toISOString(),
          assignedAt: newAssignment.assignedAt.toISOString(),
        },
        message: shareWithClient
          ? 'Document assigned and shared with client'
          : 'Document assigned to client',
      });
    }
  } catch (error) {
    console.error('Error assigning document:', error);
    return NextResponse.json(
      {
        error: 'Failed to assign document',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { userId, sessionClaims } = await auth();
    const metadata = sessionClaims?.metadata as { role?: string } | undefined;

    if (!userId || metadata?.role !== 'therapist') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userEmail = user.emailAddresses[0]?.emailAddress;
    const userResult = await db.select().from(users).where(eq(users.email, userEmail)).limit(1);

    if (!userResult.length) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const therapistResult = await db
      .select()
      .from(therapists)
      .where(eq(therapists.userId, userResult[0].id))
      .limit(1);

    if (!therapistResult.length) {
      return NextResponse.json({ error: 'Therapist not found' }, { status: 404 });
    }

    const { documentId, clientId } = await request.json();

    if (!documentId || !clientId) {
      return NextResponse.json(
        { error: 'Document ID and Client ID are required' },
        { status: 400 },
      );
    }

    const therapistId = therapistResult[0].id;

    // Verify the document belongs to this therapist
    const documentResult = await db
      .select()
      .from(therapistDocuments)
      .where(
        and(
          eq(therapistDocuments.id, parseInt(documentId)),
          eq(therapistDocuments.therapistId, therapistId),
        ),
      )
      .limit(1);

    if (!documentResult.length) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }

    // Delete the assignment
    const deletedAssignments = await db
      .delete(therapistDocumentAssignments)
      .where(
        and(
          eq(therapistDocumentAssignments.documentId, parseInt(documentId)),
          eq(therapistDocumentAssignments.userId, parseInt(clientId)),
        ),
      )
      .returning();

    if (deletedAssignments.length === 0) {
      return NextResponse.json({ error: 'Assignment not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: 'Document assignment removed',
    });
  } catch (error) {
    console.error('Error removing document assignment:', error);
    return NextResponse.json(
      {
        error: 'Failed to remove document assignment',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}
