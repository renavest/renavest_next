'use client';

import { User } from '@clerk/nextjs/server';
import type { UserResource } from '@clerk/types';
import { redirect } from 'next/navigation';
import { useRouter } from 'next/navigation';
import { useCallback } from 'react';

import type { UserRole } from '@/src/shared/types';

// Import shared route mapping utilities
import {
  ROLE_ROUTES,
  UNAUTHORIZED_PATH,
  getRouteForRole,
  isValidUserRole,
  getUserRoleFromUser,
  hasRole,
  hasAnyRole,
  getRoleDisplayName,
  getAllRoles,
  isRoleRoute,
  getRoleForPath,
} from './routeMapping';

// Re-export for backward compatibility
export {
  ROLE_ROUTES,
  UNAUTHORIZED_PATH,
  getRouteForRole,
  isValidUserRole,
  getUserRoleFromUser,
  hasRole,
  hasAnyRole,
  getRoleDisplayName,
  getAllRoles,
  isRoleRoute,
  getRoleForPath,
};

/**
 * Redirect user to their role-specific dashboard
 */
export function redirectToRoleDashboard(role: UserRole): never {
  const route = getRouteForRole(role);
  redirect(route);
}

/**
 * Handle post-authentication redirect based on user role
 * This should be called after successful login/signup
 */
export function handlePostAuthRedirect(userRole: UserRole): string {
  const route = getRouteForRole(userRole);
  console.log('Post-auth redirect:', { userRole, route });
  return route;
}

/**
 * Gets the route for a user directly
 */
export function getRouteForUser(user: UserResource | User | null | undefined): string {
  const role = getUserRoleFromUser(user);
  return getRouteForRole(role);
}

/**
 * Server-side redirect based on user role
 * Use this in server components and API routes
 */
export function redirectBasedOnRole(user: UserResource | User | null | undefined): never {
  const route = getRouteForUser(user);
  redirect(route);
}

/**
 * Client-side redirect hook based on user role
 * Use this in client components
 */
export function useRoleBasedRedirect() {
  const router = useRouter();

  const redirectToRole = useCallback(
    (user: UserResource | User | null | undefined) => {
      const route = getRouteForUser(user);
      router.push(route);
    },
    [router],
  );

  const redirectToRoleReplace = useCallback(
    (user: UserResource | User | null | undefined) => {
      const route = getRouteForUser(user);
      router.replace(route);
    },
    [router],
  );

  const redirectToSpecificRole = useCallback(
    (role: UserRole) => {
      const route = getRouteForRole(role);
      router.push(route);
    },
    [router],
  );

  const redirectToSpecificRoleReplace = useCallback(
    (role: UserRole) => {
      const route = getRouteForRole(role);
      router.replace(route);
    },
    [router],
  );

  return {
    redirectToRole,
    redirectToRoleReplace,
    redirectToSpecificRole,
    redirectToSpecificRoleReplace,
    getUserRole: getUserRoleFromUser,
    getRouteForRole,
    getRouteForUser,
  };
}

/**
 * Check if user is authenticated and has completed onboarding
 */
export function isUserReady(user: UserResource | User | null | undefined): boolean {
  return !!(user && user.publicMetadata?.onboardingComplete && getUserRoleFromUser(user));
}
