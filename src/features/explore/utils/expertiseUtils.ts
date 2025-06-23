import { ExpertiseTag } from '../types';

/**
 * Utility functions for handling expertise tags display
 */

/**
 * Parse expertise string into array of tags
 *
 * @param expertise - Comma-separated expertise string
 * @returns Array of trimmed expertise strings
 */
export function parseExpertiseTags(expertise?: string): string[] {
  if (!expertise) return [];
  return expertise
    .split(',')
    .map((exp) => exp.trim())
    .filter(Boolean);
}

/**
 * Create expertise tag objects with overflow handling
 *
 * @param expertise - Comma-separated expertise string
 * @param maxTags - Maximum number of tags to display before showing overflow
 * @returns Array of ExpertiseTag objects
 */
export function createExpertiseTags(expertise?: string, maxTags: number = 3): ExpertiseTag[] {
  const expertiseTags = parseExpertiseTags(expertise);
  const tags: ExpertiseTag[] = [];

  // Add visible tags
  expertiseTags.slice(0, maxTags).forEach((exp, index) => {
    tags.push({
      text: exp,
      index,
      isOverflow: false,
    });
  });

  // Add overflow indicator if needed
  if (expertiseTags.length > maxTags) {
    tags.push({
      text: `+${expertiseTags.length - maxTags}`,
      index: maxTags,
      isOverflow: true,
      overflowCount: expertiseTags.length - maxTags,
    });
  }

  return tags;
}

/**
 * Get CSS classes for expertise tags
 *
 * @param isOverflow - Whether this is an overflow indicator tag
 * @returns String of CSS classes
 */
export function getExpertiseTagClasses(isOverflow: boolean = false): string {
  const baseClasses =
    'px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs tracking-wide';
  const colorClasses = isOverflow
    ? 'bg-gray-100 text-gray-600 border border-gray-200'
    : 'bg-purple-50 text-purple-700';

  return `${baseClasses} ${colorClasses}`;
}

/**
 * Format years of experience display
 *
 * @param yoe - Years of experience string
 * @returns Formatted experience string
 */
export function formatExperience(yoe: string): string {
  if (!yoe) return 'Experience not specified';

  // Handle different formats
  const numYears = parseInt(yoe, 10);
  if (isNaN(numYears)) return yoe;

  if (numYears === 1) return '1 year of experience';
  return `${numYears} years of experience`;
}

/**
 * Truncate advisor bio for preview display
 *
 * @param bio - Full bio text
 * @param maxLength - Maximum character length
 * @returns Truncated bio with ellipsis if needed
 */
export function truncateBio(bio?: string, maxLength: number = 120): string {
  if (!bio) return '';
  if (bio.length <= maxLength) return bio;

  return bio.substring(0, maxLength).trim() + '...';
}
