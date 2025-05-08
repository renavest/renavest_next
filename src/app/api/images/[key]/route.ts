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

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ key: string }> },
): Promise<NextResponse> {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const params = await context.params;
    const decodedKey = decodeURIComponent(params.key);

    console.log('Attempting to fetch from S3:', {
      bucket: bucketName,
      key: decodedKey,
      hasCredentials: !!process.env.AWS_ACCESS_KEY_ID && !!process.env.AWS_SECRET_ACCESS_KEY,
    });

    const command = new GetObjectCommand({
      Bucket: bucketName,
      Key: decodedKey,
    });

    // Get the object directly from S3
    const response = await s3Client.send(command);

    // Convert the S3 response stream to a Response
    if (!response.Body) {
      console.error('No body in S3 response for:', decodedKey);
      return new NextResponse('No image data received', { status: 404 });
    }

    // Get the content type from S3 or default to jpeg
    const contentType = response.ContentType || 'image/jpeg';

    // Create headers for caching
    const headers = new Headers({
      'Content-Type': contentType,
      'Cache-Control': 'public, max-age=31536000', // Cache for 1 year
      'Content-Length': response.ContentLength?.toString() || '',
    });

    // Stream the response directly
    // @ts-expect-error response.Body is a Readable stream
    return new NextResponse(response.Body, { headers });
  } catch (error) {
    // Handle S3 specific errors
    if (error instanceof S3ServiceException) {
      console.error('S3 Error:', {
        key: decodeURIComponent((await context.params).key),
        code: error.name,
        message: error.message,
        bucket: bucketName,
      });

      if (error.name === 'NoSuchKey') {
        return new NextResponse('Image not found in S3', {
          status: 404,
          headers: { 'Content-Type': 'text/plain' },
        });
      }
    }

    console.error('Error in image API route:', {
      key: decodeURIComponent((await context.params).key),
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
    });

    return new NextResponse('Failed to fetch image', {
      status: 500,
      headers: { 'Content-Type': 'text/plain' },
    });
  }
}
