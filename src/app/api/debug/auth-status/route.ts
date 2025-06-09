// src/app/api/debug/auth-status/route.ts
// Debug endpoint to help diagnose authentication issues
// Only available in development environment

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';

import { validateClerkEnvironment } from '@/src/features/auth/utils/envValidation';

export async function GET(req: NextRequest) {
  // Only allow in development
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json(
      { error: 'Debug endpoint only available in development' },
      { status: 404 },
    );
  }

  try {
    // Validate environment configuration
    const envValidation = validateClerkEnvironment();

    // Get current auth status
    const { userId, sessionClaims } = await auth();

    // Get request info
    const requestInfo = {
      origin: req.headers.get('origin'),
      host: req.headers.get('host'),
      userAgent: req.headers.get('user-agent'),
      referer: req.headers.get('referer'),
    };

    // Environment info
    const envInfo = {
      nodeEnv: process.env.NODE_ENV,
      nextPublicAppUrl: process.env.NEXT_PUBLIC_APP_URL,
      clerkPublishableKey: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
        ? `${process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY.slice(0, 20)}...`
        : 'Not set',
      hasClerkSecretKey: !!process.env.CLERK_SECRET_KEY,
      hasWebhookSecret: !!process.env.CLERK_WEBHOOK_SECRET,
    };

    const debugInfo = {
      timestamp: new Date().toISOString(),
      environment: envInfo,
      validation: envValidation,
      auth: {
        isAuthenticated: !!userId,
        userId: userId || null,
        sessionClaims: sessionClaims || null,
      },
      request: requestInfo,
    };

    return NextResponse.json(debugInfo, { status: 200 });
  } catch (error) {
    console.error('Debug auth status error:', error);
    return NextResponse.json(
      {
        error: 'Failed to get auth status',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}
