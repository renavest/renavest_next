/**
 * Home Feature Analytics & Tracking Utilities
 *
 * Centralized tracking functions for PostHog analytics integration
 * throughout the home feature components.
 */

import posthog from 'posthog-js';
import type { NavClickEvent, SectionViewEvent, TrackingContext } from '../types';

// ====================================
// CORE TRACKING FUNCTIONS
// ====================================

/**
 * Track navigation link clicks with context
 * @param link_name - Name of the link clicked
 * @param is_mobile - Whether clicked on mobile device
 * @param userContext - Additional user context
 */
export const trackNavClick = (
  link_name: string,
  is_mobile: boolean = false,
  userContext: TrackingContext = {},
): void => {
  if (typeof window !== 'undefined') {
    posthog.capture('navigation:link_clicked_v1', {
      link_name,
      device_type: is_mobile ? 'mobile' : 'desktop',
      url: window.location.href,
      timestamp: new Date().toISOString(),
      ...userContext,
    } as NavClickEvent);
  }
};

/**
 * Track CTA button clicks with enhanced context
 * @param cta_type - Type of CTA (primary, secondary, etc.)
 * @param cta_text - Text displayed on the CTA
 * @param position - Position/section where CTA appears
 * @param is_mobile - Whether clicked on mobile device
 */
export const trackCtaClick = (
  cta_type: string,
  cta_text: string,
  position: string = 'landing_page',
  is_mobile: boolean = false,
): void => {
  if (typeof window !== 'undefined') {
    posthog.capture('landing_page_cta_clicked', {
      cta_type,
      cta_text,
      device_type: is_mobile ? 'mobile' : 'desktop',
      position,
      url: window.location.href,
      timestamp: new Date().toISOString(),
    });
  }
};

/**
 * Track section visibility with enhanced context
 * @param section_name - Name of the section viewed
 * @param userContext - Additional user context
 */
export const trackSectionView = (section_name: string, userContext: TrackingContext = {}): void => {
  if (typeof window !== 'undefined') {
    posthog.capture('section:viewed_v1', {
      section_name,
      url: window.location.href,
      visibility_timestamp: new Date().toISOString(),
      ...userContext,
    } as SectionViewEvent);
  }
};

/**
 * Track mobile menu toggle actions
 * @param action - Whether menu was opened or closed
 */
export const trackMobileMenuToggle = (action: 'opened' | 'closed'): void => {
  if (typeof window !== 'undefined') {
    posthog.capture('mobile_menu_toggled', {
      action,
      url: window.location.href,
      timestamp: new Date().toISOString(),
    });
  }
};

// ====================================
// SPECIALIZED TRACKING FUNCTIONS
// ====================================

/**
 * Track card selection in What We Do section
 * @param cardNumber - Number of the selected card
 */
export const trackWhatWeDoCardSelection = (cardNumber: number): void => {
  if (typeof window !== 'undefined') {
    posthog.capture('what_we_do:card_selected', {
      card_number: cardNumber,
      section: 'what_we_do',
      url: window.location.href,
      timestamp: new Date().toISOString(),
    });
  }
};

/**
 * Track business impact stat hover events
 * @param stat_name - Name of the statistic
 * @param stat_value - Value of the statistic
 * @param userContext - Additional user context
 */
export const trackBusinessImpactStatHover = (
  stat_name: string,
  stat_value: string,
  userContext: TrackingContext = {},
): void => {
  if (typeof window !== 'undefined') {
    posthog.capture('business_impact:stat_hover_v1', {
      stat_name,
      stat_value,
      section: 'business_impact',
      url: window.location.href,
      timestamp: new Date().toISOString(),
      ...userContext,
    });
  }
};

/**
 * Track testimonial section viewing
 */
export const trackTestimonialView = (): void => {
  if (typeof window !== 'undefined') {
    posthog.capture('section_viewed', {
      section_name: 'testimonial',
      url: window.location.href,
      visibility_time: new Date().toISOString(),
    });
  }
};

/**
 * Track pilot cohort banner interactions
 * @param action - Type of interaction (viewed, demo_booked)
 * @param cohort_end_date - End date of the pilot cohort
 */
export const trackPilotCohortInteraction = (
  action: 'viewed' | 'demo_booked',
  cohort_end_date: Date,
): void => {
  if (typeof window !== 'undefined') {
    const eventName =
      action === 'viewed' ? 'pilot_cohort_banner_viewed' : 'pilot_cohort_demo_booked';

    posthog.capture(eventName, {
      timestamp: new Date().toISOString(),
      cohort_end_date: cohort_end_date.toISOString(),
    });
  }
};

// ====================================
// USER IDENTIFICATION FUNCTIONS
// ====================================

/**
 * Identify user with PostHog for enhanced tracking
 * @param userId - Unique user identifier
 * @param properties - Additional user properties
 */
export const identifyUser = (userId: string, properties: Record<string, any> = {}): void => {
  if (typeof window !== 'undefined') {
    posthog.identify(userId, properties);
  }
};

/**
 * Set user properties for tracking context
 * @param properties - User properties to set
 */
export const setUserProperties = (properties: Record<string, any>): void => {
  if (typeof window !== 'undefined') {
    posthog.setPersonProperties(properties);
  }
};

// ====================================
// UTILITY FUNCTIONS
// ====================================

/**
 * Check if PostHog is available and initialized
 * @returns Whether PostHog is ready for tracking
 */
export const isTrackingAvailable = (): boolean => {
  return typeof window !== 'undefined' && !!posthog;
};

/**
 * Get current tracking context
 * @returns Basic tracking context object
 */
export const getCurrentTrackingContext = (): TrackingContext => {
  if (typeof window === 'undefined') {
    return {};
  }

  return {
    url: window.location.href,
    timestamp: new Date().toISOString(),
  };
};
