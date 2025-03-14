'use client';

import { Advisor } from '@/src/shared/types';

import TherapistList from '../../../config/therapistsList';
import AdvisorGrid from '../../../features/advisors/components/AdvisorGrid';
import FloatingHeader from '../../../features/home/components/Navbar';

export default function Home() {
  // const [isLoading, setIsLoading] = useState(true);

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
        <AdvisorGrid advisors={TherapistList as Advisor[]} />
      </main>
    </div>
  );
}
