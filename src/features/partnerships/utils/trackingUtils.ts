/**
 * Partnerships Feature Analytics & Tracking Utilities
 *
 * Centralized tracking functions for PostHog analytics integration
 * throughout the partnerships feature components.
 */

import posthog from 'posthog-js';
import type { NavClickEvent, SectionViewEvent, TrackingContext } from '../types';

// ====================================
// CORE TRACKING FUNCTIONS
// ====================================

/**
 * Track navigation link clicks with context for partnerships
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
    posthog.capture('partnerships_navigation:link_clicked_v1', {
      link_name,
      device_type: is_mobile ? 'mobile' : 'desktop',
      url: window.location.href,
      timestamp: new Date().toISOString(),
      page_type: 'partnerships',
      ...userContext,
    } as NavClickEvent);
  }
};

/**
 * Track CTA button clicks with enhanced context for partnerships
 * @param cta_type - Type of CTA (primary, secondary, etc.)
 * @param cta_text - Text displayed on the CTA
 * @param position - Position/section where CTA appears
 * @param is_mobile - Whether clicked on mobile device
 */
export const trackCtaClick = (
  cta_type: string,
  cta_text: string,
  position: string = 'partnerships_page',
  is_mobile: boolean = false,
): void => {
  if (typeof window !== 'undefined') {
    posthog.capture('partnerships_page_cta_clicked', {
      cta_type,
      cta_text,
      device_type: is_mobile ? 'mobile' : 'desktop',
      position,
      page_type: 'partnerships',
      url: window.location.href,
      timestamp: new Date().toISOString(),
    });
  }
};

/**
 * Track section visibility with enhanced context for partnerships
 * @param section_name - Name of the section viewed
 * @param userContext - Additional user context
 */
export const trackSectionView = (section_name: string, userContext: TrackingContext = {}): void => {
  if (typeof window !== 'undefined') {
    posthog.capture('partnerships_section:viewed_v1', {
      section_name,
      url: window.location.href,
      page_type: 'partnerships',
      visibility_timestamp: new Date().toISOString(),
      ...userContext,
    } as SectionViewEvent);
  }
};

/**
 * Track mobile menu toggle actions for partnerships
 * @param action - Whether menu was opened or closed
 */
export const trackMobileMenuToggle = (action: 'opened' | 'closed'): void => {
  if (typeof window !== 'undefined') {
    posthog.capture('partnerships_mobile_menu_toggled', {
      action,
      page_type: 'partnerships',
      url: window.location.href,
      timestamp: new Date().toISOString(),
    });
  }
};

// ====================================
// SPECIALIZED TRACKING FUNCTIONS
// ====================================

/**
 * Track partnership opportunity selection
 * @param opportunityType - Type of partnership opportunity
 */
export const trackPartnershipOpportunitySelection = (opportunityType: string): void => {
  if (typeof window !== 'undefined') {
    posthog.capture('partnerships_opportunity:selected', {
      opportunity_type: opportunityType,
      section: 'partnerships_what_we_do',
      page_type: 'partnerships',
      url: window.location.href,
      timestamp: new Date().toISOString(),
    });
  }
};

/**
 * Track partnership benefit hover events
 * @param benefit_name - Name of the benefit
 * @param benefit_type - Type of partnership
 * @param userContext - Additional user context
 */
export const trackPartnershipBenefitHover = (
  benefit_name: string,
  benefit_type: string,
  userContext: TrackingContext = {},
): void => {
  if (typeof window !== 'undefined') {
    posthog.capture('partnerships_benefit:hover_v1', {
      benefit_name,
      benefit_type,
      section: 'partnerships_benefits',
      page_type: 'partnerships',
      url: window.location.href,
      timestamp: new Date().toISOString(),
      ...userContext,
    });
  }
};

/**
 * Track partnership testimonial section viewing
 */
export const trackPartnershipTestimonialView = (): void => {
  if (typeof window !== 'undefined') {
    posthog.capture('partnerships_section_viewed', {
      section_name: 'partnerships_testimonial',
      page_type: 'partnerships',
      url: window.location.href,
      visibility_time: new Date().toISOString(),
    });
  }
};

/**
 * Track partnership pilot banner interactions
 * @param action - Type of interaction (viewed, demo_booked)
 * @param pilot_end_date - End date of the partnership pilot
 */
export const trackPartnershipPilotInteraction = (
  action: 'viewed' | 'demo_booked',
  pilot_end_date: Date,
): void => {
  if (typeof window !== 'undefined') {
    const eventName =
      action === 'viewed' ? 'partnerships_pilot_banner_viewed' : 'partnerships_pilot_demo_booked';

    posthog.capture(eventName, {
      timestamp: new Date().toISOString(),
      pilot_end_date: pilot_end_date.toISOString(),
      page_type: 'partnerships',
    });
  }
};

// ====================================
// USER IDENTIFICATION FUNCTIONS
// ====================================

/**
 * Identify potential partner with PostHog for enhanced tracking
 * @param userId - Unique user identifier
 * @param properties - Additional user properties including partnership interest
 */
export const identifyPartner = (userId: string, properties: Record<string, any> = {}): void => {
  if (typeof window !== 'undefined') {
    posthog.identify(userId, {
      ...properties,
      partnership_interest: true,
      partnership_page_visited: new Date().toISOString(),
    });
  }
};

/**
 * Set partnership-specific user properties for tracking context
 * @param properties - Partnership-related user properties to set
 */
export const setPartnerProperties = (properties: Record<string, any>): void => {
  if (typeof window !== 'undefined') {
    posthog.setPersonProperties({
      ...properties,
      last_partnership_page_visit: new Date().toISOString(),
    });
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
 * Get current tracking context for partnerships
 * @returns Basic tracking context object with partnership-specific data
 */
export const getCurrentTrackingContext = (): TrackingContext => {
  if (typeof window === 'undefined') {
    return {};
  }

  return {
    url: window.location.href,
    timestamp: new Date().toISOString(),
    page_type: 'partnerships',
  };
};