'use client';

import { CheckCircle2 } from 'lucide-react';
import Image from 'next/image';
import React from 'react';

import LoginForm from '@/src/features/auth/components/LoginForm';
import { COLORS } from '@/src/styles/colors';

const LoginFeature = ({ icon: Icon, text }: { icon: React.ElementType; text: string }) => (
  <div className='flex items-center space-x-3'>
    <Icon className='h-6 w-6 text-[#9071FF]' />
    <span className='text-gray-700'>{text}</span>
  </div>
);

export default function LoginPage() {
  return (
    <div className='min-h-screen flex'>
      <div
        className={`
          hidden lg:flex lg:w-1/2 
          ${COLORS.WARM_WHITE.bg} 
          p-16 
          flex-col 
          justify-center 
          items-center 
          space-y-12
        `}
      >
        <div className='text-center'>
          <h2 className='text-4xl font-bold text-gray-900 mb-6'>
            Reimagine Your Financial Wellness
          </h2>
          <p className='text-xl text-gray-600 mb-10'>
            More than just numbers. A holistic approach to financial health.
          </p>
        </div>

        <div className='space-y-6 max-w-md'>
          <LoginFeature icon={CheckCircle2} text='Personalized Financial Therapy' />
          <LoginFeature icon={CheckCircle2} text='Emotional Intelligence in Finance' />
          <LoginFeature icon={CheckCircle2} text='Comprehensive Wellness Support' />
        </div>

        <div className='mt-12'>
          <Image
            src='/financial-wellness-illustration.svg'
            alt='Financial Wellness Illustration'
            width={400}
            height={300}
            className='opacity-90'
          />
        </div>
      </div>

      <div className='w-full lg:w-1/2 flex items-center justify-center px-6 py-12'>
        <div className='w-full max-w-md'>
          <LoginForm />
        </div>
      </div>
    </div>
  );
}
