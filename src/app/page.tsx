'use client';

// URL Parameter Format Examples:
// ?employee=true&company=Google&first_name=Seth&last_name=Morton
// ?employee=false&company=Tesla&color=blue&audience=enterprise

import { useClerk } from '@clerk/nextjs';
import { Inter } from 'next/font/google';
import Head from 'next/head';
import { useSearchParams } from 'next/navigation';
import posthog from 'posthog-js';
import { useEffect } from 'react';
import { Suspense } from 'react';

import {
  BusinessImpactSection,
  Footer,
  HeroSection,
  JasmineJourneySection,
  Navbar,
  PilotCohortBanner,
  TestimonialSection,
  WhatIsFinancialTherapySection,
  WhatWeDoSection,
} from '@/src/features/home';
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
    <>
      <Head>
        {/* Additional structured data for home page */}
        <script
          type='application/ld+json'
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'WebPage',
              '@id': 'https://renavestapp.com/#webpage',
              url: 'https://renavestapp.com',
              name: 'Renavest - Financial Therapy for Workplace Wellness',
              isPartOf: {
                '@id': 'https://renavestapp.com/#website',
              },
              about: {
                '@id': 'https://renavestapp.com/#organization',
              },
              description:
                'Transform your workplace with financial therapy. Renavest connects businesses with certified financial therapists to reduce employee financial stress and boost productivity by up to 15%.',
              breadcrumb: {
                '@id': 'https://renavestapp.com/#breadcrumb',
              },
              inLanguage: 'en-US',
              potentialAction: [
                {
                  '@type': 'ReadAction',
                  target: ['https://renavestapp.com'],
                },
              ],
            }),
          }}
        />

        {/* FAQ structured data */}
        <script
          type='application/ld+json'
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'FAQPage',
              mainEntity: [
                {
                  '@type': 'Question',
                  name: 'What is financial therapy?',
                  acceptedAnswer: {
                    '@type': 'Answer',
                    text: 'Financial therapy combines financial planning with therapeutic techniques to help people understand and improve their relationship with money. It addresses the emotional and psychological aspects of financial decisions.',
                  },
                },
                {
                  '@type': 'Question',
                  name: 'How does financial therapy help employees?',
                  acceptedAnswer: {
                    '@type': 'Answer',
                    text: 'Financial therapy helps employees reduce financial stress, improve decision-making, and develop healthier money habits. This leads to increased workplace productivity, reduced absenteeism, and improved overall wellbeing.',
                  },
                },
                {
                  '@type': 'Question',
                  name: 'What are the benefits for employers?',
                  acceptedAnswer: {
                    '@type': 'Answer',
                    text: 'Employers see reduced turnover, increased productivity, lower healthcare costs, and improved employee satisfaction. Financial stress costs employers an average of $2,500 per employee annually in lost productivity.',
                  },
                },
              ],
            }),
          }}
        />
      </Head>

      <div className={`min-h-screen bg-white ${inter.className}`}>
        <Navbar />
        <HeroSection />
        <BusinessImpactSection />
        <WhatWeDoSection />
        <WhatIsFinancialTherapySection />
        <JasmineJourneySection />
        <TestimonialSection />
        <PilotCohortBanner />
        <Footer />
      </div>
    </>
  );
}

export default function HomePage() {
  return (
    <Suspense fallback={<div>Loading home page...</div>}>
      <HomeContent />
    </Suspense>
  );
}
