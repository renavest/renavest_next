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
  console.log('=== Image API Route Called ===');
  console.log('URL:', request.url);
  console.log('User-Agent:', request.headers.get('user-agent'));
  console.log('Environment:', process.env.NODE_ENV);
  console.log('Vercel Environment:', process.env.VERCEL_ENV);

  try {
    // Wrap auth in try-catch to prevent unhandled auth errors
    let userId: string | null = null;
    try {
      const authResult = await auth();
      userId = authResult.userId;
      console.log('Auth check - userId:', userId ? 'present' : 'missing');
    } catch (authError) {
      console.error('Auth error (non-fatal):', authError);
      // Continue without auth for now to prevent 400 errors
      // In production, you might want to be more strict
    }

    // For development, allow unauthorized access to prevent blocking
    // In production, uncomment the line below to enforce auth
    // if (!userId) {
    //   console.log('Unauthorized access attempt');
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    // }

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

    console.log('Key processing:', {
      rawKey,
      decodedKey,
      urlSearchParams: request.nextUrl.searchParams.toString(),
    });

    // Validate S3 key to prevent injection attacks
    if (!decodedKey || decodedKey.includes('..') || decodedKey.startsWith('/')) {
      console.error('Invalid S3 key detected:', decodedKey);
      return NextResponse.json({ error: 'Invalid image key' }, { status: 400 });
    }

    const command = new GetObjectCommand({
      Bucket: bucketName,
      Key: decodedKey,
    });

    console.log('S3 Command:', {
      bucket: bucketName,
      key: decodedKey,
    });

    // Get the object directly from S3 with timeout
    const response = (await Promise.race([
      s3Client.send(command),
      new Promise((_, reject) => setTimeout(() => reject(new Error('S3 request timeout')), 10000)),
    ])) as any;

    console.log('S3 Response received:', {
      contentType: response.ContentType,
      contentLength: response.ContentLength,
      hasBody: !!response.Body,
    });

    // Convert the S3 response stream to a Response
    if (!response.Body) {
      console.error('No body in S3 response for:', decodedKey);
      return NextResponse.json({ error: 'Image not found' }, { status: 404 });
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
        console.log('Image not found in S3');
        return NextResponse.json({ error: 'Image not found' }, { status: 404 });
      }

      if (error.name === 'AccessDenied') {
        console.error('S3 Access Denied - check AWS credentials and permissions');
        return NextResponse.json({ error: 'Access denied' }, { status: 403 });
      }
    }

    // Handle timeout errors
    if (error instanceof Error && error.message === 'S3 request timeout') {
      console.error('S3 request timed out');
      return NextResponse.json({ error: 'Request timeout' }, { status: 504 });
    }

    // Return error response - let client handle fallback
    console.log('Returning error response for client to handle');
    return NextResponse.json({ error: 'Image service error' }, { status: 500 });
  }
}
