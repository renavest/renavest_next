'use server';

import { auth } from '@clerk/nextjs/server';
import { clerkClient } from '@clerk/nextjs/server';
import { revalidatePath } from 'next/cache';

import { db } from '@/src/db';
import { userOnboarding } from '@/src/db/schema';

const ONBOARDING_VERSION = 1;

export async function   submitOnboardingData(answers: Record<number, string[]>) {
  const { userId: clerkUserId } = await auth();

  if (!clerkUserId) {
    throw new Error('User not authenticated');
  }

  try {
    // First try to find user by Clerk ID
    let user = await db.query.users.findFirst({
      where: (users, { eq }) => eq(users.clerkId, clerkUserId),
    });

    if (!user) {
      // If user not found, get their data from Clerk
      const clerk = await clerkClient();
      const clerkUser = await clerk.users.getUser(clerkUserId);

      // Get primary email
      const primaryEmail = clerkUser.emailAddresses.find(
        (email) => email.id === clerkUser.primaryEmailAddressId,
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
          where: (users, { eq }) => eq(users.clerkId, clerkUserId),
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

    // Update Clerk public metadata to mark onboarding as complete
    const clerk = await clerkClient();
    await clerk.users.updateUser(clerkUserId, {
      publicMetadata: {
        onboardingComplete: true,
      },
    });

    // Revalidate the explore page
    revalidatePath('/explore');

    return { success: true, message: 'Onboarding data submitted successfully' };
  } catch (error) {
    console.error('Error submitting onboarding data:', error);
    throw new Error('Failed to submit onboarding data');
  }
}
