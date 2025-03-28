import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { clerkClient } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

import { ALLOWED_EMAILS } from './constants';

// Define protected routes that require authentication
const protectedRoutes = [
  '/employee',
  '/employee/(.*)',
  '/employer/dashboard',
  '/employer/dashboard/(.*)',
  '/therapist/dashboard',
  '/therapist/dashboard/(.*)',
  '/explore',
  '/explore/(.*)',
];

// Create route matcher for protected routes
const isProtectedRoute = createRouteMatcher(protectedRoutes);

// Define a type for session claims to handle metadata
interface CustomSessionClaims {
  email?: string;
  metadata?: {
    role?: string;
    onboardingComplete?: boolean;
  };
}

export default clerkMiddleware(async (auth, request: NextRequest) => {
  // Get current user details using auth()
  const { userId, sessionClaims } = await auth();
  let emailAddress: string | undefined;

  // Get email from session claims or fetch from Clerk user
  const claims = sessionClaims as CustomSessionClaims;
  if (claims?.email) {
    emailAddress = claims.email;
  } else if (userId) {
    try {
      const client = await clerkClient();
      const user = await client.users.getUser(userId);
      emailAddress = user.emailAddresses[0]?.emailAddress;
    } catch (error) {
      console.error('Error fetching user email:', error);
    }
  }

  // Enhanced protection for all protected routes
  if (isProtectedRoute(request)) {
    if (!userId) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect_url', request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  // Handle initial routing after login
  if (
    userId &&
    emailAddress &&
    (request.nextUrl.pathname === '/login' ||
      request.nextUrl.pathname === '/sign-up/sso-callback' ||
      request.nextUrl.pathname === '/explore') // Also check if we're on explore page
  ) {
    const isAllowedEmail = ALLOWED_EMAILS.includes(emailAddress);
    const userRole = claims?.metadata?.role;

    // For allowed emails (salespeople), set role if not already set
    if (isAllowedEmail) {
      if (!userRole) {
        const clerk = await clerkClient();
        await clerk.users.updateUser(userId, {
          publicMetadata: {
            ...claims?.metadata,
            role: 'employee', // Set default role for allowed emails to employee
          },
        });
      }
      // Always redirect to appropriate dashboard based on role or default to employee
      if (userRole === 'employer') {
        return NextResponse.redirect(new URL('/employer', request.url));
      } else if (userRole === 'therapist') {
        return NextResponse.redirect(new URL('/therapist', request.url));
      } else {
        // Default to employee for allowed emails
        return NextResponse.redirect(new URL('/employee', request.url));
      }
    }

    // Only redirect to explore if explicitly not an allowed email
    if (!isAllowedEmail && request.nextUrl.pathname !== '/explore') {
      return NextResponse.redirect(new URL('/explore', request.url));
    }
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files
    '/((?!_next|[^?]*\\.[\\w]+$).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};
