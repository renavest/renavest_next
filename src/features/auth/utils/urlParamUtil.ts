/**
 * Utility functions for handling URL parameters in auth flows
 */

/**
 * Extracts sponsored group information from URL parameters
 * Supports URLs like: /signup?group=Tech-ERG or /signup?sponsoredGroup=Women-in-Tech
 */
export function extractSponsoredGroupFromURL(url?: string): string | null {
  try {
    const currentUrl = url || (typeof window !== 'undefined' ? window.location.href : '');
    const urlObj = new URL(currentUrl);

    // Check multiple parameter names for flexibility
    const groupParam =
      urlObj.searchParams.get('group') ||
      urlObj.searchParams.get('sponsoredGroup') ||
      urlObj.searchParams.get('erg') ||
      urlObj.searchParams.get('team');

    return groupParam ? decodeURIComponent(groupParam) : null;
  } catch (error) {
    console.warn('Error extracting sponsored group from URL:', error);
    return null;
  }
}

/**
 * Sets up sponsored group signup based on URL parameters
 * Should be called during auth component initialization
 */
export function initializeSponsoredGroupSignup(): {
  sponsoredGroup: string | null;
  isGroupSignup: boolean;
} {
  const sponsoredGroup = extractSponsoredGroupFromURL();
  const isGroupSignup = !!sponsoredGroup;

  if (sponsoredGroup) {
    console.log('Detected sponsored group signup:', sponsoredGroup);
  }

  return {
    sponsoredGroup,
    isGroupSignup,
  };
}

/**
 * Generates a sponsored group signup URL
 * Useful for employer admins to create signup links for their groups
 */
export function generateSponsoredGroupSignupURL(
  baseURL: string,
  sponsoredGroupName: string,
): string {
  try {
    const url = new URL('/signup', baseURL);
    url.searchParams.set('group', encodeURIComponent(sponsoredGroupName));
    return url.toString();
  } catch (error) {
    console.error('Error generating sponsored group signup URL:', error);
    return `${baseURL}/signup?group=${encodeURIComponent(sponsoredGroupName)}`;
  }
}
