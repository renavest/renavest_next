import { auth, currentUser } from '@clerk/nextjs/server';
import { eq, inArray } from 'drizzle-orm';
import { NextResponse } from 'next/server';

import { db } from '@/src/db';
import {
  therapists,
  users,
  therapistDocuments,
  therapistDocumentAssignments,
} from '@/src/db/schema';

export async function GET() {
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

    const therapistId = therapistResult[0].id;

    // Fetch documents from database
    const documentsResult = await db
      .select({
        id: therapistDocuments.id,
        s3Key: therapistDocuments.s3Key,
        fileName: therapistDocuments.fileName,
        originalFileName: therapistDocuments.originalFileName,
        title: therapistDocuments.title,
        description: therapistDocuments.description,
        category: therapistDocuments.category,
        fileSize: therapistDocuments.fileSize,
        mimeType: therapistDocuments.mimeType,
        uploadedAt: therapistDocuments.uploadedAt,
        updatedAt: therapistDocuments.updatedAt,
      })
      .from(therapistDocuments)
      .where(eq(therapistDocuments.therapistId, therapistId))
      .orderBy(therapistDocuments.uploadedAt);

    // Fetch all assignments for these documents
    const documentIds = documentsResult.map((doc) => doc.id);
    const assignmentsResult =
      documentIds.length > 0
        ? await db
            .select({
              documentId: therapistDocumentAssignments.documentId,
              userId: therapistDocumentAssignments.userId,
              isSharedWithClient: therapistDocumentAssignments.isSharedWithClient,
              sharedAt: therapistDocumentAssignments.sharedAt,
              assignedAt: therapistDocumentAssignments.assignedAt,
              userFirstName: users.firstName,
              userLastName: users.lastName,
              userEmail: users.email,
            })
            .from(therapistDocumentAssignments)
            .leftJoin(users, eq(therapistDocumentAssignments.userId, users.id))
            .where(inArray(therapistDocumentAssignments.documentId, documentIds))
        : [];

    // Group assignments by document ID
    const assignmentsByDocument = new Map();
    assignmentsResult.forEach((assignment) => {
      if (!assignmentsByDocument.has(assignment.documentId)) {
        assignmentsByDocument.set(assignment.documentId, []);
      }
      assignmentsByDocument.get(assignment.documentId).push({
        userId: assignment.userId,
        isSharedWithClient: assignment.isSharedWithClient,
        sharedAt: assignment.sharedAt?.toISOString(),
        assignedAt: assignment.assignedAt.toISOString(),
        user: {
          id: assignment.userId,
          firstName: assignment.userFirstName,
          lastName: assignment.userLastName,
          email: assignment.userEmail,
          fullName:
            `${assignment.userFirstName || ''} ${assignment.userLastName || ''}`.trim() ||
            assignment.userEmail,
        },
      });
    });

    // Format documents for response
    const documents = documentsResult.map((doc) => ({
      id: doc.id.toString(),
      s3Key: doc.s3Key,
      fileName: doc.fileName,
      originalFileName: doc.originalFileName,
      fileSize: doc.fileSize,
      mimeType: doc.mimeType,
      title: doc.title,
      description: doc.description,
      category: doc.category,
      uploadedAt: doc.uploadedAt.toISOString(),
      lastModified: doc.updatedAt.toISOString(),
      assignments: assignmentsByDocument.get(doc.id) || [],
    }));

    // Sort by upload date (newest first)
    documents.sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime());

    return NextResponse.json({
      documents,
      total: documents.length,
    });
  } catch (error) {
    console.error('Error listing documents:', error);
    return NextResponse.json(
      {
        error: 'Failed to list documents',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}
