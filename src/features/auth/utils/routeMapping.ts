/* eslint-disable @typescript-eslint/no-unused-vars */
// src/features/auth/utils/routeMapping.ts
// Server-side route mapping utilities (no 'use client' directive)

import { User } from '@clerk/nextjs/server';
import type { UserResource } from '@clerk/types';

import type { UserRole } from '@/src/shared/types';

// Define route mappings for each role (excluding null)
const ROLE_ROUTES: Record<Exclude<UserRole, null>, string> = {
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

// The helper utilities below are kept internal (no export) for potential future use
function isValidUserRole(role: string | undefined | null): role is Exclude<UserRole, null> {
  return (
    role === 'therapist' ||
    role === 'employer_admin' ||
    role === 'employee' ||
    role === 'super_admin'
  );
}

/**
 * Extract user role from Clerk user object (works with both UserResource and User types)
 */
function getUserRoleFromUser(user: UserResource | User | null | undefined): UserRole {
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
 * Check if user has a specific role (server-side safe)
 */
function hasRole(user: UserResource | User | null | undefined, role: UserRole): boolean {
  const userRole = getUserRoleFromUser(user);
  return userRole === role;
}

/**
 * Check if user has any of the specified roles (server-side safe)
 */
function hasAnyRole(user: UserResource | User | null | undefined, roles: UserRole[]): boolean {
  const userRole = getUserRoleFromUser(user);
  return userRole !== null && roles.includes(userRole);
}

/**
 * Get role display name for UI purposes
 */
function getRoleDisplayName(role: UserRole): string {
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
function getAllRoles(): Exclude<UserRole, null>[] {
  return Object.keys(ROLE_ROUTES) as Exclude<UserRole, null>[];
}

/**
 * Check if a route path matches a specific role's protected routes
 */
function isRoleRoute(path: string, role: Exclude<UserRole, null>): boolean {
  const roleRoute = ROLE_ROUTES[role];
  return path.startsWith(roleRoute);
}

/**
 * Get the role that corresponds to a given path
 */
function getRoleForPath(path: string): Exclude<UserRole, null> | null {
  for (const [role, route] of Object.entries(ROLE_ROUTES)) {
    if (path.startsWith(route)) {
      return role as Exclude<UserRole, null>;
    }
  }
  return null;
}
