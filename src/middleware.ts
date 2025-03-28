import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { clerkClient } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

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

// Allowed emails for traditional routing
const ALLOWED_EMAILS = [
  // Add your allowed emails here
  'test@renavest.com',
  'admin@renavest.com',
  'sethmorton05@gmail.com',
  'stanley@renavestapp.com',
];

// Helper function to get dashboard path based on role metadata
// function getDashboardPath(role?: string | null): string {
//   switch (role) {
//     case 'employer':
//       return '/employer';
//     case 'therapist':
//       return '/therapist/dashboard';
//     case 'employee':
//       return '/employee';
//     default:
//       return '/employee';
//   }
// }

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

  // Enhanced debugging: Log the current request and authentication status
  console.log('🔍 Middleware Detailed Request:', {
    fullPath: request.nextUrl.pathname,
    userId: userId,
    isProtectedRoute: isProtectedRoute(request),
  });

  // Get email from session claims or fetch from Clerk user
  const claims = sessionClaims as CustomSessionClaims;
  if (claims?.email) {
    emailAddress = claims.email;
  } else if (userId) {
    try {
      const client = await clerkClient();

      const user = await client.users.getUser(userId);
      console.log(user);
      emailAddress = user.emailAddresses[0]?.emailAddress;
      console.log(emailAddress);
    } catch (error) {
      console.error('Error fetching user email:', error);
    }
  }

  // Enhanced protection for all protected routes
  if (isProtectedRoute(request)) {
    // If no user ID, always redirect to login
    if (!userId) {
      console.log('🔒 Redirecting unauthenticated user to login');
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect_url', request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  // Handle initial routing after login
  if (
    userId &&
    emailAddress &&
    (request.nextUrl.pathname === '/login' || request.nextUrl.pathname === '/sign-up/sso-callback')
  ) {
    console.log('THE EMAIL ADDRESS IS:');
    console.log(emailAddress);
    const isAllowedEmail = ALLOWED_EMAILS.includes(emailAddress);
    console.log('THE IS ALLOWED EMAIL IS:');
    console.log(isAllowedEmail);
    const userRole = claims?.metadata?.role;

    // For allowed emails (salespeople), set role if not already set
    if (isAllowedEmail && !userRole) {
      const clerk = await clerkClient();
      await clerk.users.updateUser(userId, {
        publicMetadata: {
          ...claims?.metadata,
          role: 'employer', // Set default role for allowed emails to employer
        },
      });
      return NextResponse.redirect(new URL('/employee', request.url));
    }

    // For allowed emails with existing roles, redirect to appropriate dashboard
    if (isAllowedEmail) {
      if (userRole === 'employee') {
        console.log('🎯 Redirecting salesperson to employee dashboard');
        return NextResponse.redirect(new URL('/employee', request.url));
      } else if (userRole === 'employer') {
        console.log('🎯 Redirecting salesperson to employer dashboard');
        return NextResponse.redirect(new URL('/employer', request.url));
      } else if (userRole === 'therapist') {
        console.log('🎯 Redirecting salesperson to therapist dashboard');
        return NextResponse.redirect(new URL('/therapist', request.url));
      }
    }

    // For regular users, redirect to explore
    console.log('🌐 Redirecting regular user to explore');
    return NextResponse.redirect(new URL('/explore', request.url));
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
