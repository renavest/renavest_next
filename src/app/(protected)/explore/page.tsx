import { auth } from '@clerk/nextjs/server';

import { db } from '@/src/db';
import { therapists } from '@/src/db/schema';
import AdvisorGrid from '@/src/features/advisors/components/AdvisorGrid';
import OnboardingModalServerWrapper from '@/src/features/onboarding/components/OnboardingModalServerWrapper';

export default async function ExplorePage() {
  const { userId } = await auth();

  try {
    // Fetch therapists from the database
    const advisors = await db.select().from(therapists);

    return (
      <div>
        <OnboardingModalServerWrapper userId={userId} />
        <section className='container mx-auto px-4 py-8'>
          <h1 className='text-3xl font-bold mb-6'>Explore Advisors</h1>
          <main className='pb-12'>
            {advisors.length > 0 ? <AdvisorGrid advisors={advisors} /> : <p>No advisors found.</p>}
          </main>
        </section>
      </div>
    );
  } catch (error) {
    console.error('Error fetching advisors:', error);
    return <p>Error loading advisors</p>;
  }
}
