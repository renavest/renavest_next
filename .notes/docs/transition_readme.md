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

### 3. Explore Feature (`src/features/explore/`)

**Status**: ✅ Restructured and improved for handoff

**Improvements Made:**
- Restructured directory hierarchy moving state and hooks from nested components structure to feature level
- Enhanced type system with comprehensive TypeScript definitions using JSDoc documentation
- Added centralized exports in `index.ts` for better developer experience
- Created comprehensive utility functions for booking, expertise handling, and image management
- Added complete README.md with detailed architecture documentation
- Improved component organization with better separation of concerns

#### Structure Overview
```
src/features/explore/
├── components/                    # React components
│   ├── AdvisorGrid.tsx               # Main responsive grid display of advisors
│   ├── AdvisorModal.tsx              # Detailed advisor modal with booking
│   └── ExploreNavbar.tsx             # Navigation component with user controls
├── state/                         # Global state management
│   └── exploreState.ts               # Preact signals for advisor state
├── hooks/                         # Custom React hooks
│   ├── useMarketplaceIntegration.ts  # Calendar integration status hook
│   └── useImageLoadState.ts          # Image loading state management hook
├── utils/                         # Utility functions
│   ├── expertiseUtils.ts             # Expertise tag parsing and rendering
│   └── bookingUtils.ts               # Booking logic and API interactions
├── types.ts                       # Comprehensive TypeScript definitions
├── index.ts                       # Centralized feature exports
└── README.md                      # Complete feature documentation
```

#### Key Components
- **AdvisorGrid**: Responsive grid layout with image optimization and expertise tags
- **AdvisorModal**: Full advisor details with booking functionality and integration status
- **ExploreNavbar**: Navigation with dynamic titles, back button, and mobile menu

#### Features
- **Responsive Design**: 1-3 column grid adapting to screen size
- **Image Optimization**: Progressive loading with Next.js Image component
- **Booking Integration**: Dual booking modes (internal/external) with calendar detection
- **State Management**: Preact signals for reactive state without prop drilling
- **Error Handling**: Graceful fallbacks for images and API failures

#### State Management Architecture
Uses Preact signals for efficient reactive state:
- **Core Signals**: advisor modal, list management, loading states
- **Image Management**: Per-advisor loading and error states
- **Integration Detection**: Google Calendar status and booking mode
- **Computed Values**: Active/pending advisor counts and derived state

#### Custom Hooks
- **useMarketplaceIntegration**: Determines booking mode based on calendar integration
- **useImageLoadState**: Manages image loading states with proper fallbacks

#### Utility Functions
- **expertiseUtils**: Tag parsing, rendering, and CSS class generation
- **bookingUtils**: Self-booking prevention, notification sending, billing checks

#### Integration Points
- **Authentication**: Clerk integration with role-based access
- **Booking System**: Dual-mode booking (direct + external)
- **Analytics**: PostHog tracking for user interactions
- **Payment**: Stripe integration for billing verification

#### API Dependencies
- `/api/therapist/details/[id]` - Get therapist information
- `/api/booking/notify` - Send booking notifications
- `/api/stripe/billing-setup-check` - Verify payment setup
- `/api/therapist/id` - Get current user's therapist ID

#### Code Quality Notes
- **Type Safety**: Full TypeScript coverage with shared type compatibility
- **Component Architecture**: Clean separation with proper hook abstractions
- **Performance**: Optimized image loading and efficient state management
- **Error Handling**: Comprehensive error states and user feedback
- **Accessibility**: Keyboard navigation and screen reader support

#### Developer Notes
- State moved from nested component structure to feature-level organization
- Centralized exports make imports clean and predictable
- Comprehensive documentation enables easy onboarding
- Utility functions are well-tested and reusable

---

### 4. Employee Dashboard Feature (`src/features/employee-dashboard/`)

**Status**: ✅ Restructured and improved for handoff

**Improvements Made:**
- Created comprehensive centralized exports in `index.ts`
- Enhanced type system with JSDoc documentation and organized by functional areas
- Added complete README.md with architecture documentation
- **Reorganized physical file structure** into logical folders (layout/, sections/, modals/, subscription/, insights/, forms/)
- Improved component organization with better separation of concerns
- Fixed export inconsistencies and type conflicts
- Updated all import paths to reflect new folder structure

#### Structure Overview
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
│   ├── [+12 other core components]
├── state/                        # Global state management (Preact signals)
│   ├── dashboardState.ts             # Dashboard UI and sample data
│   └── clientFormsState.ts           # Form management state
├── types.ts                      # Comprehensive TypeScript definitions
├── index.ts                      # Centralized feature exports
└── README.md                     # Complete documentation
```

#### Key Features
- **Main Dashboard**: Comprehensive employee interface with session management
- **Forms System**: Dynamic therapist-assigned forms with real-time validation
- **Insights & Analytics**: Financial behavior analysis and goal tracking
- **Chat Integration**: Real-time messaging with assigned therapists
- **Subscription Gating**: Premium feature access control
- **Assessment Quiz**: Financial therapy questionnaire with recommendations

#### State Management
Uses Preact signals for reactive state:
- Dashboard UI state (scroll, navigation, goal selection)
- Form management (assignments, responses, validation)
- Sample data for insights and recommendations

#### Component Organization
- **Server Components**: Authentication and data fetching (`EmployeeDashboard`)
- **Client Components**: Interactive UI and state management (`LimitedDashboardClient`)
- **Presentational Components**: Pure UI with props (`DashboardContent`)
- **Specialized Sections**: Forms, insights, chat, documents

#### Type Safety & Documentation
- Comprehensive TypeScript coverage with JSDoc comments
- Types organized by functional area (Dashboard, Chat, Forms, Insights)
- Clear component prop interfaces
- State management type definitions

#### API Integration
- Form assignment and submission endpoints
- Session management and booking
- Chat messaging and channels
- Therapist recommendations
- Document sharing capabilities

#### External Dependencies
- **Clerk**: Authentication and user management
- **PostHog**: Analytics and behavior tracking
- **Stripe**: Subscription and billing
- **Sonner**: Toast notifications

#### Code Quality Notes
- **Component Structure**: Well-organized with clear separation of concerns
- **State Management**: Reactive signals pattern avoiding prop drilling
- **Type Safety**: Excellent TypeScript coverage with comprehensive interfaces
- **Documentation**: Complete README with usage examples and architecture
- **Accessibility**: Form components include proper labels and keyboard navigation
- **Performance**: Designed for code splitting and lazy loading

#### Developer Handoff Notes
- All components are documented with purpose and key features
- State management follows consistent patterns
- Forms system is dynamic and extensible
- Analytics integration is comprehensive
- Subscription gating is implemented throughout
- Component exports are centralized and well-organized

---

### 3. Employer Dashboard Feature (`src/features/employer-dashboard/`)

**Status**: ✅ Refactored and improved for handoff

**Improvements Made:**
- Consolidated all types into comprehensive `types.ts` file with JSDoc documentation
- Created proper `index.ts` with organized exports for components, types, and state
- Added comprehensive `README.md` with usage examples and architecture overview
- Removed empty `actions/` directory for cleaner structure
- Updated state management to use centralized types from `types.ts`
- Enhanced type safety with proper TypeScript definitions

#### Structure Overview
```
src/features/employer-dashboard/
├── components/           # React components for dashboard UI
│   ├── EmployerNavbar.tsx           # Main navigation with company branding
│   ├── SponsoredGroupCard.tsx       # Individual group display with metrics
│   ├── SponsoredGroupsSection.tsx   # Groups overview and management
│   ├── SponsoredGroupUtils.tsx      # Utility functions for group styling
│   ├── ProgramOverviewSection.tsx   # High-level program statistics
│   ├── EmployeeInsightsCard.tsx     # Employee metrics visualization
│   ├── SessionAllocationChart.tsx   # Session utilization charts
│   ├── SessionsSection.tsx          # Session management interface
│   ├── EngagementChart.tsx          # User engagement visualization
│   ├── EngagementSection.tsx        # Engagement metrics display
│   ├── ChartsSections.tsx           # Charts wrapper component
│   └── CreditRequestsModal.tsx      # Modal for credit request management
├── state/                # Global state management
│   └── employerDashboardState.ts    # Preact signals for reactive state
├── types.ts              # Comprehensive TypeScript definitions
├── index.ts              # Organized feature exports
└── README.md             # Complete documentation and usage guide
```

#### Key Features
- **Sponsored Groups Management**: Create, view, and manage employee groups with real-time metrics
- **Comprehensive Analytics**: Financial wellness, session utilization, and engagement tracking
- **Credit Management**: Employee credit request approval workflow
- **Data Visualization**: Interactive charts with responsive design
- **State Management**: Reactive Preact signals for efficient updates

#### Key Components
- **EmployerNavbar**: Responsive navigation with company branding integration
- **SponsoredGroupCard**: Interactive group cards with utilization tracking and signup link generation
- **Analytics Charts**: Session allocation, engagement, and utilization visualizations
- **CreditRequestsModal**: Employee credit request management interface

#### State Management
Uses Preact signals for reactive state:
- `sessionMetricsSignal`: Session allocation and completion data
- `employeeMetricsSignal`: Employee participation and demographics
- `engagementMetricsSignal`: Platform engagement analytics
- `programStatsSignal`: High-level program performance metrics
- `financialWellnessMetricsSignal`: Financial wellness program metrics
- `satisfactionMetricsSignal`: Employee satisfaction data
- `therapistMetricsSignal`: Therapist utilization metrics
- `bookingMetricsSignal`: Booking and appointment analytics

#### Integration Points
- **Authentication**: Clerk user management integration
- **Styling**: Tailwind CSS with design system compliance
- **Analytics**: PostHog tracking integration
- **API**: REST endpoints for groups, metrics, and credit management

#### Type Safety
Comprehensive TypeScript definitions with:
- Core dashboard entities (SponsoredGroup, CreditRequest)
- Metrics interfaces (SessionMetrics, EmployeeMetrics, EngagementMetrics)
- Component props with JSDoc documentation
- Utility types for consistency

#### Code Quality Notes
- **Type Safety**: Comprehensive TypeScript coverage with centralized definitions
- **Component Architecture**: Well-organized component hierarchy with clear separation
- **State Management**: Efficient reactive state with Preact signals
- **Documentation**: Complete README with usage examples and troubleshooting
- **Performance**: Optimized components with proper loading states

#### Developer Notes
- All metrics use reactive signals for efficient updates
- Components are responsive and accessible
- Comprehensive error handling with user-friendly messaging
- Integration ready with proper API endpoint expectations

---

### 4. Booking Feature (`src/features/booking/`)

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

### 4. Chat Feature (`src/features/chat/`)

**Status**: ✅ Refactored and improved for handoff

**Improvements Made:**
- Consolidated all type definitions into central `types.ts` file
- Created comprehensive index.ts with clean exports
- Updated all components to use centralized types
- Added comprehensive README with architecture overview
- Organized empty state directory for future expansion

#### Structure Overview
```
src/features/chat/
├── components/
│   ├── ChatMessageArea.tsx           # Main chat interface with SSE integration
│   ├── ConnectionStatusIndicator.tsx # Real-time connection status display
│   └── ChatChannelList.tsx          # Channel selection and management
├── hooks/
│   ├── useChat.ts                   # Core SSE connection and message handling
│   └── useChatContext.ts            # User role and authentication context
├── state/                           # Reserved for future global state management
├── types.ts                         # Consolidated TypeScript definitions
├── index.ts                         # Feature exports and namespacing
└── README.md                        # Comprehensive documentation
```

#### Key Components

**ChatMessageArea** - Primary chat interface featuring:
- Real-time messaging via Server-Sent Events (SSE)
- Role-based UI (therapist vs prospect experiences)
- Message export for therapeutic compliance
- Responsive design with mobile optimization
- Connection status visualization
- Conversation starter prompts for therapists

**ConnectionStatusIndicator** - Visual connection health display:
- Real-time connection state visualization
- Animated indicators for different connection states
- User-friendly status messaging

**ChatChannelList** - Channel management interface:
- Active conversation browsing
- Participant name display
- Channel switching functionality

#### Architecture Highlights

**Real-time Communication**:
- **Technology**: Server-Sent Events (SSE) for efficient one-way communication
- **Connection Management**: Automatic connection lifecycle with error recovery
- **Message Flow**: Deduplication, sorting, and real-time delivery
- **Performance**: Optimized for minimal server resources vs WebSocket alternatives

**Authentication & Security**:
- **Role-based Access**: Clerk integration with therapist/prospect role detection
- **Channel Security**: Server-side access verification
- **HIPAA Compliance**: Secure message handling and export functionality
- **Data Privacy**: Encrypted message storage with audit trails

**State Management**:
- **Current**: Local React state via custom hooks
- **Architecture**: Prepared for global state expansion in dedicated state directory
- **Context Management**: Centralized user role and authentication context

#### Core Hooks

**useChat** - Main chat functionality:
```typescript
const { messages, connectionStatus, sendMessage } = useChat(channelId);
```
- SSE connection management with automatic cleanup
- Message deduplication and chronological sorting
- Connection state tracking (disconnected/connecting/connected/error)
- Error handling and recovery mechanisms

**useChatContext** - User authentication and role management:
```typescript
const { userRole, therapistId, userId, isLoading } = useChatContext();
```
- Clerk authentication integration
- Role detection from user metadata
- Therapist ID extraction for routing

#### API Integration

**Required Endpoints**:
- `GET /api/chat/{channelId}` - SSE connection for real-time messages
- `POST /api/chat/send` - Send new message to channel
- `GET /api/chat/export` - Export chat history for compliance

**Message Flow Architecture**:
1. User input → `sendMessage` hook function
2. POST to API endpoint with channel and content
3. Server processing and broadcast to channel
4. SSE delivery to all connected clients
5. Local state update and UI re-render

#### Compliance & Export Features

**Therapeutic Record Keeping**:
- Complete chat history export to formatted text files
- Automatic filename generation with timestamps
- HIPAA-compliant data handling throughout
- Export functionality integrated into chat interface

#### Responsive Design

**Desktop Experience**:
- Split-pane layout with channel list and message area
- Full conversation history visibility
- Rich message composition with conversation starters

**Mobile Experience**:
- Optimized single-pane layout
- Touch-friendly message bubbles
- Conversation starter prompts for therapist engagement

#### Code Quality Improvements

1. **Type Consolidation**: All interfaces moved to central `types.ts`
2. **Import Optimization**: Updated all components to use centralized types
3. **Export Organization**: Clean module exports with proper namespacing
4. **Documentation**: Comprehensive README with usage examples and architecture
5. **Future-Ready Structure**: Organized directories for planned enhancements

#### Integration Points

**External Dependencies**:
- **Clerk**: User authentication and role management
- **Tailwind CSS**: Responsive UI components
- **Lucide React**: Icon system for status indicators
- **SSE API**: Real-time message streaming

**Environment Configuration**:
```env
NEXT_PUBLIC_ENABLE_CHAT_FEATURE=true  # Feature flag control
```

#### Performance Features

**Optimization Strategies**:
- Message deduplication prevents duplicate renders
- Automatic scroll management for conversation flow
- Efficient re-rendering with proper React keys
- Connection pooling and cleanup on unmount

**Scalability Considerations**:
- Channel-based isolation prevents message cross-talk
- SSE provides efficient server resource usage
- Minimal memory footprint with message history management

#### Code Quality Notes

- **Type Safety**: Comprehensive TypeScript coverage with strict interfaces
- **Component Architecture**: Clear separation of concerns with logical grouping
- **Error Handling**: Robust error states with user-friendly messaging
- **Accessibility**: Keyboard navigation and screen reader support
- **Security**: Role-based access control and secure message handling

#### Critical Business Logic

**Therapeutic Communication**:
- Real-time chat essential for therapeutic relationship building
- Export functionality required for compliance and record-keeping
- Role-based access crucial for privacy and therapeutic boundaries
- Connection reliability critical for trust and engagement

#### Developer Notes

**Testing Priorities**:
- SSE connection stability across network conditions
- Message delivery verification and deduplication
- Role-based UI rendering and access control
- Export functionality accuracy and file generation

**Known Limitations**:
- No offline message queuing (requires active connection)
- Single message type support (no rich media attachments)
- Manual channel management (no auto-channel creation)
- No conversation search or filtering capabilities

**Future Enhancement Readiness**:
- State directory prepared for global state management
- Type system designed for additional message types
- Component structure supports feature extensions
- API architecture ready for additional endpoints

#### Environment Dependencies
```env
NEXT_PUBLIC_ENABLE_CHAT_FEATURE=true  # Chat functionality toggle
```

---

## Next Steps
Continue reviewing remaining features...
