import type { CompanyInfo, UtmParams } from '../types';
import { companyInfo } from '../companyInfo';

/**
 * Extract UTM parameters from URL search params
 */
export function extractUtmParams(searchParams: URLSearchParams): UtmParams {
  return {
    utm_source: searchParams.get('utm_source') || undefined,
    utm_medium: searchParams.get('utm_medium') || undefined,
    utm_campaign: searchParams.get('utm_campaign') || undefined,
    utm_term: searchParams.get('utm_term') || undefined,
    utm_content: searchParams.get('utm_content') || undefined,
  };
}

/**
 * Validate if a company code exists in our system
 */
export function isValidCompanyCode(code: string): boolean {
  return Object.keys(companyInfo).includes(code.toLowerCase());
}

/**
 * Get company experience configuration based on UTM parameters
 */
export function getCompanyExperience(utmParams: UtmParams): CompanyInfo | null {
  if (!utmParams.utm_source) return null;

  const companyCode = utmParams.utm_source.toLowerCase();
  return companyInfo[companyCode] || null;
}

/**
 * Generate tracking URL with UTM parameters
 */
export function generateTrackingUrl(
  baseUrl: string,
  companyCode: string,
  campaign?: string,
): string {
  const url = new URL(baseUrl);
  url.searchParams.set('utm_source', companyCode);
  url.searchParams.set('utm_medium', 'partner');

  if (campaign) {
    url.searchParams.set('utm_campaign', campaign);
  }

  return url.toString();
}
