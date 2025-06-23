# Explore Feature

The Explore feature allows users to browse and discover available therapists/advisors, view their profiles, and initiate booking sessions. It includes a responsive grid layout, detailed modal views, and integrated booking functionality.

## Architecture Overview

```
src/features/explore/
├── components/           # React components
│   ├── AdvisorGrid.tsx       # Main grid display of advisors
│   ├── AdvisorModal.tsx      # Detailed advisor modal view
│   └── ExploreNavbar.tsx     # Navigation component
├── state/               # Global state management
│   └── exploreState.ts      # Preact signals for advisor state
├── hooks/              # Custom React hooks
│   ├── useMarketplaceIntegration.ts # Calendar integration hook
│   └── useImageLoadState.ts         # Image loading state hook
├── utils/              # Utility functions
│   ├── expertiseUtils.ts    # Expertise tag handling
│   └── bookingUtils.ts      # Booking-related utilities
├── types.ts           # TypeScript type definitions
├── index.ts           # Centralized exports
└── README.md          # This documentation
```

## Key Components

### AdvisorGrid
The main component that displays advisors in a responsive grid layout.

**Features:**
- Responsive grid (1-3 columns based on screen size)
- Priority image loading for first 3 advisors
- Image loading states with placeholders
- Expertise tag display with overflow handling
- Click-to-open modal functionality

**Usage:**
```tsx
import { AdvisorGrid } from '@/src/features/explore';

<AdvisorGrid advisors={advisorsList} />
```

### AdvisorModal
Detailed modal view showing full advisor information and booking options.

**Features:**
- Full advisor bio and credentials
- Booking functionality with integration detection
- Google Calendar integration status
- Self-booking prevention
- External calendar fallback

**State Management:**
Uses global signals for modal state - automatically opens when advisor is clicked from grid.

### ExploreNavbar
Navigation component with back button, title, and user controls.

**Features:**
- Dynamic page titles
- Optional back button
- Mobile menu support
- User account controls
- Subscription plan indicator

## State Management

The explore feature uses Preact signals for reactive state management:

### Core Signals
- `advisorSignal` - Currently selected advisor for modal
- `isOpenSignal` - Modal open/closed state
- `advisorsListSignal` - Full list of advisors
- `advisorsLoadingSignal` - Loading state for advisor list
- `advisorsErrorSignal` - Error state for advisor operations

### Image Management
- `advisorImageLoadingSignal` - Loading states per advisor ID
- `advisorImageErrorSignal` - Error states per advisor ID

### Integration Signals
- `isGoogleCalendarConnectedSignal` - Calendar integration status
- `isCheckingIntegrationSignal` - Integration check loading
- `marketplaceErrorSignal` - Integration error state
- `bookingModeSignal` - 'internal' or 'external' booking mode

### Computed Signals
- `hasAdvisorsSignal` - Whether any advisors are loaded
- `activeAdvisorsSignal` - Non-pending advisors
- `pendingAdvisorsSignal` - Pending advisors
- `advisorCountsSignal` - Count statistics

## Custom Hooks

### useMarketplaceIntegration
Manages advisor calendar integration status and booking mode.

```tsx
const { isConnected, isChecking, error, bookingMode } = useMarketplaceIntegration(advisor);
```

**Returns:**
- `isConnected` - Whether Google Calendar is connected
- `isChecking` - Loading state for integration check
- `error` - Any integration errors
- `bookingMode` - 'internal' or 'external' booking

### useImageLoadState
Manages image loading and error states for advisor photos.

```tsx
const { imageLoadState, handleImageLoad, handleImageError } = useImageLoadState(advisor.id);
```

**Returns:**
- `imageLoadState` - Object with `isLoaded`, `hasError`, `isLoading`
- `handleImageLoad` - Success handler for Image onLoad
- `handleImageError` - Error handler for Image onError

## Utility Functions

### expertiseUtils.ts
- `parseExpertiseTags()` - Parse comma-separated expertise string
- `createExpertiseTags()` - Create tag objects with overflow handling
- `getExpertiseTagClasses()` - Get CSS classes for tags
- `formatExperience()` - Format years of experience
- `truncateBio()` - Truncate bio text for previews

### bookingUtils.ts
- `isBookingSelf()` - Check if user is booking themselves
- `getBookingButtonText()` - Get appropriate button text
- `sendBookingNotification()` - Send email to therapist
- `checkBillingSetup()` - Verify payment method setup
- `getIntegrationStatus()` - Get status indicator text/color

## Integration Points

### Authentication
- Uses Clerk for user authentication
- Checks user role and therapist ID to prevent self-booking
- Redirects to appropriate dashboards based on user type

### Booking System
- **Internal Booking**: For advisors with Google Calendar integration
  - Direct booking through `/book/[therapistId]` route
  - Stripe billing integration for payments
- **External Booking**: For advisors without integration
  - Opens external booking URL in new tab
  - Sends notification email to therapist

### Analytics
- PostHog tracking for advisor interactions
- Events tracked:
  - `therapist_profile_viewed`
  - `therapist_session_booked`
- User identification with current therapist context

### Image Management
- Next.js Image component with optimization
- Progressive loading with blur placeholders
- Error handling with fallback images
- Priority loading for above-the-fold content

## API Dependencies

### Required Endpoints
- `GET /api/therapist/details/[id]` - Get therapist details
- `POST /api/booking/notify` - Send booking notification
- `GET /api/stripe/billing-setup-check` - Check payment setup
- `GET /api/therapist/id` - Get current user's therapist ID

### Data Structure
Advisors must include:
```typescript
interface Advisor {
  id: string;
  therapistId?: number;
  name: string;
  title: string;
  profileUrl?: string;
  expertise: string;
  yoe: string;
  hasGoogleCalendar?: boolean;
  googleCalendarStatus?: 'connected' | 'disconnected' | 'pending';
  bookingURL?: string;
  isPending?: boolean;
  // ... other optional fields
}
```

## Styling

### Design System
- Uses COLORS constants from `@/src/styles/colors`
- Tailwind CSS for responsive design
- Purple color scheme (warm purple variants)
- Consistent spacing and typography

### Responsive Breakpoints
- Mobile: 1 column grid
- Tablet: 2 columns
- Desktop: 3 columns
- Large screens: 3 columns with max-width container

### Component States
- Loading: Skeleton placeholders and spinners
- Error: Fallback images and error messages
- Hover: Scale animations and background changes
- Focus: Keyboard navigation support

## Error Handling

### Image Loading
- Graceful fallback to placeholder images
- Loading states prevent layout shift
- Error boundaries for component crashes

### API Errors
- Toast notifications for user feedback
- Console logging for debugging
- Graceful degradation for missing data

### Integration Failures
- External booking fallback
- Clear status indicators
- Error messaging for failed operations

## Performance Optimizations

### Image Optimization
- Next.js Image component with `sizes` attribute
- Priority loading for first 3 images
- Blur placeholders reduce perceived loading time
- WebP format with quality optimization

### State Management
- Signals provide efficient reactivity
- Computed values prevent unnecessary recalculations
- Centralized state reduces prop drilling

### Component Optimization
- React.memo and useCallback where appropriate
- Lazy loading for modal content
- Efficient re-rendering with proper dependency arrays

## Development Notes

### Adding New Advisor Fields
1. Update `Advisor` interface in `types.ts`
2. Add display logic in `AdvisorModal.tsx`
3. Update any utility functions as needed
4. Consider backward compatibility

### Extending Booking Functionality
1. Add new booking modes to `bookingModeSignal`
2. Update `useMarketplaceIntegration` hook
3. Modify booking utilities in `bookingUtils.ts`
4. Test integration status detection

### State Management Best Practices
- Use actions from `advisorActions` for state mutations
- Prefer computed signals for derived state
- Keep signals atomic and focused
- Document signal purposes and dependencies

## Testing Considerations

### Unit Tests
- Test utility functions independently
- Mock API calls in hook tests
- Test component rendering with different props

### Integration Tests
- Test booking flow end-to-end
- Verify image loading states
- Test modal open/close functionality

### Accessibility Tests
- Keyboard navigation
- Screen reader compatibility
- Focus management in modal
- Alt text for images

## Migration Notes

### From Previous Structure
- Moved state from `components/state/` to `state/`
- Moved hooks from `components/utils/` to `hooks/`
- Created centralized exports in `index.ts`
- Enhanced type definitions with JSDoc
- Added comprehensive utility functions

### Breaking Changes
- Import paths changed from nested component structure
- State signals may have different names
- Some utility functions were reorganized 