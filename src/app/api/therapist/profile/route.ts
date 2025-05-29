import { auth, currentUser } from '@clerk/nextjs/server';
import { eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';

import { db } from '@/src/db';
import { therapists, users } from '@/src/db/schema';
import { trackTherapistServerSide } from '@/src/features/posthog/therapistTracking';

export async function GET() {
  try {
    const { userId, sessionClaims } = await auth();
    const metadata = sessionClaims?.metadata as { role?: string } | undefined;
    if (!userId || metadata?.role !== 'therapist') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const userEmail = user.emailAddresses[0]?.emailAddress;
    const userResult = await db.select().from(users).where(eq(users.email, userEmail)).limit(1);
    if (!userResult.length) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    const therapistResult = await db
      .select()
      .from(therapists)
      .where(eq(therapists.userId, userResult[0].id))
      .limit(1);
    if (!therapistResult.length) {
      return NextResponse.json({ error: 'Therapist not found' }, { status: 404 });
    }
    return NextResponse.json({
      user: userResult[0],
      therapist: therapistResult[0],
    });
  } catch (error) {
    console.error('Error fetching therapist profile:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { userId, sessionClaims } = await auth();
    const metadata = sessionClaims?.metadata as { role?: string } | undefined;
    if (!userId || metadata?.role !== 'therapist') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const userEmail = user.emailAddresses[0]?.emailAddress;
    const userResult = await db.select().from(users).where(eq(users.email, userEmail)).limit(1);
    if (!userResult.length) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    const therapistResult = await db
      .select()
      .from(therapists)
      .where(eq(therapists.userId, userResult[0].id))
      .limit(1);
    if (!therapistResult.length) {
      return NextResponse.json({ error: 'Therapist not found' }, { status: 404 });
    }
    const body = await request.json();
    // Only allow updating editable fields
    const editableUserFields = ['firstName', 'lastName', 'imageUrl'];
    const editableTherapistFields = [
      'name',
      'title',
      'bookingURL',
      'expertise',
      'certifications',
      'song',
      'yoe',
      'clientele',
      'longBio',
      'previewBlurb',
      'profileUrl',
      'hourlyRateCents',
    ];
    const userUpdates: Record<string, unknown> = {};
    const therapistUpdates: Record<string, unknown> = {};
    for (const key of editableUserFields) {
      if (body[key] !== undefined) userUpdates[key] = body[key];
    }
    for (const key of editableTherapistFields) {
      if (body[key] !== undefined) therapistUpdates[key] = body[key];
    }
    if (Object.keys(userUpdates).length > 0) {
      await db.update(users).set(userUpdates).where(eq(users.id, userResult[0].id));
    }
    if (Object.keys(therapistUpdates).length > 0) {
      // Always update the updatedAt timestamp when saving therapist data
      therapistUpdates.updatedAt = new Date();

      await db
        .update(therapists)
        .set(therapistUpdates)
        .where(eq(therapists.id, therapistResult[0].id));
    }

    // Track the profile update with changed fields
    const changedFields = [...Object.keys(userUpdates), ...Object.keys(therapistUpdates)];
    if (changedFields.length > 0) {
      await trackTherapistServerSide.profileUpdated(therapistResult[0].id, changedFields, {
        user_id: userId,
        email: userEmail,
      });
    }

    // Return updated profile
    const updatedUser = await db
      .select()
      .from(users)
      .where(eq(users.id, userResult[0].id))
      .limit(1);
    const updatedTherapist = await db
      .select()
      .from(therapists)
      .where(eq(therapists.id, therapistResult[0].id))
      .limit(1);
    return NextResponse.json({
      user: updatedUser[0],
      therapist: updatedTherapist[0],
    });
  } catch (error) {
    console.error('Error updating therapist profile:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
