// src/app/middleware.ts
// src/middleware.ts
// middleware.ts
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Clerk/Next.js RBAC & onboarding: see Clerk docs for recommended patterns
// All API routes are public in middleware (must protect themselves internally)
const isPublicRoute = createRouteMatcher([
  '/',
  '/login(.*)',
  '/sign-up(.*)',
  '/privacy(.*)',
  '/terms(.*)',
  '/api(.*)', // All API routes are public in middleware
]);

const isTherapistRoute = createRouteMatcher(['/therapist(.*)']);
const isEmployerRoute = createRouteMatcher(['/employer(.*)']);
const isEmployeeRoute = createRouteMatcher(['/employee(.*)']);

const AUTH_FLOW_PATH = '/login';
const UNAUTHORIZED_PATH = '/unauthorized';

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

  const publicMetadata = sessionClaims?.metadata as
    | {
        onboardingComplete?: boolean;
        role?: 'therapist' | 'employer_admin' | 'employee';
        [key: string]: unknown;
      }
    | undefined;
  const userRole = publicMetadata?.role;
      
  // If on the auth flow path and onboarding is complete, redirect to dashboard
  if (currentPath === AUTH_FLOW_PATH) {
    let redirectPath = '/employee';
    switch (userRole) {
      case 'therapist':
        redirectPath = '/therapist';
        break;
      case 'employer_admin':
        redirectPath = '/employer';
        break;
      case 'employee':
      default:
        redirectPath = '/employee';
        break;
    }
    if (redirectPath === AUTH_FLOW_PATH) redirectPath = '/employee';
    return NextResponse.redirect(new URL(redirectPath, req.url));
  }

  // Role-based route protection
  const roleProtectedRoutes = [
    { matcher: isTherapistRoute, requiredRole: 'therapist' },
    { matcher: isEmployerRoute, requiredRole: 'employer_admin' },
    { matcher: isEmployeeRoute, requiredRole: 'employee' },
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
    // Skip Next.js internals and static files
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
};
