'use client';
import { Pencil } from 'lucide-react';
import Image from 'next/image';
import { useState } from 'react';

import { getTherapistImageUrl } from '@/src/services/s3/assetUrls';

interface TherapistProfile {
  user: {
    firstName?: string;
    lastName?: string;
    email: string;
    imageUrl?: string;
  };
  therapist: {
    name?: string;
    title?: string;
    bookingURL?: string;
    expertise?: string;
    certifications?: string;
    song?: string;
    yoe?: number;
    clientele?: string;
    longBio?: string;
    previewBlurb?: string;
    profileUrl?: string;
    hourlyRate?: string;
  };
}

const PLACEHOLDER = '/experts/placeholderexp.png';

function ExpertiseTags({ tags }: { tags: string[] }) {
  if (!tags.length) return null;
  return (
    <div className='mt-2 flex items-start flex-wrap gap-1 min-h-[1.5rem] overflow-hidden'>
      {tags.slice(0, 3).map((exp, index) => (
        <span
          key={index}
          className='px-2 py-1 rounded-full text-xs bg-purple-50 text-purple-700 font-medium'
        >
          {exp.trim()}
        </span>
      ))}
      {tags.length > 3 && (
        <span className='px-2 py-1 rounded-full text-xs bg-purple-50 text-purple-700 font-medium'>
          +{tags.length - 3}
        </span>
      )}
    </div>
  );
}

interface ProfileDisplayProps {
  profile: TherapistProfile;
  onEditClick: () => void;
}

export function ProfileDisplay({ profile, onEditClick }: ProfileDisplayProps) {
  const [imgLoaded, setImgLoaded] = useState(false);
  const [imgError, setImgError] = useState(false);

  const { user, therapist } = profile;
  const expertiseTags = (therapist.expertise || '')
    .split(',')
    .map((t: string) => t.trim())
    .filter(Boolean);
  const displayImage = !imgError
    ? getTherapistImageUrl(therapist.profileUrl || therapist.name || user.firstName || '')
    : PLACEHOLDER;

  return (
    <div className='w-full h-full bg-white rounded-3xl shadow-2xl p-8 flex flex-col items-center max-w-xl mx-auto min-h-[540px] border border-purple-100'>
      <div className='flex flex-col items-center mb-6 w-full'>
        <div className='relative w-32 h-32 mb-3 rounded-2xl overflow-hidden bg-gray-100 flex items-center justify-center'>
          {!imgLoaded && !imgError && (
            <div
              className='absolute inset-0 bg-gray-200 animate-pulse rounded-2xl'
              aria-label='Image loading placeholder'
            />
          )}
          <Image
            src={displayImage}
            alt={therapist.name || user.firstName || 'Profile'}
            fill
            className='object-cover object-center rounded-2xl border-4 border-purple-100'
            onLoad={() => setImgLoaded(true)}
            onError={() => setImgError(true)}
            priority
          />
        </div>
        <h2 className='text-2xl font-bold text-center text-gray-900 mb-1'>
          {therapist.name || user.firstName + ' ' + user.lastName}
        </h2>
        <p className='text-lg text-center text-gray-600 mb-1 font-medium'>{therapist.title}</p>
        <p className='text-sm text-gray-400 mb-2'>{user.email}</p>
      </div>
      <div className='w-full flex flex-col gap-4 mb-4'>
        <div>
          <h3 className='text-sm font-semibold text-gray-700 mb-1'>Years of Experience</h3>
          <span className='bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-xs font-medium'>
            {therapist.yoe ? `${therapist.yoe} years` : 'N/A'}
          </span>
        </div>
        <div>
          <h3 className='text-sm font-semibold text-gray-700 mb-1'>Areas of Expertise</h3>
          <ExpertiseTags tags={expertiseTags} />
        </div>
        <div>
          <h3 className='text-sm font-semibold text-gray-700 mb-1'>Certifications</h3>
          <span className='bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-medium'>
            {therapist.certifications || 'Not specified'}
          </span>
        </div>
        <div>
          <h3 className='text-sm font-semibold text-gray-700 mb-1'>Who I Work With</h3>
          <div className='bg-blue-50 text-blue-800 px-4 py-3 rounded-xl text-sm font-medium leading-relaxed border border-blue-200'>
            {therapist.clientele || 'Not specified'}
          </div>
        </div>
        <div>
          <h3 className='text-sm font-semibold text-gray-700 mb-1'>About Me</h3>
          <p className='text-gray-700 whitespace-pre-line text-base leading-relaxed'>
            {therapist.longBio || 'No bio provided.'}
          </p>
        </div>
        {therapist.bookingURL && (
          <div>
            <h3 className='text-sm font-semibold text-gray-700 mb-1'>Booking Link</h3>
            <a
              href={therapist.bookingURL}
              target='_blank'
              rel='noopener noreferrer'
              className='text-purple-600 underline text-sm font-medium mt-2'
            >
              Book a session
            </a>
          </div>
        )}
      </div>
      <div className='flex gap-3 mt-4'>
        <button
          className='flex items-center gap-2 bg-purple-100 hover:bg-purple-200 text-purple-700 font-semibold px-6 py-2 rounded-lg shadow transition-colors'
          onClick={onEditClick}
        >
          <Pencil className='h-5 w-5' /> Edit Profile
        </button>
      </div>
    </div>
  );
}
