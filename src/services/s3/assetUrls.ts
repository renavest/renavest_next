/**
 * Generates URLs specifically for therapist profile images
 * @param key The S3 key or therapist name
 * @param bustCache Whether to add a cache-busting parameter (use after uploads)
 * @param timestamp Optional timestamp for cache-busting (from database updatedAt)
 * @returns The URL to access the profile image through S3
 */
export function getTherapistImageUrl(
  key?: string | null,
  bustCache = false,
  timestamp?: number,
): string {
  console.log('getTherapistImageUrl called with:', { key, bustCache, timestamp });

  if (!key) {
    console.log('No key provided, returning placeholder');
    return '/experts/placeholderexp.png';
  }

  // If it's already a full URL, return it
  if (key.startsWith('http')) {
    console.log('Key is full URL, returning as-is');
    return key;
  }

  // If it's already an API route URL, don't double-process it
  if (key.startsWith('/api/images/')) {
    console.log('Key is already an API route, returning as-is');
    return key;
  }

  // If the key contains URL-encoded characters or malformed API paths, extract the original name
  if (key.includes('%2F') || key.includes('api-images-therapists')) {
    console.log('Detected malformed/encoded key, extracting original name');
    // Try to extract the therapist name from malformed URLs
    const match = key.match(/(?:therapists[%2F-]+)?([a-z-]+)(?:\.jpg|\.jpeg|\.png)?/i);
    if (match && match[1]) {
      const extractedName = match[1].replace(/[^a-z-]/gi, '-').toLowerCase();
      console.log('Extracted name:', extractedName);
      key = extractedName;
    } else {
      console.log('Could not extract name from malformed key, using placeholder');
      return '/experts/placeholderexp.png';
    }
  }

  // Always use the API route for consistency between dev and prod
  // Determine the S3 key
  let s3Key: string;
  if (key.startsWith('therapists/')) {
    s3Key = key;
  } else {
    s3Key = generateTherapistImageKey(key);
  }

  console.log('Using API route with S3 key:', s3Key);

  // Use authenticated API route for all environments
  const baseUrl = `/api/images/${encodeURIComponent(s3Key)}`;
  if (bustCache || timestamp) {
    const cacheParam = timestamp ? `v=${timestamp}` : `t=${Date.now()}`;
    return `${baseUrl}?${cacheParam}`;
  }
  return baseUrl;
}

/**
 * Generates the S3 key for a therapist's profile image
 * @param name The name of the therapist
 * @returns The S3 key for the therapist's profile image
 */
function generateTherapistImageKey(name: string): string {
  if (!name) return '';

  // Convert to lowercase and normalize special characters
  const normalizedName = name
    .trim()
    .toLowerCase()
    // Normalize accented characters to their ASCII equivalents
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    // Replace spaces and special characters with hyphens
    .replace(/[^a-z0-9]+/g, '-')
    // Remove any leading or trailing hyphens
    .replace(/^-+|-+$/g, '');

  return `therapists/${normalizedName}.jpg`;
}
