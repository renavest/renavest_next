import {
  S3Client,
  GetObjectCommand,
  S3ServiceException,
  GetObjectCommandOutput,
} from '@aws-sdk/client-s3';
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
  let decodedKey = ''; // Declare at function scope

  try {
    // Check AWS configuration first
    const hasAwsConfig = !!(
      process.env.AWS_ACCESS_KEY_ID &&
      process.env.AWS_SECRET_ACCESS_KEY &&
      process.env.AWS_S3_IMAGES_BUCKET_NAME
    );

    if (!hasAwsConfig) {
      console.error('AWS configuration missing for image serving');
      // Return a redirect to placeholder instead of JSON error
      return NextResponse.redirect(new URL('/experts/placeholderexp.png', request.url));
    }

    // Safely get params with error handling
    let params: { key: string };
    try {
      params = await context.params;
    } catch (paramError) {
      console.error('Error getting params:', paramError);
      return NextResponse.redirect(new URL('/experts/placeholderexp.png', request.url));
    }

    const rawKey = params.key;
    decodedKey = decodeURIComponent(rawKey);

    // Validate S3 key to prevent injection attacks
    if (!decodedKey || decodedKey.includes('..') || decodedKey.startsWith('/')) {
      console.error('Invalid S3 key detected:', decodedKey);
      return NextResponse.redirect(new URL('/experts/placeholderexp.png', request.url));
    }

    const command = new GetObjectCommand({
      Bucket: bucketName,
      Key: decodedKey,
    });

    // Get the object directly from S3 with shorter timeout to prevent 502s
    const response = (await Promise.race([
      s3Client.send(command),
      new Promise((_, reject) => setTimeout(() => reject(new Error('S3 request timeout')), 5000)),
    ])) as GetObjectCommandOutput;

    // Convert the S3 response stream to a Response
    if (!response.Body) {
      console.error('No body in S3 response for:', decodedKey);
      return NextResponse.redirect(new URL('/experts/placeholderexp.png', request.url));
    }

    // Get the content type from S3 or default to jpeg
    const contentType = response.ContentType || 'image/jpeg';

    // Create headers for better caching and cache invalidation support
    const headers = new Headers({
      'Content-Type': contentType,
      'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400',
      'Content-Length': response.ContentLength?.toString() || '',
      ETag: response.ETag || `"${Date.now()}"`,
    });

    // Add cache-busting support via query parameters
    const url = new URL(request.url);
    const version = url.searchParams.get('v') || url.searchParams.get('t');
    if (version) {
      headers.set('Cache-Control', 'public, max-age=31536000, immutable');
    }

    // Convert the stream to bytes to avoid stream handling issues
    const chunks: Uint8Array[] = [];
    const reader = (response.Body as ReadableStream).getReader();

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        chunks.push(value);
      }
    } finally {
      reader.releaseLock();
    }

    // Combine chunks into a single buffer
    const totalLength = chunks.reduce((sum, chunk) => sum + chunk.length, 0);
    const buffer = new Uint8Array(totalLength);
    let offset = 0;
    for (const chunk of chunks) {
      buffer.set(chunk, offset);
      offset += chunk.length;
    }

    return new NextResponse(buffer, { headers });
  } catch (error) {
    console.error('Error in image API route:', error);

    // Handle S3 specific errors
    if (error instanceof S3ServiceException) {
      if (error.name === 'NoSuchKey') {
        console.log('Image not found, redirecting to placeholder:', decodedKey);
        return NextResponse.redirect(new URL('/experts/placeholderexp.png', request.url));
      }

      if (error.name === 'AccessDenied') {
        console.error('S3 Access Denied - check AWS credentials and permissions');
        return NextResponse.redirect(new URL('/experts/placeholderexp.png', request.url));
      }
    }

    // Handle timeout errors
    if (error instanceof Error && error.message === 'S3 request timeout') {
      console.log('S3 request timeout, redirecting to placeholder');
      return NextResponse.redirect(new URL('/experts/placeholderexp.png', request.url));
    }

    // For any other error, redirect to placeholder instead of returning error response
    console.log('Unknown error, redirecting to placeholder');
    return NextResponse.redirect(new URL('/experts/placeholderexp.png', request.url));
  }
}
