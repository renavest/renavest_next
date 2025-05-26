// src/app/middleware.ts
// src/middleware.ts
// middleware.ts
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

import { getRouteForRole, UNAUTHORIZED_PATH } from '@/src/features/auth/utils/routeMapping';
import type { UserRole } from '@/src/shared/types';

// All API routes are public in middleware (must protect themselves internally)
const isPublicRoute = createRouteMatcher([
  '/',
  '/login(.*)',
  '/sign-up(.*)',
  '/auth-check(.*)',
  '/privacy(.*)',
  '/terms(.*)',
  '/api(.*)',
  '/pricing(.*)',
]);

const isTherapistRoute = createRouteMatcher(['/therapist(.*)']);
const isEmployerRoute = createRouteMatcher(['/employer(.*)']);
const isEmployeeRoute = createRouteMatcher(['/employee(.*)']);
const isExploreRoute = createRouteMatcher(['/explore(.*)']);

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

  // 3. Get user role from session claims
  const userRole = (sessionClaims?.metadata as { role?: string })?.role as UserRole;
  const onboardingComplete = sessionClaims?.metadata?.onboardingComplete as boolean | undefined;

  // 4. If user doesn't have a role or hasn't completed onboarding, redirect to auth-check
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

  // 5. Role-based route protection
  const roleProtectedRoutes = [
    { matcher: isTherapistRoute, requiredRole: 'therapist' as UserRole },
    { matcher: isEmployerRoute, requiredRole: 'employer_admin' as UserRole },
    { matcher: isEmployeeRoute, requiredRole: 'employee' as UserRole },
    // Explore page requires any valid role (employee, therapist, or employer_admin)
    {
      matcher: isExploreRoute,
      requiredRole: null, // Special case - any authenticated user with valid role
      allowedRoles: ['employee', 'therapist', 'employer_admin', 'super_admin'] as UserRole[],
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
