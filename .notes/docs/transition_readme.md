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

### 2. Billing Feature (`src/features/billing/`)

**Status**: ✅ Refactored and improved for handoff

#### Structure Overview
```
src/features/billing/
├── components/
│   ├── SubscriptionPlansCard.tsx    # Main subscription plans display
│   ├── PaymentMethodCard.tsx        # Individual payment method card
│   └── AddPaymentMethodForm.tsx     # Stripe Elements form
├── hooks/
│   └── useBillingManagement.ts      # Payment methods management
├── services/
│   └── payment-methods.ts           # Stripe API service
├── types.ts                         # Consolidated type definitions
├── index.ts                         # Feature exports
└── README.md                        # Comprehensive documentation
```

#### Key Components
- **SubscriptionPlansCard**: Three-tier subscription display (Basic, Premium, Professional)
- **PaymentMethodCard**: Displays saved payment methods with remove functionality
- **AddPaymentMethodForm**: Secure payment method addition via Stripe Elements

#### Features
- **Subscription Management**: Visual plan comparison with employer sponsorship support
- **Payment Methods**: Full CRUD operations for saved payment methods
- **Stripe Integration**: Secure tokenization and payment processing
- **Error Handling**: Comprehensive error states with user-friendly messaging

#### Improvements Made
1. **Type Consolidation**: Moved all types to central `types.ts` file
2. **Documentation**: Added JSDoc comments to all components and functions
3. **Export Organization**: Cleaned up index.ts exports with proper namespacing
4. **README Creation**: Comprehensive feature documentation with usage examples

#### Integration Points
- **Stripe**: Payment processing and secure vault storage
- **Clerk**: User authentication and session management
- **Toast Notifications**: User feedback via sonner library

#### Environment Dependencies
```env
NEXT_PUBLIC_STRIPE_PRICE_ID_PREMIUM=price_xxx
NEXT_PUBLIC_STRIPE_PRICE_ID_PROFESSIONAL=price_xxx
```

#### API Endpoints Required
- `GET /api/stripe/payment-methods` - Fetch payment methods
- `POST /api/stripe/setup-intent` - Create Stripe SetupIntent
- `DELETE /api/stripe/payment-methods` - Remove payment method

#### Code Quality Notes
- **Type Safety**: Full TypeScript coverage with strict types
- **Component Structure**: Clean separation of concerns
- **Error Handling**: Graceful error states throughout
- **Performance**: Proper loading states and optimistic updates
- **Security**: Stripe Elements handles all sensitive data

#### Developer Notes
- All payment data is handled securely by Stripe
- Components are responsive and accessible
- Hook provides complete payment method lifecycle management
- Comprehensive error messaging for different failure scenarios

---

---

### 3. Booking Feature (`src/features/booking/`)

**Status**: ✅ Refactored and improved for handoff

#### Structure Overview
```
src/features/booking/
├── components/
│   ├── BookingFlow.tsx                    # Main flow orchestrator
│   ├── AlternativeBooking.tsx             # External booking fallback
│   ├── BillingCheckWrapper.tsx            # Payment verification
│   ├── TherapistAvailability.tsx          # Simple re-export
│   ├── TherapistAvailability/
│   │   ├── index.tsx                      # Main availability component
│   │   ├── TimeSelectionModal.tsx         # Mobile time selection
│   │   └── useTherapistAvailability.ts    # Signals and logic
│   ├── calendar/
│   │   └── CalendarGrid.tsx               # Calendar date selection
│   ├── confirmation/
│   │   └── [confirmation components]
│   ├── form/
│   │   └── BookingForm.tsx                # Internal booking form
│   ├── BookingConfirmation/
│   │   └── [confirmation modals]
│   └── EmailTemplates/
│       └── [email templates]
├── actions/
│   └── sendBookingConfirmationEmail.ts    # Email server actions
├── utils/
│   ├── timezoneManager.ts                 # Centralized timezone handling
│   ├── dateTimeUtils.ts                   # Date formatting utilities
│   └── stringUtils.ts                     # String manipulation helpers
├── types.ts                               # All TypeScript definitions
├── index.ts                               # Feature exports
└── README.md                              # Comprehensive documentation
```

#### Key Components

**BookingFlow** - Main orchestrator that:
- Determines booking flow type (internal Google Calendar vs external Calendly)
- Handles PostHog analytics tracking throughout the funnel
- Manages conditional billing verification for paid therapists
- Integrates Calendly event listeners

**TherapistAvailability** - Sophisticated availability system featuring:
- Real-time Google Calendar integration
- Timezone-aware slot display and conversion
- Responsive design (desktop grid + mobile modal)
- Future-only slot filtering with proper timezone handling

**TimezoneManager** - Centralized timezone handling singleton:
- Auto-detects user timezone with intelligent fallback mapping
- Provides consistent formatting across all datetime displays
- Handles timezone conversions for booking storage
- Supports 12+ major timezones globally

#### Architectural Highlights

**Dual Booking System**:
- **Internal Flow**: Google Calendar integration with real-time availability
- **External Flow**: Calendly widget integration for therapists without calendar setup
- **Intelligent Routing**: Automatically determines which flow based on therapist status

**Timezone-First Design**:
- All datetime operations are timezone-aware from the ground up
- Centralized TimezoneManager prevents timezone-related bugs
- Proper handling of DST transitions and edge cases

**Conditional Billing**:
- Payment verification only triggers for therapists with hourly rates
- Seamless redirect to billing setup if payment methods missing
- Graceful fallback for free consultations

#### Improvements Made

1. **Added Missing Index File**: Created comprehensive `index.ts` with proper exports
2. **Cleaned Up Structure**: Removed empty `hooks/` and `BookingFormComponents/` directories
3. **Comprehensive Documentation**: Added detailed README with architecture overview
4. **Type Organization**: All types centralized in `types.ts` with clear interfaces
5. **Export Organization**: Clean module exports with proper namespacing

#### Integration Points

**External Services**:
- Google Calendar API (availability fetching)
- Calendly Widget (external booking)
- Stripe (payment verification)
- PostHog (comprehensive analytics)
- Resend (email notifications)

**Key API Endpoints**:
- `GET /api/sessions/availability` - Real-time availability data
- `POST /api/sessions/create` - Session booking creation
- `POST /api/track/calendly` - Analytics event tracking
- `GET /api/google-calendar/status` - Integration verification

#### State Management Architecture

Uses Preact Signals for reactive state management:
- `availableSlotsSignal` - Real-time availability data
- `selectedSlotSignal` - User time slot selection
- `loadingSignal` - Async operation states
- `errorSignal` - Error handling and display
- `isGoogleCalendarIntegratedSignal` - Integration status

#### Email System

Sophisticated email notification system with three distinct flows:
- **Booking Confirmation**: Dual emails to client and therapist with timezone conversion
- **Calendly Notifications**: Lightweight notifications for external bookings
- **Interest Notifications**: Lead capture for pending therapist inquiries

#### Code Quality Notes

- **Type Safety**: Comprehensive TypeScript coverage with strict interfaces
- **Component Architecture**: Clear separation of concerns with logical grouping
- **Error Handling**: Robust error states with user-friendly messaging
- **Performance**: Optimized loading states and efficient re-rendering
- **Accessibility**: Keyboard navigation and screen reader support
- **Mobile Responsive**: Tailored experiences for desktop and mobile

#### Critical Business Logic

This feature represents the core revenue-generating flow:
- **Session Booking**: Direct path to therapist engagement
- **Payment Integration**: Automatic billing verification for paid sessions  
- **Analytics**: Comprehensive funnel tracking for conversion optimization
- **Timezone Handling**: Prevents booking conflicts across time zones
- **Integration Flexibility**: Supports various therapist onboarding levels

#### Developer Notes

**Testing Considerations**:
- Mock Google Calendar API responses for availability testing
- Verify timezone conversion accuracy across DST boundaries
- Test email template rendering in various email clients
- Validate mobile responsive behavior on different devices

**Performance Optimizations**:
- Efficient calendar grid calculations with memoization
- Rate-limited email sending to prevent API limits
- Lazy loading of availability data based on user interaction

**Security Considerations**:
- All payment data handled securely through Stripe
- Email templates sanitize user-provided content
- Timezone detection respects user privacy preferences

#### Environment Dependencies
```env
RESEND_API_KEY=re_xxx            # Email delivery
NEXT_PUBLIC_POSTHOG_KEY=phc_xxx  # Analytics tracking
```

---

## Next Steps
Continue reviewing remaining features...
