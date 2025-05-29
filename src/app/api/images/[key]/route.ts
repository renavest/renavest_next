import { Readable } from 'stream';

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
      'Content-Length': response.ContentLength?.toString() || '',
      ETag: response.ETag || `"${Date.now()}"`,
    });

    // Add cache-busting support via query parameters
    const url = new URL(request.url);
    const version = url.searchParams.get('v') || url.searchParams.get('t');
    if (version) {
      // For versioned requests (cache-busting), use no-cache to force fresh fetch
      headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');
      headers.set('Pragma', 'no-cache');
      headers.set('Expires', '0');
    } else {
      // For normal requests, allow longer caching with revalidation
      headers.set('Cache-Control', 'public, max-age=86400, stale-while-revalidate=604800'); // 1 day cache, 1 week stale
      headers.set('Vary', 'Accept-Encoding');
    }

    // Convert the stream to bytes to avoid stream handling issues
    let buffer: Buffer;

    if (response.Body instanceof Buffer) {
      // If it's already a buffer, use it directly
      buffer = response.Body;
    } else {
      // Convert the stream to buffer using Node.js stream methods
      const chunks: Uint8Array[] = [];
      const stream = response.Body as Readable; // S3 response body is a Node.js readable stream

      for await (const chunk of stream) {
        chunks.push(chunk);
      }

      buffer = Buffer.concat(chunks);
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
