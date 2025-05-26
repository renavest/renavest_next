import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { auth, currentUser } from '@clerk/nextjs/server';
import { eq } from 'drizzle-orm';
import { NextRequest, NextResponse } from 'next/server';

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

const bucketName = process.env.AWS_S3_IMAGES_BUCKET_NAME || '';

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

    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        {
          error: 'Invalid file type. Please upload a JPEG, PNG, or WebP image.',
        },
        { status: 400 },
      );
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return NextResponse.json(
        {
          error: 'File too large. Please upload an image smaller than 10MB.',
        },
        { status: 400 },
      );
    }

    // Generate S3 key based on therapist name
    const therapistName = therapistResult[0].name || userResult[0].firstName || 'therapist';
    const normalizedName = therapistName
      .trim()
      .toLowerCase()
      .normalize('NFKD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

    const fileExtension = file.type === 'image/png' ? 'png' : 'jpg';
    const s3Key = `therapists/${normalizedName}.${fileExtension}`;

    // Convert file to buffer
    const buffer = Buffer.from(await file.arrayBuffer());

    // Upload to S3
    const uploadCommand = new PutObjectCommand({
      Bucket: bucketName,
      Key: s3Key,
      Body: buffer,
      ContentType: file.type,
      CacheControl: 'public, max-age=31536000', // Cache for 1 year
    });

    await s3Client.send(uploadCommand);

    // Update therapist profile with new image URL
    await db
      .update(therapists)
      .set({ profileUrl: s3Key })
      .where(eq(therapists.id, therapistResult[0].id));

    return NextResponse.json({
      success: true,
      profileUrl: s3Key,
      message: 'Photo uploaded successfully',
    });
  } catch (error) {
    console.error('Error uploading photo:', error);
    return NextResponse.json(
      {
        error: 'Failed to upload photo. Please try again.',
      },
      { status: 500 },
    );
  }
}
