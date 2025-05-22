import { auth } from '@clerk/nextjs/server';
import { sql } from 'drizzle-orm';

import { db } from '@/src/db';
import { pendingTherapists } from '@/src/db/schema';
import AdvisorGrid from '@/src/features/explore/components/AdvisorGrid';
import { getTherapistImageUrl } from '@/src/services/s3/assetUrls';
import { Advisor } from '@/src/shared/types';
import { COLORS } from '@/src/styles/colors';

import ExploreNavbar from '../../../features/explore/components/ExploreNavbar';
// import Navbar from '../../../features/home/components/Navbar';

// Make this a server component since we're doing DB fetching
export default async function Home() {
  try {
    auth.protect();
    // Fetch all therapists except Seth Morton from the database
    const dbTherapists = await db
      .select()
      .from(pendingTherapists)
      .where(sql`name != 'Seth Morton'`);

    // Transform the database records into the Advisor type
    const advisors: Advisor[] = dbTherapists
      .map((therapist) => {
        // Fallback to a default image if no profile URL is provided
        const profileUrl = therapist.profileUrl
          ? getTherapistImageUrl(therapist.profileUrl)
          : '/experts/placeholderexp.png';
        return {
          id: therapist.id.toString(),
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
      <div
        className={`min-h-screen ${COLORS.WARM_WHITE.bg} font-[family-name:var(--font-geist-sans)]`}
      >
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
