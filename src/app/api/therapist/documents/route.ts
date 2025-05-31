import { S3Client, ListObjectsV2Command, HeadObjectCommand } from '@aws-sdk/client-s3';
import { auth, currentUser } from '@clerk/nextjs/server';
import { eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';

import { db } from '@/src/db';
import { therapists, users } from '@/src/db/schema';

// Configure AWS S3
const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  },
});

const bucketName = process.env.AWS_S3_DOCUMENTS_BUCKET_NAME || '';

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

    // List objects in S3 for this therapist
    const listCommand = new ListObjectsV2Command({
      Bucket: bucketName,
      Prefix: `therapist-${therapistId}/documents/`,
      MaxKeys: 100, // Limit for now
    });

    const listResult = await s3Client.send(listCommand);
    const documents = [];

    if (listResult.Contents) {
      // Get metadata for each document
      for (const object of listResult.Contents) {
        if (!object.Key) continue;

        try {
          const headCommand = new HeadObjectCommand({
            Bucket: bucketName,
            Key: object.Key,
          });

          const headResult = await s3Client.send(headCommand);
          const metadata = headResult.Metadata || {};

          documents.push({
            id: object.Key.split('/').pop()?.split('_')[0] || 'unknown',
            s3Key: object.Key,
            fileName: object.Key.split('/').pop() || 'unknown',
            originalFileName: metadata['original-filename'] || object.Key.split('/').pop(),
            fileSize: object.Size || 0,
            mimeType: headResult.ContentType || 'application/octet-stream',
            title: metadata.title || 'Untitled Document',
            description: metadata.description || '',
            category: metadata.category || 'general',
            uploadedAt: object.LastModified?.toISOString() || new Date().toISOString(),
            lastModified: object.LastModified?.toISOString() || new Date().toISOString(),
          });
        } catch (error) {
          console.error('Error getting metadata for object:', object.Key, error);
          // Skip this document if we can't get metadata
          continue;
        }
      }
    }

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
