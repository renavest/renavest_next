'use client';

// URL Parameter Format Examples:
// ?employee=true&company=Google&first_name=Seth&last_name=Morton
// ?employee=false&company=Tesla&color=blue&audience=enterprise

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
import ParallaxWrapper from '@/src/features/parallax/ParallaxWrapper';
import { setupReferralAttribution } from '@/src/lib/referralTracking';

const inter = Inter({ subsets: ['latin'] });

function HomeContent() {
  const searchParams = useSearchParams();
  const { user: clerkUser } = useClerk();

  useEffect(() => {
    // Handle referral attribution if a referral link was used
    const referrerId = setupReferralAttribution();

    // Track page view with user type and referral data
    if (typeof window !== 'undefined') {
      posthog.capture('landing_page_viewed', {
        referrer: document.referrer,
        url: window.location.href,
        utm_source: searchParams.get('utm_source'),
        utm_medium: searchParams.get('utm_medium'),
        utm_campaign: searchParams.get('utm_campaign'),
        utm_term: searchParams.get('utm_term'),
        utm_content: searchParams.get('utm_content'),
        referrer_id: referrerId || null, // Track the referrer ID from the attribution setup
        user_id: clerkUser?.id || null, // Include user ID if signed in
        company: searchParams.get('company'),
        first_name: searchParams.get('first_name'),
        last_name: searchParams.get('last_name'),
        is_employee: searchParams.get('employee') === 'true',
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
