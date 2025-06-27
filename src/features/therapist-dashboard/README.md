# Therapist Dashboard Feature

## Overview
The therapist dashboard provides a comprehensive interface for therapists to manage their practice, including client management, session scheduling, document sharing, and analytics.

## Structure Overview
```
src/features/therapist-dashboard/
├── components/                    # React components
│   ├── availability-management/   # Schedule and calendar management
│   ├── clients/                   # Client relationship management  
│   ├── dashboard/                 # Main dashboard interface
│   ├── documents/                 # Document sharing and forms
│   ├── forms/                     # Dynamic form builder and management
│   ├── navigation/                # Navigation components
│   ├── profile/                   # Profile editing and verification
│   ├── sessions/                  # Session tracking and management
│   └── shared/                    # Reusable components
├── hooks/                         # Custom React hooks for dashboard logic
├── state/                         # Global state management (Preact signals)
├── types/                         # TypeScript definitions (organized by domain)
└── utils/                         # Utility functions for calculations and formatting
```

## Key Features

### Client Management
- **Client List**: View and manage all assigned clients
- **Client Profiles**: Detailed client information and session history
- **Communication**: Real-time chat with clients via integrated chat system
- **Notes Management**: Create, edit, and organize clinical notes with rich content structure

### Session Management  
- **Session Scheduling**: Book and manage therapy sessions
- **Session Completion**: Mark sessions complete and trigger payment processing
- **Availability Management**: Set working hours and block specific times
- **Google Calendar Integration**: Automatic calendar sync and event creation

### Document & Forms System
- **Document Sharing**: Upload and share documents with clients
- **Dynamic Form Builder**: Create custom intake forms with drag-and-drop interface
- **Form Assignment**: Assign forms to specific clients
- **Document Categories**: Organize documents by type and client

### Profile & Settings
- **Professional Profile**: Edit qualifications, expertise, and bio
- **Photo Management**: Upload and manage profile photos with caching
- **Stripe Connect**: Integration for therapist payouts
- **Rate Management**: Set and update hourly rates

### Analytics & Insights
- **Session Metrics**: Track completed sessions and revenue
- **Client Statistics**: Monitor client growth and engagement
- **Performance Dashboard**: View key performance indicators

## State Management Architecture

Uses **Preact Signals** for efficient reactive state:

### Core State Files
- **`therapistDashboardState.ts`**: Main dashboard data, clients, sessions, statistics
- **`profileState.ts`**: Profile information and editing state
- **`availabilityState.ts`**: Working hours, blocked times, availability slots
- **`formsState.ts`**: Form builder state and form assignments

### Key Signals
```typescript
// Dashboard state
export const therapistIdSignal = signal<number | null>(null);
export const clientsSignal = signal<Client[]>([]);
export const upcomingSessionsSignal = signal<UpcomingSession[]>([]);
export const statisticsSignal = signal<TherapistStatistics | null>(null);

// Profile state  
export const profileSignal = signal<TherapistProfile | null>(null);
export const profileSavingSignal = signal(false);

// Availability state
export const workingHoursSignal = signal<WorkingHours[]>([]);
export const blockedTimesSignal = signal<BlockedTime[]>([]);
```

## Component Architecture

### Main Dashboard Component
**`TherapistDashboardClient.tsx`** - Primary dashboard interface featuring:
- Statistics overview cards
- Quick action shortcuts  
- Comprehensive client management section with tabbed interface
- Real-time chat integration
- Session management tools

### Key Sub-Components
- **`ClientManagementSection`**: Tabbed interface for client overview, notes, documents, forms, sessions, and chat
- **`AvailabilityManagement`**: Working hours and blocked time management
- **`FormBuilder`**: Drag-and-drop form creation with live preview
- **`DocumentUpload`**: Secure document sharing with clients

## Type System

### Organized Type Structure
```
types/
├── index.ts          # Main exports and cross-cutting types
├── client.ts         # Client-related interfaces
├── session.ts        # Session and scheduling types  
├── availability.ts   # Calendar and availability types
├── dashboard.ts      # Dashboard metrics and statistics
├── profile.ts        # Therapist profile types
├── components.ts     # Component prop interfaces
├── documents.ts      # Document and file sharing types
├── forms.ts          # Form builder and response types
└── payments.ts       # Payment and billing types
```

### Key Types
```typescript
// Client management
interface Client {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  status: 'active' | 'inactive' | 'pending';
  totalSessions: number;
  createdAt: string;
}

// Session management  
interface UpcomingSession {
  id: string;
  clientId: string;
  scheduledAt: string;
  duration: number;
  status: 'scheduled' | 'completed' | 'cancelled';
  sessionType: 'initial' | 'follow-up' | 'emergency';
}

// Dashboard statistics
interface TherapistStatistics {
  totalClients: number;
  activeClients: number;
  totalSessions: number;
  upcomingSessions: number;
  totalRevenue: number;
  monthlyRevenue: number;
  completionRate: number;
}
```

## Integration Points

### External Services
- **Google Calendar**: OAuth integration for availability and event management
- **Stripe Connect**: Therapist payout processing and commission handling
- **Clerk Authentication**: User management and role verification  
- **Chat System**: Real-time messaging with clients
- **PostHog Analytics**: Usage tracking and performance monitoring

### Key API Endpoints
```
GET /api/therapist/details/[id]     # Therapist profile information
GET /api/therapist/clients          # Client list and details
POST /api/therapist/client-notes    # Create/update clinical notes
GET /api/sessions/availability      # Real-time availability data
POST /api/sessions/complete         # Mark session complete
GET /api/therapist/forms            # Form templates and assignments
POST /api/therapist/documents       # Document upload and sharing
```

## Custom Hooks

### `useTherapistDashboard`
Main dashboard data management:
```typescript
const { 
  refreshData,        // Refresh all dashboard data
  loading,           // Loading state
  error             // Error state  
} = useTherapistDashboard(therapistId);
```

### `useTherapistActions`  
Common therapist actions:
```typescript
const {
  completeSession,    // Mark session complete
  createNote,        // Create client note
  uploadDocument,    // Upload document
  assignForm        // Assign form to client
} = useTherapistActions();
```

## Performance Considerations

### Optimizations
- **Preact Signals**: Minimal re-renders with efficient reactive state
- **Image Caching**: Profile photo caching with cache-busting
- **Lazy Loading**: Components loaded on-demand
- **API Caching**: Strategic caching of session and client data

### Best Practices
- All datetime operations are timezone-aware
- Real-time updates via signals prevent stale data
- Proper error boundaries and loading states
- HIPAA-compliant data handling throughout

## Security & Compliance

### Data Protection
- **HIPAA Compliance**: Encrypted clinical notes and client data
- **Access Control**: Role-based access to client information
- **Audit Trails**: Complete logging of client data access
- **Secure File Handling**: Document encryption and access controls

### Authentication
- Clerk integration with therapist role verification
- Session management with automatic logout
- Multi-factor authentication support

## Development Guidelines

### Adding New Components
1. Create component in appropriate subdirectory
2. Define prop types in `types/components.ts`
3. Add any business logic types to relevant domain type file
4. Use signals for state management when state is shared
5. Include proper TypeScript types and JSDoc comments

### State Management Patterns
```typescript
// ✅ Good: Use signals for shared state
export const newFeatureSignal = signal<FeatureData | null>(null);

// ✅ Good: Computed values for derived state  
export const filteredDataSignal = computed(() => 
  dataSignal.value.filter(item => item.active)
);

// ❌ Avoid: Prop drilling for shared state
// ❌ Avoid: useState for data that needs to persist across components
```

### Component Organization
- **Pure Components**: Use for display-only components with props
- **State Components**: Use signals for components that manage state
- **Hook Components**: Extract complex logic into custom hooks
- **Server Components**: Use for data fetching when possible

## Testing Strategy

### Component Testing
- Test component rendering with various props
- Test user interactions and state changes
- Mock external API calls and services
- Test error states and edge cases

### Integration Testing  
- Test complete user workflows (e.g., session booking to completion)
- Test real-time features with WebSocket mocking
- Test file upload and download workflows
- Verify HIPAA compliance in data handling

## Common Issues & Troubleshooting

### Performance Issues
- **Slow Re-renders**: Check signal usage and ensure minimal subscriptions
- **Memory Leaks**: Verify proper cleanup in useEffect hooks
- **Image Loading**: Use proper caching and fallback handling

### Integration Issues
- **Google Calendar**: Verify OAuth tokens and refresh handling
- **Stripe Connect**: Check account status and webhook processing
- **Chat System**: Ensure proper SSE connection management

### Data Consistency
- **Stale Data**: Use proper cache invalidation strategies
- **Race Conditions**: Implement proper loading states and debouncing
- **Timezone Issues**: Always use UTC for storage, local for display

## Future Enhancements

### Planned Features
- **Advanced Analytics**: Detailed therapist performance metrics
- **Mobile App**: React Native therapist dashboard
- **EMR Integration**: Integration with electronic medical records
- **Group Sessions**: Support for group therapy sessions
- **AI Insights**: ML-powered client progress analysis

### Technical Improvements
- **Offline Support**: PWA capabilities for offline note-taking
- **Advanced Search**: Full-text search across notes and documents  
- **Bulk Operations**: Batch actions for client and session management
- **Export Functionality**: PDF export of notes and reports

## Migration Notes

### From Previous Version
- Signals replace useState for shared state
- Centralized type definitions improve maintainability  
- Enhanced error handling and loading states
- Improved mobile responsiveness

### Breaking Changes
- Component prop interfaces have been centralized
- Some API endpoints have changed for consistency
- Authentication flow updated for improved security

---

This documentation provides a comprehensive foundation for developers working with the therapist dashboard feature. Each component is well-documented, properly typed, and follows consistent patterns for maintainability and scalability. 