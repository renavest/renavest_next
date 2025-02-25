import React from 'react';
import { Advisor } from '@/src/shared/types';
import { X } from 'lucide-react';
import Image from 'next/image';

interface AdvisorPopoverProps {
  advisor: Advisor | null;
  isOpen: boolean;
  position: string;
  onClose: () => void;
}
declare global {
  interface Window {
    umami: {
      trackEvent: (event: string, data: { email: string }) => void;
    };
  }
}

const AdvisorPopover: React.FC<AdvisorPopoverProps> = ({ advisor, isOpen, onClose }) => {
  console.log('AdvisorPopover render:', { advisor: advisor?.name, isOpen });


  // Early return with debug
  if (!isOpen || !advisor) {
    console.log('AdvisorPopover early return:', { isOpen, hasAdvisor: !!advisor });
    return null;
  }

  return (
    <div className='fixed top-0 left-0 h-full w-full flex-wrap overflow-auto z-50 flex items-center justify-center bg-black bg-opacity-50'>
      <div className='relative overflow-hidden mx-4 w-full max-w-4xl rounded-2xl bg-white p-6 shadow-xl min-h-[650px]'>
        <button
          onClick={onClose}
          className='absolute right-4 top-4 rounded-full bg-gray-100 p-2 hover:bg-gray-200'
        >
          <X className='h-6 w-6' />
        </button>

        <div className='flex flex-col md:flex-row md:gap-6'>
          <div className='mb-6 md:mb-0 md:w-1/3'>
            <div className='overflow-hidden rounded-xl bg-gray-200 min-h-60 mb-6'>
              <Image
                src={advisor.profileUrl || '/experts/placeholderexp.png'}
                alt={advisor.name}
                width={500}
                height={300}
                className='h-64 w-full h-full object-cover md:h-auto'
              />
            </div>
            {advisor.bookingURL && (
              <a
                href={advisor.bookingURL}
                target='_blank'
                rel='noopener noreferrer'
                className='inline-block rounded-lg bg-violet-500 px-6 py-3 font-semibold text-white transition-colors hover:bg-blue-700 w-full text-center'
              >
                Book a Session
              </a>
            )}
            <div className='mt-4 space-y-4'>
              <div>
                <h3 className='font-semibold'>Expertise</h3>
                <div className='mt-2 flex flex-wrap gap-2'>
                  <p>{advisor.expertise}</p>
                </div>
              </div>
              <div>
                <h3 className='font-semibold'>Certifications</h3>
                <p className='mt-1 text-sm text-gray-600 max-h-[50px] overflow-y-auto'>
                  {advisor.certifications}
                </p>
              </div>
              <div>
                <h3 className='font-semibold'>Favorite Song</h3>
                <p className='mt-1 text-sm text-gray-600'>{advisor.song}</p>
              </div>
            </div>
          </div>

          <div className='md:w-2/3'>
            <div className='mb-6'>
              <h2 className='text-2xl font-bold'>{advisor.name}</h2>
              <p className='text-lg text-gray-600'>{advisor.title}</p>
              <p className='mt-1 text-sm text-gray-500'>{advisor.yoe} years of experience</p>
            </div>

            <div className='mb-6'>
              <h3 className='mb-2 text-lg font-semibold'>Introduction</h3>
              <p className='text-gray-700'>{advisor.previewBlurb}</p>
            </div>

            <div className='mb-6'>
              <h3 className='mb-2 text-lg font-semibold'>Who I Work With</h3>
              <p className='max-h-[200px] overflow-y-auto'>{advisor.clientele}</p>
            </div>

            {advisor.longBio && (
              <div className='mb-6'>
                <h3 className='mb-2 text-lg font-semibold'>About Me</h3>
                <p className='text-gray-700 max-h-[250px] overflow-y-auto'>{advisor.longBio}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdvisorPopover;
