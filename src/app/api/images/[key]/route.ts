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

    // Check AWS configuration first
    const hasAwsConfig = !!(
      process.env.AWS_ACCESS_KEY_ID &&
      process.env.AWS_SECRET_ACCESS_KEY &&
      process.env.AWS_S3_IMAGES_BUCKET_NAME
    );

    if (!hasAwsConfig) {
      console.error('AWS configuration missing for image serving');
      // Return placeholder image instead of error
      return NextResponse.redirect('/experts/placeholderexp.png');
    }

    const params = await context.params;
    const decodedKey = decodeURIComponent(params.key);

    console.log('Attempting to fetch from S3:', {
      bucket: bucketName,
      key: decodedKey,
      hasCredentials: hasAwsConfig,
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
      return NextResponse.redirect('/experts/placeholderexp.png');
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
        // Redirect to placeholder instead of 404
        return NextResponse.redirect('/experts/placeholderexp.png');
      }

      if (error.name === 'AccessDenied') {
        console.error('S3 Access Denied - check AWS credentials and permissions');
        return NextResponse.redirect('/experts/placeholderexp.png');
      }
    }

    console.error('Error in image API route:', {
      key: decodeURIComponent((await context.params).key),
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
    });

    // Redirect to placeholder instead of error response
    return NextResponse.redirect('/experts/placeholderexp.png');
  }
}
