// PostHog Analytics Feature Exports
// Centralized exports for analytics and event tracking

// Components
export { default as PostHogProvider } from './PostHogProvider';

// Tracking Services
export { trackAuthEvent } from './authTrackingServer';
export { trackTherapistEvent } from './therapistTrackingServer';
export * from './therapistTracking';
export * from './tracking';

// Types
export * from './types';

// Main tracking instance
export { default as posthog } from 'posthog-js';
