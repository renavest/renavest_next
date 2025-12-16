/**
 * Partnerships Feature - Centralized Exports
 *
 * This file provides a single entry point for all partnerships feature components,
 * types, and utilities, enabling clean imports throughout the application.
 *
 * @example
 * import { HeroSection, CTAButton, JourneyStep } from '@/src/features/partnerships';
 * import type { JourneyStepData, CTAButtonProps } from '@/src/features/partnerships/types';
 */

// ====================================
// COMPONENT EXPORTS
// ====================================

// Core layout components
export { default as Navbar } from './components/layout/Navbar';
export { default as Footer } from './components/layout/Footer';

// Content section components
export { default as WhatWeDoSection } from './components/sections/WhatWeDoSection';
export { default as TestimonialSection } from './components/sections/TestimonialSection';
export { default as BusinessImpactSection } from './components/sections/BusinessImpactSection';
export { default as WhatIsFinancialTherapySection } from './components/sections/WhatIsFinancialTherapySection';
export { default as JasmineJourneySection } from './components/sections/JasmineJourneySection';

// Interactive components
export { default as JourneyStep } from './components/interactive/JourneyStep';
export { default as CTAButton } from './components/interactive/CTAButton';
export { default as PilotCohortBanner } from './components/interactive/PilotCohortBanner';
export { default as DataCardExample } from './components/interactive/DataCardExample';

// ====================================
// TYPE EXPORTS - REMOVED
// ====================================
// Types are now imported directly from './types' to avoid duplication
// Example: import type { JourneyStepData, CTAButtonProps } from '@/src/features/partnerships/types';

// ====================================
// UTILITY EXPORTS
// ====================================

// Tracking utilities
export {
  trackNavClick,
  trackCtaClick,
  trackSectionView,
  trackMobileMenuToggle,
  trackPartnershipOpportunitySelection,
  trackPartnershipBenefitHover,
  trackPartnershipTestimonialView,
  trackPartnershipPilotInteraction,
  identifyPartner,
  setPartnerProperties,
  isTrackingAvailable,
  getCurrentTrackingContext,
} from './utils/trackingUtils';

// ====================================
// FEATURE METADATA
// ====================================

/**
 * Partnerships feature metadata for debugging and documentation
 */
export const PARTNERSHIPS_FEATURE_META = {
  name: 'Partnerships Feature',
  version: '1.0.0',
  description: 'Partnership page components and utilities for the Renavest application',
  components: [
    'Navbar',
    'Footer',
    'WhatWeDoSection',
    'TestimonialSection',
    'BusinessImpactSection',
    'WhatIsFinancialTherapySection',
    'JasmineJourneySection',
    'JourneyStep',
    'CTAButton',
    'PilotCohortBanner',
    'DataCardExample',
  ],
  utilities: ['trackingUtils'],
  integrations: [
    'PostHog Analytics',
    'Clerk Authentication',
    'Preact Signals',
    'Next.js',
    'Tailwind CSS',
  ],
} as const;