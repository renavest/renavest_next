import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

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

  // Block signup unless email is in therapists table
  if (request.nextUrl.pathname === '/therapist-signup') {
    if (request.method === 'POST') {
      const body = await request.json();
      const email = body.email || body.identifier || body.emailAddress;
      if (email) {
        // Import db and therapists
        const { db } = await import('@/src/db');
        const { therapists } = await import('@/src/db/schema');
        const { eq } = await import('drizzle-orm');
        const therapistRows = await db
          .select()
          .from(therapists)
          .where(eq(therapists.email, email.toLowerCase()))
          .limit(1);
        if (therapistRows.length === 0) {
          // Redirect or return error
          return NextResponse.redirect(new URL('/therapist-signup/error', request.url));
        }
      }
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
