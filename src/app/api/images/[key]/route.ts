import fs from 'fs';
import path from 'path';

import { S3Client, GetObjectCommand, S3ServiceException } from '@aws-sdk/client-s3';
import { auth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';

// Configure AWS S3
const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  },
});

const bucketName = process.env.AWS_S3_IMAGES_BUCKET_NAME || '';

// Helper function to serve placeholder image
async function servePlaceholderImage(): Promise<NextResponse> {
  try {
    const placeholderPath = path.join(process.cwd(), 'public', 'experts', 'placeholderexp.png');
    const imageBuffer = fs.readFileSync(placeholderPath);

    return new NextResponse(imageBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'public, max-age=3600',
      },
    });
  } catch (error) {
    console.error('Failed to serve placeholder image:', error);
    // Return a simple 1x1 transparent PNG as fallback
    const transparentPng = Buffer.from([
      0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00, 0x00, 0x0d, 0x49, 0x48, 0x44,
      0x52, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01, 0x08, 0x06, 0x00, 0x00, 0x00, 0x1f,
      0x15, 0xc4, 0x89, 0x00, 0x00, 0x00, 0x0a, 0x49, 0x44, 0x41, 0x54, 0x78, 0x9c, 0x63, 0x00,
      0x01, 0x00, 0x00, 0x05, 0x00, 0x01, 0x0d, 0x0a, 0x2d, 0xb4, 0x00, 0x00, 0x00, 0x00, 0x49,
      0x45, 0x4e, 0x44, 0xae, 0x42, 0x60, 0x82,
    ]);

    return new NextResponse(transparentPng, {
      status: 200,
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'public, max-age=3600',
      },
    });
  }
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ key: string }> },
): Promise<NextResponse> {
  console.log('=== Image API Route Called = ==');
  console.log('URL:', request.url);
  console.log('User-Agent:', request.headers.get('user-agent'));
  console.log('Environment:', process.env.NODE_ENV);
  console.log('Vercel Environment:', process.env.VERCEL_ENV);

  try {
    const { userId } = await auth();
    console.log('Auth check - userId:', userId ? 'present' : 'missing');

    if (!userId) {
      console.log('Unauthorized access attempt');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check AWS configuration first
    const hasAwsConfig = !!(
      process.env.AWS_ACCESS_KEY_ID &&
      process.env.AWS_SECRET_ACCESS_KEY &&
      process.env.AWS_S3_IMAGES_BUCKET_NAME
    );

    console.log('AWS Config check:', {
      hasAccessKey: !!process.env.AWS_ACCESS_KEY_ID,
      hasSecretKey: !!process.env.AWS_SECRET_ACCESS_KEY,
      hasBucketName: !!process.env.AWS_S3_IMAGES_BUCKET_NAME,
      bucketName: bucketName,
      region: process.env.AWS_REGION || 'us-east-1',
      accessKeyPrefix: process.env.AWS_ACCESS_KEY_ID
        ? process.env.AWS_ACCESS_KEY_ID.substring(0, 8) + '...'
        : 'missing',
    });

    if (!hasAwsConfig) {
      console.error('AWS configuration missing for image serving');
      return servePlaceholderImage();
    }

    const params = await context.params;
    const rawKey = params.key;
    const decodedKey = decodeURIComponent(rawKey);

    console.log('Key processing:', {
      rawKey,
      decodedKey,
      urlSearchParams: request.nextUrl.searchParams.toString(),
    });

    const command = new GetObjectCommand({
      Bucket: bucketName,
      Key: decodedKey,
    });

    console.log('S3 Command:', {
      bucket: bucketName,
      key: decodedKey,
    });

    // Get the object directly from S3
    const response = await s3Client.send(command);
    console.log('S3 Response received:', {
      contentType: response.ContentType,
      contentLength: response.ContentLength,
      hasBody: !!response.Body,
    });

    // Convert the S3 response stream to a Response
    if (!response.Body) {
      console.error('No body in S3 response for:', decodedKey);
      return servePlaceholderImage();
    }

    // Get the content type from S3 or default to jpeg
    const contentType = response.ContentType || 'image/jpeg';

    // Create headers for caching
    const headers = new Headers({
      'Content-Type': contentType,
      'Cache-Control': 'public, max-age=31536000', // Cache for 1 year
      'Content-Length': response.ContentLength?.toString() || '',
    });

    console.log('Returning successful image response');

    // Stream the response directly
    // @ts-expect-error response.Body is a Readable stream
    return new NextResponse(response.Body, { headers });
  } catch (error) {
    console.error('=== Error in image API route ===');
    console.error('Error details:', {
      name: error instanceof Error ? error.name : 'Unknown',
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
    });

    // Handle S3 specific errors
    if (error instanceof S3ServiceException) {
      console.error('S3 Service Exception:', {
        code: error.name,
        message: error.message,
        statusCode: error.$metadata?.httpStatusCode,
      });

      if (error.name === 'NoSuchKey') {
        console.log('Image not found in S3, serving placeholder');
        return servePlaceholderImage();
      }

      if (error.name === 'AccessDenied') {
        console.error('S3 Access Denied - check AWS credentials and permissions');
        return servePlaceholderImage();
      }
    }

    // Return placeholder image instead of throwing error
    console.log('Falling back to placeholder image');
    return servePlaceholderImage();
  }
}
