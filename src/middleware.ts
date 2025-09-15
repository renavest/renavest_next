import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

import { getRouteForRole, UNAUTHORIZED_PATH } from '@/src/features/auth/utils/routeMapping';
import type { UserRole } from '@/src/shared/types';

// All API routes are public in middleware (must protect themselves internally)
// IMPORTANT: Webhooks must be excluded from auth middleware per Clerk security best practices
const isPublicRoute = createRouteMatcher([
  '/',
  '/login(.*)',
  '/sign-up(.*)',
  '/sso-callback(.*)', // OAuth/SSO callback routes must be public
  '/auth-check(.*)',
  '/privacy(.*)',
  '/terms(.*)',
  '/waitlist(.*)',
  '/api(.*)', // API routes self-protect
  '/pricing(.*)',
]);

const isTherapistRoute = createRouteMatcher(['/therapist(.*)']);
const isEmployerRoute = createRouteMatcher(['/employer(.*)']);
const isEmployeeRoute = createRouteMatcher(['/employee(.*)']);
const isExploreRoute = createRouteMatcher(['/explore(.*)']);
const isBillingRoute = createRouteMatcher(['/billing(.*)']); // Allow billing for all authenticated users
const isBookRoute = createRouteMatcher(['/book(.*)']); // Allow booking for all authenticated users

export default clerkMiddleware(async (auth, req: NextRequest) => {
  const { userId, sessionClaims, redirectToSignIn } = await auth();

  // 1. Allow public routes (including all API routes)
  if (isPublicRoute(req)) {
    return NextResponse.next();
  }

  // 2. Redirect unauthenticated users to sign-in
  if (!userId) {
    return redirectToSignIn({ returnBackUrl: req.url });
  }

  // 3. Allow billing, booking, and explore routes for all authenticated users (no role requirement)
  if (isBillingRoute(req) || isBookRoute(req) || isExploreRoute(req)) {
    return NextResponse.next();
  }

  // 4. Get user role from session claims
  const userRole = (sessionClaims?.metadata as { role?: string })?.role as UserRole;
  const onboardingComplete = sessionClaims?.metadata?.onboardingComplete as boolean | undefined;

  // 5. If user doesn't have a role or hasn't completed onboarding, redirect to auth-check
  // (except for billing and booking routes which are handled above)
  if (!userRole || !onboardingComplete) {
    console.log(
      'Middleware: User missing role or onboarding incomplete, redirecting to auth-check',
      {
        userId,
        userRole,
        onboardingComplete,
        requestedPath: req.nextUrl.pathname,
      },
    );
    return NextResponse.redirect(new URL('/auth-check', req.url));
  }

  // 6. Role-based route protection
  const roleProtectedRoutes = [
    { matcher: isTherapistRoute, requiredRole: 'therapist' as UserRole },
    { matcher: isEmployerRoute, requiredRole: 'employer_admin' as UserRole },
    {
      matcher: isEmployeeRoute,
      requiredRole: null, // Allow both employee and individual_consumer
      allowedRoles: ['employee', 'individual_consumer'] as UserRole[],
    },
  ];

  for (const { matcher, requiredRole, allowedRoles } of roleProtectedRoutes) {
    if (matcher(req)) {
      if (requiredRole && userRole !== requiredRole) {
        // Specific role required and user doesn't have it
        const correctRoute = getRouteForRole(userRole);
        return NextResponse.redirect(new URL(correctRoute, req.url));
      } else if (allowedRoles && (!userRole || !allowedRoles.includes(userRole))) {
        // Multiple roles allowed but user doesn't have any of them
        return NextResponse.redirect(new URL(UNAUTHORIZED_PATH, req.url));
      }
    }
  }

  // Default: allow
  return NextResponse.next();
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};
