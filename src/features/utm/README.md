# UTM Feature

## Overview
UTM tracking and company-specific experience system that provides customized content, demos, and onboarding flows based on referral sources and partner companies.

## Structure
```
src/features/utm/
├── components/
├── utils/
│   └── utmUtils.ts              # UTM parameter handling utilities
├── companyInfo.ts               # Company configuration and branding
├── utmCustomDemo.ts             # Custom demo configurations per company
├── PageText.tsx                 # Dynamic content based on company
├── types.ts                     # UTM and company types
├── index.ts                     # Feature exports
└── README.md                    # This documentation
```

## Features
- **Company-Specific Branding**: Custom logos, colors, and messaging per partner
- **Targeted Demo Content**: Tailored demo flows based on company requirements
- **UTM Parameter Tracking**: Complete attribution tracking for marketing campaigns
- **Custom Onboarding**: Company-specific setup flows and configurations
- **Partner Integration**: Seamless experience for referred employees

## Usage

### UTM Parameter Extraction
```typescript
import { extractUtmParams, getCompanyExperience } from '@/src/features/utm';

function LandingPage({ searchParams }: { searchParams: URLSearchParams }) {
  const utmParams = extractUtmParams(searchParams);
  const companyExperience = getCompanyExperience(utmParams);
  
  return (
    <div>
      {companyExperience && (
        <h1>Welcome, {companyExperience.name} employees!</h1>
      )}
    </div>
  );
}
```

### Company-Specific Content
```typescript
import { PageText, getCompanyByUtm } from '@/src/features/utm';

// Dynamic text component
<PageText 
  utmSource="acme"
  defaultText="Standard welcome message"
  companyText="Welcome ACME Corp employees!"
/>

// Company-specific configuration
const companyConfig = getCompanyByUtm('acme');
if (companyConfig) {
  // Apply custom branding, limits, pricing
}
```

### Custom Demo Configuration
```typescript
import { getCustomDemoConfig } from '@/src/features/utm';

const demoConfig = getCustomDemoConfig('acme');
// Returns custom demo flow for ACME Corp
```

## Company Configuration

### Adding New Companies
```typescript
// In companyInfo.ts
export const companyInfo = {
  'acme': {
    name: 'ACME Corporation',
    logo: '/logos/acme-logo.png',
    primaryColor: '#1234ab',
    employeeLimit: 500,
    customDomain: 'acme.renavest.com',
    features: ['priority_support', 'custom_branding'],
    contact: {
      hr: 'hr@acme.com',
      admin: 'admin@acme.com'
    }
  }
};
```

## UTM Parameter Schema

### Standard Parameters
- `utm_source`: Company code or referral source
- `utm_medium`: Traffic medium (email, social, partner)
- `utm_campaign`: Specific campaign name
- `utm_term`: Paid search terms
- `utm_content`: Content variation identifier

### Custom Parameters
- Company-specific tracking codes
- Employee group identifiers
- Department-specific routing

## Company Features

### Supported Customizations
1. **Visual Branding**: Custom logos, colors, themes
2. **Content Personalization**: Company-specific messaging and CTAs
3. **Demo Flows**: Tailored product demonstrations
4. **Onboarding Paths**: Custom setup and verification flows
5. **Feature Gates**: Company-specific feature access
6. **Pricing Models**: Custom pricing and billing arrangements

### Integration Examples

#### Goldman Sachs
- High-security onboarding with additional verification
- Custom pricing for large employee base
- Integration with existing HR systems

#### Stripe
- Tech-focused demo emphasizing API integrations
- Developer-friendly documentation links
- Custom Stripe Connect setup flow

## Analytics Integration
- UTM parameter tracking via PostHog
- Company-specific conversion funnels
- Partner referral attribution
- Campaign performance metrics

## Environment Variables
```env
NEXT_PUBLIC_ENABLE_UTM_TRACKING=true    # Enable UTM parameter processing
COMPANY_BRANDING_ENABLED=true          # Allow custom company branding
```

## File Organization
- `companyInfo.ts`: Company configurations and metadata
- `utmCustomDemo.ts`: Demo flow configurations per company
- `PageText.tsx`: Dynamic text rendering component
- `utmUtils.ts`: URL parameter processing utilities 