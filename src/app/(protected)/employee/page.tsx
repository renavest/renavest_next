// import { auth } from '@clerk/nextjs';
import { auth, clerkClient } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';

import { ALLOWED_EMAILS } from '@/src/constants';
import DashboardClient from '@/src/features/employee-dashboard/components/DashboardClient';
import { clearOnboardingState } from '@/src/features/onboarding/state/onboardingState';

export default async function DashboardPage() {
  const clerk = await clerkClient();
  const { userId } = await auth();
  const user = await clerk.users.getUser(userId ?? '');
  const email = user.emailAddresses[0]?.emailAddress;

  // Redirect to explore if email not in allowed list
  if (!email || !ALLOWED_EMAILS.includes(email)) {
    redirect('/explore');
  } else {
    clearOnboardingState();
  }

  return <DashboardClient />;
}
