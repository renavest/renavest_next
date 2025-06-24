// UTM Feature Exports
// Centralized exports for UTM tracking and company-specific experiences

// Components
export { default as PageText } from './PageText';

// Company Data
export { companyInfo, getCompanyByUtm } from './companyInfo';

// Custom Demo Configurations
export { utmCustomDemo, getCustomDemoConfig } from './utmCustomDemo';

// Types
export * from './types';

// Utilities
export { extractUtmParams, isValidCompanyCode, getCompanyExperience } from './utils/utmUtils';
