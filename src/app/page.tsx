'use client';

import { redirect } from 'next/navigation';
import { useEffect, useState } from 'react';

import { Advisor } from '@/src/shared/types';

import TherapistList from '../config/therapistsList';
import { checkUserVerified } from '../features/auth/utils/auth';
import FloatingHeader from '../features/home/components/FloatingHeader';
import GridComponent from '../features/home/components/Grid';

export default function Home() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!checkUserVerified()) {
      redirect('/login');
    }
    setIsLoading(false);
  }, []);

  if (isLoading) {
    return null;
  }

  return (
    <div className='font-[family-name:var(--font-geist-sans)]'>
      <FloatingHeader title='Renavest' />
      <section className='p-6 px-0 mt-16'>
        <h2 className='text-3xl mt-10 font-bold text-center'>Financial Therapists</h2>
      </section>
      <main className='flex flex-col gap-8 row-start-2 items-center sm:items-start bg-white'>
        <GridComponent advisors={TherapistList as Advisor[]} />
      </main>
    </div>
  );
}
