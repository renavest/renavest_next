// import { auth } from '@clerk/nextjs';
import { auth, clerkClient } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';

import { ALLOWED_EMAILS } from '@/src/constants';
import DashboardClient from '@/src/features/employee-dashboard/components/DashboardClient';
import TherapistRecommendations from '@/src/features/employee-dashboard/components/insights/TherapistRecommendations';
import { UpcomingSessionsSection } from '@/src/features/employee-dashboard/components/UpcomingSessionsSection';
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
  if (email === 'stanley@renavestapp.com') {
    return <DashboardClient />;
  } else {
    return (
      <div className='min-h-screen bg-gray-50 font-sans pt-24 pb-8 px-4 md:px-0'>
        <main className='max-w-2xl mx-auto space-y-8'>
          <UpcomingSessionsSection />
          <TherapistRecommendations />
        </main>
      </div>
    );
  }
}
