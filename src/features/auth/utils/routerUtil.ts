'use client';

import { User } from '@clerk/nextjs/server';
import type { UserResource } from '@clerk/types';
import { redirect } from 'next/navigation';
import { useRouter } from 'next/navigation';
import { useCallback } from 'react';

// Define the role type based on our global types
export type UserRole = 'therapist' | 'employer_admin' | 'employee';

// Define route mappings for each role
export const ROLE_ROUTES: Record<UserRole, string> = {
  therapist: '/therapist',
  employer_admin: '/employer',
  employee: '/employee',
} as const;

// Default fallback route
export const DEFAULT_ROUTE = '/employee';

// Auth flow path constant
export const AUTH_FLOW_PATH = '/login';

// Unauthorized path constant
export const UNAUTHORIZED_PATH = '/unauthorized';

/**
 * Type guard to check if a string is a valid UserRole
 */
export function isValidUserRole(role: string): role is UserRole {
  return role === 'therapist' || role === 'employer_admin' || role === 'employee';
}

/**
 * Extracts the user role from middleware session claims
 * Use this specifically in middleware where you only have sessionClaims
 */
export function getUserRoleFromSessionClaims(
  sessionClaims:
    | {
        metadata?: {
          role?: string;
          [key: string]: unknown;
        };
      }
    | null
    | undefined,
): UserRole | null {
  if (!sessionClaims?.metadata?.role) {
    return null;
  }

  const role = sessionClaims.metadata.role as string;

  // Validate that the role is one of our expected values using type guard
  if (isValidUserRole(role)) {
    return role;
  }

  return null;
}

/**
 * Extracts the user role from Clerk user object with improved type safety
 */
export function getUserRole(user: UserResource | User | null | undefined): UserRole | null {
  if (!user?.publicMetadata?.role) {
    return null;
  }

  const role = user.publicMetadata.role as string;

  // Validate that the role is one of our expected values using type guard
  if (isValidUserRole(role)) {
    return role;
  }

  return null;
}

/**
 * Gets the appropriate route for a user role with fallback
 */
export function getRouteForRole(role: UserRole | null): string {
  if (!role || !ROLE_ROUTES[role]) {
    return DEFAULT_ROUTE;
  }
  return ROLE_ROUTES[role];
}

/**
 * Gets the route for a user directly
 */
export function getRouteForUser(user: UserResource | User | null | undefined): string {
  const role = getUserRole(user);
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
 * Server-side redirect to a specific role's route
 * Use this when you know the specific role to redirect to
 */
export function redirectToRoleRoute(role: UserRole): never {
  const route = getRouteForRole(role);
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
    getUserRole,
    getRouteForRole,
    getRouteForUser,
  };
}

/**
 * Check if user has a specific role
 */
export function hasRole(user: UserResource | User | null | undefined, role: UserRole): boolean {
  const userRole = getUserRole(user);
  return userRole === role;
}

/**
 * Check if user has any of the specified roles
 */
export function hasAnyRole(
  user: UserResource | User | null | undefined,
  roles: UserRole[],
): boolean {
  const userRole = getUserRole(user);
  return userRole !== null && roles.includes(userRole);
}

/**
 * Check if user is authenticated and has completed onboarding
 */
export function isUserReady(user: UserResource | User | null | undefined): boolean {
  return !!(user && user.publicMetadata?.onboardingComplete && getUserRole(user));
}

/**
 * Get all available roles
 */
export function getAllRoles(): UserRole[] {
  return Object.keys(ROLE_ROUTES) as UserRole[];
}

/**
 * Get role display name for UI purposes
 */
export function getRoleDisplayName(role: UserRole): string {
  const displayNames: Record<UserRole, string> = {
    therapist: 'Financial Therapist',
    employer_admin: 'Employer Admin',
    employee: 'Employee',
  };
  return displayNames[role];
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
