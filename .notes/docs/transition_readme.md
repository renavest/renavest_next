# Renavest Codebase Transition Documentation

## Overview
This document serves as a comprehensive guide for developers taking over the Renavest codebase. Each feature has been reviewed for code quality, structure, and maintainability.

## Project Architecture
- **Framework**: Next.js with TypeScript
- **Authentication**: Clerk
- **State Management**: Preact Signals
- **Styling**: Tailwind CSS
- **Database**: Drizzle ORM
- **Analytics**: PostHog

## Feature Analysis

### 1. Authentication Feature (`src/features/auth/`)

**Status**: ✅ Well-structured, improved naming conventions applied

**Improvements Made:**
- Removed empty `services/` directory for cleaner structure
- Improved component naming by removing redundant "Step" suffixes
- Updated all import paths and file comments for consistency
- Enhanced file organization with better descriptive comments

#### Structure Overview
```
src/features/auth/
├── components/
│   ├── auth/           # Core authentication components
│   │   ├── Login.tsx          # Login form and validation
│   │   ├── Signup.tsx         # Account creation form
│   │   ├── RoleSelection.tsx  # User role selector
│   │   ├── EmailVerification.tsx # Email verification step
│   │   ├── ForgotPassword.tsx # Password reset request
│   │   ├── ResetPassword.tsx  # New password form
│   │   └── LogoutButton.tsx   # Logout functionality
│   ├── onboarding/     # Multi-step demographic collection
│   │   ├── Purpose.tsx        # Employee purpose selection
│   │   ├── AgeRange.tsx       # Age demographic
│   │   ├── MaritalStatus.tsx  # Marital status selection
│   │   ├── Ethnicity.tsx      # Ethnicity demographic
│   │   └── PrivacyPledge.tsx  # HIPAA compliance step
│   ├── AuthenticationFlow.tsx # Main flow orchestrator
│   ├── LoginPageContent.tsx   # Login page layout and UTM handling
│   └── LoginPage.tsx          # Simple wrapper component
├── state/
│   └── authState.ts    # Global auth state using Preact signals
├── utils/
│   ├── authTracking.ts     # PostHog analytics integration
│   ├── routeMapping.ts     # Role-based route definitions
│   ├── routerUtil.ts       # Navigation utilities
│   ├── signupHelpers.ts    # Signup workflow helpers
│   └── [other utilities]
├── types.ts            # Comprehensive TypeScript definitions
└── components.ts       # Component exports
```

#### Key Components
- **AuthenticationFlow**: Main orchestrator component handling step transitions
- **LoginPageContent**: Primary login page with UTM tracking and testimonials
- **Role-based Steps**: Separate components for employee, therapist, employer workflows

#### Authentication Flow
1. **Role Selection**: Users choose between Individual, Financial Therapist, or Organization
2. **Demographic Collection** (Employees only): Purpose, age range, marital status, ethnicity
3. **Privacy Pledge**: HIPAA compliance acknowledgment
4. **Account Creation**: Final signup with Clerk integration
5. **Email Verification**: Clerk-handled verification process

#### State Management
Uses Preact signals for reactive state:
- Authentication inputs (email, password)
- Role selection and onboarding data
- Flow control (currentStep)
- Error handling (authErrorSignal)

#### Role-based Routing
- **Employee**: `/employee` dashboard
- **Therapist**: `/therapist` dashboard  
- **Employer Admin**: `/employer` dashboard
- **Super Admin**: `/employer` dashboard (shared)

#### Analytics Integration
Comprehensive tracking with PostHog:
- Page views, login attempts, signup flow progression
- Error tracking with detailed error codes
- User identification and role-based analytics

#### Code Quality Notes
- **Type Safety**: Excellent TypeScript coverage
- **Component Structure**: Well-organized with clear separation
- **Error Handling**: Robust error states and user feedback
- **Analytics**: Comprehensive tracking implementation
- **Accessibility**: Good form labels and keyboard navigation

#### Developer Notes
- Clerk handles authentication backend
- Multi-step onboarding customized per user role
- UTM tracking for company-specific signup flows
- PostHog analytics deeply integrated throughout flow

---

## Next Steps
Continue reviewing remaining features...
