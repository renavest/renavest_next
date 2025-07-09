'use server';

import { auth, currentUser, clerkClient } from '@clerk/nextjs/server';
import { revalidatePath } from 'next/cache';

import { db } from '@/src/db';
import { userOnboarding } from '@/src/db/schema';
import { createDate } from '@/src/utils/timezone';
import { MetadataManager } from '@/src/features/auth/utils/metadataManager';

const ONBOARDING_VERSION = 1;

export async function submitOnboardingData(answers: Record<number, string[]>) {
  const { userId: clerkUserId } = await auth();
  auth.protect();
  try {
    // First try to find user by Clerk ID
    let user = await db.query.users.findFirst({
      where: (users, { eq }) => eq(users.clerkId, clerkUserId ?? ''),
    });

    if (!user) {
      // If user not found, get their data from Clerk
      const clerkUser = await currentUser();

      // Get primary email
      const primaryEmail = clerkUser?.emailAddresses.find(
        (email) => email.id === clerkUser?.primaryEmailAddressId,
      )?.emailAddress;

      if (!primaryEmail) {
        throw new Error('No primary email found for user');
      }

      // Try to find user by email as fallback
      user = await db.query.users.findFirst({
        where: (users, { eq }) => eq(users.email, primaryEmail),
      });

      if (!user) {
        // If still not found, wait briefly and retry once more
        await new Promise((resolve) => setTimeout(resolve, 1000));
        user = await db.query.users.findFirst({
          where: (users, { eq }) => eq(users.clerkId, clerkUserId ?? ''),
        });

        if (!user) {
          throw new Error('User not found in database after retries');
        }
      }
    }

    // Insert onboarding data into our database using the numeric user ID
    await db.insert(userOnboarding).values({
      userId: user.id,
      answers: JSON.stringify(answers),
      version: ONBOARDING_VERSION,
    });

    // Update Clerk metadata using centralized manager
    await MetadataManager.completeOnboarding(
      clerkUserId ?? '', 
      Object.entries(answers).map(([key, value]) => ({
        questionId: Number(key),
        answeredCategories: value,
      })),
      ONBOARDING_VERSION
    );

    // Revalidate the explore page
    revalidatePath('/explore');

    return { success: true, message: 'Onboarding data submitted successfully' };
  } catch (error) {
    console.error('Error submitting onboarding data:', error);
    throw new Error('Failed to submit onboarding data');
  }
}
