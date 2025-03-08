'use client';

import { notFound } from 'next/navigation';

import { advisors } from '@/src/features/advisors/data/advisors';

interface AdvisorProfileProps {
  params: {
    id: string;
  };
}

export default function AdvisorProfile({ params }: AdvisorProfileProps) {
  const advisor = advisors.find((a) => a.id === params.id);

  if (!advisor) {
    notFound();
  }

  return (
    <main className='min-h-screen bg-white py-12 px-4 sm:px-6 lg:px-8'>
      <div className='max-w-4xl mx-auto'>
        <div className='flex flex-col md:flex-row gap-8'>
          <div className='w-full md:w-1/3'>
            <img
              src={advisor.profileUrl || '/experts/placeholderexp.png'}
              alt={advisor.name}
              className='w-full rounded-2xl'
            />
          </div>
          <div className='w-full md:w-2/3'>
            <h1 className='text-3xl font-bold text-gray-900'>{advisor.name}</h1>
            <p className='text-xl text-gray-600 mt-2'>{advisor.title}</p>
            <p className='text-gray-600 mt-1'>{advisor.yoe} years of experience</p>

            <div className='mt-6'>
              <h2 className='text-xl font-semibold text-gray-900'>About</h2>
              <p className='mt-2 text-gray-600'>{advisor.introduction}</p>
            </div>

            <div className='mt-6'>
              <h2 className='text-xl font-semibold text-gray-900'>Expertise</h2>
              <div className='mt-2 flex flex-wrap gap-2'>
                {advisor.expertise?.split(',').map((exp, index) => (
                  <span
                    key={index}
                    className='px-3 py-1 bg-purple-50 text-purple-700 rounded-full text-sm'
                  >
                    {exp.trim()}
                  </span>
                ))}
              </div>
            </div>

            <button className='mt-8 w-full md:w-auto px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors'>
              Schedule a Session
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
