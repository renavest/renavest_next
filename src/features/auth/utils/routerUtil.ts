'use client';

import { User } from '@clerk/nextjs/server';
import type { UserResource } from '@clerk/types';
import { redirect } from 'next/navigation';
import { useRouter } from 'next/navigation';
import { useCallback } from 'react';

import type { UserRole } from '@/src/shared/types';

// Define route mappings for each role (excluding null)
export const ROLE_ROUTES: Record<Exclude<UserRole, null>, string> = {
  therapist: '/therapist',
  employer_admin: '/employer',
  employee: '/employee',
  super_admin: '/employer', // Super admin uses employer dashboard for now
} as const;

// Auth flow paths
export const AUTH_FLOW_PATH = '/auth-flow';
export const UNAUTHORIZED_PATH = '/explore';

/**
 * Get the appropriate route for a user's role
 */
export function getRouteForRole(role: UserRole): string {
  if (!role) return ROLE_ROUTES.employee;
  return ROLE_ROUTES[role] || ROLE_ROUTES.employee;
}

/**
 * Redirect user to their role-specific dashboard
 */
export function redirectToRoleDashboard(role: UserRole): never {
  const route = getRouteForRole(role);
  redirect(route);
}

/**
 * Type guard to check if a string is a valid UserRole
 */
export function isValidUserRole(role: string | undefined | null): role is Exclude<UserRole, null> {
  return (
    role === 'therapist' ||
    role === 'employer_admin' ||
    role === 'employee' ||
    role === 'super_admin'
  );
}

/**
 * Extract user role from Clerk session claims
 */
export function getUserRoleFromSessionClaims(
  sessionClaims: Record<string, any> | null | undefined,
): UserRole {
  const metadata = sessionClaims?.metadata as { role?: string } | undefined;
  const role = metadata?.role;

  if (isValidUserRole(role)) {
    return role;
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
 * Get role display name for UI purposes
 */
export function getRoleDisplayName(role: UserRole): string {
  const displayNames: Record<Exclude<UserRole, null>, string> = {
    therapist: 'Financial Therapist',
    employer_admin: 'Employer Admin',
    employee: 'Employee',
    super_admin: 'Super Admin',
  };
  return role ? displayNames[role] : 'Unknown';
}

/**
 * Gets the route for a user directly
 */
export function getRouteForUser(user: UserResource | User | null | undefined): string {
  const role = getUserRoleFromSessionClaims(user);
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
    getUserRole: getUserRoleFromSessionClaims,
    getRouteForRole,
    getRouteForUser,
  };
}

/**
 * Check if user has a specific role
 */
export function hasRole(user: UserResource | User | null | undefined, role: UserRole): boolean {
  const userRole = getUserRoleFromSessionClaims(user);
  return userRole === role;
}

/**
 * Check if user has any of the specified roles
 */
export function hasAnyRole(
  user: UserResource | User | null | undefined,
  roles: UserRole[],
): boolean {
  const userRole = getUserRoleFromSessionClaims(user);
  return userRole !== null && roles.includes(userRole);
}

/**
 * Check if user is authenticated and has completed onboarding
 */
export function isUserReady(user: UserResource | User | null | undefined): boolean {
  return !!(user && user.publicMetadata?.onboardingComplete && getUserRoleFromSessionClaims(user));
}

/**
 * Get all available roles
 */
export function getAllRoles(): UserRole[] {
  return Object.keys(ROLE_ROUTES) as UserRole[];
}

/**
 * Check if a route path matches a specific role's protected routes
 */
export function isRoleRoute(path: string, role: UserRole): boolean {
  const roleRoute = ROLE_ROUTES[role];
  return path.startsWith(roleRoute);
}

/**
 * Get the role that should have access to a given path
 */
export function getRoleForPath(path: string): UserRole | null {
  for (const [role, route] of Object.entries(ROLE_ROUTES)) {
    if (path.startsWith(route)) {
      return role as UserRole;
    }
  }
  return null;
}
