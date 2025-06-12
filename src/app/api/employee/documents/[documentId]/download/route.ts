import { GetObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { auth, currentUser } from '@clerk/nextjs/server';
import { eq, and } from 'drizzle-orm';
import { NextRequest, NextResponse } from 'next/server';

import { db } from '@/src/db';
import { users, therapistDocuments, therapistDocumentAssignments } from '@/src/db/schema';

// Initialize S3 client
const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ documentId: string }> },
) {
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
    const documentId = parseInt((await params).documentId);

    if (isNaN(documentId)) {
      return NextResponse.json({ error: 'Invalid document ID' }, { status: 400 });
    }

    // Verify the document is shared with this user
    const sharedDocument = await db
      .select({
        s3Key: therapistDocuments.s3Key,
        fileName: therapistDocuments.fileName,
        originalFileName: therapistDocuments.originalFileName,
        mimeType: therapistDocuments.mimeType,
        fileSize: therapistDocuments.fileSize,
        isSharedWithClient: therapistDocumentAssignments.isSharedWithClient,
      })
      .from(therapistDocumentAssignments)
      .innerJoin(
        therapistDocuments,
        eq(therapistDocumentAssignments.documentId, therapistDocuments.id),
      )
      .where(
        and(
          eq(therapistDocumentAssignments.documentId, documentId),
          eq(therapistDocumentAssignments.userId, currentUserId),
          eq(therapistDocumentAssignments.isSharedWithClient, true),
        ),
      )
      .limit(1);

    if (!sharedDocument.length) {
      return NextResponse.json(
        { error: 'Document not found or not shared with you' },
        { status: 404 },
      );
    }

    const document = sharedDocument[0];

    // Generate a signed URL for secure download
    const command = new GetObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET_NAME!,
      Key: document.s3Key,
      ResponseContentDisposition: `attachment; filename="${document.originalFileName}"`,
      ResponseContentType: document.mimeType,
    });

    // URL expires in 1 hour for security
    const signedUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 });

    // Log the download for audit purposes
    console.log(`[DOCUMENT DOWNLOAD] User ${currentUserId} downloaded document ${documentId}`);

    return NextResponse.json({
      success: true,
      downloadUrl: signedUrl,
      fileName: document.originalFileName,
      fileSize: document.fileSize,
      mimeType: document.mimeType,
      expiresIn: 3600, // 1 hour
    });
  } catch (error) {
    console.error('Error generating download URL:', error);
    return NextResponse.json(
      {
        error: 'Failed to generate download URL',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}
