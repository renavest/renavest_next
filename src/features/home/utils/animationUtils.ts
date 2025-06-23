/**
 * Home Feature Animation Utilities
 *
 * Centralized animation helpers and intersection observer utilities
 * for consistent animations across home feature components.
 */

import type { IntersectionConfig } from '../types';

// ====================================
// INTERSECTION OBSERVER UTILITIES
// ====================================

/**
 * Creates an intersection observer for visibility tracking
 * @param callback - Function to call when element becomes visible
 * @param config - Observer configuration options
 * @returns IntersectionObserver instance
 */
export const createVisibilityObserver = (
  callback: (isVisible: boolean) => void,
  config: IntersectionConfig = { threshold: 0.1 },
): IntersectionObserver => {
  return new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        callback(true);
      }
    });
  }, config);
};

/**
 * Creates a one-time intersection observer that unobserves after triggering
 * @param callback - Function to call when element becomes visible
 * @param config - Observer configuration options
 * @returns IntersectionObserver instance
 */
export const createOneTimeVisibilityObserver = (
  callback: () => void,
  config: IntersectionConfig = { threshold: 0.1 },
): IntersectionObserver => {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        callback();
        // Unobserve after first trigger
        entry.target && entry.target instanceof Element && observer.unobserve(entry.target);
      }
    });
  }, config);
  return observer;
};

/**
 * Sets up intersection observer for a specific element
 * @param elementId - ID of the element to observe
 * @param callback - Function to call when element becomes visible
 * @param config - Observer configuration options
 * @returns Cleanup function
 */
export const observeElement = (
  elementId: string,
  callback: () => void,
  config: IntersectionConfig = { threshold: 0.1 },
): (() => void) => {
  const observer = createOneTimeVisibilityObserver(callback, config);
  const element = document.querySelector(`#${elementId}`);

  if (element) {
    observer.observe(element);
  }

  // Return cleanup function
  return () => {
    if (element) {
      observer.unobserve(element);
    }
  };
};

// ====================================
// ANIMATION TIMING UTILITIES
// ====================================

/**
 * Calculate animation delay based on index
 * @param index - Element index
 * @param baseDelay - Base delay in seconds
 * @param increment - Delay increment per index
 * @returns CSS delay string
 */
export const calculateAnimationDelay = (
  index: number,
  baseDelay: number = 0,
  increment: number = 0.2,
): string => {
  return `${baseDelay + index * increment}s`;
};

/**
 * Generate staggered animation delays for multiple elements
 * @param count - Number of elements
 * @param baseDelay - Base delay in seconds
 * @param increment - Delay increment between elements
 * @returns Array of delay strings
 */
export const generateStaggeredDelays = (
  count: number,
  baseDelay: number = 0,
  increment: number = 0.1,
): string[] => {
  return Array.from({ length: count }, (_, index) =>
    calculateAnimationDelay(index, baseDelay, increment),
  );
};

// ====================================
// CSS CLASS UTILITIES
// ====================================

/**
 * Generate CSS classes for fade-in animation
 * @param isVisible - Whether element is visible
 * @param additionalClasses - Additional CSS classes
 * @returns CSS class string
 */
export const getFadeInClasses = (isVisible: boolean, additionalClasses: string = ''): string => {
  const baseClasses = 'transition-all duration-500 ease-in-out';
  const visibilityClasses = isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4';

  return `${baseClasses} ${visibilityClasses} ${additionalClasses}`.trim();
};

/**
 * Generate CSS classes for slide-in animation
 * @param isVisible - Whether element is visible
 * @param direction - Slide direction ('left' | 'right' | 'up' | 'down')
 * @param additionalClasses - Additional CSS classes
 * @returns CSS class string
 */
export const getSlideInClasses = (
  isVisible: boolean,
  direction: 'left' | 'right' | 'up' | 'down' = 'up',
  additionalClasses: string = '',
): string => {
  const baseClasses = 'transition-all duration-500 ease-in-out';

  const directionMap = {
    left: isVisible ? 'translate-x-0' : '-translate-x-4',
    right: isVisible ? 'translate-x-0' : 'translate-x-4',
    up: isVisible ? 'translate-y-0' : 'translate-y-4',
    down: isVisible ? 'translate-y-0' : '-translate-y-4',
  };

  const opacityClasses = isVisible ? 'opacity-100' : 'opacity-0';
  const transformClasses = directionMap[direction];

  return `${baseClasses} ${opacityClasses} ${transformClasses} ${additionalClasses}`.trim();
};

/**
 * Generate CSS classes for scale animation
 * @param isVisible - Whether element is visible
 * @param additionalClasses - Additional CSS classes
 * @returns CSS class string
 */
export const getScaleInClasses = (isVisible: boolean, additionalClasses: string = ''): string => {
  const baseClasses = 'transition-all duration-500 ease-in-out';
  const visibilityClasses = isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95';

  return `${baseClasses} ${visibilityClasses} ${additionalClasses}`.trim();
};

// ====================================
// COUNTDOWN TIMER UTILITIES
// ====================================

/**
 * Calculate time remaining until a target date
 * @param targetDate - Target date to count down to
 * @returns Object with days, hours, minutes, seconds
 */
export const calculateTimeRemaining = (targetDate: Date) => {
  const now = new Date();
  const difference = targetDate.getTime() - now.getTime();

  if (difference > 0) {
    return {
      days: Math.floor(difference / (1000 * 60 * 60 * 24)),
      hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
      minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
      seconds: Math.floor((difference % (1000 * 60)) / 1000),
    };
  } else {
    return { days: 0, hours: 0, minutes: 0, seconds: 0 };
  }
};

/**
 * Format time value with leading zero if needed
 * @param value - Time value to format
 * @returns Formatted string with leading zero
 */
export const formatTimeValue = (value: number): string => {
  return value.toString().padStart(2, '0');
};

// ====================================
// RESPONSIVE UTILITIES
// ====================================

/**
 * Check if current device is mobile based on window width
 * @param breakpoint - Mobile breakpoint in pixels
 * @returns Whether device is mobile
 */
export const isMobileDevice = (breakpoint: number = 768): boolean => {
  if (typeof window === 'undefined') return false;
  return window.innerWidth < breakpoint;
};

/**
 * Get responsive animation duration based on device
 * @param desktop - Desktop duration in milliseconds
 * @param mobile - Mobile duration in milliseconds
 * @returns Duration for current device
 */
export const getResponsiveAnimationDuration = (
  desktop: number = 500,
  mobile: number = 300,
): number => {
  return isMobileDevice() ? mobile : desktop;
};

// ====================================
// PERFORMANCE UTILITIES
// ====================================

/**
 * Create a debounced function for performance optimization
 * @param func - Function to debounce
 * @param wait - Wait time in milliseconds
 * @returns Debounced function
 */
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number,
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;

  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

/**
 * Create a throttled function for performance optimization
 * @param func - Function to throttle
 * @param limit - Time limit in milliseconds
 * @returns Throttled function
 */
export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number,
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean;

  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
};
