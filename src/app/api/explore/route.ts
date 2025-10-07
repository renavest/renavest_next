import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

import { db } from '@/src/db';
import { GoogleCalendarTokenManager } from '@/src/features/google-calendar/utils/tokenManager';
import { getTherapistImageUrl } from '@/src/services/s3/assetUrls';
import { Advisor } from '@/src/shared/types';

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

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

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

    // Eric(Note): we only want to show pending therapists for initial launch
    // DEFINITELY NOT FINAL SOLUTION - PLEASE ADD ADVISORS BACK IN LATER.
    // const allAdvisors = [...advisors, ...pendingAdvisors];
    const allAdvisors = [...pendingAdvisors];

    return NextResponse.json({ advisors: allAdvisors });
  } catch (error) {
    console.error('Error fetching explore data:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
