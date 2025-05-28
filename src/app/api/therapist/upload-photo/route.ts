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
    console.log('=== Photo Upload API Called ===');

    // Check environment variables
    const hasAwsConfig = !!(
      process.env.AWS_ACCESS_KEY_ID &&
      process.env.AWS_SECRET_ACCESS_KEY &&
      process.env.AWS_S3_IMAGES_BUCKET_NAME
    );
    console.log('AWS Configuration:', {
      hasAccessKey: !!process.env.AWS_ACCESS_KEY_ID,
      hasSecretKey: !!process.env.AWS_SECRET_ACCESS_KEY,
      hasBucketName: !!process.env.AWS_S3_IMAGES_BUCKET_NAME,
      bucketName: bucketName,
      region: process.env.AWS_REGION || 'us-east-1',
      hasCompleteConfig: hasAwsConfig,
    });

    if (!hasAwsConfig) {
      console.error('Missing AWS configuration');
      return NextResponse.json(
        {
          error: 'Server configuration error: Missing AWS credentials',
        },
        { status: 500 },
      );
    }

    const { userId, sessionClaims } = await auth();
    const metadata = sessionClaims?.metadata as { role?: string } | undefined;

    console.log('Auth check:', { userId: !!userId, role: metadata?.role });

    if (!userId || metadata?.role !== 'therapist') {
      console.error('Unauthorized access attempt:', { userId: !!userId, role: metadata?.role });
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await currentUser();
    if (!user) {
      console.error('Current user not found');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userEmail = user.emailAddresses[0]?.emailAddress;
    console.log('User email:', userEmail);

    const userResult = await db.select().from(users).where(eq(users.email, userEmail)).limit(1);

    if (!userResult.length) {
      console.error('User not found in database:', userEmail);
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const therapistResult = await db
      .select()
      .from(therapists)
      .where(eq(therapists.userId, userResult[0].id))
      .limit(1);

    if (!therapistResult.length) {
      console.error('Therapist not found for user:', userResult[0].id);
      return NextResponse.json({ error: 'Therapist not found' }, { status: 404 });
    }

    console.log('Therapist found:', { id: therapistResult[0].id, name: therapistResult[0].name });

    const formData = await request.formData();
    const file = formData.get('file') as File;

    console.log('File check:', {
      hasFile: !!file,
      fileName: file?.name,
      fileSize: file?.size,
      fileType: file?.type,
    });

    if (!file) {
      console.error('No file provided in request');
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      console.error('Invalid file type:', file.type);
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
      console.error('File too large:', file.size);
      return NextResponse.json(
        {
          error: 'File too large. Please upload an image smaller than 10MB.',
        },
        { status: 400 },
      );
    }

    // Generate S3 key based on therapist name (consistent naming for existing compatibility)
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

    console.log('S3 upload details:', { s3Key, fileExtension, normalizedName });

    // Note: We're overwriting the existing file with the same S3 key
    // This maintains compatibility with existing database records

    // Convert file to buffer
    const buffer = Buffer.from(await file.arrayBuffer());
    console.log('Buffer created, size:', buffer.length);

    // Upload to S3 with cache invalidation headers
    const uploadCommand = new PutObjectCommand({
      Bucket: bucketName,
      Key: s3Key,
      Body: buffer,
      ContentType: file.type,
      CacheControl: 'public, max-age=0, must-revalidate', // Force cache revalidation
      Metadata: {
        'upload-timestamp': Date.now().toString(), // Help with cache busting
      },
    });

    console.log('Attempting S3 upload...');
    await s3Client.send(uploadCommand);
    console.log('S3 upload successful');

    // Update therapist profile with new image URL and timestamp
    console.log('Updating therapist profile...');
    const updateResult = await db
      .update(therapists)
      .set({
        profileUrl: s3Key,
        updatedAt: new Date(), // Update the timestamp to help with cache busting
      })
      .where(eq(therapists.id, therapistResult[0].id))
      .returning({ updatedAt: therapists.updatedAt });

    console.log('Database update successful');

    const updatedTimestamp = updateResult[0]?.updatedAt?.getTime() || Date.now();

    return NextResponse.json({
      success: true,
      profileUrl: s3Key,
      timestamp: updatedTimestamp, // Use database timestamp for consistent cache busting
      message: 'Photo uploaded successfully',
    });
  } catch (error) {
    console.error('Error uploading photo:', error);
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack available');
    return NextResponse.json(
      {
        error: 'Failed to upload photo. Please try again.',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}
