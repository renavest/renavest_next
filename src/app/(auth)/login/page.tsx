'use client';

import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import React, { useEffect, Suspense } from 'react';

import LoginForm from '@/src/features/auth/components/LoginForm';
import { setCompanyIntegration } from '@/src/features/auth/state/authState';
import { COLORS } from '@/src/styles/colors';

function TestimonialSection() {
  // Testimonial/Quote
  const quote =
    "My session with financial therapy coach Paige was nothing short of transformative. Her insight, compassion, and affirming guidance created a space where I felt truly seen and empowered... ";
  const quoteName = 'Essma Litim';
  const quoteTitle = 'Renavest User';
  const personImage = 'https://d2qcuj7ucxw61o.cloudfront.net/esmaa_testimonial.png';

  return (
    <div className='flex flex-col items-center justify-center w-full h-full min-h-screen bg-[#f7f5ff] px-6'>
      <div className='max-w-md w-full flex flex-col items-center justify-center text-center'>
        <div className='text-gray-900 text-xl md:text-2xl font-normal leading-snug mb-8 mt-8 md:mt-0'>
          “{quote}”
        </div>
        <Image
          src={personImage}
          alt={quoteName}
          width={48}
          height={48}
          className='rounded-full object-cover border-2 border-purple-100 shadow-sm mb-3'
          priority
        />
        <div className='text-base text-gray-900 font-semibold'>{quoteName}</div>
        <div className='text-sm text-gray-500'>{quoteTitle}</div>
      </div>
    </div>
  );
}

function LoginPageContent() {
  const searchParams = useSearchParams();

  useEffect(() => {
    const company = searchParams.get('company');
    if (company) {
      setCompanyIntegration(company);
    }
  }, [searchParams]);

  return (
    <div className='min-h-screen flex flex-col lg:flex-row bg-gradient-to-br from-purple-50 via-[#f7f5ff] to-[#faf9f6]'>
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
        .animate-fade-in {
          animation: fade-in 0.6s ease-out forwards;
        }
      `}</style>
      {/* Testimonial on the left */}
      <div className='w-full lg:w-4/12 flex items-center justify-center p-0'>
        <TestimonialSection />
      </div>
      {/* Login section on the right */}
      <div className='w-full lg:w-8/12 flex flex-col items-center bg-white p-8 min-h-screen relative overflow-hidden'>
        <div className='w-full max-w-md relative z-10 flex flex-col h-full'>
          {/* Logo and name row, centered */}
          <div className='flex items-center justify-center mt-16 mb-2'>
            <Image
              src='/renavestlogo.png'
              alt='Renavest'
              width={48}
              height={48}
              className='w-12 h-12 mr-3'
            />
            <h1 className={`text-3xl font-bold ${COLORS.WARM_PURPLE.DEFAULT}`}>Renavest</h1>
          </div>
          {/* New large header and subheader */}

          {/* Vertically centered login card content */}
          <div className='flex-1 flex flex-col justify-center'>
            <LoginForm />
          </div>
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
