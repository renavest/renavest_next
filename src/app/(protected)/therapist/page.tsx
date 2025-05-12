'use server';
import { currentUser } from '@clerk/nextjs/server';
import { clerkClient } from '@clerk/nextjs/server';
import { eq } from 'drizzle-orm';
import { redirect } from 'next/navigation';

import { db } from '@/src/db';
import { therapists } from '@/src/db/schema';

import TherapistDashboardClient from '../../../features/therapist-dashboard/components/TherapistDashboardClient';

export default async function TherapistPage() {
  console.log('TherapistPage');
  const user = await currentUser();

  if (!user) {
    redirect('/login');
  }
  try {
    // Get the user's email
    const email = user.emailAddresses[0]?.emailAddress;

    if (!email) {
      console.log('No email found for user');
      redirect('/therapist-signup/error');
    }

    // Directly check if the therapist exists in the database
    const therapistResult = await db
      .select({ id: therapists.id })
      .from(therapists)
      .where(eq(therapists.email, email))
      .limit(1);
    console.log('therapistResult', therapistResult);
    // If no therapist found, redirect to error page
    if (!therapistResult.length) {
      console.log('No pre-approved therapist found');
      redirect('/therapist-signup/error');
    } else {
      // Update user metadata to mark as therapist
      await (
        await clerkClient()
      ).users.updateUserMetadata(user.id, {
        publicMetadata: {
          role: 'therapist',
        },
      });
    }

    return <TherapistDashboardClient />;
  } catch (error) {
    console.error('Therapist pre-approval check failed:', error);
    redirect('/therapist-signup/error');
  }
}
