import posthog from 'posthog-js';
import { useEffect, RefObject } from 'react';

/**
 * Track page section view with consistent format
 */
export const trackSectionView = (
  sectionName: string,
  additionalProps: Record<string, unknown> = {},
) => {
  if (typeof window === 'undefined') return;

  posthog.capture('section_viewed', {
    section_name: sectionName,
    url: window.location.href,
    timestamp: new Date().toISOString(),
    ...additionalProps,
  });
};

/**
 * Track UI element interaction
 */
export const trackUIInteraction = (
  interactionType: string,
  elementName: string,
  additionalProps: Record<string, unknown> = {},
) => {
  if (typeof window === 'undefined') return;

  posthog.capture(interactionType, {
    element_name: elementName,
    url: window.location.href,
    timestamp: new Date().toISOString(),
    ...additionalProps,
  });
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
