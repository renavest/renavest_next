'use client';

import { Heart, BarChart, Lightbulb } from 'lucide-react';
import Image from 'next/image';
import React from 'react';

import LoginForm from '@/src/features/auth/components/LoginForm';
import { COLORS } from '@/src/styles/colors';

const FeatureSection = () => {
  const features = [
    {
      icon: Heart,
      title: 'Employee Empowerment',
      description:
        'Personalized financial therapy that transforms individual money mindsets and supports holistic financial well-being.',
    },
    {
      icon: BarChart,
      title: 'Employer Insights',
      description:
        'Aggregate, anonymized analytics that help organizations understand workforce financial health and support strategies.',
    },
    {
      icon: Lightbulb,
      title: 'Therapist Collaboration',
      description:
        'A comprehensive platform for financial therapists to manage clients, track progress, and deliver targeted financial wellness support.',
    },
  ];

  return (
    <div className='space-y-4'>
      {features.map((feature, index) => (
        <div
          key={index}
          className={`
            flex items-start space-x-4 
            p-4 rounded-xl 
            bg-white/80 backdrop-blur-sm 
            border border-purple-100
            hover:shadow-md hover:-translate-y-0.5 
            transition-all duration-300 ease-out
            animate-fade-in opacity-0 
            [animation-delay:${400 + index * 100}ms]
          `}
        >
          <feature.icon
            className={`
              w-8 h-8 mt-1 
              ${COLORS.WARM_PURPLE.DEFAULT} 
              opacity-80
            `}
          />
          <div>
            <h3 className='text-lg font-semibold text-gray-900 mb-1'>{feature.title}</h3>
            <p className='text-sm text-gray-600'>{feature.description}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

const LoginLeftSection = () => {
  return (
    <div
      className={`
      hidden 
      lg:flex 
      lg:w-7/12 
      ${COLORS.WARM_WHITE.bg} 
      p-16 
      flex-col 
      justify-between 
      relative 
      overflow-hidden
    `}
    >
      {/* Enhanced gradient background with animation */}
      <div className='absolute inset-0'>
        <div className='absolute inset-0 bg-gradient-to-br from-purple-50 via-white to-purple-50/30' />
        <div className='absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(144,113,255,0.1),transparent_50%)] animate-pulse-slow' />
        <div className='absolute inset-0 bg-[radial-gradient(circle_at_70%_60%,rgba(255,229,229,0.15),transparent_50%)] animate-pulse-slower' />
      </div>

      {/* Logo and main content */}
      <div className='relative z-10 animate-fade-in [animation-delay:200ms] opacity-0'>
        <div className='flex items-center space-x-3 mb-8 hover:translate-x-0.5 transition-transform duration-300'>
          <Image
            src='/renavestlogo.png'
            alt='Renavest'
            width={40}
            height={40}
            className='w-10 h-10'
          />
          <h1 className={`text-2xl font-bold ${COLORS.WARM_PURPLE.DEFAULT}`}>Renavest</h1>
        </div>

        <div className='max-w-xl mb-8'>
          <h2 className='text-4xl font-bold text-gray-900 mb-4 animate-fade-in [animation-delay:400ms] opacity-0'>
            Where emotional intelligence meets financial empowerment
          </h2>
          <p className='text-xl text-gray-600 leading-relaxed mb-6 animate-fade-in [animation-delay:500ms] opacity-0'>
            A compassionate approach to understanding your relationship with money
          </p>
        </div>
      </div>

      {/* Features */}
      <div className='relative z-10'>
        <FeatureSection />
      </div>
    </div>
  );
};

export default function LoginPage() {
  return (
    <div className='min-h-screen flex'>
      <style jsx global>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes pulse-slow {
          0%,
          100% {
            opacity: 0.1;
          }
          50% {
            opacity: 0.15;
          }
        }
        @keyframes pulse-slower {
          0%,
          100% {
            opacity: 0.15;
          }
          50% {
            opacity: 0.2;
          }
        }
        .animate-fade-in {
          animation: fade-in 0.6s ease-out forwards;
        }
        .animate-pulse-slow {
          animation: pulse-slow 4s ease-in-out infinite;
        }
        .animate-pulse-slower {
          animation: pulse-slower 6s ease-in-out infinite;
        }
      `}</style>
      <LoginLeftSection />
      <div className='w-full lg:w-5/12 flex items-center justify-center px-6 py-12 relative animate-fade-in [animation-delay:300ms] opacity-0'>
        <div className='absolute inset-0 bg-gradient-to-b from-purple-50/50 to-transparent lg:hidden' />
        <div className='w-full max-w-md relative z-10'>
          <LoginForm />
        </div>
      </div>
    </div>
  );
}
