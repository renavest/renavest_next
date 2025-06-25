# PostHog Analytics Feature

## Overview
Comprehensive analytics and event tracking system integrated with PostHog for monitoring user behavior, feature usage, and business metrics across the Renavest platform.

## Structure
```
src/features/posthog/
├── PostHogProvider.tsx           # React provider for client-side tracking
├── authTrackingServer.ts         # Server-side authentication event tracking
├── therapistTrackingServer.ts    # Server-side therapist event tracking
├── therapistTracking.ts          # Client-side therapist analytics
├── tracking.ts                   # General client-side tracking utilities
├── types.ts                      # Analytics type definitions
├── index.ts                      # Feature exports
└── README.md                     # This documentation
```

## Features
- **Multi-Role Tracking**: Separate analytics for employees, therapists, and employers
- **Real-Time Events**: Immediate event capture and analysis
- **User Journey Analytics**: Onboarding funnels and feature adoption
- **Business Metrics**: Revenue tracking, session completion rates
- **Privacy Compliance**: HIPAA-compliant analytics with data anonymization

## Usage

### Client-Side Tracking
```typescript
import { posthog, PostHogProvider } from '@/src/features/posthog';

// Wrap app with provider
function App() {
  return (
    <PostHogProvider>
      <YourAppContent />
    </PostHogProvider>
  );
}

// Track events in components
import { trackBookingEvent } from '@/src/features/posthog';

function BookingComponent() {
  const handleBooking = () => {
    trackBookingEvent('session_booking_completed', {
      sessionId: 'session_123',
      therapistId: 'therapist_456',
      amount: 150
    });
  };
}
```

### Server-Side Tracking
```typescript
import { trackAuthEvent, trackTherapistEvent } from '@/src/features/posthog';

// Authentication events
await trackAuthEvent('user_signed_in', {
  userId: user.id,
  authMethod: 'email',
  userRole: 'employee'
});

// Therapist events
await trackTherapistEvent('therapist_session_completed', {
  therapistId: therapist.id,
  sessionCount: therapist.completedSessions,
  hourlyRate: therapist.hourlyRate
});
```

## Event Categories

### Authentication Events
- `user_signed_in`: User login events
- `user_signed_out`: User logout events  
- `user_registered`: New user registration
- `sso_login`: Single sign-on authentication

### Therapist Events
- `therapist_profile_updated`: Profile information changes
- `therapist_availability_set`: Calendar availability updates
- `therapist_connected_stripe`: Payment setup completion
- `therapist_session_completed`: Session completion tracking

### Booking Events
- `session_booking_started`: Booking flow initiation
- `session_booking_completed`: Successful booking completion
- `session_booking_cancelled`: Booking cancellation
- `session_reschedule_requested`: Rescheduling requests

### Payment Events
- `payment_method_added`: New payment method setup
- `subscription_created`: New subscription activation
- `payment_succeeded`: Successful payment processing
- `payment_failed`: Failed payment attempts

## Analytics Dashboards

### User Acquisition
- Registration conversion rates by source
- Onboarding completion funnels
- Feature adoption timelines

### Business Metrics
- Revenue tracking and projections
- Session completion rates
- Therapist utilization metrics

### Product Analytics
- Feature usage heatmaps
- User journey analysis
- Drop-off point identification

## Privacy & Compliance

### HIPAA Compliance
- No PHI (Protected Health Information) in events
- User data anonymization
- Secure event transmission

### Data Retention
- 90-day event retention policy
- Automatic PII scrubbing
- Opt-out mechanisms for users

## Environment Variables
```env
NEXT_PUBLIC_POSTHOG_KEY=phc_xxx       # PostHog project API key
NEXT_PUBLIC_POSTHOG_HOST=us.posthog.com  # PostHog instance URL
POSTHOG_PERSONAL_API_KEY=phx_xxx      # Server-side API key
```

## Integration Points
- **Clerk**: User authentication and identity
- **Stripe**: Payment and subscription events
- **Calendar APIs**: Session scheduling analytics
- **Database**: User activity correlation 