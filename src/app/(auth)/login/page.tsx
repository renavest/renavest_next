'use client';

import { Heart, BarChart, Lightbulb } from 'lucide-react';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import React, { useEffect } from 'react';

import LoginForm from '@/src/features/auth/components/LoginForm';
import {
  setCompanyIntegration,
  companyIntegrationSignal,
} from '@/src/features/auth/state/authState';
import { COLORS } from '@/src/styles/colors';

const INTEGRATION_COPY: Record<string, { headline: string; subheadline: string }> = {
  google: {
    headline: 'Welcome to the Renavest × Google Integration',
    subheadline:
      'This portal is customized for Google team members. Enjoy exclusive Renavest benefits as a Google partner.',
  },
  // Add more companies here as needed
};

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

const GoogleLogo = () => (
  <svg className='w-7 h-7 ml-2' viewBox='0 0 24 24'>
    <path
      d='M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z'
      fill='#4285F4'
    />
    <path
      d='M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z'
      fill='#34A853'
    />
    <path
      d='M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z'
      fill='#FBBC05'
    />
    <path
      d='M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z'
      fill='#EA4335'
    />
    <path d='M1 1h22v22H1z' fill='none' />
  </svg>
);

const LoginLeftSection = () => {
  const company = companyIntegrationSignal.value;
  const companyKey = company ? company.toLowerCase() : '';
  const isGoogle = companyKey === 'google';
  const integrationCopy = companyKey && INTEGRATION_COPY[companyKey];

  const headline = integrationCopy
    ? integrationCopy.headline
    : 'Where emotional intelligence meets financial empowerment';
  const subheadline = integrationCopy
    ? integrationCopy.subheadline
    : 'A compassionate approach to understanding your relationship with money';

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
          {isGoogle && (
            <>
              <span className='mx-2 text-gray-400 text-2xl font-bold'>×</span>
              <GoogleLogo />
              <span className='ml-2 text-2xl font-bold text-gray-700'>Google</span>
            </>
          )}
        </div>

        <div className='max-w-xl mb-8'>
          <h2 className='text-4xl font-bold text-gray-900 mb-4 animate-fade-in [animation-delay:400ms] opacity-0'>
            {headline}
          </h2>
          <p className='text-xl text-gray-600 leading-relaxed mb-6 animate-fade-in [animation-delay:500ms] opacity-0'>
            {subheadline}
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
  const searchParams = useSearchParams();

  useEffect(() => {
    const company = searchParams.get('company');
    if (company) {
      setCompanyIntegration(company);
    }
  }, [searchParams]);

  return (
    <div className='min-h-screen flex bg-gradient-to-br from-purple-50 via-[#f7f5ff] to-[#faf9f6]'>
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
