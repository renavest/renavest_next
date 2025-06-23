/**
 * Home Feature Type Definitions
 *
 * This file contains all TypeScript type definitions used throughout
 * the home feature, providing a centralized type system for better
 * maintainability and developer experience.
 */

import type { ElementType } from 'react';

// ====================================
// JOURNEY & TESTIMONIAL TYPES
// ====================================

/**
 * Represents a step in the customer journey/onboarding flow
 * Used in journey sections to show progression and features
 */
export type JourneyStepData = {
  /** Icon component to display for this step */
  icon: ElementType;
  /** Step title (format: "Phase: Description") */
  title: string;
  /** Detailed description of what happens in this step */
  description: string;
  /** Background color class for the step container */
  bg: string;
  /** Optional HR insight text for business impact */
  hrInsight?: string;
  /** Optional main image URL for visual representation */
  image?: string;
  /** Optional therapist image URL for personalization */
  therapistImage?: string;
};

/**
 * Props for individual journey step components
 * Includes step data and position for animations
 */
export type JourneySectionProps = {
  /** The journey step data */
  step: JourneyStepData;
  /** Step index for animation delays and styling */
  idx: number;
};

// ====================================
// COMPONENT PROPS TYPES
// ====================================

/**
 * Props for animated title components in journey steps
 */
export type AnimatedTitleProps = {
  /** Title text to display */
  title: string;
  /** Whether the component is visible (for animations) */
  isVisible: boolean;
  /** CSS animation delay value */
  animationDelay: string;
  /** Icon component to display alongside title */
  icon: ElementType;
};

/**
 * Props for animated heading components
 */
export type AnimatedHeadingProps = {
  /** Heading text to display */
  title: string;
  /** Whether the component is visible (for animations) */
  isVisible: boolean;
  /** CSS animation delay value */
  animationDelay: string;
};

/**
 * Props for animated description components
 */
export type AnimatedDescriptionProps = {
  /** Description text to display */
  description: string;
  /** Whether the component is visible (for animations) */
  isVisible: boolean;
  /** CSS animation delay value */
  animationDelay: string;
};

/**
 * Props for CTA button component
 * Supports custom styling and click tracking
 */
export type CTAButtonProps = {
  /** Optional CSS classes for custom styling */
  className?: string;
  /** Optional click handler override */
  onClick?: () => void;
  /** Optional custom text override */
  text?: string;
};

/**
 * Props for testimonial card component
 */
export type TestimonialCardProps = {
  /** Whether the card is visible (for animations) */
  isVisible: boolean;
  /** Ref for intersection observer */
  sectionRef: React.RefObject<HTMLDivElement | null>;
};

// ====================================
// BUSINESS METRICS TYPES
// ====================================

/**
 * Represents a business impact statistic
 * Used in business impact sections
 */
export type BusinessImpactStat = {
  /** Unique identifier for tracking */
  id: string;
  /** Statistic name for analytics */
  name: string;
  /** Display value (e.g., "34% increase") */
  value: string;
  /** Icon component to display */
  icon: ElementType;
  /** Detailed description */
  description: string;
};

// ====================================
// COUNTDOWN & TIMING TYPES
// ====================================

/**
 * Countdown timer state for pilot cohort banner
 */
export type CountdownTime = {
  /** Remaining days */
  days: number;
  /** Remaining hours */
  hours: number;
  /** Remaining minutes */
  minutes: number;
  /** Remaining seconds */
  seconds: number;
};

// ====================================
// ANALYTICS & TRACKING TYPES
// ====================================

/**
 * PostHog tracking context for user events
 */
export type TrackingContext = {
  /** User ID if available */
  user_id?: string;
  /** Company ID if available */
  company_id?: string;
  /** Current page URL */
  url?: string;
  /** Timestamp of the event */
  timestamp?: string;
};

/**
 * Navigation click tracking data
 */
export type NavClickEvent = {
  /** Name of the link clicked */
  link_name: string;
  /** Device type (mobile/desktop) */
  device_type: 'mobile' | 'desktop';
  /** Current URL */
  url: string;
} & TrackingContext;

/**
 * Section view tracking data
 */
export type SectionViewEvent = {
  /** Name of the section viewed */
  section_name: string;
  /** Visibility timestamp */
  visibility_timestamp: string;
  /** Current URL */
  url: string;
} & TrackingContext;

// ====================================
// NAVIGATION TYPES
// ====================================

/**
 * Mobile navigation link props
 */
export type MobileNavLinkProps = {
  /** Link destination */
  href: string;
  /** Icon component to display */
  icon: React.ReactNode;
  /** Link label text */
  label: string;
  /** Function to call when closing mobile menu */
  onClose: () => void;
};

/**
 * Desktop navigation props
 */
export type DesktopNavigationProps = {
  /** Whether user is signed in */
  isSignedIn: boolean;
};

/**
 * Mobile navigation links props
 */
export type MobileNavLinksProps = {
  /** Function to call when closing mobile menu */
  onClose: () => void;
  /** Whether user is signed in */
  isSignedIn: boolean;
};

// ====================================
// UTILITY TYPES
// ====================================

/**
 * Generic component with children
 */
export type ComponentWithChildren = {
  children: React.ReactNode;
};

/**
 * Generic component with optional className
 */
export type ComponentWithClassName = {
  className?: string;
};

/**
 * Intersection observer configuration
 */
export type IntersectionConfig = {
  /** Threshold for triggering visibility */
  threshold: number;
  /** Root margin for early triggering */
  rootMargin?: string;
};
