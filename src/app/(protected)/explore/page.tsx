
import { db } from '@/src/db';
import { therapists } from '@/src/db/schema';
import { getTherapistImageUrl } from '@/src/services/s3/assetUrls';
import { Advisor } from '@/src/shared/types';

import AdvisorGrid from '../../../features/advisors/components/AdvisorGrid';
import FloatingHeader from '../../../features/home/components/Navbar';

// Make this a server component since we're doing DB fetching
export default async function Home() {
  // Fetch therapists from the database
  const dbTherapists = await db.select().from(therapists);

  // Transform the database records into the Advisor type
  const advisors: Advisor[] = dbTherapists.map((therapist) => ({
    id: therapist.id.toString(),
    name: therapist.name,
    title: therapist.title || '',
    bookingURL: therapist.bookingURL || '',
    expertise: therapist.expertise || '',
    certifications: therapist.certifications || '',
    song: therapist.song || '',
    yoe: therapist.yoe?.toString() || '',
    clientele: therapist.clientele || '',
    longBio: therapist.longBio || '',
    previewBlurb: therapist.previewBlurb || '',
    profileUrl: getTherapistImageUrl(therapist.profileUrl || ''),
  }));

  return (
    <div className='min-h-screen bg-gray-50 font-[family-name:var(--font-geist-sans)]'>
      <FloatingHeader title='Renavest' />
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
        <AdvisorGrid advisors={advisors} />
      </main>
    </div>
  );
}
