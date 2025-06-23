/**
 * Home Feature - Centralized Exports
 *
 * This file provides a single entry point for all home feature components,
 * types, and utilities, enabling clean imports throughout the application.
 *
 * @example
 * import { HeroSection, CTAButton, JourneyStep } from '@/src/features/home';
 * import type { JourneyStepData, CTAButtonProps } from '@/src/features/home';
 */

// ====================================
// COMPONENT EXPORTS
// ====================================

// Core layout components
export { default as HeroSection } from './components/layout/HeroSection';
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
// TYPE EXPORTS
// ====================================

// Core journey types
export type { JourneyStepData, JourneySectionProps } from './types';

// Component prop types
export type {
  AnimatedTitleProps,
  AnimatedHeadingProps,
  AnimatedDescriptionProps,
  CTAButtonProps,
  TestimonialCardProps,
  MobileNavLinkProps,
  DesktopNavigationProps,
  MobileNavLinksProps,
} from './types';

// Business & analytics types
export type {
  BusinessImpactStat,
  CountdownTime,
  TrackingContext,
  NavClickEvent,
  SectionViewEvent,
} from './types';

// Utility types
export type { ComponentWithChildren, ComponentWithClassName, IntersectionConfig } from './types';

// ====================================
// UTILITY EXPORTS
// ====================================

// Tracking utilities
export {
  trackNavClick,
  trackCtaClick,
  trackSectionView,
  trackMobileMenuToggle,
  trackWhatWeDoCardSelection,
  trackBusinessImpactStatHover,
  trackTestimonialView,
  trackPilotCohortInteraction,
  identifyUser,
  setUserProperties,
  isTrackingAvailable,
  getCurrentTrackingContext,
} from './utils/trackingUtils';

// Animation utilities
export {
  createVisibilityObserver,
  createOneTimeVisibilityObserver,
  observeElement,
  calculateAnimationDelay,
  generateStaggeredDelays,
  getFadeInClasses,
  getSlideInClasses,
  getScaleInClasses,
  calculateTimeRemaining,
  formatTimeValue,
  isMobileDevice,
  getResponsiveAnimationDuration,
  debounce,
  throttle,
} from './utils/animationUtils';

// ====================================
// FEATURE METADATA
// ====================================

/**
 * Home feature metadata for debugging and documentation
 */
export const HOME_FEATURE_META = {
  name: 'Home Feature',
  version: '1.0.0',
  description: 'Landing page components and utilities for the Renavest application',
  components: [
    'HeroSection',
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
  utilities: ['trackingUtils', 'animationUtils'],
  integrations: [
    'PostHog Analytics',
    'Clerk Authentication',
    'Preact Signals',
    'Next.js',
    'Tailwind CSS',
  ],
} as const;
