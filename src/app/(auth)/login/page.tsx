'use client';

import { Heart, BarChart, Lightbulb } from 'lucide-react';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import React, { useEffect, Suspense } from 'react';

import companyInfo from '@/src/features/auth/companyInfo';
import LoginForm from '@/src/features/auth/components/LoginForm';
import {
  setCompanyIntegration,
  companyIntegrationSignal,
} from '@/src/features/auth/state/authState';
import { COLORS } from '@/src/styles/colors';

const logoScaleOverrides: { [key: string]: number } = {
  'bridge.png': 1.5,
};

// Feature type
interface Feature {
  icon: React.ElementType;
  title: string;
  description: string;
}

const features: Feature[] = [
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

function FeatureCard({ feature }: { feature: Feature }) {
  const Icon = feature.icon;
  return (
    <div className='bg-white/90 border border-purple-100 rounded-xl shadow-md p-4 w-40 flex flex-col items-start space-y-2'>
      <Icon className={`w-6 h-6 ${COLORS.WARM_PURPLE.DEFAULT} opacity-80`} />
      <div className='font-semibold text-gray-900 text-base'>{feature.title}</div>
      <div className='text-xs text-gray-500'>{feature.description}</div>
    </div>
  );
}

function LoginVisualArea() {
  // Testimonial/Quote
  const quote =
    'Renavest helped me finally feel in control of my finances. The support and insights were life-changing!';
  const quoteName = 'Essma Litim';
  const quoteTitle = 'Software Engineer, Acme Corp';
  const personImage = 'https://d2qcuj7ucxw61o.cloudfront.net/esmaa_testimonial.png';

  return (
    <div className='relative flex-1 flex items-center justify-center min-h-[400px] h-full'>
      {/* Data Insights Card */}
      <div className='absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/3 bg-white/90 border border-purple-100 rounded-xl shadow-lg p-6 w-48 z-20 animate-fade-in [animation-delay:600ms] opacity-0'>
        <div className='font-bold text-purple-700 mb-2'>Data Insights</div>
        <div className='text-gray-600 text-sm'>
          Placeholder for data insights about your team's financial health.
        </div>
      </div>

      {/* Large Person Image */}
      <div className='relative z-10 flex items-end justify-center w-full h-full'>
        <Image
          src={personImage}
          alt={quoteName}
          fill
          style={{ objectFit: 'contain' }}
          className='max-h-[80vh] w-auto h-auto bg-purple-100 rounded-lg'
          priority
        />
      </div>

      {/* Quote Card (speech bubble style) */}
      <div className='absolute right-0 top-0 translate-x-1/4 -translate-y-1/4 bg-white/90 border border-purple-100 rounded-2xl shadow-lg p-6 max-w-xs z-30 animate-fade-in [animation-delay:650ms] opacity-0'>
        <div className='text-gray-700 italic mb-2'>"{quote}"</div>
        <div className='text-sm text-gray-500 font-semibold'>{quoteName}</div>
        <div className='text-xs text-gray-400'>{quoteTitle}</div>
      </div>
    </div>
  );
}

const LoginLeftSection = () => {
  const company = companyIntegrationSignal.value;
  const companyKey = company ? company.toLowerCase() : '';
  const companyData = companyKey ? companyInfo[companyKey] : undefined;

  const headline = companyData?.headline || 'Welcome to your safe space to talk about money';
  const subheadline =
    companyData?.about || 'A compassionate approach to understanding your relationship with money';

  return (
    <div
      className={`
        hidden
        lg:flex
        lg:w-7/12
        ${COLORS.WARM_WHITE.bg}
        p-16
        flex-col
        justify-start
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

      {/* Header and Subheader */}
      <div className='relative z-10 max-w-xl mb-8'>
        <div className='flex items-center space-x-3 mb-8 hover:translate-x-0.5 transition-transform duration-300'>
          <span style={{ display: 'flex', alignItems: 'center' }}>
            <Image
              src='/renavestlogo.png'
              alt='Renavest'
              width={40}
              height={40}
              className='w-10 h-10 bg-[#'
            />
            <h1 className={`text-2xl font-bold ${COLORS.WARM_PURPLE.DEFAULT} ml-2`}>Renavest</h1>
          </span>
          {companyData && (
            <>
              <span className='mx-2 text-gray-400 text-2xl font-bold'>×</span>
              {(() => {
                const fileName =
                  (companyData.logoSrc && companyData.logoSrc.split('/').pop()) || '';
                const scale = logoScaleOverrides[fileName] || 1;
                return (
                  <img
                    src={companyData.logoSrc}
                    alt={companyData.title}
                    className='object-contain ml-6'
                    style={{
                      height: '80px',
                      width: 'auto',
                      display: 'block',
                      transform: `scale(${scale})`,
                      transformOrigin: 'left center',
                    }}
                  />
                );
              })()}
            </>
          )}
        </div>
        <h2 className='text-4xl font-bold text-gray-900 mb-4 animate-fade-in [animation-delay:400ms] opacity-0'>
          {headline}
        </h2>
        <p className='text-xl text-gray-600 leading-relaxed mb-6 animate-fade-in [animation-delay:500ms] opacity-0'>
          {subheadline}
        </p>
      </div>

      {/* Main Visual Area */}
      <LoginVisualArea />
    </div>
  );
};

function LoginPageContent() {
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

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginPageContent />
    </Suspense>
  );
}
