import { eq } from 'drizzle-orm';
import { NextRequest, NextResponse } from 'next/server';

import { db } from '@/src/db';

export async function POST(req: NextRequest) {
  try {
    const { clerkId } = await req.json();
    if (!clerkId) {
      return NextResponse.json({ error: 'Missing clerkId' }, { status: 400 });
    }

    // Find user in database
    const user = await db.query.users.findFirst({
      where: (u) => eq(u.clerkId, clerkId),
      with: {
        therapistProfile: true,
      },
    });

    if (user) {
      // User exists - validate role consistency
      const roleValidation = {
        databaseRole: user.role,
        hasTherapistProfile: !!user.therapistProfile,
        isRoleConsistent: true,
      };

      // Check for role inconsistencies
      if (user.role === 'therapist' && !user.therapistProfile) {
        roleValidation.isRoleConsistent = false;
        console.warn('Role inconsistency: User has therapist role but no therapist profile', {
          userId: user.id,
          clerkId: user.clerkId,
          email: user.email,
        });
      }

      if (user.role !== 'therapist' && user.therapistProfile) {
        roleValidation.isRoleConsistent = false;
        console.warn('Role inconsistency: User has therapist profile but non-therapist role', {
          userId: user.id,
          clerkId: user.clerkId,
          email: user.email,
          role: user.role,
        });
      }

      return NextResponse.json({
        exists: true,
        user: {
          id: user.id,
          clerkId: user.clerkId,
          email: user.email,
          role: user.role,
          firstName: user.firstName,
          lastName: user.lastName,
          isActive: user.isActive,
        },
        roleValidation,
      });
    } else {
      // User doesn't exist yet - this is expected during signup flow
      console.log('User validation: User not found in database', { clerkId });
      return NextResponse.json({ exists: false });
    }
  } catch (error) {
    console.error('Error validating user database entry:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
