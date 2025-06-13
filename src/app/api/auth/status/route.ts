import { auth, currentUser } from '@clerk/nextjs/server';
import { eq } from 'drizzle-orm';
import { NextRequest, NextResponse } from 'next/server';

import { db } from '@/src/db';
import { users } from '@/src/db/schema';

/**
 * GET /api/auth/status – returns { ready: boolean, details?: object }
 * Client-side auth-check page polls this to decide when to redirect the user
 * out of the splash screen. Status is considered ready when:
 *   • a DB user row exists with a non-null role
 *   • Clerk publicMetadata.onboardingComplete === true
 */
export async function GET(_req: NextRequest) {
  try {
    auth.protect();
    const clerkUser = await currentUser();
    if (!clerkUser) {
      return NextResponse.json({ ready: false, error: 'unauthenticated' }, { status: 401 });
    }

    // Look up local DB record
    const dbUser = await db.query.users.findFirst({
      where: eq(users.clerkId, clerkUser.id),
      columns: {
        id: true,
        role: true,
        isActive: true,
      },
    });

    const onboardingComplete = clerkUser.publicMetadata?.onboardingComplete === true;

    const ready = !!dbUser && dbUser.isActive && !!dbUser.role && onboardingComplete;

    return NextResponse.json({ ready, role: dbUser?.role ?? null, onboardingComplete });
  } catch (error) {
    console.error('Error in auth/status route:', error);
    return NextResponse.json({ ready: false, error: 'internal_error' }, { status: 500 });
  }
}
