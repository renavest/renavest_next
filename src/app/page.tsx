'use client';

import { useClerk } from '@clerk/nextjs';
import { Inter } from 'next/font/google';
import { useSearchParams } from 'next/navigation';
import posthog from 'posthog-js';
import { useEffect } from 'react';
import { Suspense } from 'react';

import BusinessImpactSection from '@/src/features/home/components/BusinessImpactSection';
import Footer from '@/src/features/home/components/Footer';
import HeroSection from '@/src/features/home/components/HeroSection';
import JasmineJourneySection from '@/src/features/home/components/JasmineJourneySection';
import Navbar from '@/src/features/home/components/Navbar';
import TestimonialSection from '@/src/features/home/components/TestimonialSection';
import WhatIsFinancialTherapySection from '@/src/features/home/components/WhatIsFinancialTherapySection';
import { ctaTextSignal, isEmployeeSignal } from '@/src/features/home/state/ctaSignals';
import ParallaxWrapper from '@/src/features/parallax/ParallaxWrapper';
import { setupReferralAttribution } from '@/src/lib/referralTracking';

const inter = Inter({ subsets: ['latin'] });

function HomeContent() {
  const searchParams = useSearchParams();
  const { user: clerkUser } = useClerk();

  useEffect(() => {
    let isEmployee: boolean | null = null;
    const param = searchParams.get('employee');
    if (param !== null) {
      isEmployee = param === 'true';
      localStorage.setItem('isEmployee', isEmployee ? 'true' : 'false');
      isEmployeeSignal.value = isEmployee;
    } else {
      const stored = localStorage.getItem('isEmployee');
      if (stored === 'true' || stored === 'false') {
        isEmployee = stored === 'true';
        isEmployeeSignal.value = isEmployee;
      }
    }
    ctaTextSignal.value = isEmployee ? 'Get Started' : 'Book a Demo';

    // Handle referral attribution if a referral link was used
    const referrerId = setupReferralAttribution();

    // Track page view with user type and referral data
    if (typeof window !== 'undefined') {
      posthog.capture('landing_page_viewed', {
        is_employee: isEmployee,
        referrer: document.referrer,
        url: window.location.href,
        utm_source: searchParams.get('utm_source'),
        utm_medium: searchParams.get('utm_medium'),
        utm_campaign: searchParams.get('utm_campaign'),
        referrer_id: referrerId || null, // Track the referrer ID from the attribution setup
        user_id: clerkUser?.id || null, // Include user ID if signed in
      });
    }
  }, [searchParams, clerkUser]);

  return (
    <div className={`min-h-screen bg-white ${inter.className}`}>
      <Navbar />
      <ParallaxWrapper>
        <HeroSection />
        <JasmineJourneySection />
        <WhatIsFinancialTherapySection />
        <BusinessImpactSection />
        <TestimonialSection />
      </ParallaxWrapper>
      <Footer />
    </div>
  );
}

export default function HomePage() {
  return (
    <Suspense fallback={<div>Loading home page...</div>}>
      <HomeContent />
    </Suspense>
  );
}
