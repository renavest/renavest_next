import { auth, currentUser } from '@clerk/nextjs/server';
import { eq, and } from 'drizzle-orm';
import { NextRequest, NextResponse } from 'next/server';

import { db } from '@/src/db';
import {
  users,
  therapistDocuments,
  therapistDocumentAssignments,
  therapists,
} from '@/src/db/schema';

export async function GET(request: NextRequest) {
  try {
    const { userId, sessionClaims } = await auth();
    const metadata = sessionClaims?.metadata as { role?: string } | undefined;

    if (!userId || metadata?.role !== 'employee') {
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

    const currentUserId = userResult[0].id;

    // Fetch documents that are shared with this user
    const sharedDocuments = await db
      .select({
        // Document details
        documentId: therapistDocuments.id,
        title: therapistDocuments.title,
        description: therapistDocuments.description,
        category: therapistDocuments.category,
        fileName: therapistDocuments.fileName,
        originalFileName: therapistDocuments.originalFileName,
        fileSize: therapistDocuments.fileSize,
        mimeType: therapistDocuments.mimeType,
        uploadedAt: therapistDocuments.uploadedAt,
        s3Key: therapistDocuments.s3Key,
        // Assignment details
        assignedAt: therapistDocumentAssignments.assignedAt,
        sharedAt: therapistDocumentAssignments.sharedAt,
        // Therapist details
        therapistUserId: therapists.userId,
        therapistName: therapists.name,
        therapistTitle: therapists.title,
      })
      .from(therapistDocumentAssignments)
      .innerJoin(
        therapistDocuments,
        eq(therapistDocumentAssignments.documentId, therapistDocuments.id),
      )
      .innerJoin(therapists, eq(therapistDocuments.therapistId, therapists.id))
      .where(
        and(
          eq(therapistDocumentAssignments.userId, currentUserId),
          eq(therapistDocumentAssignments.isSharedWithClient, true),
        ),
      )
      .orderBy(therapistDocumentAssignments.sharedAt);

    // Format documents for response
    const documents = sharedDocuments.map((doc) => ({
      id: doc.documentId.toString(),
      title: doc.title,
      description: doc.description,
      category: doc.category,
      fileName: doc.fileName,
      originalFileName: doc.originalFileName,
      fileSize: doc.fileSize,
      mimeType: doc.mimeType,
      uploadedAt: doc.uploadedAt.toISOString(),
      assignedAt: doc.assignedAt.toISOString(),
      sharedAt: doc.sharedAt?.toISOString(),
      therapist: {
        name: doc.therapistName,
        title: doc.therapistTitle,
      },
      // Security: Don't expose S3 key directly - will need separate endpoint for downloads
    }));

    return NextResponse.json({
      success: true,
      documents,
      total: documents.length,
    });
  } catch (error) {
    console.error('Error fetching shared documents:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch shared documents',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}
