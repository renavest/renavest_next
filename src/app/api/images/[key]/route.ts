import { S3Client, GetObjectCommand, S3ServiceException } from '@aws-sdk/client-s3';
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
    // Check AWS configuration first
    const hasAwsConfig = !!(
      process.env.AWS_ACCESS_KEY_ID &&
      process.env.AWS_SECRET_ACCESS_KEY &&
      process.env.AWS_S3_IMAGES_BUCKET_NAME
    );

    if (!hasAwsConfig) {
      console.error('AWS configuration missing for image serving');
      return NextResponse.json({ error: 'Service not configured' }, { status: 503 });
    }

    // Safely get params with error handling
    let params: { key: string };
    try {
      params = await context.params;
    } catch (paramError) {
      console.error('Error getting params:', paramError);
      return NextResponse.json({ error: 'Invalid request parameters' }, { status: 400 });
    }

    const rawKey = params.key;
    const decodedKey = decodeURIComponent(rawKey);

    // Validate S3 key to prevent injection attacks
    if (!decodedKey || decodedKey.includes('..') || decodedKey.startsWith('/')) {
      console.error('Invalid S3 key detected:', decodedKey);
      return NextResponse.json({ error: 'Invalid image key' }, { status: 400 });
    }

    const command = new GetObjectCommand({
      Bucket: bucketName,
      Key: decodedKey,
    });

    // Get the object directly from S3 with timeout
    const response = (await Promise.race([
      s3Client.send(command),
      new Promise((_, reject) => setTimeout(() => reject(new Error('S3 request timeout')), 10000)),
    ])) as any;

    // Convert the S3 response stream to a Response
    if (!response.Body) {
      console.error('No body in S3 response for:', decodedKey);
      return NextResponse.json({ error: 'Image not found' }, { status: 404 });
    }

    // Get the content type from S3 or default to jpeg
    const contentType = response.ContentType || 'image/jpeg';

    // Create headers for better caching and cache invalidation support
    const headers = new Headers({
      'Content-Type': contentType,
      'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400', // More flexible caching
      'Content-Length': response.ContentLength?.toString() || '',
      ETag: response.ETag || `"${Date.now()}"`, // Add ETag for better cache control
    });

    // Add cache-busting support via query parameters
    const url = new URL(request.url);
    const version = url.searchParams.get('v') || url.searchParams.get('t');
    if (version) {
      headers.set('Cache-Control', 'public, max-age=31536000, immutable'); // Long cache for versioned images
    }

    // Stream the response directly
    // @ts-expect-error response.Body is a Readable stream
    return new NextResponse(response.Body, { headers });
  } catch (error) {
    console.error('Error in image API route:', error);

    // Handle S3 specific errors
    if (error instanceof S3ServiceException) {
      if (error.name === 'NoSuchKey') {
        return NextResponse.json({ error: 'Image not found' }, { status: 404 });
      }

      if (error.name === 'AccessDenied') {
        console.error('S3 Access Denied - check AWS credentials and permissions');
        return NextResponse.json({ error: 'Access denied' }, { status: 403 });
      }
    }

    // Handle timeout errors
    if (error instanceof Error && error.message === 'S3 request timeout') {
      return NextResponse.json({ error: 'Request timeout' }, { status: 504 });
    }

    // Return error response - let client handle fallback
    return NextResponse.json({ error: 'Image service error' }, { status: 500 });
  }
}
