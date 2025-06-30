import { auth } from '@clerk/nextjs/server';
import { Metadata } from 'next';

import { db } from '@/src/db';
import AdvisorGrid from '@/src/features/explore/components/AdvisorGrid';
import ExploreNavbar from '@/src/features/explore/components/ExploreNavbar';
import { GoogleCalendarTokenManager } from '@/src/features/google-calendar/utils/tokenManager';
import { getTherapistImageUrl } from '@/src/services/s3/assetUrls';
import { Advisor } from '@/src/shared/types';

export const metadata: Metadata = {
  title: 'Explore - Renavest',
  description: 'Browse our network of financial therapists',
};

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
      googleCalendarIntegrationStatus: therapist.googleCalendarIntegrationStatus,
    });

    return { hasGoogleCalendar: true, status: 'connected' };
  } catch (error) {
    console.error('Failed to verify Google Calendar tokens for therapist:', therapist.id, error);
    return { hasGoogleCalendar: false, status: 'error' };
  }
}

export default async function ExplorePage() {
  auth.protect();

  // Fetch all therapists and pending therapists
  const [allTherapists, allPendingTherapists] = await Promise.all([
    db.query.therapists.findMany({
      where: (therapists, { isNull }) => isNull(therapists.deletedAt),
      with: {
        user: true,
      },
      orderBy: (therapists, { asc }) => [asc(therapists.name)],
    }),
    db.query.pendingTherapists.findMany({
      orderBy: (pendingTherapists, { asc }) => [asc(pendingTherapists.name)],
    }),
  ]);

  // Process therapists
  const advisors: Advisor[] = await Promise.all(
    allTherapists.map(async (therapist): Promise<Advisor> => {
      const profileUrl = await getTherapistImageUrl(therapist.profileUrl);
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
        hourlyRate: therapist.hourlyRateCents
          ? `$${(therapist.hourlyRateCents / 100).toFixed(0)}`
          : 'Contact for pricing',
        hasGoogleCalendar: calendarStatus.hasGoogleCalendar,
        googleCalendarStatus: calendarStatus.status,
        isPending: false,
      };
    }),
  );

  // Process pending therapists
  const pendingAdvisors: Advisor[] = await Promise.all(
    allPendingTherapists.map(async (therapist): Promise<Advisor> => {
      const profileUrl = await getTherapistImageUrl(therapist.profileUrl);
      const calendarStatus = await verifyGoogleCalendarIntegration(therapist);

      return {
        id: `pending-${therapist.id}`,
        therapistId: therapist.id,
        userId: undefined,
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
        hourlyRate: therapist.hourlyRateCents
          ? `$${(therapist.hourlyRateCents / 100).toFixed(0)}`
          : 'Contact for pricing',
        hasGoogleCalendar: calendarStatus.hasGoogleCalendar,
        googleCalendarStatus: calendarStatus.status,
        isPending: true,
      };
    }),
  );

  const allAdvisors = [...advisors, ...pendingAdvisors];

  return (
    <>
      <ExploreNavbar />
      <div className='min-h-screen bg-gray-50'>
        <div className='mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12'>
          <div className='mb-8'>
            <h1 className='text-3xl font-bold text-gray-900 mb-4'>Find Your Financial Therapist</h1>
          </div>
          <AdvisorGrid advisors={allAdvisors} />
        </div>
      </div>
    </>
  );
}
