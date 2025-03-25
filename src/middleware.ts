import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

// Define protected routes that require authentication
const protectedRoutes = [
  '/employee/(.*)',
  '/employer/dashboard/(.*)',
  '/therapist/dashboard/(.*)',
  '/explore/(.*)',
];

// Define public routes that don't require authentication
const publicRoutes = ['/login', '/sign-up', '/'];

// Create route matcher for protected routes
const isProtectedRoute = createRouteMatcher(protectedRoutes);

// Helper function to get dashboard path based on role
function getDashboardPath(role: string | undefined, userId: string | undefined): string {
  // Special handling for Seth
  if (userId === 'user_2ujgBxILoKp4ICRZ7A3LYlbKceU') {
    switch (role) {
      case 'employer':
        return '/employer/dashboard';
      case 'therapist':
        return '/therapist/dashboard';
      case 'employee':
        return '/employee';
      default:
        return '/employee'; // Default to employee dashboard for Seth
    }
  }

  // For all other users, always redirect to explore
  return '/explore';
}

export default clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) {
    // Protect the route
    const authObject = await auth();
    const { userId, sessionClaims } = authObject;

    if (!userId) {
      const loginUrl = new URL('/login', req.url);
      loginUrl.searchParams.set('redirect_url', req.url);
      return NextResponse.redirect(loginUrl);
    }

    // If accessing public routes while authenticated, redirect based on user ID
    if (publicRoutes.includes(req.nextUrl.pathname)) {
      const metadata = sessionClaims?.metadata as { role?: string } | undefined;
      const userDashboard = getDashboardPath(metadata?.role, userId);
      return NextResponse.redirect(new URL(userDashboard, req.url));
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
