import { parse } from 'url';

/**
 * Extract the event type slug from a Calendly booking URL
 * @param bookingURL Full Calendly booking URL
 * @returns Event type slug or null if not found
 */
export function extractCalendlyEventTypeSlug(bookingURL: string): string | null {
  try {
    const parsedUrl = parse(bookingURL);
    const pathParts = parsedUrl.pathname?.split('/').filter(Boolean);

    // Typical Calendly URL format: https://calendly.com/username/event-type
    if (pathParts && pathParts.length >= 2) {
      return pathParts[1]; // Return the event type slug
    }

    return null;
  } catch (error) {
    console.error('Error parsing Calendly URL:', error);
    return null;
  }
}
