# Onboarding Feature

## Overview
Multi-role onboarding system that provides customized setup experiences for employees, therapists, and employers joining the Renavest platform.

## Structure
```
src/features/onboarding/
├── actions/
│   └── submitOnboarding.ts       # Server action for onboarding completion
├── components/
│   ├── OnboardingWizard.tsx      # Main wizard orchestrator
│   ├── EmployeeOnboarding.tsx    # Employee-specific steps
│   └── TherapistOnboarding.tsx   # Therapist verification and setup
├── hooks/
│   └── useOnboardingFlow.ts      # Onboarding state management
├── state/
│   └── onboardingState.ts        # Global onboarding state
├── utils/
│   └── onboardingValidation.ts   # Form validation and completion checks
├── types.ts                      # Onboarding flow types
├── index.ts                      # Feature exports
└── README.md                     # This documentation
```

## Features
- **Role-Based Flows**: Different onboarding experiences for each user type
- **Progress Tracking**: Step completion and validation
- **Data Collection**: Demographics, preferences, and professional information
- **Integration Setup**: Connect third-party services during onboarding
- **Compliance**: HIPAA acknowledgment and privacy agreements

## Usage

### Onboarding Wizard
```typescript
import { OnboardingWizard } from '@/src/features/onboarding';

<OnboardingWizard 
  userRole="employee"
  onComplete={handleOnboardingComplete}
  initialStep={0}
/>
```

### Custom Onboarding Flows
```typescript
import { 
  EmployeeOnboarding, 
  TherapistOnboarding,
  useOnboardingFlow 
} from '@/src/features/onboarding';

// Employee-specific onboarding
<EmployeeOnboarding 
  companyCode="ACME123"
  onStepComplete={handleStepComplete}
/>

// Therapist onboarding with verification
<TherapistOnboarding 
  requiresLicenseVerification={true}
  onVerificationComplete={handleVerification}
/>
```

## Onboarding Flows

### Employee Onboarding
1. **Company Verification**: Validate employee email and company association
2. **Demographics**: Collect age, location, and financial goals
3. **Preferences**: Communication preferences and therapy interests
4. **Platform Introduction**: Feature overview and first steps

### Therapist Onboarding
1. **Professional Verification**: License validation and credential checks
2. **Stripe Connect Setup**: Bank account connection for payments
3. **Calendar Integration**: Google Calendar connection for availability
4. **Profile Completion**: Bio, specializations, and rates

### Employer Onboarding
1. **Company Verification**: Business registration and contact validation
2. **Team Setup**: Employee group configuration and access controls
3. **Billing Configuration**: Payment methods and subscription setup
4. **Admin Training**: Platform management and reporting features

## State Management
Uses Preact signals for reactive onboarding state:

```typescript
import { onboardingState } from '@/src/features/onboarding';

// Access current onboarding data
const currentStep = onboardingState.currentStep.value;
const userData = onboardingState.userData.value;

// Update onboarding progress
onboardingState.currentStep.value = 2;
onboardingState.userData.value = { ...userData, demographics: formData };
```

## Integration Points
- **Clerk**: User authentication and metadata updates
- **Stripe**: Payment setup and Connect account creation
- **Google Calendar**: OAuth integration for therapists
- **Database**: User profile and preference storage
- **PostHog**: Onboarding funnel analytics 