# Employee Dashboard Feature

## Overview
The Employee Dashboard feature provides a comprehensive interface for individual employees to manage their financial therapy journey, view sessions, complete forms, and interact with therapists.

## Structure

```
src/features/employee-dashboard/
├── components/                    # React components
│   ├── forms/                    # Form-related components
│   │   ├── ClientFormsDashboard.tsx    # Main forms management interface
│   │   ├── ClientFormFill.tsx          # Form filling interface
│   │   └── ClientFormField.tsx         # Individual form field component
│   ├── insights/                 # Data visualization and insights
│   │   ├── TherapistRecommendations.tsx     # Therapist matching display
│   │   ├── PersonalActionableInsights.tsx   # Spending insights
│   │   ├── PersonalGoalsTracker.tsx         # Financial goal tracking
│   │   └── ProgressComparisonChart.tsx      # Progress visualization
│   ├── EmployeeDashboard.tsx          # Main server component wrapper
│   ├── LimitedDashboardClient.tsx     # Client component with subscription gates
│   ├── DashboardContent.tsx           # Main dashboard layout
│   ├── EmployeeNavbar.tsx            # Dashboard navigation
│   ├── ChatSection.tsx               # Therapist chat interface
│   ├── SharedDocumentsSection.tsx    # Document sharing
│   ├── UpcomingSessionsSection.tsx   # Session management
│   ├── CurrentPlanCard.tsx           # Subscription plan display
│   ├── SubscriptionPlanIndicator.tsx # Plan status indicator
│   ├── QuizModal.tsx                 # Financial assessment quiz
│   ├── FinancialTherapyModal.tsx     # Educational content modal
│   ├── SharePanel.tsx                # Referral sharing
│   ├── VideoLibrary.tsx              # Educational video library
│   ├── ConsultationBanner.tsx        # Booking consultation CTA
│   └── TherapistRecommendationsWithOverlay.tsx # Quiz-gated recommendations
├── state/                        # Global state management
│   ├── dashboardState.ts             # Dashboard UI and sample data
│   └── clientFormsState.ts           # Form management state
├── types.ts                      # TypeScript definitions
├── index.ts                      # Feature exports
└── README.md                     # This documentation
```

## Key Components

### Main Dashboard Components

#### `EmployeeDashboard`
- **Type**: Server Component
- **Purpose**: Entry point with authentication and user validation
- **Key Features**: Clerk integration, role verification, onboarding state cleanup

#### `LimitedDashboardClient` 
- **Type**: Client Component
- **Purpose**: Main dashboard with subscription-based feature gating
- **Key Features**: Subscription validation, modal management, referral tracking

#### `DashboardContent`
- **Type**: Presentational Component
- **Purpose**: Main dashboard layout and sections
- **Key Features**: Responsive grid layout, upcoming sessions, therapist recommendations, chat

### Forms Management

#### `ClientFormsDashboard`
- **Purpose**: Form assignment management interface
- **Key Features**: 
  - Form status filtering (sent, completed, expired)
  - Search functionality
  - Progress tracking
  - Cache-aware data loading

#### `ClientFormFill`
- **Purpose**: Interactive form completion interface
- **Key Features**:
  - Dynamic field rendering
  - Real-time validation
  - Progress tracking
  - Auto-save capabilities

#### `ClientFormField`
- **Purpose**: Reusable form field component
- **Supported Types**: text, email, textarea, select, radio, checkbox, number, date
- **Key Features**: Validation, error handling, accessibility

### Insights & Analytics

#### `TherapistRecommendations`
- **Purpose**: Display algorithm-matched therapists
- **Key Features**: Match scores, specialties, availability, booking integration

#### `PersonalActionableInsights`
- **Purpose**: Spending analysis and suggestions
- **Key Features**: Categorized insights, savings calculations, friendly messaging

#### `PersonalGoalsTracker`
- **Purpose**: Financial goal visualization and tracking
- **Key Features**: Progress bars, categorization, timeline tracking

#### `ProgressComparisonChart`
- **Purpose**: Visual comparison of financial metrics over time
- **Key Features**: Past vs current data, category breakdown

### Interactive Components

#### `QuizModal`
- **Purpose**: Financial therapy assessment questionnaire
- **Key Features**: Multi-step flow, progress tracking, PostHog analytics
- **Questions**: 5 questions covering financial behaviors and confidence

#### `ChatSection`
- **Purpose**: Real-time messaging with assigned therapists
- **Key Features**: Message history, file sharing, typing indicators

#### `SharedDocumentsSection`
- **Purpose**: Document sharing between client and therapist
- **Key Features**: File upload, categorization, access control

## State Management

### Dashboard State (`dashboardState.ts`)
Global UI state using Preact signals:
- `isHeaderScrolledSignal`: Header scroll state
- `selectedGoalSignal`: Selected financial goal
- `isMobileMenuOpenSignal`: Mobile navigation state
- Sample data for insights and goals

### Client Forms State (`clientFormsState.ts`)
Form management using Preact signals:
- Form assignments and responses
- Validation state and errors
- Loading and submission states
- Progress calculation utilities

## Types

Comprehensive TypeScript definitions organized by functional area:
- **Core Dashboard**: Component props and configuration
- **Therapist Related**: Therapist data and matching
- **Chat Related**: Messaging and channels
- **Modal Components**: Interactive dialog props
- **Insights & Analytics**: Financial data structures
- **Forms & Documents**: Form definitions and responses
- **Subscription**: Plan and billing types

## API Integration

### Required Endpoints
- `GET /api/client/forms` - Retrieve form assignments
- `POST /api/client/forms/[id]/submit` - Submit completed forms
- `GET /api/sessions/upcoming` - Fetch upcoming sessions
- `GET /api/chat/channels` - Get chat channels
- `POST /api/chat/send` - Send messages
- `GET /api/therapist/recommendations` - Get matched therapists

### External Dependencies
- **Clerk**: Authentication and user management
- **PostHog**: Analytics and user tracking
- **Stripe**: Subscription and billing management
- **Sonner**: Toast notifications

## Usage Examples

### Basic Import
```typescript
import { 
  EmployeeDashboard,
  ClientFormsDashboard,
  QuizModal 
} from '@/src/features/employee-dashboard';
```

### Using Form Components
```typescript
import { 
  ClientFormField,
  clientFormsActions,
  clientFormsStateSignal 
} from '@/src/features/employee-dashboard';

// Access form state
const formState = clientFormsStateSignal.value;

// Update form response
clientFormsActions.setResponse('fieldId', 'value');
```

### State Management
```typescript
import { 
  selectedGoalSignal,
  actionableInsights 
} from '@/src/features/employee-dashboard';

// Access selected goal
const currentGoal = selectedGoalSignal.value;

// Update selected goal
selectedGoalSignal.value = 1;
```

## Development Notes

### Component Organization
- **Server Components**: Authentication and data fetching
- **Client Components**: Interactive UI and state management
- **Presentational Components**: Pure UI components with props

### State Philosophy
- Uses Preact signals for reactive state management
- Avoids prop drilling through global state
- Separates UI state from business logic

### Subscription Gating
Many components include subscription-based feature gating:
- Basic plan: Limited access to premium features
- Premium plan: Full feature access
- Employer-sponsored: Enhanced features

### Form System
Dynamic form system supporting:
- Therapist-assigned forms
- Real-time validation
- Progress tracking
- Expiration handling
- Response caching

## Testing Considerations

### Component Testing
- Mock Clerk authentication
- Mock form state signals
- Test subscription gating logic
- Verify analytics tracking

### Integration Testing
- Form submission flows
- Chat functionality
- Therapist recommendations
- Session booking integration

## Performance Considerations

### Code Splitting
- Components are designed for lazy loading
- Heavy charts/visualizations are conditionally rendered
- Form components load on demand

### Caching
- Form data includes cache-aware loading
- Therapist recommendations cached per user
- Chat messages use optimistic updates

### Analytics
- PostHog integration for user behavior tracking
- Form completion tracking
- Feature usage analytics
- Error tracking and monitoring 