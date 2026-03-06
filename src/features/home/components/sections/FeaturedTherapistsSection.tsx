'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';

import therapistsData from '@/src/features/employee-dashboard/components/therapistCatalog/financial_therapists.json';

interface Therapist {
  id: number;
  name: string;
  title: string;
  expertise: string;
  previewblurb: string | null;
  profileurl: string | null;
}

function shuffleAndPick(arr: Therapist[], count: number): Therapist[] {
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

export default function FeaturedTherapistsSection() {
  const [featured, setFeatured] = useState<Therapist[]>([]);

  useEffect(() => {
    setFeatured(shuffleAndPick(therapistsData as Therapist[], 4));
  }, []);

  if (featured.length === 0) return null;

  return (
    <section className='py-16 md:py-20 bg-white'>
      <div className='max-w-6xl mx-auto px-6 md:px-10'>
        <div className='text-center mb-12'>
          <h2 className='text-3xl md:text-4xl font-bold text-gray-900 mb-4'>
            Meet Our Financial Therapists
          </h2>
          <p className='text-lg text-gray-600 max-w-2xl mx-auto'>
            Licensed professionals ready to help you build a healthier relationship with money.
          </p>
        </div>

        <div className='grid grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8'>
          {featured.map((therapist) => {
            const profileUrl =
              therapist.profileurl && !therapist.profileurl.startsWith('/') && !therapist.profileurl.startsWith('http')
                ? `/${therapist.profileurl}`
                : therapist.profileurl;

            return (
              <Link
                key={therapist.id}
                href='/therapists'
                className='group block'
              >
                <div className='relative aspect-square overflow-hidden rounded-2xl mb-4 bg-gray-100'>
                  {profileUrl ? (
                    <Image
                      src={profileUrl}
                      alt={therapist.name}
                      fill
                      className='object-cover object-top transition-transform duration-300 group-hover:scale-105'
                    />
                  ) : (
                    <div
                      className='w-full h-full flex items-center justify-center'
                      style={{ background: 'linear-gradient(to bottom right, rgb(144, 113, 255), rgb(164, 143, 255))' }}
                    >
                      <span className='text-5xl text-white font-semibold'>
                        {therapist.name.split(' ').map((n) => n[0]).join('')}
                      </span>
                    </div>
                  )}
                </div>
                <h3 className='text-base md:text-lg font-semibold text-gray-900 group-hover:text-purple-600 transition-colors'>
                  {therapist.name}
                </h3>
                <p className='text-sm text-gray-500 mt-1'>{therapist.title}</p>
              </Link>
            );
          })}
        </div>

        <div className='text-center mt-10'>
          <Link
            href='/therapists'
            className='inline-flex items-center gap-2 px-8 py-3 rounded-full text-white font-medium transition-all duration-200 hover:shadow-lg'
            style={{ background: '#9071FF' }}
          >
            View All Therapists
            <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
              <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M9 5l7 7-7 7' />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
}
