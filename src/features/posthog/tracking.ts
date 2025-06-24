import posthog from 'posthog-js';
import { useEffect, RefObject } from 'react';

import type { TrackingContext, FeatureEvent } from './types';

/**
 * Track page section view with consistent format
 */
export const trackSectionView = (
  section_name: string,
  additionalProps: Record<string, unknown> = {},
  userContext: { user_id?: string; company_id?: string } = {},
) => {
  if (typeof window === 'undefined') return;

  const trackingContext: TrackingContext = {
    page: window.location.pathname,
    section: section_name,
    referrer: document.referrer,
  };

  posthog.capture('section:viewed_v1', {
    section_name,
    url: window.location.href,
    viewed_timestamp: new Date().toISOString(),
    ...trackingContext,
    ...userContext,
    ...additionalProps,
  });
};

/**
 * Track UI element interaction
 */
export const trackUIInteraction = (
  interaction_type: string,
  element_name: string,
  additionalProps: Record<string, unknown> = {},
  userContext: { user_id?: string; company_id?: string } = {},
) => {
  if (typeof window === 'undefined') return;

  const trackingContext: TrackingContext = {
    page: window.location.pathname,
    section: element_name,
  };

  posthog.capture(`ui:${interaction_type}_v1`, {
    element_name,
    url: window.location.href,
    interacted_timestamp: new Date().toISOString(),
    ...trackingContext,
    ...userContext,
    ...additionalProps,
  });
};

/**
 * Track feature usage events with proper typing
 */
export const trackFeatureEvent = (
  featureName: string,
  userRole: string,
  additionalProps: Record<string, unknown> = {},
) => {
  if (typeof window === 'undefined') return;

  const event: Omit<FeatureEvent, 'distinctId' | 'timestamp'> = {
    event: 'feature_accessed',
    properties: {
      featureName,
      userRole,
      ...additionalProps,
    },
  };

  posthog.capture(event.event, event.properties);
};

/**
 * Custom hook to track when an element comes into view
 */
export const useViewTracker = (
  elementRef: RefObject<HTMLElement | null>,
  onIntersect: () => void,
  options: IntersectionObserverInit = { threshold: 0.1 },
) => {
  useEffect(() => {
    // Ensure the ref is not null and points to an actual element
    const currentElement = elementRef.current;
    if (!currentElement) return;

    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        onIntersect();
        // Once tracked, disconnect to prevent repeated tracking
        observer.disconnect();
      }
    }, options);

    observer.observe(currentElement);

    // Cleanup function to prevent memory leaks
    return () => observer.disconnect();
  }, [elementRef, onIntersect, options]);
};
