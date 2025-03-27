import { InferSelectModel } from 'drizzle-orm';
import React from 'react';

import { therapists } from '@/src/db/schema';

// Define Advisor type based on the therapists table schema
export type Advisor = InferSelectModel<typeof therapists>;

interface AdvisorGridProps {
  advisors: Advisor[];
}

export default function AdvisorGrid({ advisors }: AdvisorGridProps) {
  return (
    <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
      {advisors.map((advisor) => (
        <div
          key={advisor.id.toString()}
          className='bg-white shadow-md rounded-lg p-6 flex flex-col items-center'
        >
          {advisor.profileUrl && (
            <img
              src={advisor.profileUrl}
              alt={advisor.name}
              className='w-24 h-24 rounded-full mb-4 object-cover'
            />
          )}
          <h2 className='text-xl font-semibold'>{advisor.name}</h2>
          {advisor.title && <p className='text-gray-600 text-sm'>{advisor.title}</p>}
        </div>
      ))}
    </div>
  );
}
