'use server';

import { auth } from '@clerk/nextjs/server';
import { revalidatePath } from 'next/cache';

import { db } from '@/src/db';
import { userOnboarding } from '@/src/db/schema';

const ONBOARDING_VERSION = 1;

export async function submitOnboardingData(answers: Record<number, string[]>) {
  const { userId } = await auth();

  if (!userId) {
    throw new Error('User not authenticated');
  }

  try {
    // Insert onboarding data
    await db.insert(userOnboarding).values({
      userId,
      answers: JSON.stringify(answers),
      version: ONBOARDING_VERSION,
    });

    // Revalidate the explore page
    revalidatePath('/explore');

    return { success: true, message: 'Onboarding data submitted successfully' };
  } catch (error) {
    console.error('Error submitting onboarding data:', error);
    throw new Error('Failed to submit onboarding data');
  }
}
