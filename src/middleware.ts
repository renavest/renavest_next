import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { clerkClient } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Define protected routes that require authentication
const protectedRoutes = [
  '/employee/(.*)',
  '/employer/dashboard/(.*)',
  '/therapist/dashboard/(.*)',
  '/explore/(.*)',
  '/onboarding/(.*)',
];

// Create route matcher for protected routes
const isProtectedRoute = createRouteMatcher(protectedRoutes);

// Allowed emails for traditional routing
const ALLOWED_EMAILS = [
  // Add your allowed emails here
  'test@renavest.com',
  'admin@renavest.com',
  'sethmorton05@gmail.com',
];

// Helper function to get dashboard path based on role metadata
function getDashboardPath(role?: string | null): string {
  switch (role) {
    case 'employer':
      return '/employer';
    case 'therapist':
      return '/therapist/dashboard';
    case 'employee':
      return '/employee';
    default:
      return '/employee';
  }
}

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

  // Try to get email from session claims first
  const claims = sessionClaims as CustomSessionClaims;
  if (claims?.email) {
    emailAddress = claims.email;
  }
  // If no email in session claims, fetch from Clerk user
  else if (userId) {
    try {
      const client = await clerkClient();
      const user = await client.users.getUser(userId);
      emailAddress = user.emailAddresses[0]?.emailAddress;
    } catch (error) {
      console.error('Error fetching user email:', error);
    }
  }

  // Handle protected routes first
  if (isProtectedRoute(request) && !userId) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect_url', request.url);
    return NextResponse.redirect(loginUrl);
  }

  // If user is authenticated, handle routing
  if (userId && emailAddress) {
    // Check if user's email is in the allowed list
    if (ALLOWED_EMAILS.includes(emailAddress)) {
      // Traditional routing based on role
      const userRole = claims?.metadata?.role;
      const dashboardPath = getDashboardPath(userRole);

      if (!request.nextUrl.pathname.startsWith(dashboardPath)) {
        return NextResponse.redirect(new URL(dashboardPath, request.url));
      }
    } else {
      // Non-allowed users need to complete onboarding before accessing explore
      const onboardingComplete = claims?.metadata?.onboardingComplete;

      // If onboarding is not complete and user is not on onboarding page, redirect to onboarding
      if (!onboardingComplete && !request.nextUrl.pathname.startsWith('/onboarding')) {
        return NextResponse.redirect(new URL('/onboarding', request.url));
      }

      // If onboarding is complete and user is not on explore, redirect to explore
      if (onboardingComplete && !request.nextUrl.pathname.startsWith('/explore')) {
        return NextResponse.redirect(new URL('/explore', request.url));
      }
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files
    '/((?!_next|[^?]*\\.[\\w]+$).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};
