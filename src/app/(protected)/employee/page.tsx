// import { auth } from '@clerk/nextjs';
import { auth, clerkClient } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';

import DashboardClient from '@/src/features/employee-dashboard/components/DashboardClient';
import LimitedDashboardClient from '@/src/features/employee-dashboard/components/LimitedDashboardClient';
import { clearOnboardingState } from '@/src/features/onboarding/state/onboardingState';

export default async function DashboardPage() {
  const clerk = await clerkClient();
  const { userId } = await auth();
  const user = await clerk.users.getUser(userId ?? '');
  const email = user.emailAddresses[0]?.emailAddress;

  // Redirect to explore if no email
  if (!email) {
    redirect('/explore');
  }

  // Clear onboarding state if needed
  clearOnboardingState();

  // Render specific view based on email
  if (email === 'stanley@renavestapp.com' || email === 'sethmorton05@gmail.com') {
    return <DashboardClient />;
  } else {
    return <LimitedDashboardClient />;
  }
}
