import { auth } from '@clerk/nextjs/server';
import { Metadata } from 'next';

import { db } from '@/src/db';
import { therapists, pendingTherapists, users } from '@/src/db/schema';
import AdvisorGrid from '@/src/features/explore/components/AdvisorGrid';
import ExploreNavbar from '@/src/features/explore/components/ExploreNavbar';
import { GoogleCalendarTokenManager } from '@/src/features/google-calendar/utils/tokenManager';
import { getTherapistImageUrl } from '@/src/services/s3/assetUrls';
import { Advisor } from '@/src/shared/types';

export const metadata: Metadata = {
  title: 'Explore - Renavest',
  description: 'Browse our network of financial therapists',
};

// Helper function to format hourly rate handling data inconsistencies
function formatHourlyRate(hourlyRateCents: number | null): string {
  if (!hourlyRateCents) return 'Contact for pricing';

  let rateInCents = hourlyRateCents;

  // Handle data inconsistency: detect if value was entered as dollars instead of cents
  // If value is suspiciously low (< $10 = 1000 cents), it was likely entered as dollars
  if (rateInCents < 1000) {
    // Convert from dollars to cents (multiply by 100)
    rateInCents = rateInCents * 100;
  }

  // Now convert from cents to dollars for display
  const rateInDollars = rateInCents / 100;

  return `$${rateInDollars.toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })}`;
}

// Helper function to verify Google Calendar integration
async function verifyGoogleCalendarIntegration(therapist: {
  id: number;
  googleCalendarIntegrationStatus: string;
  googleCalendarAccessToken: string | null;
  googleCalendarRefreshToken: string | null;
}): Promise<{ hasGoogleCalendar: boolean; status: 'connected' | 'not_connected' | 'error' }> {
  if (
    therapist.googleCalendarIntegrationStatus !== 'connected' ||
    !therapist.googleCalendarAccessToken ||
    !therapist.googleCalendarRefreshToken
  ) {
    return {
      hasGoogleCalendar: false,
      status: therapist.googleCalendarIntegrationStatus === 'error' ? 'error' : 'not_connected',
    };
  }

  try {
    const tokenManager = new GoogleCalendarTokenManager(db);
    await tokenManager.ensureValidTokens({
      id: therapist.id,
      googleCalendarAccessToken: therapist.googleCalendarAccessToken,
      googleCalendarRefreshToken: therapist.googleCalendarRefreshToken,
    });

    return {
      hasGoogleCalendar: true,
      status: 'connected',
    };
  } catch (error) {
    console.error(`Failed to verify Google Calendar tokens for therapist ${therapist.id}:`, error);
    return {
      hasGoogleCalendar: false,
      status: 'error',
    };
  }
}

export default async function Home() {
  auth.protect();

  // Get all therapists from the therapists table
  const confirmedTherapists = await db.query.therapists.findMany({
    columns: {
      id: true,
      userId: true,
      name: true,
      title: true,
      bookingURL: true,
      expertise: true,
      certifications: true,
      song: true,
      yoe: true,
      clientele: true,
      longBio: true,
      previewBlurb: true,
      profileUrl: true,
      hourlyRateCents: true,
      googleCalendarIntegrationStatus: true,
      googleCalendarAccessToken: true,
      googleCalendarRefreshToken: true,
    },
    where: (therapists, { isNull }) => isNull(therapists.deletedAt),
  });

  // Get all pending therapists
  const pendingTherapistsData = await db.query.pendingTherapists.findMany({
    columns: {
      id: true,
      clerkEmail: true,
      name: true,
      title: true,
      bookingURL: true,
      expertise: true,
      certifications: true,
      song: true,
      yoe: true,
      clientele: true,
      longBio: true,
      previewBlurb: true,
      profileUrl: true,
      hourlyRateCents: true,
      googleCalendarIntegrationStatus: true,
      googleCalendarAccessToken: true,
      googleCalendarRefreshToken: true,
    },
  });

  // Convert confirmed therapists to Advisor format
  const confirmedAdvisors: Advisor[] = await Promise.all(
    confirmedTherapists.map(async (therapist) => {
      const profileUrl = await getTherapistImageUrl(therapist.profileUrl || '');
      const calendarStatus = await verifyGoogleCalendarIntegration(therapist);

      return {
        id: therapist.id.toString(),
        therapistId: therapist.id,
        userId: therapist.userId,
        name: therapist.name,
        title: therapist.title || 'Financial Therapist',
        bookingURL: therapist.bookingURL || '',
        expertise: therapist.expertise || '',
        certifications: therapist.certifications || '',
        song: therapist.song || '',
        yoe: therapist.yoe?.toString() || 'N/A',
        clientele: therapist.clientele || '',
        longBio: therapist.longBio || '',
        previewBlurb: therapist.previewBlurb || 'Experienced financial therapist',
        profileUrl: profileUrl,
        hourlyRate: formatHourlyRate(therapist.hourlyRateCents),
        hasProfileImage: !!therapist.profileUrl,
        isPending: false,
        hasGoogleCalendar: calendarStatus.hasGoogleCalendar,
        googleCalendarStatus: calendarStatus.status,
      };
    }),
  );

  // Convert pending therapists to Advisor format
  const pendingAdvisors: Advisor[] = await Promise.all(
    pendingTherapistsData.map(async (therapist) => {
      const profileUrl = await getTherapistImageUrl(therapist.profileUrl || '');
      const calendarStatus = await verifyGoogleCalendarIntegration(therapist);

      return {
        id: therapist.id.toString(),
        therapistId: therapist.id,
        userId: null,
        name: therapist.name,
        title: therapist.title || 'Financial Therapist',
        bookingURL: therapist.bookingURL || '',
        expertise: therapist.expertise || '',
        certifications: therapist.certifications || '',
        song: therapist.song || '',
        yoe: therapist.yoe?.toString() || 'N/A',
        clientele: therapist.clientele || '',
        longBio: therapist.longBio || '',
        previewBlurb: therapist.previewBlurb || 'Experienced financial therapist',
        profileUrl: profileUrl,
        hourlyRate: formatHourlyRate(therapist.hourlyRateCents),
        hasProfileImage: !!therapist.profileUrl,
        isPending: true,
        hasGoogleCalendar: calendarStatus.hasGoogleCalendar,
        googleCalendarStatus: calendarStatus.status,
      };
    }),
  );

  // Combine all advisors
  const allAdvisors = [...confirmedAdvisors, ...pendingAdvisors];

  return (
    <div className='min-h-screen bg-gray-50'>
      <ExploreNavbar />
      <main className='container mx-auto px-4 py-8'>
        <div className='mb-8'>
          <h1 className='text-3xl font-bold text-gray-900 mb-4'>Find Your Financial Therapist</h1>
          <p className='text-lg text-gray-600'>
            Browse our network of qualified financial therapists and find the perfect match for your
            needs.
          </p>
        </div>
        <AdvisorGrid advisors={allAdvisors} />
      </main>
    </div>
  );
}
