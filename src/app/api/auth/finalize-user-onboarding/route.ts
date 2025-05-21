import { db } from '@/src/db';
import { NextRequest, NextResponse } from 'next/server';
import { currentUser, clerkClient } from '@clerk/nextjs/server';
import { userOnboarding } from '@/src/db/schema';
import { createDate } from '@/src/utils/timezone';
import { eq } from 'drizzle-orm';

export async function POST(req: NextRequest) {
  const body = await req.json();
  const clerk = await clerkClient();
  const user = await currentUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  if (!body.onboardingData) {
    return NextResponse.json({ error: 'Onboarding data not found' }, { status: 400 });
  }
  const existingMetadata = user.unsafeMetadata;
  await clerk.users.updateUserMetadata(user.id, {
    publicMetadata: {
      ...existingMetadata,
      onboardingData: body.onboardingData,
      onboardingComplete: true,
      role: body.role,
    },
  });
  const dbUser = await db.query.users.findFirst({ where: (u) => eq(u.clerkId, user.id) });
  if (!dbUser) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }
  await db
    .insert(userOnboarding)
    .values({
      userId: dbUser.id,
      answers: body.onboardingData,
      version: 1,
      createdAt: createDate().toJSDate(),
      updatedAt: createDate().toJSDate(),
    })
    .onConflictDoUpdate({
      target: userOnboarding.userId,
      set: {
        answers: body.onboardingData,
        version: 1,
        updatedAt: createDate().toJSDate(),
      },
    });
  return NextResponse.json(
    {
      message: 'Onboarding completed successfully',
      role: body.role,
    },
    { status: 200 },
  );
}
