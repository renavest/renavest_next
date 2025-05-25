// src/features/auth/utils/routeMapping.ts
// Server-side route mapping utilities (no 'use client' directive)

import type { UserRole } from '@/src/shared/types';

// Define route mappings for each role (excluding null)
export const ROLE_ROUTES: Record<Exclude<UserRole, null>, string> = {
  therapist: '/therapist',
  employer_admin: '/employer',
  employee: '/employee',
  super_admin: '/employer', // Super admin uses employer dashboard for now
} as const;

// Default unauthorized path - users must be authorized to access any protected content
export const UNAUTHORIZED_PATH = '/login';

/**
 * Get the appropriate route for a user's role (server-side safe)
 */
export function getRouteForRole(role: UserRole): string {
  if (!role) return ROLE_ROUTES.employee;
  return ROLE_ROUTES[role] || ROLE_ROUTES.employee;
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
 * Get all available roles
 */
export function getAllRoles(): Exclude<UserRole, null>[] {
  return Object.keys(ROLE_ROUTES) as Exclude<UserRole, null>[];
}

/**
 * Check if a route path matches a specific role's protected routes
 */
export function isRoleRoute(path: string, role: Exclude<UserRole, null>): boolean {
  const roleRoute = ROLE_ROUTES[role];
  return path.startsWith(roleRoute);
}

/**
 * Get the role that corresponds to a given path
 */
export function getRoleForPath(path: string): Exclude<UserRole, null> | null {
  for (const [role, route] of Object.entries(ROLE_ROUTES)) {
    if (path.startsWith(route)) {
      return role as Exclude<UserRole, null>;
    }
  }
  return null;
}
