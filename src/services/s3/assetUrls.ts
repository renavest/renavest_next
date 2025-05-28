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
  if (!key) return '/experts/placeholderexp.png';

  // If it's already a full URL, return it
  if (key.startsWith('http')) return key;

  // If it's already an S3 key, use it directly
  if (key.startsWith('therapists/')) {
    const baseUrl = `/api/images/${encodeURIComponent(key)}`;
    if (bustCache || timestamp) {
      const cacheParam = timestamp ? `v=${timestamp}` : `t=${Date.now()}`;
      return `${baseUrl}?${cacheParam}`;
    }
    return baseUrl;
  }

  // Otherwise, treat it as a therapist name and generate the key
  const s3Key = generateTherapistImageKey(key);
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
