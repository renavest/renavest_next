'use client';

import { X } from 'lucide-react';
import { useEffect } from 'react';

import { advisorSignal, isOpenSignal } from '../state/advisorSignals';

export default function AdvisorPopover() {
  const advisor = advisorSignal.value;
  const isOpen = isOpenSignal.value;

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        isOpenSignal.value = false;
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen || !advisor) return null;

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-20'>
      <div
        className='fixed inset-0 bg-gray-500 bg-opacity-25 backdrop-blur-sm transition-opacity'
        onClick={() => (isOpenSignal.value = false)}
      />

      <div className='relative w-full max-w-2xl overflow-hidden rounded-xl bg-white shadow-2xl ring-1 ring-black ring-opacity-5'>
        <button
          className='absolute right-4 top-4 text-gray-400 hover:text-gray-500'
          onClick={() => (isOpenSignal.value = false)}
        >
          <X className='h-6 w-6' />
        </button>

        <div className='p-6 sm:p-8'>
          <div className='flex items-start gap-6'>
            <img
              src={advisor.profileUrl || '/experts/placeholderexp.png'}
              alt={advisor.name}
              className='h-24 w-24 rounded-lg object-cover'
            />
            <div>
              <h2 className='text-2xl font-bold text-gray-900'>{advisor.name}</h2>
              <p className='mt-1 text-sm text-gray-500'>{advisor.title}</p>
              <p className='mt-1 text-sm text-gray-500'>{advisor.yoe} years of experience</p>
            </div>
          </div>

          <div className='mt-6'>
            <h3 className='text-lg font-medium text-gray-900'>About</h3>
            <p className='mt-2 text-gray-600'>{advisor.introduction || advisor.previewBlurb}</p>
          </div>

          <div className='mt-6'>
            <h3 className='text-lg font-medium text-gray-900'>Expertise</h3>
            <div className='mt-2 flex flex-wrap gap-2'>
              {advisor.expertise?.split(',').map((exp, index) => (
                <span
                  key={index}
                  className='rounded-full bg-purple-50 px-3 py-1 text-sm text-purple-700'
                >
                  {exp.trim()}
                </span>
              ))}
            </div>
          </div>

          <div className='mt-8'>
            <button
              className='w-full rounded-lg bg-purple-600 px-4 py-2 text-white hover:bg-purple-700'
              onClick={() => {
                // TODO: Implement booking logic
                console.log('Book session with:', advisor.name);
              }}
            >
              Book a Session
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
