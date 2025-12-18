'use client';

// URL Parameter Format Examples:
// ?partner_type=therapist&company=ABC&first_name=John&last_name=Doe
// ?partner_type=enterprise&company=XYZ&audience=corporate

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
  JasmineJourneySection,
  Navbar,
  PilotCohortBanner,
  WhatIsFinancialTherapySection,
  WhatWeDoSection,
} from '@/src/features/partnerships';
import { setupReferralAttribution } from '@/src/lib/referralTracking';

const inter = Inter({ subsets: ['latin'] });

function PartnershipsContent() {
  const searchParams = useSearchParams();
  const { user: clerkUser } = useClerk();

  useEffect(() => {
    // Handle referral attribution if a referral link was used
    const referrerId = setupReferralAttribution();

    // Track partnerships page view with partner-specific context
    if (typeof window !== 'undefined') {
      posthog.capture('partnerships_page_viewed', {
        referrer: document.referrer,
        url: window.location.href,
        utm_source: searchParams.get('utm_source'),
        utm_medium: searchParams.get('utm_medium'),
        utm_campaign: searchParams.get('utm_campaign'),
        utm_term: searchParams.get('utm_term'),
        utm_content: searchParams.get('utm_content'),
        referrer_id: referrerId || null,
        user_id: clerkUser?.id || null,
        company: searchParams.get('company'),
        first_name: searchParams.get('first_name'),
        last_name: searchParams.get('last_name'),
        partner_type: searchParams.get('partner_type'),
        page_type: 'partnerships',
      });
    }
  }, [searchParams, clerkUser]);

  return (
    <>
      <Head>
        {/* Additional structured data for partnerships page */}
        <script
          type='application/ld+json'
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'WebPage',
              '@id': 'https://renavestapp.com/partnerships#webpage',
              url: 'https://renavestapp.com/partnerships',
              name: 'Renavest Partnerships - Financial Therapy Partner Network',
              isPartOf: {
                '@id': 'https://renavestapp.com/#website',
              },
              about: {
                '@id': 'https://renavestapp.com/#organization',
              },
              description:
                'Join the Renavest partner network. Connect with certified financial therapists, integrate our platform, or explore enterprise partnership opportunities in the financial wellness space.',
              breadcrumb: {
                '@id': 'https://renavestapp.com/partnerships#breadcrumb',
              },
              inLanguage: 'en-US',
              potentialAction: [
                {
                  '@type': 'ReadAction',
                  target: ['https://renavestapp.com/partnerships'],
                },
              ],
            }),
          }}
        />

        {/* Partnership FAQ structured data */}
        <script
          type='application/ld+json'
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'FAQPage',
              mainEntity: [
                {
                  '@type': 'Question',
                  name: 'What types of partnerships does Renavest offer?',
                  acceptedAnswer: {
                    '@type': 'Answer',
                    text: 'Renavest offers multiple partnership models including joining our certified financial therapist network, enterprise integrations for corporate wellness providers, and white-label solutions for wellness platforms.',
                  },
                },
                {
                  '@type': 'Question',
                  name: 'How do I become a certified financial therapist partner?',
                  acceptedAnswer: {
                    '@type': 'Answer',
                    text: 'To join our therapist network, you need appropriate financial therapy certifications and experience. Our AI-powered matching system connects you with clients who are the best fit for your specializations and approach.',
                  },
                },
                {
                  '@type': 'Question',
                  name: 'What are the benefits of partnering with Renavest?',
                  acceptedAnswer: {
                    '@type': 'Answer',
                    text: 'Partners benefit from access to our growing market, proven results, comprehensive support including training and technical assistance, and continuous platform innovation.',
                  },
                },
              ],
            }),
          }}
        />
      </Head>

      <div style={{ backgroundColor: 'bg-#9071FF' }} className={` ${inter.className}`}>
        <Navbar />
        <BusinessImpactSection />
        <WhatWeDoSection />
        <WhatIsFinancialTherapySection />
        <JasmineJourneySection />
        <PilotCohortBanner />
        <Footer />
      </div>
    </>
  );
}

export default function PartnershipsPage() {
  return (
    <Suspense fallback={<div>Loading partnerships page...</div>}>
      <PartnershipsContent />
    </Suspense>
  );
}