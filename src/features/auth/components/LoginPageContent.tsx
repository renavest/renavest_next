// app/login/LoginPageContent.tsx
'use client';

import { useUser } from '@clerk/nextjs';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import React, { useEffect } from 'react';

// Assuming these utility/context files exist based on your tree structure
import companyInfo from '@/src/features/utm/companyInfo'; // Placeholder
import PageUtmHandler from '@/src/features/utm/PageText'; // Placeholder component wrapping content
import { companyNameSignal } from '@/src/features/utm/utmCustomDemo'; // Placeholder signal // Assuming this signal exists

import { trackAuthPageView } from '../utils/authTracking'; // Assuming this tracking utility exists
import { useRoleBasedRedirect } from '../utils/routerUtil';

import AuthenticationFlow from './AuthenticationFlow'; // The main component handling the flow

function TestimonialSection() {
  // Testimonial/Quote - Keep as is from your provided code
  const quote =
    'My session with financial therapy coach Paige was nothing short of transformative. Her insight, compassion, and affirming guidance created a space where I felt truly seen and empowered... ';
  const quoteName = 'Essma Litim';
  const quoteTitle = 'Renavest User';
  const personImage = 'https://d2qcuj7ucxw61o.cloudfront.net/esmaa_testimonial.png'; // Example image URL

  return (
    <div className='flex flex-col items-center justify-center w-full h-full min-h-screen bg-[#f7f5ff] px-6'>
      <div className='max-w-md w-full flex flex-col items-center justify-center text-center'>
        <div className='text-gray-900 text-xl md:text-2xl font-normal leading-snug mb-8 mt-8 md:mt-0'>
          "{quote}"
        </div>
        {/* Use Next/Image for optimized images */}
        <Image
          src={personImage}
          alt={quoteName}
          width={48}
          height={48}
          className='rounded-full object-cover border-2 border-purple-100 shadow-sm mb-3'
          priority // Mark as priority if it's above the fold
        />
        <div className='text-base text-gray-900 font-semibold'>{quoteName}</div>
        <div className='text-sm text-gray-500'>{quoteTitle}</div>
      </div>
    </div>
  );
}

export default function LoginPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user } = useUser();
  const { redirectToRoleReplace } = useRoleBasedRedirect();

  useEffect(() => {
    console.log('user', user);
    if (user) {
      redirectToRoleReplace(user);
    }
    // utm
    const company = searchParams?.get('company');
    if (company) {
      // Assuming setCompanyIntegration updates a signal or context
      companyNameSignal.value = company;
    }
    // Track page view using the utility
    trackAuthPageView('/login', { company: company || 'none' });
  }, [searchParams, router, user, redirectToRoleReplace]);

  return (
    // PageUtmHandler is assumed to be a context or wrapper component
    <PageUtmHandler>
      <div className='min-h-screen flex flex-col lg:flex-row bg-gradient-to-br from-purple-50 via-[#f7f5ff] to-[#faf9f6]'>
        {/* Global CSS for animation - Keep as is */}
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
        {/* Testimonial Section */}
        <div className='order-2 lg:order-1 w-full lg:w-4/12 flex items-center justify-center p-0'>
          <TestimonialSection />
        </div>
        {/* Login/Auth Flow Section */}
        <div className='order-1 lg:order-2 w-full lg:w-8/12 flex flex-col items-center bg-white p-12 relative overflow-hidden'>
          {/* Renavest × Company row */}
          <div className='flex w-full justify-center items-center my-6 space-x-4'>
            {/* Renavest Logo */}
            <Image
              src='/renavestlogo.png' // Example logo path
              alt='Renavest'
              width={48}
              height={48}
              className='w-12 h-12'
            />
            {/* Renavest Title */}
            <span className='text-4xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-[#9071FF] to-[#6A4BFF]'>
              Renavest
            </span>
            {/* Company Integration Display (if companyNameSignal has a value) */}
            {companyNameSignal.value && (
              <>
                <span className='text-gray-400 text-3xl mx-3'>×</span>
                {/* Check if companyInfo has logoSrc, otherwise display just name */}
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

          {/* Wrapper for Vertical Centering below header */}
          <div className='flex-1 flex flex-col justify-center w-full max-w-2xl mx-auto'>
            {/* Authentication Flow Component */}
            {/* This component will render the appropriate step (Login, Onboarding, etc.) */}
            <div className='w-full relative z-10 mx-auto'>
              <AuthenticationFlow />
            </div>
          </div>
        </div>
      </div>
    </PageUtmHandler>
  );
}
