import posthog from 'posthog-js';

/**
 * Track when a user shares a referral link
 * @param userId The user ID of the person sharing the link
 * @param shareMethod The method used to share (copy_link, native_share, etc.)
 * @param referralLink The complete referral link that was shared
 */
export function trackReferralShare(
  userId: string | undefined,
  shareMethod: string,
  referralLink: string,
) {
  posthog.capture('referral_link_shared', {
    user_id: userId,
    share_method: shareMethod,
    referral_link: referralLink,
    timestamp: new Date().toISOString(),
  });
}

/**
 * Track when a referred user signs up
 * @param userId The user ID of the new user
 * @param referrerId The user ID of the referrer
 * @param userEmail The email of the new user (optional)
 */
export function trackReferralConversion(userId: string, referrerId: string, userEmail?: string) {
  posthog.capture('referral_converted', {
    user_id: userId,
    referrer_id: referrerId,
    user_email: userEmail,
    timestamp: new Date().toISOString(),
  });
}

/**
 * Set up referral attribution from URL parameters
 * Stores referral information in localStorage for later use
 * @returns The referrer ID if found in URL, null otherwise
 */
export function setupReferralAttribution(): string | null {
  if (typeof window === 'undefined') return null;

  const params = new URLSearchParams(window.location.search);
  const referrerId = params.get('ref');

  if (referrerId) {
    // Store referrer ID for attribution after signup
    localStorage.setItem('referrer_id', referrerId);

    // Track the referral visit event
    posthog.capture('referral_link_visited', {
      referrer_id: referrerId,
      url: window.location.href,
      timestamp: new Date().toISOString(),
    });
  }

  return referrerId;
}

/**
 * Get the stored referrer ID from localStorage
 * @returns The referrer ID if found, null otherwise
 */
export function getStoredReferrerId(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('referrer_id');
}
