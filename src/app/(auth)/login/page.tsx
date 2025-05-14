'use client';

import { useUser } from '@clerk/nextjs';
import Image from 'next/image';
import { useSearchParams, useRouter } from 'next/navigation';
import React, { useEffect, Suspense } from 'react';

import LoginForm from '@/src/features/auth/components/LoginForm';
import { setCompanyIntegration } from '@/src/features/auth/state/authState';
import { trackAuthPageView } from '@/src/features/auth/utils/authTracking';
import companyInfo from '@/src/features/utm/companyInfo';
import PageUtmHandler from '@/src/features/utm/PageText';
import { companyNameSignal } from '@/src/features/utm/utmCustomDemo';

function TestimonialSection() {
  // Testimonial/Quote
  const quote =
    'My session with financial therapy coach Paige was nothing short of transformative. Her insight, compassion, and affirming guidance created a space where I felt truly seen and empowered... ';
  const quoteName = 'Essma Litim';
  const quoteTitle = 'Renavest User';
  const personImage = 'https://d2qcuj7ucxw61o.cloudfront.net/esmaa_testimonial.png';

  return (
    <div className='flex flex-col items-center justify-center w-full h-full min-h-screen bg-[#f7f5ff] px-6'>
      <div className='max-w-md w-full flex flex-col items-center justify-center text-center'>
        <div className='text-gray-900 text-xl md:text-2xl font-normal leading-snug mb-8 mt-8 md:mt-0'>
          "{quote}"
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
  const router = useRouter();
  const { user, isSignedIn, isLoaded } = useUser();

  useEffect(() => {
    const company = searchParams.get('company');
    if (company) {
      setCompanyIntegration(company);
    }
    // Track page view using the utility
    trackAuthPageView('/login', { company: company || 'none' });
  }, [searchParams]);

  // Role-based redirect after login
  useEffect(() => {
    if (!isLoaded) return;
    if (isSignedIn && user) {
      const role = user.publicMetadata?.role;
      if (role === 'therapist') {
        router.replace('/therapist');
      } else if (role === 'employer') {
        router.replace('/employer');
      } else {
        router.replace('/employee');
      }
    }
  }, [isLoaded, isSignedIn, user, router]);

  return (
    <PageUtmHandler>
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
        {/* Testimonial - now first in DOM but will be last on mobile */}
        <div className='order-2 lg:order-1 w-full lg:w-4/12 flex items-center justify-center p-0'>
          <TestimonialSection />
        </div>
        {/* Login section - now second in DOM but will be first on mobile */}
        <div className='order-1 lg:order-2 w-full lg:w-8/12 flex flex-col items-center bg-white p-8 min-h-screen relative overflow-hidden'>
          {/* Renavest × Company row - full width, centered, with space */}
          <div className='flex w-full justify-center items-center my-6 space-x-4'>
            <Image
              src='/renavestlogo.png'
              alt='Renavest'
              width={48}
              height={48}
              className='w-12 h-12'
            />
            <span className='text-4xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-[#9071FF] to-[#6A4BFF]'>
              Renavest
            </span>
            {companyNameSignal.value && (
              <>
                <span className='text-gray-400 text-3xl mx-3'>×</span>
                {companyInfo[companyNameSignal.value.toLowerCase()]?.logoSrc ? (
                  <>
                    <Image
                      src={companyInfo[companyNameSignal.value.toLowerCase()].logoSrc}
                      alt={companyNameSignal.value}
                      width={48}
                      height={48}
                      className='mr-2'
                    />
                    <span className='text-3xl text-black font-bold min-w-0 truncate'>
                      {companyNameSignal.value}
                    </span>
                  </>
                ) : (
                  <span className='text-3xl text-black min-w-0 truncate'>
                    {companyNameSignal.value}
                  </span>
                )}
              </>
            )}
          </div>

          {/* Company subtitle if available */}
          {companyNameSignal.value && (
            <div className='text-center mb-6 text-gray-600'>
              Financial therapy for {companyNameSignal.value} employees
            </div>
          )}

          {/* Vertically centered login card content */}
          <div className='w-full max-w-md relative z-10 flex flex-col h-full'>
            <div className='flex-1 flex flex-col justify-center'>
              <LoginForm />
            </div>
          </div>
        </div>
      </div>
    </PageUtmHandler>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginPageContent />
    </Suspense>
  );
}
