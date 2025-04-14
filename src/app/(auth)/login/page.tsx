'use client';

import { CheckCircle2 } from 'lucide-react';
import React from 'react';

import LoginForm from '@/src/features/auth/components/LoginForm';

const LoginFeature = ({ icon: Icon, text }: { icon: React.ElementType; text: string }) => (
  <div className='flex items-center space-x-3'>
    <Icon className='h-6 w-6 text-[#9071FF]' />
    <span className='text-gray-700'>{text}</span>
  </div>
);

const GrowthVisualization = () => (
  <div className='absolute inset-0 bg-gradient-to-br from-[#F0F4F8] via-[#E6F1FF] to-[#F5E6FF] opacity-50'>
    <div className='absolute inset-0 pointer-events-none'>
      <svg
        xmlns='http://www.w3.org/2000/svg'
        viewBox='0 0 1000 600'
        className='w-full h-full opacity-20'
      >
        <defs>
          <linearGradient id='growthGradient' x1='0%' y1='100%' x2='100%' y2='0%'>
            <stop offset='0%' stopColor='#9071FF' stopOpacity='0.1' />
            <stop offset='100%' stopColor='#4FD1C5' stopOpacity='0.1' />
          </linearGradient>
        </defs>
        <path
          d='M50,550 
             Q200,450 300,500 
             Q400,550 500,450 
             Q600,350 700,400 
             Q800,450 950,350'
          fill='none'
          stroke='url(#growthGradient)'
          strokeWidth='3'
          strokeDasharray='10 10'
        />
        <circle cx='50' cy='550' r='10' fill='#9071FF' opacity='0.5' />
        <circle cx='300' cy='500' r='10' fill='#4FD1C5' opacity='0.5' />
        <circle cx='500' cy='450' r='10' fill='#9071FF' opacity='0.5' />
        <circle cx='700' cy='400' r='10' fill='#4FD1C5' opacity='0.5' />
        <circle cx='950' cy='350' r='10' fill='#9071FF' opacity='0.5' />
      </svg>
    </div>
  </div>
);

const LoginLeftSection = () => (
  <div
    className={`
      hidden lg:flex lg:w-1/2 
      bg-gradient-to-br from-[#9071FF] via-[#6A4FD1] to-[#4F3AD1]
      p-16 
      flex-col 
      justify-center 
      items-center 
      space-y-12
      relative
      overflow-hidden
      text-white
    `}
  >
    <GrowthVisualization />

    <div className='text-center relative z-10'>
      <div className='relative'>
        <div className='flex items-center justify-center mb-6'>
          <svg
            width='120'
            height='40'
            viewBox='0 0 120 40'
            fill='none'
            xmlns='http://www.w3.org/2000/svg'
          >
            <text
              x='50%'
              y='50%'
              textAnchor='middle'
              fontFamily='Arial, sans-serif'
              fontSize='24'
              fontWeight='bold'
              fill='white'
            >
              Renavest
            </text>
          </svg>
        </div>
        <h2 className='text-4xl font-bold mb-6'>Financial Wellness, Reimagined</h2>
        <p className='text-xl opacity-80 mb-10'>
          Transforming Financial Stress into Emotional Empowerment
        </p>
      </div>
    </div>

    <div className='space-y-6 max-w-md relative z-10'>
      <LoginFeature icon={CheckCircle2} text='Holistic Financial Therapy' />
      <LoginFeature icon={CheckCircle2} text='Personalized Emotional Financial Insights' />
      <LoginFeature icon={CheckCircle2} text='Workplace Financial Well-being' />
    </div>

    <div className='mt-12 relative z-10'>
      <div className='flex items-center space-x-3 bg-white/20 p-4 rounded-xl backdrop-blur-sm'>
        <div className='w-10 h-10 bg-white/30 rounded-full flex items-center justify-center'>
          <svg
            xmlns='http://www.w3.org/2000/svg'
            width='24'
            height='24'
            viewBox='0 0 24 24'
            fill='none'
            stroke='white'
            strokeWidth='2'
          >
            <path d='M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z' />
            <path d='M12 12l3-3' />
            <path d='M12 12v5' />
          </svg>
        </div>
        <span className='text-sm text-white/90'>Empowering Your Financial Journey</span>
      </div>
    </div>
  </div>
);

export default function LoginPage() {
  return (
    <div className='min-h-screen flex'>
      <LoginLeftSection />
      <div className='w-full lg:w-1/2 flex items-center justify-center px-6 py-12'>
        <div className='w-full max-w-md'>
          <LoginForm />
        </div>
      </div>
    </div>
  );
}
