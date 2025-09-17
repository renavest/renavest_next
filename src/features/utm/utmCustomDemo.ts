import { signal } from '@preact-signals/safe-react';
import type { Signal } from '@preact-signals/safe-react';

// Theme configuration signals
export const ctaTextSignal = signal<string>('Free Consultation');
export const isEmployeeSignal = signal<boolean>(false);
const ctaUrlSignal = signal<string>('https://calendly.com/rameau-stan/one-on-one');
const loginRedirectSignal = signal<string>('/login');

// Company information signals
export const companyNameSignal = signal<string>('');
// User information signals
export const firstNameSignal = signal<string>('');
const lastNameSignal = signal<string>('');
const fullNameSignal = signal<string>('');

// UTM specific signals
const utmSourceSignal = signal<string>('');
const utmMediumSignal = signal<string>('');
const utmCampaignSignal = signal<string>('');
const utmTermSignal = signal<string>('');
const utmContentSignal = signal<string>('');

// Page content signals
export const heroTitleSignal = signal<string>('Transform Your Workplace with Financial Therapy.');
export const heroSubtitleSignal = signal<string>(
  "Your workforce's financial stress is costing you $2,500 per employee annually.",
);
export const journeySectionTitleSignal = signal<string>(
  'How financial therapy transforms your workplace.',
);

// List of all standard and custom URL parameters to track
const TRACKED_PARAMS = [
  // UTM parameters
  'utm_source',
  'utm_medium',
  'utm_campaign',
  'utm_term',
  'utm_content',
  // Custom parameters
  'employee',
  'company',
  'first_name',
  'last_name',
];

// Prefix for localStorage keys
const STORAGE_PREFIX = 'renavest_utm_';

// UTM parameter to configuration mapping
interface UtmConfig {
  [key: string]: {
    param: string;
    values: {
      [key: string]: {
        signals: Array<{
          signal: Signal<unknown>;
          value: unknown;
        }>;
      };
    };
  };
}

// Configuration for how UTM parameters affect the site
const utmConfigurations: UtmConfig = {
  employee: {
    param: 'employee',
    values: {
      true: {
        signals: [
          { signal: isEmployeeSignal, value: true },
          { signal: ctaTextSignal, value: 'Get Started' },
          { signal: loginRedirectSignal, value: '/login' },
          { signal: heroTitleSignal, value: 'Because your finances need therapy too.' },
          {
            signal: heroSubtitleSignal,
            value:
              'Financial therapy that heals your relationship with money, one conversation at a time.',
          },
          {
            signal: journeySectionTitleSignal,
            value: `How financial therapy transforms your work life and wellbeing.`,
          },
        ],
      },
      false: {
        signals: [
          { signal: isEmployeeSignal, value: false },
          { signal: ctaTextSignal, value: 'Free Consultation' },
          { signal: ctaUrlSignal, value: 'https://calendly.com/rameau-stan/one-on-one' },
          { signal: heroTitleSignal, value: 'Transform Your Workplace with Financial Therapy.' },
          {
            signal: heroSubtitleSignal,
            value: "Your workforce's financial stress is costing you $2,500 per employee annually.",
          },
          {
            signal: journeySectionTitleSignal,
            value: `How financial therapy transforms work and life`,
          },
        ],
      },
    },
  },
};

/**
 * Store a parameter value in localStorage with the appropriate prefix
 */
function storeParam(key: string, value: string | null): void {
  if (value) {
    localStorage.setItem(`${STORAGE_PREFIX}${key}`, value);
  }
}

/**
 * Get a parameter value from localStorage with the appropriate prefix
 */
function getStoredParam(key: string): string | null {
  return localStorage.getItem(`${STORAGE_PREFIX}${key}`);
}

/**
 * Store all UTM and custom parameters from the URL into localStorage
 */
function storeAllParams(searchParams: URLSearchParams): Record<string, string | null> {
  const params: Record<string, string | null> = {};

  TRACKED_PARAMS.forEach((param) => {
    const value = searchParams.get(param);

    // Store in our return object
    params[param] = value;

    // Save to localStorage if present, or clear if not present
    if (value) {
      storeParam(param, value);
    }
  });

  return params;
}

/**
 * Restore all parameters from localStorage
 */
function restoreAllParams(): Record<string, string | null> {
  const params: Record<string, string | null> = {};

  TRACKED_PARAMS.forEach((param) => {
    const value = getStoredParam(param);
    params[param] = value;
  });

  return params;
}

/**
 * Apply custom styling and content based on parameters
 */
function applyCustomizations(params: Record<string, string | null>): void {
  // Store UTM parameters in signals
  if (params['utm_source']) utmSourceSignal.value = params['utm_source'];
  if (params['utm_medium']) utmMediumSignal.value = params['utm_medium'];
  if (params['utm_campaign']) utmCampaignSignal.value = params['utm_campaign'];
  if (params['utm_term']) utmTermSignal.value = params['utm_term'];
  if (params['utm_content']) utmContentSignal.value = params['utm_content'];

  // Handle company customization
  if (params['company']) {
    const company = params['company'];
    companyNameSignal.value = company;
  }
  // Handle user name customization
  const firstName = params['first_name'];
  const lastName = params['last_name'];

  if (firstName) {
    firstNameSignal.value = firstName;
    if (lastName) {
      lastNameSignal.value = lastName;
      fullNameSignal.value = `${firstName} ${lastName}`;
    } else {
      fullNameSignal.value = firstName;
    }
  }

  // Process static configurations
  Object.entries(utmConfigurations).forEach(([key, config]) => {
    // Skip company as we handle it specially above
    if (key === 'company') return;

    const paramValue = params[config.param];
    if (paramValue && config.values[paramValue]) {
      config.values[paramValue].signals.forEach(({ signal, value }) => {
        signal.value = value;
      });
    }
  });
}

/**
 * Processes URL parameters to customize the site based on UTM parameters
 * Stores parameters in localStorage, and restores them if not present in URL
 * @param searchParams - The URL search parameters
 * @returns An object containing the processed UTM parameters
 */
export function processUtmParameters(searchParams: URLSearchParams): Record<string, string | null> {
  if (typeof window === 'undefined') {
    // Return empty object if running on server
    return {};
  }

  // First, check if we have any parameters in the URL
  let hasParams = false;
  for (const param of TRACKED_PARAMS) {
    if (searchParams.has(param)) {
      hasParams = true;
      break;
    }
  }

  let params: Record<string, string | null>;

  if (hasParams) {
    // Store all parameters from URL to localStorage
    params = storeAllParams(searchParams);
  } else {
    // No URL parameters, try to restore from localStorage
    params = restoreAllParams();
  }

  // Apply all customizations based on the parameters
  applyCustomizations(params);

  return params;
}

/**
 * Clears all UTM/company-related localStorage and other relevant keys
 */
export function clearAllCompanyLocalStorage(): void {
  if (typeof window === 'undefined') return;
  // Remove all UTM and custom params with prefix
  TRACKED_PARAMS.forEach((param) => {
    localStorage.removeItem(`${STORAGE_PREFIX}${param}`);
  });
  // Remove other relevant keys
  localStorage.removeItem('companyIntegration');
  localStorage.removeItem('onboardingState');
  localStorage.removeItem('referrer_id');
  localStorage.removeItem('role_from_oauth');
}
