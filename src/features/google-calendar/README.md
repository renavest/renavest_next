# Google Calendar Integration Feature

## Overview

The Google Calendar Integration feature provides comprehensive calendar integration for therapists in the Renavest platform. It handles OAuth authentication, event management, working hours configuration, and availability synchronization with Google Calendar.

## Architecture

### Directory Structure

```
src/features/google-calendar/
├── components/                    # React components
│   ├── GoogleCalendarIntegration.tsx    # Main integration component
│   ├── GoogleCalendarSteps.tsx          # Step-by-step wizard components
│   └── WorkingHoursSection.tsx          # Working hours management
├── context/                       # React Context & State Management
│   └── GoogleCalendarContext.tsx        # Global state with Preact signals
├── utils/                         # Utility functions
│   ├── googleCalendar.ts               # Calendar API operations
│   └── tokenManager.ts                 # OAuth token management
├── types/                         # TypeScript definitions
│   └── index.ts                        # Comprehensive type definitions
├── index.ts                      # Centralized exports
└── README.md                     # This file
```

## Key Components

### GoogleCalendarIntegration

Main component that provides a complete Google Calendar integration interface.

```tsx
import { GoogleCalendarIntegration } from '@/src/features/google-calendar';

function TherapistSettings() {
  return (
    <div>
      <h2>Calendar Integration</h2>
      <GoogleCalendarIntegration therapistId={123} />
    </div>
  );
}
```

**Features:**
- Connection status display with visual indicators
- Real-time integration status updates
- Connect/disconnect/reconnect functionality
- Error handling with user-friendly messages

### GoogleCalendarSteps

Individual step components for the integration wizard:

- **WelcomeStep**: Introduction and overview
- **PermissionsStep**: Explains required permissions
- **ConnectStep**: Handles OAuth connection
- **ResultStep**: Shows connection results
- **ConnectedStatus**: Management interface when connected
- **DisconnectedStatus**: Interface when not connected

### WorkingHoursSection

Component for managing therapist working hours and availability.

```tsx
import { WorkingHoursSection } from '@/src/features/google-calendar';

function AvailabilitySettings() {
  return <WorkingHoursSection />;
}
```

**Features:**
- Add/remove working hour blocks
- Day-of-week selection
- Time range configuration
- Save and validation functionality

## State Management

### Context & Signals

The feature uses **Preact Signals** for reactive state management through React Context:

```tsx
import { GoogleCalendarProvider, useGoogleCalendarContext } from '@/src/features/google-calendar';

function App() {
  return (
    <GoogleCalendarProvider initialTherapistId={123}>
      <MyComponent />
    </GoogleCalendarProvider>
  );
}

function MyComponent() {
  const { status, actions, therapistId, isValidTherapistId } = useGoogleCalendarContext();
  
  return (
    <div>
      <p>Status: {status.isConnected ? 'Connected' : 'Disconnected'}</p>
      <button onClick={actions.connect}>Connect</button>
    </div>
  );
}
```

### Global Signals

- `googleCalendarStatusSignal`: Per-therapist integration status
- `currentTherapistIdSignal`: Current active therapist ID
- `fetchedTherapistIdsSignal`: Tracking for already-fetched therapists

## Utility Functions

### Token Management

The `GoogleCalendarTokenManager` class handles OAuth token lifecycle:

```tsx
import { createTokenManager } from '@/src/features/google-calendar';

const tokenManager = createTokenManager(db);

// Generate OAuth URL
const authUrl = tokenManager.generateAuthUrl(therapistId);

// Exchange code for tokens
const tokens = await tokenManager.exchangeCodeForTokens(code);

// Ensure valid tokens (auto-refresh if needed)
const oauth2Client = await tokenManager.ensureValidTokens(therapist);
```

### Calendar Operations

```tsx
import { 
  createAndStoreGoogleCalendarEvent,
  prepareTherapistCalendarAccess,
  isGoogleAuthError 
} from '@/src/features/google-calendar';

// Create calendar event
const eventResult = await createAndStoreGoogleCalendarEvent({
  booking,
  therapist,
  user,
  db
});

// Prepare calendar access
const { therapist, oauth2Client } = await prepareTherapistCalendarAccess(db, therapistId);

// Check auth errors
if (isGoogleAuthError(error)) {
  // Handle authentication failure
}
```

## API Integration

### Required Endpoints

The feature integrates with these API endpoints:

- `GET /api/google-calendar?therapistId=123` - Generate OAuth URL
- `POST /api/google-calendar` - Exchange code for tokens
- `GET /api/google-calendar/status?therapistId=123` - Check connection status
- `POST /api/google-calendar/disconnect` - Disconnect integration

### Environment Variables

```env
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_REDIRECT_URI=https://yourapp.com/google-calendar/success
```

## TypeScript Support

### Core Types

```tsx
import type {
  GoogleCalendarIntegrationState,
  GoogleCalendarActions,
  TherapistWithCalendar,
  WorkingHours,
  CalendarEventData
} from '@/src/features/google-calendar';

// Integration state
const status: GoogleCalendarIntegrationState = {
  isConnected: true,
  isLoading: false,
  calendarEmail: 'therapist@example.com',
  lastSynced: '2024-01-01 10:00 AM',
  error: null
};

// Working hours
const hours: WorkingHours = {
  dayOfWeek: 1, // Monday
  startTime: '09:00',
  endTime: '17:00',
  isActive: true
};
```

### Component Props

All components have comprehensive TypeScript definitions with JSDoc documentation:

```tsx
interface GoogleCalendarIntegrationProps {
  therapistId?: number;
  showAvailabilityLink?: boolean;
  onStatusChange?: (status: GoogleCalendarIntegrationState) => void;
}
```

## Integration Flow

### 1. Initial Setup

```tsx
// Wrap your app with the provider
<GoogleCalendarProvider initialTherapistId={therapistId}>
  <TherapistDashboard />
</GoogleCalendarProvider>
```

### 2. Connection Process

1. User clicks "Connect Google Calendar"
2. System generates OAuth URL via API
3. User redirects to Google consent screen
4. Google redirects back with authorization code
5. System exchanges code for access/refresh tokens
6. Tokens stored securely in database
7. Integration status updated to "connected"

### 3. Event Management

```tsx
// Create calendar event for booking
const eventResult = await createAndStoreGoogleCalendarEvent({
  booking: sessionBooking,
  therapist: therapistData,
  user: userData,
  db: database
});

// Event includes Google Meet link automatically
console.log(eventResult.googleMeetLink);
```

### 4. Working Hours

```tsx
// Component automatically loads and manages working hours
<WorkingHoursSection />

// Custom implementation
const workingHours = await fetch(`/api/therapist/working-hours?therapistId=${id}`);
```

## Error Handling

### Authentication Errors

The system automatically detects authentication failures and disconnects invalid integrations:

```tsx
import { isGoogleAuthError } from '@/src/features/google-calendar';

try {
  await calendarOperation();
} catch (error) {
  if (isGoogleAuthError(error)) {
    // Auto-disconnect and prompt reconnection
    await actions.disconnect();
    setError('Please reconnect your Google Calendar');
  }
}
```

### Token Refresh

Tokens are automatically refreshed when needed:

```tsx
// Token manager handles this automatically
const oauth2Client = await tokenManager.ensureValidTokens(therapist);
```

## Performance Optimizations

### Caching

- Therapist status cached by ID in signals
- Prevents redundant API calls
- Automatic cache invalidation on status changes

### Lazy Loading

```tsx
// Components can be lazy loaded
const GoogleCalendarIntegration = lazy(() => 
  import('@/src/features/google-calendar').then(m => ({ 
    default: m.GoogleCalendarIntegration 
  }))
);
```

## Security Considerations

### Token Storage

- Access tokens stored encrypted in database
- Refresh tokens stored separately with additional encryption
- Automatic token revocation on disconnect

### Scopes

The integration requests minimal required scopes:
- `calendar.events` - Create/modify calendar events
- `userinfo.email` - Get user's calendar email
- `calendar.settings.readonly` - Read calendar settings
- `calendar.readonly` - Read calendar for availability

### Error Boundaries

```tsx
import { ErrorBoundary } from 'react-error-boundary';

<ErrorBoundary fallback={<GoogleCalendarError />}>
  <GoogleCalendarIntegration />
</ErrorBoundary>
```

## Testing

### Component Testing

```tsx
import { render, screen } from '@testing-library/react';
import { GoogleCalendarProvider, GoogleCalendarIntegration } from '@/src/features/google-calendar';

test('shows connection status', () => {
  render(
    <GoogleCalendarProvider initialTherapistId={123}>
      <GoogleCalendarIntegration />
    </GoogleCalendarProvider>
  );
  
  expect(screen.getByText(/connection status/i)).toBeInTheDocument();
});
```

### API Testing

```tsx
// Mock token manager for testing
jest.mock('@/src/features/google-calendar/utils/tokenManager');
```

## Troubleshooting

### Common Issues

1. **No refresh token received**
   - Ensure `prompt: 'consent'` in OAuth URL
   - Check Google OAuth settings for offline access

2. **Token refresh fails**
   - Verify Google API credentials
   - Check for revoked permissions in user's Google account

3. **Events not appearing**
   - Verify calendar permissions
   - Check timezone handling in event creation

4. **Integration status not updating**
   - Check signal reactivity
   - Verify API endpoint responses

### Debug Mode

```tsx
// Enable debug logging
localStorage.setItem('google-calendar-debug', 'true');
```

## Migration Notes

### From v0.x to v1.x

- State management moved to Preact signals
- Context provider now required
- Component props simplified
- Types reorganized and centralized

## Contributing

When extending this feature:

1. **Add new types** to `types/index.ts`
2. **Export new components** from `index.ts`
3. **Update this README** with new functionality
4. **Add JSDoc comments** to all public functions
5. **Write tests** for new components/utilities

## Dependencies

- `@clerk/nextjs` - Authentication
- `googleapis` - Google Calendar API
- `google-auth-library` - OAuth handling
- `@preact-signals/safe-react` - State management
- `drizzle-orm` - Database operations
- `lucide-react` - Icons
- `sonner` - Toast notifications 