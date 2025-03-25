'use client';

import { CheckCircle2 } from 'lucide-react';
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
          relative
          overflow-hidden
        `}
      >
        {/* Abstract Background Design */}
        <div className='absolute inset-0 opacity-10 pointer-events-none'>
          <div className='absolute top-0 right-0 w-96 h-96 bg-[#9071FF]/20 rounded-full transform translate-x-1/2 -translate-y-1/2' />
          <div className='absolute bottom-0 left-0 w-72 h-72 bg-[#9071FF]/10 rounded-full transform -translate-x-1/2 translate-y-1/2' />
        </div>

        <div className='text-center relative z-10'>
          <h2 className='text-4xl font-bold text-gray-900 mb-6'>
            Reimagine Your Financial Wellness
          </h2>
          <p className='text-xl text-gray-600 mb-10'>
            More than just numbers. A holistic approach to financial health.
          </p>
        </div>

        <div className='space-y-6 max-w-md relative z-10'>
          <LoginFeature icon={CheckCircle2} text='Personalized Financial Therapy' />
          <LoginFeature icon={CheckCircle2} text='Emotional Intelligence in Finance' />
          <LoginFeature icon={CheckCircle2} text='Comprehensive Wellness Support' />
        </div>

        {/* Replace SVG with geometric pattern */}
        <div className='mt-12 relative z-10'>
          <div className='grid grid-cols-3 gap-4 w-64 h-48'>
            {[...Array(9)].map((_, index) => (
              <div
                key={index}
                className={`
                  transform transition-all duration-300 
                  ${index % 2 === 0 ? 'bg-[#9071FF]/10' : 'bg-[#9071FF]/5'}
                  rounded-lg
                  hover:scale-105
                `}
              />
            ))}
          </div>
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
