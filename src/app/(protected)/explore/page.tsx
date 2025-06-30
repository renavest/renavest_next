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
  title: 'Find Financial Therapists - Expert Directory',
  description:
    'Browse our directory of certified financial therapists. Connect with experienced professionals who can help you build a healthier relationship with money and achieve financial wellness.',
  keywords: [
    'financial therapist directory',
    'certified financial therapists',
    'financial therapy experts',
    'money counseling',
    'financial wellness professionals',
    'debt therapy',
    'financial anxiety help',
    'money mindset coaching',
  ],
  openGraph: {
    title: 'Find Financial Therapists - Expert Directory | Renavest',
    description:
      'Browse our directory of certified financial therapists. Get help with financial stress, debt management, and building healthy money habits.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Find Financial Therapists - Expert Directory | Renavest',
    description:
      'Browse our directory of certified financial therapists. Get help with financial stress and build healthy money habits.',
  },
  alternates: {
    canonical: '/explore',
  },
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

    return {
      hasGoogleCalendar: true,
      status: 'connected',
    };
  } catch (error) {
    console.error(`Token verification failed for therapist ${therapist.id}:`, error);
    return {
      hasGoogleCalendar: false,
      status: 'error',
    };
  }
}

// Make this a server component since we're doing DB fetching
export default async function Home() {
  try {
    auth.protect();

    const [dbTherapists, dbPendingTherapists, dbUsers] = await Promise.all([
      db
        .select({
          id: therapists.id,
          userId: therapists.userId,
          name: therapists.name,
          title: therapists.title,
          bookingURL: therapists.bookingURL,
          expertise: therapists.expertise,
          certifications: therapists.certifications,
          song: therapists.song,
          yoe: therapists.yoe,
          clientele: therapists.clientele,
          longBio: therapists.longBio,
          previewBlurb: therapists.previewBlurb,
          profileUrl: therapists.profileUrl,
          hourlyRateCents: therapists.hourlyRateCents,
          googleCalendarIntegrationStatus: therapists.googleCalendarIntegrationStatus,
          googleCalendarAccessToken: therapists.googleCalendarAccessToken,
          googleCalendarRefreshToken: therapists.googleCalendarRefreshToken,
        })
        .from(therapists),

      db
        .select({
          id: pendingTherapists.id,
          clerkEmail: pendingTherapists.clerkEmail,
          name: pendingTherapists.name,
          title: pendingTherapists.title,
          bookingURL: pendingTherapists.bookingURL,
          expertise: pendingTherapists.expertise,
          certifications: pendingTherapists.certifications,
          song: pendingTherapists.song,
          yoe: pendingTherapists.yoe,
          clientele: pendingTherapists.clientele,
          longBio: pendingTherapists.longBio,
          previewBlurb: pendingTherapists.previewBlurb,
          profileUrl: pendingTherapists.profileUrl,
          hourlyRateCents: pendingTherapists.hourlyRateCents,
          googleCalendarIntegrationStatus: pendingTherapists.googleCalendarIntegrationStatus,
          googleCalendarAccessToken: pendingTherapists.googleCalendarAccessToken,
          googleCalendarRefreshToken: pendingTherapists.googleCalendarRefreshToken,
        })
        .from(pendingTherapists),

      // Fetch users to get emails of active therapists
      db
        .select({
          id: users.id,
          email: users.email,
        })
        .from(users),
    ]);

    // Get emails of active therapists by joining with users table
    const activeTherapistUserIds = dbTherapists.map((t) => t.userId);
    const activeTherapistEmails = dbUsers
      .filter((user) => activeTherapistUserIds.includes(user.id))
      .map((user) => user.email?.toLowerCase())
      .filter((email) => email !== null && email !== undefined);

    // Transform active therapists with proper Google Calendar verification
    const activeAdvisors: Advisor[] = await Promise.all(
      dbTherapists
        .filter((therapist) => {
          // In production, filter out Seth Morton
          if (process.env.NODE_ENV === 'production' && therapist.name === 'Seth Morton') {
            return false;
          }
          return true;
        })
        .map(async (therapist) => {
          const profileUrl = therapist.profileUrl
            ? getTherapistImageUrl(therapist.profileUrl)
            : '/experts/placeholderexp.png';

          // Verify Google Calendar integration with token refresh
          const { hasGoogleCalendar, status } = await verifyGoogleCalendarIntegration(therapist);

          return {
            id: therapist.id.toString(), // This is the therapist table ID
            therapistId: therapist.id, // Explicit therapist ID
            userId: therapist.userId, // User table ID
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
              ? (() => {
                  // Fix for hourly rates that were incorrectly stored as already-multiplied cents
                  // If the value seems too large (>$1000), divide by an additional 100
                  const rate = therapist.hourlyRateCents / 100;
                  const adjustedRate = rate > 1000 ? rate / 100 : rate;
                  return `$${Math.round(adjustedRate)}`;
                })()
              : undefined,
            hasProfileImage: !!therapist.profileUrl,
            isPending: false,
            hasGoogleCalendar,
            googleCalendarStatus: status,
          };
        }),
    );

    // Filter out pending therapists who already exist as active therapists
    const filteredPendingTherapists = dbPendingTherapists.filter((pendingTherapist) => {
      // In production, filter out Seth Morton
      if (process.env.NODE_ENV === 'production' && pendingTherapist.name === 'Seth Morton') {
        return false;
      }
      // Filter out pending therapists who already exist as active therapists
      return !activeTherapistEmails.includes(pendingTherapist.clerkEmail?.toLowerCase());
    });

    // Transform filtered pending therapists with proper Google Calendar verification
    const pendingAdvisors: Advisor[] = await Promise.all(
      filteredPendingTherapists.map(async (pendingTherapist) => {
        const profileUrl = pendingTherapist.profileUrl
          ? getTherapistImageUrl(pendingTherapist.profileUrl)
          : '/experts/placeholderexp.png';

        // Verify Google Calendar integration with token refresh
        const { hasGoogleCalendar, status } =
          await verifyGoogleCalendarIntegration(pendingTherapist);

        return {
          id: `pending-${pendingTherapist.id}`, // Prefix to distinguish from active therapists
          therapistId: undefined, // No therapist ID yet
          userId: undefined, // No user ID yet
          name: pendingTherapist.name,
          title: pendingTherapist.title || 'Financial Therapist',
          bookingURL: pendingTherapist.bookingURL || '',
          expertise: pendingTherapist.expertise || '',
          certifications: pendingTherapist.certifications || '',
          song: pendingTherapist.song || '',
          yoe: pendingTherapist.yoe?.toString() || 'N/A',
          clientele: pendingTherapist.clientele || '',
          longBio: pendingTherapist.longBio || '',
          previewBlurb: pendingTherapist.previewBlurb || 'Experienced financial therapist',
          profileUrl: profileUrl,
          hourlyRate: pendingTherapist.hourlyRateCents
            ? (() => {
                // Fix for hourly rates that were incorrectly stored as already-multiplied cents
                // If the value seems too large (>$1000), divide by an additional 100
                const rate = pendingTherapist.hourlyRateCents / 100;
                const adjustedRate = rate > 1000 ? rate / 100 : rate;
                return `$${Math.round(adjustedRate)}`;
              })()
            : undefined,
          hasProfileImage: !!pendingTherapist.profileUrl,
          isPending: true,
          hasGoogleCalendar,
          googleCalendarStatus: status,
        };
      }),
    );

    // Combine and sort advisors
    const allAdvisors = [...activeAdvisors, ...pendingAdvisors].sort((a, b) => {
      // Prioritize active therapists over pending ones
      if (a.isPending !== b.isPending) {
        return a.isPending ? 1 : -1;
      }

      // Then prioritize those with profile images
      if (a.hasProfileImage !== b.hasProfileImage) {
        return a.hasProfileImage ? -1 : 1;
      }

      // Finally, prioritize those with Google Calendar integration
      if (a.hasGoogleCalendar !== b.hasGoogleCalendar) {
        return a.hasGoogleCalendar ? -1 : 1;
      }

      return 0;
    });

    return (
      <div className='min-h-screen bg-gradient-to-br from-purple-50 to-white'>
        <ExploreNavbar showBackButton={true} />
        <section className='pt-20 pb-6 px-4 sm:px-6'>
          <h2 className='text-2xl sm:text-3xl font-bold text-center text-gray-900'>
            Financial Therapists
          </h2>
          <p className='mt-2 text-center text-sm sm:text-base text-gray-600 max-w-2xl mx-auto'>
            Connect with experienced financial therapists who can help you build a healthier
            relationship with money
          </p>
        </section>
        <main className='pb-12'>
          {allAdvisors.length > 0 ? (
            <>
              {/* Preload first few images for better performance */}
              {allAdvisors.slice(0, 3).map((advisor) => (
                <link
                  key={`preload-${advisor.id}`}
                  rel='preload'
                  as='image'
                  href={advisor.profileUrl}
                />
              ))}
              <AdvisorGrid advisors={allAdvisors} />
            </>
          ) : (
            <div className='text-center text-gray-600'>
              No therapists available at the moment. Please check back later.
            </div>
          )}
        </main>
      </div>
    );
  } catch (error) {
    console.error('Error fetching therapists:', error);
    return (
      <div className='text-center text-red-500'>
        An error occurred while fetching therapists. Please try again later.
      </div>
    );
  }
}
