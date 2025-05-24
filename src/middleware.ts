// src/app/middleware.ts
// src/middleware.ts
// middleware.ts
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

import {
  getUserRoleFromSessionClaims,
  getRouteForRole,
  AUTH_FLOW_PATH,
  UNAUTHORIZED_PATH,
  type UserRole,
} from '@/src/features/auth/utils/routerUtil';

// Clerk/Next.js RBAC & onboarding: see Clerk docs for recommended patterns
// All API routes are public in middleware (must protect themselves internally)
const isPublicRoute = createRouteMatcher([
  '/',
  '/login(.*)',
  '/sign-up(.*)',
  '/privacy(.*)',
  '/terms(.*)',
  '/api(.*)',
  '/pricing(.*)', // All API routes are public in middleware
]);

const isTherapistRoute = createRouteMatcher(['/therapist(.*)']);
const isEmployerRoute = createRouteMatcher(['/employer(.*)']);
const isEmployeeRoute = createRouteMatcher(['/employee(.*)']);

export default clerkMiddleware(async (auth, req: NextRequest) => {
  const { userId, sessionClaims, redirectToSignIn } = await auth();
  const currentPath = req.nextUrl.pathname;

  // 1. Allow public routes (including all API routes)
  if (isPublicRoute(req)) {
    return NextResponse.next();
  }

  // 2. Redirect unauthenticated users to sign-in
  if (!userId) {
    return redirectToSignIn({ returnBackUrl: req.url });
  }

  // 3. Onboarding and role-based access
  const userRole = getUserRoleFromSessionClaims(sessionClaims);

  // If on the auth flow path and onboarding is complete, redirect to dashboard
  if (currentPath === AUTH_FLOW_PATH) {
    const redirectPath = getRouteForRole(userRole);
    return NextResponse.redirect(new URL(redirectPath, req.url));
  }

  // Role-based route protection using our utility functions
  const roleProtectedRoutes = [
    { matcher: isTherapistRoute, requiredRole: 'therapist' as UserRole },
    { matcher: isEmployerRoute, requiredRole: 'employer_admin' as UserRole },
    { matcher: isEmployeeRoute, requiredRole: 'employee' as UserRole },
  ];

  for (const { matcher, requiredRole } of roleProtectedRoutes) {
    if (matcher(req) && userRole !== requiredRole) {
      return NextResponse.redirect(new URL(UNAUTHORIZED_PATH, req.url));
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
