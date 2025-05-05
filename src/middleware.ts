import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

import { ALLOWED_EMAILS } from './constants';

// Define protected routes that require authentication
const protectedRoutes = [
  '/therapist',
  '/therapist/(.*)',
  '/explore',
  '/explore/(.*)',
  '/employee',
  '/employee/(.*)',
  '/employer',
  '/employer/(.*)',
  '/book',
  '/book/(.*)',
];

// Create route matcher for protected routes
const isProtectedRoute = createRouteMatcher(protectedRoutes);

export default clerkMiddleware(async (auth, request: NextRequest) => {
  // Enhanced protection for all protected routes
  if (isProtectedRoute(request)) {
    const { userId } = await auth();
    if (!userId) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect_url', request.url);
      return NextResponse.redirect(loginUrl);
    }
  }
  if (request.nextUrl.pathname === '/login') {
    const { userId } = await auth();
    if (userId) {
      return NextResponse.redirect(new URL('/employee', request.url));
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
