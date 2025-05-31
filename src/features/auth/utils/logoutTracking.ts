import { trackLogout } from './authTracking';

/**
 * Handle logout tracking and cleanup
 */
export const handleLogoutTracking = (userRole?: string) => {
  // Track logout event and reset PostHog context
  trackLogout(userRole);

  // Additional cleanup can be added here if needed
  console.log('User logged out, PostHog context reset');
};
