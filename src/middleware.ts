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
  console.log('Determining dashboard path:', { role, userId });

  // Special handling for Seth
  if (userId === 'user_2ujgBxILoKp4ICRZ7A3LYlbKceU') {
    console.log('Seth user detected');
    switch (role) {
      case 'employer':
        console.log('Routing Seth to employer dashboard');
        return '/employer/dashboard';
      case 'therapist':
        console.log('Routing Seth to therapist dashboard');
        return '/therapist/dashboard';
      case 'employee':
        console.log('Routing Seth to employee page');
        return '/employee';
      default:
        console.log('Seth: No role specified, defaulting to employee');
        return '/employee'; // Default to employee dashboard for Seth
    }
  }

  // For ALL other users, ALWAYS redirect to explore, regardless of role
  console.log('Non-Seth user, routing to explore');
  return '/explore';
}

export default clerkMiddleware(async (auth, req) => {
  console.log('Middleware processing request:', {
    pathname: req.nextUrl.pathname,
    method: req.method,
  });

  // Always redirect non-Seth users to explore
  const authObject = await auth();
  const { userId, sessionClaims } = authObject;

  console.log('Authentication details:', {
    userId,
    sessionClaimsMetadata: sessionClaims?.metadata,
  });

  if (userId && userId !== 'user_2ujgBxILoKp4ICRZ7A3LYlbKceU') {
    // Force redirect to explore for non-Seth users
    if (!req.nextUrl.pathname.startsWith('/explore')) {
      console.log('Redirecting non-Seth user to explore');
      return NextResponse.redirect(new URL('/explore', req.url));
    }
  }

  if (isProtectedRoute(req)) {
    if (!userId) {
      console.log('No user ID, redirecting to login');
      const loginUrl = new URL('/login', req.url);
      loginUrl.searchParams.set('redirect_url', req.url);
      return NextResponse.redirect(loginUrl);
    }

    // If accessing public routes while authenticated, redirect based on user ID
    if (publicRoutes.includes(req.nextUrl.pathname)) {
      const metadata = sessionClaims?.metadata as { role?: string } | undefined;
      const userDashboard = getDashboardPath(metadata?.role, userId);
      console.log('Redirecting to dashboard:', userDashboard);
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
