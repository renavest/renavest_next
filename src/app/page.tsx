'use client';

import { Inter } from 'next/font/google';
import { useSearchParams } from 'next/navigation';
import { useEffect } from 'react';
import { Suspense } from 'react';

import BusinessImpactSection from '@/src/features/home/components/BusinessImpactSection';
import Footer from '@/src/features/home/components/Footer';
import HeroSection from '@/src/features/home/components/HeroSection';
import JasmineJourneySection from '@/src/features/home/components/JasmineJourneySection';
import Navbar from '@/src/features/home/components/Navbar';
import TestimonialSection from '@/src/features/home/components/TestimonialSection';
import WhatIsFinancialTherapySection from '@/src/features/home/components/WhatIsFinancialTherapySection';
import { ctaTextSignal } from '@/src/features/home/state/ctaSignals';

const inter = Inter({ subsets: ['latin'] });

function HomeComponent() {
  const searchParams = useSearchParams();

  useEffect(() => {
    let isEmployee: boolean | null = null;
    const param = searchParams.get('employee');
    if (param !== null) {
      isEmployee = param === 'true';
      localStorage.setItem('isEmployee', isEmployee ? 'true' : 'false');
    } else {
      const stored = localStorage.getItem('isEmployee');
      if (stored === 'true' || stored === 'false') {
        isEmployee = stored === 'true';
      }
    }
    ctaTextSignal.value = isEmployee ? 'Get Started' : 'Book a Demo';
  }, [searchParams]);

  return (
    <div className={`min-h-screen bg-white ${inter.className}`}>
      <Navbar />
      <HeroSection />
      <JasmineJourneySection />
      <WhatIsFinancialTherapySection />
      <BusinessImpactSection />
      <TestimonialSection />
      <Footer />
    </div>
  );
}

export default function HomePage() {
  return (
    <div>
      <Suspense fallback={<div>Loading...</div>}>
        <HomeComponent />
      </Suspense>
    </div>
  );
}
