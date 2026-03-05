'use server';

import { currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';

import { clearOnboardingState } from '@/src/features/onboarding/state/onboardingState';

import LimitedDashboardClient from './LimitedDashboardClient';

export default async function EmployeeDashboard() {
  // COMMENTED OUT: Auth check - allowing unauthenticated access
  // const user = await currentUser();
  // if (!user) {
  //   redirect('/login');
  // }
  // clearOnboardingState();

  return <LimitedDashboardClient />;
}
