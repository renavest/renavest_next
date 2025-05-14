import { clerkClient, currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';

import DashboardClient from '@/src/features/employee-dashboard/components/DashboardClient';
import LimitedDashboardClient from '@/src/features/employee-dashboard/components/LimitedDashboardClient';
import { clearOnboardingState } from '@/src/features/onboarding/state/onboardingState';

export default async function DashboardPage() {
  const user = await currentUser();
  const email = user?.emailAddresses[0]?.emailAddress;

  if (!user) {
    redirect('/login');
  }

  // Check if metadata already exists and is correct
  const existingMetadata = user.publicMetadata as { role?: string };
  if (!existingMetadata.role) {
    await (
      await clerkClient()
    ).users.updateUserMetadata(user.id, {
      publicMetadata: {
        role: 'employee',
      },
    });
  }

  // Clear onboarding state if needed
  clearOnboardingState();

  // Render specific view based on email
  if (email === 'stanley@renavestapp.com' || email === 'sethmorton05@gmail.com') {
    return <DashboardClient />; // TODO: Remove this once we have a full employee dashboard
  } else {
    return <LimitedDashboardClient />;
  }
}
