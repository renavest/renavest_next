// AdvisorPopover.tsx
'use client';
import { X } from 'lucide-react';
import Image from 'next/image';

import { advisorSignal, isOpenSignal } from '../state/advisorSignals';

const AdvisorPopover = () => {
  const advisor = advisorSignal.value;
  const isOpen = isOpenSignal.value;

  if (!isOpen || !advisor) {
    return null;
  }

  const handleClose = () => {
    isOpenSignal.value = false;
    advisorSignal.value = null;
  };

  return (
    <div className='fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50'>
      <div className='min-h-screen px-4 text-center'>
        <div className='inline-block w-full max-w-4xl my-8 text-left align-middle transition-all transform bg-white rounded-2xl shadow-xl'>
          <div className='relative p-6 sm:p-8'>
            <button
              onClick={handleClose}
              className='absolute right-4 top-4 rounded-full bg-gray-100 p-2 hover:bg-gray-200 z-10'
            >
              <X className='h-5 w-5' />
            </button>

            <div className='flex flex-col md:flex-row gap-6 md:gap-8 mt-6'>
              <div className='md:w-1/3'>
                <div className='aspect-[3/4] w-full relative rounded-xl overflow-hidden'>
                  <Image
                    src={advisor.profileUrl || '/experts/placeholderexp.png'}
                    alt={advisor.name}
                    fill
                    className='object-cover'
                  />
                </div>
                <div className='mt-6 space-y-4'>
                  <a
                    href={advisor.bookingURL}
                    target='_blank'
                    rel='noopener noreferrer'
                    className='block w-full py-3 px-4 text-center bg-[#952e8f] text-white rounded-lg hover:bg-[#952e8f]/90 transition-colors font-medium'
                  >
                    Book a Session
                  </a>
                  <div className='p-4 bg-gray-50 rounded-lg'>
                    <h4 className='font-medium mb-2'>Certifications</h4>
                    <p className='text-sm text-gray-600'>
                      {advisor.certifications || 'Not specified'}
                    </p>
                  </div>
                </div>
              </div>

              <div className='md:w-2/3'>
                <div className='mb-6'>
                  <h2 className='text-2xl font-bold text-gray-900'>{advisor.name}</h2>
                  <p className='text-lg text-gray-600'>{advisor.title}</p>
                  <p className='mt-1 text-sm text-gray-500'>{advisor.yoe} years of experience</p>
                </div>

                <div className='space-y-6'>
                  <div>
                    <h3 className='text-lg font-semibold mb-2'>Areas of Expertise</h3>
                    <div className='flex flex-wrap gap-2'>
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

                  <div>
                    <h3 className='text-lg font-semibold mb-2'>Who I Work With</h3>
                    <p className='text-gray-700'>{advisor.clientele}</p>
                  </div>

                  {advisor.longBio && (
                    <div>
                      <h3 className='text-lg font-semibold mb-2'>About Me</h3>
                      <p className='text-gray-700'>{advisor.longBio}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdvisorPopover;
