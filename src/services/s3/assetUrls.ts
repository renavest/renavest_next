/**
 * Generates URLs for assets stored in S3
 * @param key The S3 key of the asset
 * @returns The URL to access the asset through our secure API endpoint
 */
export function getAssetUrl(key: string): string {
  // If it's already a full URL (e.g. external asset), return as is
  if (key.startsWith('http')) {
    return key;
  }

  // If it's an S3 key, return the API route URL
  if (key) {
    return `/api/images/${encodeURIComponent(key)}`;
  }

  // Return a default placeholder image from our public directory
  return '/experts/placeholderexp.png';
}

/**
 * Generates URLs specifically for therapist profile images
 * @param key The S3 key of the therapist's profile image
 * @returns The URL to access the profile image
 */
export function getTherapistImageUrl(key: string): string {
  if (!key) {
    return '/experts/placeholderexp.png';
  }
  return getAssetUrl(key);
}

/**
 * Generates the S3 key for a therapist's profile image
 * @param therapistName The name of the therapist
 * @returns The S3 key for the therapist's profile image
 */
export function generateTherapistImageKey(therapistName: string): string {
  return `therapists/${therapistName.toLowerCase().replace(/\s+/g, '-')}.jpg`;
}
