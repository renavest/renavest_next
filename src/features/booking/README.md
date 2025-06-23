# Booking Feature

## Overview
The booking feature handles the complete session booking workflow for financial therapy sessions. It supports both internal Google Calendar integration and external Calendly booking flows.

## Architecture

### Core Components

#### 1. BookingFlow (`components/BookingFlow.tsx`)
**Main orchestrator component for the booking experience**

- Determines which booking flow to use (internal vs external)
- Handles PostHog analytics tracking
- Manages billing verification for paid therapists
- Integrates with Calendly event listeners

**Props:**
```typescript
interface BookingFlowProps {
  advisor: {
    id: string;
    name: string;
    bookingURL: string;
    profileUrl?: string;
    email?: string;
    isPending?: boolean;
    hourlyRateCents?: number;
  };
  userId: string;
  userEmail: string;
}
```

#### 2. TherapistAvailability (`components/TherapistAvailability/`)
**Google Calendar integrated availability system**

- Real-time availability fetching from Google Calendar
- Timezone-aware time slot display
- Calendar grid with date/time selection
- Mobile-responsive design with modal overlay

**Features:**
- Desktop: Split calendar/time selection layout
- Mobile: Full-screen modal with time slots
- Future-only slot filtering
- Integration status checking

#### 3. AlternativeBooking (`components/AlternativeBooking.tsx`)
**Fallback for therapists without Google Calendar integration**

- Displays therapist profile information
- External Calendly link integration
- Interest notification system for pending therapists

#### 4. BillingCheckWrapper (`components/BillingCheckWrapper.tsx`)
**Payment verification for paid sessions**

- Checks if user has valid payment methods
- Redirects to billing setup if needed
- Conditional wrapper based on therapist pricing

### Utilities

#### TimezoneManager (`utils/timezoneManager.ts`)
**Centralized timezone handling system**

- User timezone detection with fallback mapping
- Timezone conversion utilities
- Display formatting for different contexts
- Email template timezone formatting

**Key Methods:**
```typescript
const tzManager = TimezoneManager.getInstance();
tzManager.getUserTimezone() // Get detected timezone
tzManager.formatForDisplay(dateTime, options) // Format for UI
tzManager.convertTimezone(dateTime, from, to) // Convert between zones
```

#### DateTime Utilities (`utils/dateTimeUtils.ts`)
**Date/time formatting helpers**

- Consistent date formatting across components
- Timezone-aware formatting
- Integration with Luxon DateTime

#### String Utilities (`utils/stringUtils.ts`)
**Common string operations**

- Name initials generation
- Text formatting helpers

### Actions

#### sendBookingConfirmationEmail (`actions/sendBookingConfirmationEmail.ts`)
**Server actions for email notifications**

**Functions:**
- `sendBookingConfirmationEmail()` - Dual email to client and therapist
- `sendTherapistCalendlyEmail()` - Calendly booking notifications
- `sendBookingInterestNotification()` - Interest expression emails

### State Management

Uses Preact Signals for reactive state:
- Availability slots
- Selected time slots
- Loading states
- Error handling
- Integration status

### Component Structure

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
│   ├── EmailTemplates/
│   │   └── [email templates]
│   └── BookingFormComponents/             # Empty directory
├── actions/
│   └── sendBookingConfirmationEmail.ts    # Email server actions
├── utils/
│   ├── timezoneManager.ts                 # Centralized timezone handling
│   ├── dateTimeUtils.ts                   # Date formatting utilities
│   └── stringUtils.ts                     # String manipulation helpers
├── types.ts                               # All TypeScript definitions
├── index.ts                               # Feature exports
└── README.md                              # This documentation
```

## Integration Points

### External Services
- **Google Calendar API**: Real-time availability fetching
- **Calendly**: External booking widget integration
- **Stripe**: Payment verification for paid sessions
- **PostHog**: Analytics tracking throughout booking flow
- **Resend**: Email notification delivery

### API Endpoints
- `GET /api/sessions/availability` - Fetch therapist availability
- `POST /api/sessions/create` - Create booking session
- `POST /api/track/calendly` - Track Calendly events
- `GET /api/google-calendar/status` - Check integration status

### Environment Variables
```env
RESEND_API_KEY=re_xxx
NEXT_PUBLIC_POSTHOG_KEY=phc_xxx
```

## Usage Examples

### Basic Booking Flow
```typescript
import { BookingFlow } from '@/src/features/booking';

export default function BookingPage() {
  return (
    <BookingFlow
      advisor={{
        id: "123",
        name: "Dr. Jane Smith",
        bookingURL: "https://calendly.com/jane-smith",
        hourlyRateCents: 15000
      }}
      userId="user_123"
      userEmail="user@example.com"
    />
  );
}
```

### Timezone Management
```typescript
import { TimezoneManager } from '@/src/features/booking';

const tzManager = TimezoneManager.getInstance();
const userTz = tzManager.getUserTimezone();
const formatted = tzManager.formatForDisplay(new Date(), {
  timezone: userTz,
  format: 'datetime'
});
```

## Current Issues & Improvements Needed

### Issues Identified
1. **Empty Directories**: `hooks/` and `BookingFormComponents/` are empty
2. **Mixed Component Organization**: Some components in subdirectories, others at root
3. **Type Isolation**: Types are centralized but could be better organized by domain
4. **Missing Documentation**: Limited JSDoc comments in components

### Recommended Improvements
1. **Clean up empty directories**
2. **Consolidate component organization**
3. **Add comprehensive JSDoc documentation**
4. **Create domain-specific type groups**
5. **Add component-level README files for complex subdirectories**

## Developer Notes

### Key Architectural Decisions
- **Dual Booking System**: Supports both internal (Google Calendar) and external (Calendly) booking
- **Timezone-First Design**: All datetime handling is timezone-aware from the start
- **Conditional Billing**: Payment verification only for therapists with pricing
- **Analytics-Heavy**: Comprehensive tracking throughout the booking funnel

### Testing Considerations
- Mock Google Calendar API responses
- Test timezone conversion accuracy
- Verify email template rendering
- Test mobile responsive behavior

### Performance Considerations
- Availability fetching is optimized with proper loading states
- Calendar grid uses efficient date calculations
- Email sending includes rate limiting

This feature is critical to the core business flow and requires careful handling of datetime, payments, and external integrations. 