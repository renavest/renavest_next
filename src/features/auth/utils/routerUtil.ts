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
 * Extract user role from Clerk user object (works with both UserResource and User types)
 */
export function getUserRoleFromUser(user: UserResource | User | null | undefined): UserRole {
  if (!user) return null;

  // Try publicMetadata first (available on both types)
  const publicRole = user.publicMetadata?.role as string | undefined;
  if (isValidUserRole(publicRole)) {
    return publicRole;
  }

  // Try unsafeMetadata (available on UserResource)
  const unsafeRole = (user as UserResource).unsafeMetadata?.role as string | undefined;
  if (isValidUserRole(unsafeRole)) {
    return unsafeRole;
  }

  // Default to employee if no valid role found
  return 'employee';
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
 * Check if user has a specific role
 */
export function hasRole(user: UserResource | User | null | undefined, role: UserRole): boolean {
  const userRole = getUserRoleFromUser(user);
  return userRole === role;
}

/**
 * Check if user has any of the specified roles
 */
export function hasAnyRole(
  user: UserResource | User | null | undefined,
  roles: UserRole[],
): boolean {
  const userRole = getUserRoleFromUser(user);
  return userRole !== null && roles.includes(userRole);
}

/**
 * Check if user is authenticated and has completed onboarding
 */
export function isUserReady(user: UserResource | User | null | undefined): boolean {
  return !!(user && user.publicMetadata?.onboardingComplete && getUserRoleFromUser(user));
}
