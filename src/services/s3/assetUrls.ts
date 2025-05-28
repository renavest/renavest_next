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

  // Check if we have proper AWS configuration
  const hasS3Config = !!(
    process.env.AWS_S3_IMAGES_BUCKET_NAME &&
    process.env.AWS_ACCESS_KEY_ID &&
    process.env.AWS_SECRET_ACCESS_KEY
  );

  // If we don't have S3 config, always return placeholder
  if (!hasS3Config) {
    return '/experts/placeholderexp.png';
  }

  // Detect environment - be more aggressive about production detection
  const isProduction =
    process.env.NODE_ENV === 'production' ||
    process.env.VERCEL_ENV === 'production' ||
    process.env.VERCEL_ENV === 'preview';

  // For production, we have a choice:
  // 1. Use API route (keeps authentication) but might get 400 errors
  // 2. Use direct S3 (no auth) but always works
  // Let's use direct S3 in production to avoid auth issues
  const useDirectS3InProduction = true; // Always use direct S3 in production

  // If it's already an S3 key, decide whether to use API or direct S3
  if (key.startsWith('therapists/')) {
    if (isProduction && useDirectS3InProduction) {
      // Use direct S3 URL in production when configured to do so
      const s3Url = `https://${process.env.AWS_S3_IMAGES_BUCKET_NAME}.s3.amazonaws.com/${key}`;
      if (bustCache || timestamp) {
        const cacheParam = timestamp ? `v=${timestamp}` : `t=${Date.now()}`;
        return `${s3Url}?${cacheParam}`;
      }
      return s3Url;
    } else {
      // Use authenticated API route (default behavior for development)
      const baseUrl = `/api/images/${encodeURIComponent(key)}`;
      if (bustCache || timestamp) {
        const cacheParam = timestamp ? `v=${timestamp}` : `t=${Date.now()}`;
        return `${baseUrl}?${cacheParam}`;
      }
      return baseUrl;
    }
  }

  // Otherwise, treat it as a therapist name and generate the key
  const s3Key = generateTherapistImageKey(key);

  if (isProduction && useDirectS3InProduction) {
    // Use direct S3 URL in production when configured to do so
    const s3Url = `https://${process.env.AWS_S3_IMAGES_BUCKET_NAME}.s3.amazonaws.com/${s3Key}`;
    if (bustCache || timestamp) {
      const cacheParam = timestamp ? `v=${timestamp}` : `t=${Date.now()}`;
      return `${s3Url}?${cacheParam}`;
    }
    return s3Url;
  } else {
    // Use authenticated API route (default behavior for development)
    const baseUrl = `/api/images/${encodeURIComponent(s3Key)}`;
    if (bustCache || timestamp) {
      const cacheParam = timestamp ? `v=${timestamp}` : `t=${Date.now()}`;
      return `${baseUrl}?${cacheParam}`;
    }
    return baseUrl;
  }
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
