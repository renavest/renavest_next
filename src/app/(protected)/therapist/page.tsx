'use server';
import { currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';

import TherapistDashboardClient from '@/src/features/therapist-dashboard/components/dashboard/TherapistDashboardClient';
import {
  Client,
  TherapistStatistics,
  UpcomingSession,
} from '@/src/features/therapist-dashboard/types';
import { getDashboardData, getTherapistByEmail } from '@/src/services/therapistDataService';

export default async function TherapistPage() {
  const user = await currentUser();

  if (!user) {
    redirect('/login');
  }

  try {
    // Get the user's email
    const userEmail = user.emailAddresses[0]?.emailAddress;
    if (!userEmail) {
      console.log('No email found for user');
      redirect('/therapist-signup/error');
    }

    // Get therapist lookup with optimized query and caching
    const therapistLookup = await getTherapistByEmail(userEmail);
    if (!therapistLookup) {
      console.log('No therapist profile found for user');
      redirect('/therapist-signup/error');
    }

    const therapistId = therapistLookup.therapistId;

    // Fetch all dashboard data in a single optimized call with caching
    const dashboardData = await getDashboardData(therapistId);

    // Convert to the expected format for the client component
    const clients: Client[] = dashboardData.clients;
    const upcomingSessions: UpcomingSession[] = dashboardData.upcomingSessions;
    const statistics: TherapistStatistics = dashboardData.statistics;

    return (
      <TherapistDashboardClient
        initialClients={clients}
        initialUpcomingSessions={upcomingSessions}
        initialStatistics={statistics}
        initialTherapistId={therapistId}
      />
    );
  } catch (error) {
    console.error('Therapist dashboard load failed:', error);
    redirect('/therapist-signup/error');
  }
}
