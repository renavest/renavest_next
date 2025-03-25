import { clerkMiddleware, createRouteMatcher, currentUser } from '@clerk/nextjs/server';
import type { User } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

// Define protected routes that require authentication
const protectedRoutes = [
  '/employee/(.*)',
  '/employer/dashboard/(.*)',
  '/therapist/dashboard/(.*)',
  '/explore/(.*)',
];

// Create route matcher for protected routes
const isProtectedRoute = createRouteMatcher(protectedRoutes);

// Seth's user IDs
const SETH_USER_IDS = ['user_2ujgBxILoKp4ICRZ7A3LYlbKceU', 'user_2uGym23xBrjDzFTgsT0BEkgj3Ux'];

// Helper function to get dashboard path for Seth
function getSethDashboardPath(user: User): string {
  console.log('Determining Seth dashboard path');

  // Check user metadata or custom properties
  const role = user.publicMetadata?.role as string | undefined;

  console.log('Seth Role from Metadata:', role);

  switch (role) {
    case 'employer':
      return '/employer/dashboard';
    case 'therapist':
      return '/therapist/dashboard';
    case 'employee':
      return '/employee';
    default:
      console.log('No specific role found for Seth, defaulting to employee');
      return '/employee';
  }
}

export default clerkMiddleware(async (auth, req) => {
  console.log('Middleware processing request:', {
    pathname: req.nextUrl.pathname,
    method: req.method,
  });

  // Get current user
  const user = await currentUser();

  // Log user details
  console.log('Current User Details:', {
    userId: user?.id,
    email: user?.emailAddresses?.[0]?.emailAddress,
    firstName: user?.firstName,
    lastName: user?.lastName,
  });

  // Determine routing based on user
  if (user) {
    // Check if user is Seth
    const isSethUser = SETH_USER_IDS.includes(user.id);

    if (isSethUser) {
      // Seth's routing logic
      const sethDashboard = getSethDashboardPath(user);

      if (req.nextUrl.pathname !== sethDashboard) {
        console.log(`Redirecting Seth to: ${sethDashboard}`);
        return NextResponse.redirect(new URL(sethDashboard, req.url));
      }
    } else {
      // Non-Seth users always go to explore
      if (!req.nextUrl.pathname.startsWith('/explore')) {
        console.log('Redirecting non-Seth user to explore');
        return NextResponse.redirect(new URL('/explore', req.url));
      }
    }
  }

  // Handle protected routes
  if (isProtectedRoute(req) && !user) {
    console.log('No user, redirecting to login');
    const loginUrl = new URL('/login', req.url);
    loginUrl.searchParams.set('redirect_url', req.url);
    return NextResponse.redirect(loginUrl);
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
