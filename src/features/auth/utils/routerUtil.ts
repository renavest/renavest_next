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

/**
 * Extracts the user role from Clerk user object
 */
export function getUserRole(user: UserResource | User | null | undefined): UserRole | null {
  if (!user?.publicMetadata?.role) {
    return null;
  }

  const role = user.publicMetadata.role as string;

  // Validate that the role is one of our expected values
  if (role === 'therapist' || role === 'employer_admin' || role === 'employee') {
    return role;
  }

  return null;
}

/**
 * Gets the appropriate route for a user role
 */
export function getRouteForRole(role: UserRole | null): string {
  if (!role || !ROLE_ROUTES[role]) {
    return DEFAULT_ROUTE;
  }
  return ROLE_ROUTES[role];
}

/**
 * Server-side redirect based on user role
 * Use this in server components and API routes
 */
export function redirectBasedOnRole(user: UserResource | User | null | undefined): never {
  const role = getUserRole(user);
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
      const role = getUserRole(user);
      const route = getRouteForRole(role);
      router.push(route);
    },
    [router],
  );

  const redirectToRoleReplace = useCallback(
    (user: UserResource | User | null | undefined) => {
      const role = getUserRole(user);
      const route = getRouteForRole(role);
      router.replace(route);
    },
    [router],
  );

  return {
    redirectToRole,
    redirectToRoleReplace,
    getUserRole,
    getRouteForRole,
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
 * Check if user is authenticated and has completed onboarding
 */
export function isUserReady(user: UserResource | User | null | undefined): boolean {
  return !!(user && user.publicMetadata?.onboardingComplete && getUserRole(user));
}
