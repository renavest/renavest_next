import { auth } from '@clerk/nextjs/server';

import { db } from '@/src/db';
import { therapists } from '@/src/db/schema';
import AdvisorGrid from '@/src/features/explore/components/AdvisorGrid';
import ExploreNavbar from '@/src/features/explore/components/ExploreNavbar';
import { getTherapistImageUrl } from '@/src/services/s3/assetUrls';
import { Advisor } from '@/src/shared/types';
// import Navbar from '../../../features/home/components/Navbar';

// Make this a server component since we're doing DB fetching
export default async function Home() {
  try {
    auth.protect();
    // Fetch therapists with their user information and Google Calendar status
    const dbTherapists = await db
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
      .from(therapists);

    // Transform the database records into the enhanced Advisor type
    const advisors: Advisor[] = dbTherapists
      .map((therapist) => {
        // Fallback to a default image if no profile URL is provided
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
      })
      // Sort so that therapists with profile images come first
      .sort((a, b) => {
        // If both have or don't have profile images, maintain original order
        if (a.hasProfileImage === b.hasProfileImage) return 0;

        // Therapists with profile images go first
        return a.hasProfileImage ? -1 : 1;
      });

    return (
      <div className='min-h-screen bg-gradient-to-br from-purple-50 to-white'>
        <ExploreNavbar />
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
          {advisors.length > 0 ? (
            <AdvisorGrid advisors={advisors} />
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
