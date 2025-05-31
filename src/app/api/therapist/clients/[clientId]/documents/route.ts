import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { eq, and } from 'drizzle-orm';

import { db } from '@/src/db';
import {
  therapists,
  therapistDocuments,
  therapistDocumentAssignments,
  users,
} from '@/src/db/schema';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ clientId: string }> },
) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Await params before accessing properties
    const { clientId: clientIdParam } = await params;

    // Get therapist ID
    const therapist = await db
      .select({ id: therapists.id })
      .from(therapists)
      .innerJoin(users, eq(users.id, therapists.userId))
      .where(eq(users.clerkId, user.id))
      .limit(1);

    if (!therapist.length) {
      return NextResponse.json({ error: 'Therapist not found' }, { status: 404 });
    }

    const therapistId = therapist[0].id;
    const clientId = parseInt(clientIdParam);

    if (isNaN(clientId)) {
      return NextResponse.json({ error: 'Invalid client ID' }, { status: 400 });
    }

    // Fetch documents assigned to this client by this therapist
    const assignedDocuments = await db
      .select({
        id: therapistDocuments.id,
        title: therapistDocuments.title,
        description: therapistDocuments.description,
        category: therapistDocuments.category,
        fileName: therapistDocuments.fileName,
        originalFileName: therapistDocuments.originalFileName,
        fileSize: therapistDocuments.fileSize,
        mimeType: therapistDocuments.mimeType,
        uploadedAt: therapistDocuments.uploadedAt,
        s3Key: therapistDocuments.s3Key,
        assignedAt: therapistDocumentAssignments.assignedAt,
        isSharedWithClient: therapistDocumentAssignments.isSharedWithClient,
        sharedAt: therapistDocumentAssignments.sharedAt,
      })
      .from(therapistDocuments)
      .innerJoin(
        therapistDocumentAssignments,
        eq(therapistDocuments.id, therapistDocumentAssignments.documentId),
      )
      .where(
        and(
          eq(therapistDocuments.therapistId, therapistId),
          eq(therapistDocumentAssignments.userId, clientId),
        ),
      )
      .orderBy(therapistDocumentAssignments.assignedAt);

    return NextResponse.json({
      success: true,
      documents: assignedDocuments,
    });
  } catch (error) {
    console.error('Error fetching client documents:', error);
    return NextResponse.json({ error: 'Failed to fetch client documents' }, { status: 500 });
  }
}
