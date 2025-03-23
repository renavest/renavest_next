import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

// Define protected routes
const isProtectedRoute = createRouteMatcher([
  '/employee(.*)',
  '/employer(.*)',
  '/therapist(.*)',
  '/explore(.*)',
]);

// Define public routes
const isPublicRoute = createRouteMatcher(['/login(.*)', '/sign-up(.*)', '/']);

export default clerkMiddleware(async (auth, request) => {
  const session = await auth();

  // Handle users who aren't authenticated
  if (!isPublicRoute(request) && isProtectedRoute(request)) {
    await auth.protect();
  }

  // If the user is logged in and trying to access login/signup pages,
  // redirect them to their dashboard based on their role
  if (session.userId && isPublicRoute(request)) {
    const metadata = session.actor?.publicMetadata as { role?: string } | undefined;
    const role = metadata?.role;
    let dashboardUrl = '/employee'; // default dashboard

    if (role === 'employer') {
      dashboardUrl = '/employer/dashboard';
    } else if (role === 'therapist') {
      dashboardUrl = '/therapist/dashboard';
    }

    const redirectUrl = new URL(dashboardUrl, request.url);
    return Response.redirect(redirectUrl);
  }
});

export const config = {
  matcher: ['/((?!.+\\.[\\w]+$|_next).*)', '/', '/(api|trpc)(.*)'],
};
