/* eslint-disable @typescript-eslint/no-unused-vars */
import { auth, currentUser } from '@clerk/nextjs/server';
import { eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';

import { db } from '@/src/db';
import { users } from '@/src/db/schema';
import type { UserRole } from '@/src/shared/types';

/**
 * Enhanced route guard utility following Clerk security best practices
 */
export interface AuthGuardOptions {
  requireRole?: UserRole | UserRole[];
  requireOnboarding?: boolean;
  requireActiveUser?: boolean;
  skipDbLookup?: boolean;
}

export interface AuthGuardResult {
  success: true;
  userId: string;
  clerkUser: Awaited<ReturnType<typeof currentUser>>;
  dbUser?: {
    id: number;
    email: string;
    role: string;
    isActive: boolean;
    subscriptionStatus: string | null;
  };
  userRole?: UserRole;
}

export interface AuthGuardError {
  success: false;
  response: NextResponse;
}

/**
 * Comprehensive authentication and authorization guard
 *
 * @param options - Configuration for auth requirements
 * @returns Either success with user data or error response
 */
async function authGuard(
  options: AuthGuardOptions = {},
): Promise<AuthGuardResult | AuthGuardError> {
  const {
    requireRole,
    requireOnboarding = true,
    requireActiveUser = true,
    skipDbLookup = false,
  } = options;

  try {
    // Step 1: Basic authentication check using auth.protect()
    const { userId, sessionClaims } = await auth();

    if (!userId) {
      return {
        success: false,
        response: NextResponse.json({ error: 'Authentication required' }, { status: 401 }),
      };
    }

    // Step 2: Get current user data
    const clerkUser = await currentUser();
    if (!clerkUser) {
      return {
        success: false,
        response: NextResponse.json({ error: 'User session invalid' }, { status: 401 }),
      };
    }

    // Step 3: Check onboarding if required
    const onboardingComplete = sessionClaims?.metadata?.onboardingComplete;
    if (requireOnboarding && !onboardingComplete) {
      return {
        success: false,
        response: NextResponse.json(
          { error: 'Onboarding required', redirectTo: '/auth-check' },
          { status: 403 },
        ),
      };
    }

    // Step 4: Get user role from session claims (preferred) or metadata
    const userRole = (sessionClaims?.metadata?.role ||
      clerkUser.publicMetadata?.role ||
      clerkUser.unsafeMetadata?.role) as UserRole;

    // Step 5: Check role requirement
    if (requireRole) {
      const allowedRoles = Array.isArray(requireRole) ? requireRole : [requireRole];
      if (!userRole || !allowedRoles.includes(userRole)) {
        return {
          success: false,
          response: NextResponse.json(
            { error: `Role required: ${allowedRoles.join(' or ')}` },
            { status: 403 },
          ),
        };
      }
    }

    // Step 6: Database lookup if needed
    let dbUser;
    if (!skipDbLookup) {
      dbUser = await db.query.users.findFirst({
        where: eq(users.clerkId, userId),
        columns: {
          id: true,
          email: true,
          role: true,
          isActive: true,
          subscriptionStatus: true,
        },
      });

      if (!dbUser) {
        return {
          success: false,
          response: NextResponse.json({ error: 'User not found in database' }, { status: 404 }),
        };
      }

      // Check if user is active
      if (requireActiveUser && !dbUser.isActive) {
        return {
          success: false,
          response: NextResponse.json({ error: 'User account is inactive' }, { status: 403 }),
        };
      }
    }

    return {
      success: true,
      userId,
      clerkUser,
      dbUser,
      userRole,
    };
  } catch (error) {
    console.error('Auth guard error:', error);
    return {
      success: false,
      response: NextResponse.json({ error: 'Internal server error' }, { status: 500 }),
    };
  }
}
