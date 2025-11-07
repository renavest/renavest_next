'use client';
import { X } from 'lucide-react';
import React, { useEffect, useState } from 'react';

interface Therapist {
  id: number;
  name: string;
  title: string;
  expertise: string;
  certifications: string | null;
  song: string | null;
  yoe: number;
  clientele: string;
  longbio: string;
  bookingurl: string;
  previewblurb: string | null;
  profileurl: string | null;
}

interface TherapistModalProps {
  therapist: Therapist | null;
  isOpen: boolean;
  onClose: () => void;
}

const TherapistImage = ({ therapist }: { therapist: Therapist }) => {
  const handleBookSession = () => {
    if (therapist.bookingurl) {
      window.open(therapist.bookingurl, '_blank');
    }
  };

  return (
    <div className='md:w-1/3'>
      <div className='aspect-[3/4] w-full relative rounded-xl overflow-hidden'>
        {therapist.profileurl ? (
          <img
            src={therapist.profileurl}
            alt={therapist.name}
            className='h-full w-full object-cover bg-gray-100'
          />
        ) : (
          <div className='w-full h-full flex items-center justify-center' style={{ background: 'linear-gradient(to bottom right, rgb(144, 113, 255), rgb(164, 143, 255))' }}>
            <span className='text-6xl text-white font-semibold'>
              {therapist.name.split(' ').map(n => n[0]).join('')}
            </span>
          </div>
        )}
      </div>
      <div className='mt-6 space-y-4'>
        <button
          onClick={handleBookSession}
          className='block w-full py-3 px-4 text-center text-white rounded-lg transition-colors font-medium hover:bg-accent bg-accent-dark'
        >
          Book a Session
        </button>

        <div className='p-4 bg-gray-50 rounded-lg'>
          <h4 className='font-medium mb-2'>Certifications</h4>
          <p className='text-sm text-gray-600'>{therapist.certifications || 'Not specified'}</p>
        </div>

        {therapist.song && (
          <div className='p-4 bg-gray-50 rounded-lg'>
            <h4 className='font-medium mb-2'>Theme Song</h4>
            <p className='text-sm text-gray-600'>{therapist.song}</p>
          </div>
        )}
      </div>
    </div>
  );
};

const TherapistDetails = ({ therapist }: { therapist: Therapist }) => (
  <div className='md:w-2/3'>
    <div className='mb-6'>
      <h2 className='text-2xl font-bold text-gray-900'>{therapist.name}</h2>
      <p className='text-lg text-gray-600'>{therapist.title}</p>
      <p className='mt-1 text-sm text-gray-500'>{therapist.yoe} years of experience</p>
    </div>

    <div className='space-y-6'>
      <div>
        <h3 className='text-lg font-semibold mb-2'>Areas of Expertise</h3>
        <div className='flex flex-wrap gap-2'>
          {therapist.expertise?.split(',').map((exp: string, index: number) => (
            <span
              key={index}
              className='px-3 py-1 rounded-full text-sm bg-purple-100 text-purple-700'
            >
              {exp.trim()}
            </span>
          ))}
        </div>
      </div>

      {therapist.clientele && (
        <div>
          <h3 className='text-lg font-semibold mb-2'>Who I Work With</h3>
          <p className='text-gray-700'>{therapist.clientele}</p>
        </div>
      )}

      {therapist.longbio && (
        <div>
          <h3 className='text-lg font-semibold mb-2'>About Me</h3>
          <p className='text-gray-700 whitespace-pre-line'>{therapist.longbio}</p>
        </div>
      )}
    </div>
  </div>
);

export default function TherapistModal({ therapist, isOpen, onClose }: TherapistModalProps) {
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => setIsAnimating(true), 10);
      document.body.style.overflow = 'hidden';
    } else {
      setIsAnimating(false);
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen || !therapist) {
    return null;
  }

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className={`fixed inset-0 z-50 overflow-y-auto transition-all duration-300 ${
        isAnimating ? 'bg-black bg-opacity-50' : 'bg-black bg-opacity-0'
      }`}
      onClick={handleOverlayClick}
    >
      <div className='min-h-screen px-4 flex items-center justify-center'>
        <div
          className={`w-full max-w-4xl my-8 text-left transition-all duration-300 transform ${
            isAnimating 
              ? 'opacity-100 scale-100 translate-y-0' 
              : 'opacity-0 scale-95 translate-y-4'
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          <div className='bg-white rounded-2xl shadow-xl'>
            <div className='relative p-6 sm:p-8'>
              <button
                onClick={onClose}
                className='absolute right-4 top-4 rounded-full bg-gray-100 p-2 hover:bg-gray-200 transition-colors z-10'
              >
                <X className='h-5 w-5' />
              </button>

              <div className='flex flex-col md:flex-row gap-6 md:gap-8 mt-6'>
                <TherapistImage therapist={therapist} />
                <TherapistDetails therapist={therapist} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
