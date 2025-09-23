# Partnerships Feature

This feature provides a comprehensive partnerships page for the Renavest application, showcasing partnership opportunities and guiding potential partners through the collaboration process.

## Overview

The Partnerships feature is cloned from the Home feature and adapted to focus on partnership opportunities, including:
- Financial therapist network partnerships
- Enterprise integration partnerships  
- Wellness platform partnerships
- Technology partnerships

## Components

### Layout Components
- **HeroSection**: Partnership-focused hero section
- **Navbar**: Navigation with partnership-specific links
- **Footer**: Standard footer component

### Section Components
- **BusinessImpactSection**: Partnership opportunities overview
- **WhatWeDoSection**: Different partnership models
- **WhatIsFinancialTherapySection**: Why partner with Renavest
- **JasmineJourneySection**: Partnership journey/process
- **TestimonialSection**: Partner success stories

### Interactive Components
- **CTAButton**: Call-to-action button for partnerships
- **JourneyStep**: Individual step in partnership journey
- **PilotCohortBanner**: Partnership pilot program banner
- **DataCardExample**: Example of partnership data insights

## Key Differences from Home Feature

1. **Content Focus**: All content is partnership-focused rather than employee-focused
2. **Tracking Events**: Analytics events are prefixed with "partnerships_" for better segmentation
3. **CTA Actions**: Call-to-action buttons direct to partnership consultations rather than general demos
4. **Journey Steps**: Modified to show partnership onboarding process rather than employee journey
5. **Testimonials**: Partner testimonials instead of user testimonials

## Usage

```typescript
import {
  HeroSection,
  WhatWeDoSection,
  BusinessImpactSection,
  // ... other components
} from '@/src/features/partnerships';

// Use in your partnerships page
function PartnershipsPage() {
  return (
    <div>
      <HeroSection />
      <BusinessImpactSection />
      <WhatWeDoSection />
      {/* ... other sections */}
    </div>
  );
}
```

## Types

All types are defined in `types.ts` and can be imported separately:

```typescript
import type { 
  JourneyStepData, 
  PartnershipOpportunity,
  CTAButtonProps 
} from '@/src/features/partnerships/types';
```

## Analytics

Partnership-specific tracking events include:
- `partnerships_navigation:link_clicked_v1`
- `partnerships_page_cta_clicked`
- `partnerships_section:viewed_v1`
- `partnerships_opportunity:selected`
- `partnerships_benefit:hover_v1`

## Route Setup

The partnerships route is located in the public route group at `/src/app/(public)/partnerships/page.tsx` to ensure it's publicly accessible without authentication:

```typescript
'use client';

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
} from '@/src/features/partnerships';

const inter = Inter({ subsets: ['latin'] });

function PartnershipsContent() {
  const searchParams = useSearchParams();
  const { user: clerkUser } = useClerk();

  useEffect(() => {
    // Track partnerships page view
    if (typeof window !== 'undefined') {
      posthog.capture('partnerships_page_viewed', {
        referrer: document.referrer,
        url: window.location.href,
        utm_source: searchParams.get('utm_source'),
        utm_medium: searchParams.get('utm_medium'),
        utm_campaign: searchParams.get('utm_campaign'),
        user_id: clerkUser?.id || null,
        page_type: 'partnerships',
      });
    }
  }, [searchParams, clerkUser]);

  return (
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
  );
}

export default function PartnershipsPage() {
  return (
    <Suspense fallback={<div>Loading partnerships page...</div>}>
      <PartnershipsContent />
    </Suspense>
  );
}
```