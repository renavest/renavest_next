'use server';

import { currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { clearOnboardingState } from '@/src/features/onboarding/state/onboardingState';

import LimitedDashboardClient from './LimitedDashboardClient';

export default async function EmployeeDashboard() {
  // Use auth() to get the session claims which contain the user's role
  const user = await currentUser();

  // If no user is signed in, redirect to login
  if (!user) {
    redirect('/login');
  }
  // Clear onboarding state if needed
  clearOnboardingState();

  return <LimitedDashboardClient />;
}
