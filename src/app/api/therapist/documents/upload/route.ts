import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { auth, currentUser } from '@clerk/nextjs/server';
import { eq } from 'drizzle-orm';
import { NextRequest, NextResponse } from 'next/server';

import { db } from '@/src/db';
import { therapists, users, therapistDocuments } from '@/src/db/schema';

// Configure AWS S3
const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  },
});

const bucketName = process.env.AWS_S3_DOCUMENTS_BUCKET_NAME || '';

export async function POST(request: NextRequest) {
  try {
    console.log('=== Document Upload API Called ===');

    // Check environment variables
    const hasAwsConfig = !!(
      process.env.AWS_ACCESS_KEY_ID &&
      process.env.AWS_SECRET_ACCESS_KEY &&
      process.env.AWS_S3_DOCUMENTS_BUCKET_NAME
    );

    if (!hasAwsConfig) {
      console.error('Missing AWS configuration for documents');
      return NextResponse.json(
        {
          error: 'Server configuration error: Missing AWS credentials for documents',
        },
        { status: 500 },
      );
    }

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

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const category = formData.get('category') as string;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    if (!title) {
      return NextResponse.json({ error: 'Document title is required' }, { status: 400 });
    }

    // Validate file type - allow common document types
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain',
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/webp',
    ];

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        {
          error: 'Invalid file type. Please upload PDF, Word, text, or image files.',
        },
        { status: 400 },
      );
    }

    // Validate file size (max 25MB for documents)
    const maxSize = 25 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json(
        {
          error: 'File too large. Please upload a file smaller than 25MB.',
        },
        { status: 400 },
      );
    }

    // Generate S3 key
    const timestamp = Date.now();
    const therapistId = therapistResult[0].id;
    const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const s3Key = `therapist-${therapistId}/documents/${timestamp}_${sanitizedFileName}`;

    // Convert file to buffer
    const buffer = Buffer.from(await file.arrayBuffer());

    // Upload to S3
    const uploadCommand = new PutObjectCommand({
      Bucket: bucketName,
      Key: s3Key,
      Body: buffer,
      ContentType: file.type,
      Metadata: {
        'therapist-id': therapistId.toString(),
        'original-filename': file.name,
        'upload-timestamp': timestamp.toString(),
        title: title,
        category: category || 'general',
      },
    });

    await s3Client.send(uploadCommand);

    // Save document to database
    const [savedDocument] = await db
      .insert(therapistDocuments)
      .values({
        therapistId,
        s3Key,
        fileName: sanitizedFileName,
        originalFileName: file.name,
        title,
        description: description || null,
        category: category || 'general',
        fileSize: file.size,
        mimeType: file.type,
        uploadedAt: new Date(),
      })
      .returning();

    return NextResponse.json({
      success: true,
      document: {
        id: savedDocument.id.toString(),
        s3Key: savedDocument.s3Key,
        fileName: savedDocument.fileName,
        originalFileName: savedDocument.originalFileName,
        fileSize: savedDocument.fileSize,
        mimeType: savedDocument.mimeType,
        title: savedDocument.title,
        description: savedDocument.description,
        category: savedDocument.category,
        uploadedAt: savedDocument.uploadedAt.toISOString(),
        lastModified: savedDocument.updatedAt.toISOString(),
      },
      message: 'Document uploaded successfully',
    });
  } catch (error) {
    console.error('Error uploading document:', error);
    return NextResponse.json(
      {
        error: 'Failed to upload document. Please try again.',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}
