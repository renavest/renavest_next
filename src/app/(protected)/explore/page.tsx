import { auth } from '@clerk/nextjs/server';

import { db } from '@/src/db';
import { therapists, pendingTherapists, users } from '@/src/db/schema';
import AdvisorGrid from '@/src/features/explore/components/AdvisorGrid';
import ExploreNavbar from '@/src/features/explore/components/ExploreNavbar';
import { getTherapistImageUrl } from '@/src/services/s3/assetUrls';
import { Advisor } from '@/src/shared/types';

// Make this a server component since we're doing DB fetching
export default async function Home() {
  try {
    auth.protect();

    // Fetch both active therapists and pending therapists
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
          hourlyRate: therapists.hourlyRate,
          googleCalendarIntegrationStatus: therapists.googleCalendarIntegrationStatus,
          googleCalendarAccessToken: therapists.googleCalendarAccessToken,
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
          hourlyRate: pendingTherapists.hourlyRate,
          googleCalendarIntegrationStatus: pendingTherapists.googleCalendarIntegrationStatus,
          googleCalendarAccessToken: pendingTherapists.googleCalendarAccessToken,
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

    console.log('Active therapist emails:', activeTherapistEmails);
    console.log('Pending therapists count before filtering:', dbPendingTherapists.length);

    // Transform active therapists
    const activeAdvisors: Advisor[] = dbTherapists.map((therapist) => {
      const profileUrl = therapist.profileUrl
        ? getTherapistImageUrl(therapist.profileUrl)
        : '/experts/placeholderexp.png';

      const hasGoogleCalendar =
        therapist.googleCalendarIntegrationStatus === 'connected' &&
        !!therapist.googleCalendarAccessToken;

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
        hourlyRate: therapist.hourlyRate
          ? `$${Math.round(Number(therapist.hourlyRate))}`
          : undefined,
        hasProfileImage: !!therapist.profileUrl,
        isPending: false,
        hasGoogleCalendar,
        googleCalendarStatus: therapist.googleCalendarIntegrationStatus,
      };
    });

    // Filter out pending therapists who already exist as active therapists
    const filteredPendingTherapists = dbPendingTherapists.filter(
      (pendingTherapist) =>
        !activeTherapistEmails.includes(pendingTherapist.clerkEmail?.toLowerCase()),
    );

    console.log('Pending therapists count after filtering:', filteredPendingTherapists.length);

    // Transform filtered pending therapists
    const pendingAdvisors: Advisor[] = filteredPendingTherapists.map((pendingTherapist) => {
      const profileUrl = pendingTherapist.profileUrl
        ? getTherapistImageUrl(pendingTherapist.profileUrl)
        : '/experts/placeholderexp.png';

      const hasGoogleCalendar =
        pendingTherapist.googleCalendarIntegrationStatus === 'connected' &&
        !!pendingTherapist.googleCalendarAccessToken;

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
        hourlyRate: pendingTherapist.hourlyRate
          ? `$${Math.round(Number(pendingTherapist.hourlyRate))}`
          : undefined,
        hasProfileImage: !!pendingTherapist.profileUrl,
        isPending: true,
        hasGoogleCalendar,
        googleCalendarStatus: pendingTherapist.googleCalendarIntegrationStatus,
      };
    });

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
            <AdvisorGrid advisors={allAdvisors} />
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
