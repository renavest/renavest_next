'use client';

import React from 'react';

import LoginForm from '@/src/features/auth/components/LoginForm';
import { COLORS } from '@/src/styles/colors';

const FeatureCard = ({
  icon,
  title,
  description,
  bgColor,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  bgColor: string;
}) => (
  <div
    className={`
    ${COLORS.WARM_WHITE.bg} 
    p-6 
    rounded-2xl 
    shadow-lg 
    hover:shadow-xl 
    transition-all 
    group 
    overflow-hidden 
    relative
  `}
  >
    <div
      className={`
      absolute 
      -top-1/2 
      -right-1/2 
      w-full 
      h-full 
      ${bgColor} 
      opacity-10 
      group-hover:opacity-20 
      transition-opacity 
      rounded-full
    `}
    ></div>

    <div className='relative z-10 flex items-center space-x-4'>
      <div
        className={`
        ${bgColor} 
        text-white 
        p-3 
        rounded-full 
        transform 
        group-hover:scale-110 
        transition-transform
      `}
      >
        {icon}
      </div>
      <div>
        <h3 className='text-lg font-semibold text-gray-800 group-hover:text-[#9071FF] transition-colors'>
          {title}
        </h3>
        <p className='text-sm text-gray-600 group-hover:text-gray-800 transition-colors'>
          {description}
        </p>
      </div>
    </div>
  </div>
);

const LoginLeftSection = () => (
  <div
    className={`
    hidden 
    lg:flex 
    lg:w-1/2 
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
    {/* Subtle Background Pattern */}
    <div className='absolute inset-0 opacity-5 pointer-events-none'>
      <svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1000 600' className='w-full h-full'>
        <defs>
          <pattern id='financial-pattern' patternUnits='userSpaceOnUse' width='100' height='100'>
            <path d='M0 0 L50 50 L100 0 L50 100 Z' fill='#9071FF' fillOpacity='0.05' />
          </pattern>
        </defs>
        <rect width='100%' height='100%' fill='url(#financial-pattern)' />
      </svg>
    </div>

    <div className='max-w-md z-10 text-center'>
      {/* Renavest Logo/Title */}
      <div className='mb-12'>
        <h1
          className={`
          text-5xl 
          font-bold 
          ${COLORS.WARM_PURPLE.DEFAULT} 
          mb-4 
          tracking-tight
        `}
        >
          Renavest
        </h1>
        <p className='text-xl text-gray-600'>Emotional Intelligence Meets Financial Wellness</p>
      </div>

      {/* Feature Cards */}
      <div className='space-y-6 mb-10'>
        <FeatureCard
          icon={
            <svg
              xmlns='http://www.w3.org/2000/svg'
              width='24'
              height='24'
              viewBox='0 0 24 24'
              fill='none'
              stroke='currentColor'
              strokeWidth='2'
            >
              <path d='M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z' />
              <path d='M12 12l3-3' />
              <path d='M12 12v5' />
            </svg>
          }
          title='Holistic Financial Therapy'
          description='Bridging emotional insights with financial strategies'
          bgColor={COLORS.WARM_PURPLE.bg}
        />

        <FeatureCard
          icon={
            <svg
              xmlns='http://www.w3.org/2000/svg'
              width='24'
              height='24'
              viewBox='0 0 24 24'
              fill='none'
              stroke='currentColor'
              strokeWidth='2'
            >
              <circle cx='12' cy='12' r='10' />
              <line x1='12' y1='16' x2='12' y2='12' />
              <line x1='12' y1='8' x2='12.01' y2='8' />
            </svg>
          }
          title='Personalized Insights'
          description='Tailored financial guidance that understands you'
          bgColor='bg-[#4FD1C5]'
        />

        <FeatureCard
          icon={
            <svg
              xmlns='http://www.w3.org/2000/svg'
              width='24'
              height='24'
              viewBox='0 0 24 24'
              fill='none'
              stroke='currentColor'
              strokeWidth='2'
            >
              <path d='M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2' />
              <circle cx='9' cy='7' r='4' />
              <path d='M22 21v-2a4 4 0 0 0-3-3.87' />
              <path d='M16 3.13a4 4 0 0 1 0 7.75' />
            </svg>
          }
          title='Workplace Wellness'
          description='Empowering employees through financial well-being'
          bgColor='bg-[#FF6B6B]'
        />
      </div>

      {/* Inspirational Quote */}
      <div className='text-center'>
        <p
          className={`
          text-sm 
          ${COLORS.WARM_PURPLE.DEFAULT} 
          opacity-70 
          italic
        `}
        >
          "90% of financial decisions are emotionally driven"
        </p>
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
