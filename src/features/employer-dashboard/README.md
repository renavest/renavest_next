# Employer Dashboard Feature

## Overview
The Employer Dashboard feature provides a comprehensive interface for employers to manage their sponsored employee groups, track program metrics, and monitor the effectiveness of their financial wellness initiatives.

## Architecture

### Structure
```
src/features/employer-dashboard/
├── components/           # React components
│   ├── EmployerNavbar.tsx           # Main navigation component
│   ├── SponsoredGroupCard.tsx       # Individual group display
│   ├── SponsoredGroupsSection.tsx   # Groups overview section
│   ├── SponsoredGroupUtils.tsx      # Utility functions for groups
│   ├── ProgramOverviewSection.tsx   # High-level program stats
│   ├── EmployeeInsightsCard.tsx     # Employee metrics display
│   ├── SessionAllocationChart.tsx   # Session utilization charts
│   ├── SessionsSection.tsx          # Session management section
│   ├── EngagementChart.tsx          # User engagement visualization
│   ├── EngagementSection.tsx        # Engagement metrics section
│   ├── ChartsSections.tsx           # Charts wrapper component
│   └── CreditRequestsModal.tsx      # Modal for managing credit requests
├── state/                # Global state management
│   └── employerDashboardState.ts    # Preact signals for metrics
├── types.ts              # TypeScript definitions
├── index.ts              # Feature exports
└── README.md             # This documentation
```

### Key Features
- **Sponsored Groups Management**: Create, view, and manage employee groups
- **Real-time Metrics**: Track engagement, sessions, and financial wellness
- **Credit Management**: Monitor and approve additional session credit requests
- **Data Visualization**: Interactive charts for program insights
- **Responsive Design**: Mobile-friendly dashboard interface

## Components

### Core Components

#### `EmployerNavbar`
Main navigation component with company branding and user management.

**Features:**
- Responsive mobile/desktop navigation
- Company logo integration
- User authentication controls
- Smooth scroll effects

**Usage:**
```tsx
import { EmployerNavbar } from '@/src/features/employer-dashboard';

<EmployerNavbar 
  showCompanyBranding={true}
  customNavItems={customItems}
/>
```

#### `SponsoredGroupCard`
Displays individual sponsored group information with interactive features.

**Features:**
- Group utilization visualization
- Signup link generation and copying
- Real-time progress tracking
- Encouragement messaging

**Usage:**
```tsx
import { SponsoredGroupCard } from '@/src/features/employer-dashboard';

<SponsoredGroupCard 
  group={sponsoredGroup}
  onEdit={handleEdit}
  onViewDetails={handleViewDetails}
/>
```

#### `ProgramOverviewSection`
High-level program statistics and KPIs.

**Props:**
- `stats`: Program statistics object
- `isLoading`: Loading state boolean

### Chart Components

#### `SessionAllocationChart`
Visualizes session allocation and utilization trends.

**Features:**
- Monthly session tracking
- Allocation vs completion comparison
- Customizable color schemes
- Responsive design

#### `EngagementChart`
Displays user engagement metrics over time.

**Features:**
- Daily/weekly/monthly engagement tracking
- Interactive tooltips
- Login frequency visualization

### Modal Components

#### `CreditRequestsModal`
Manages employee requests for additional session credits.

**Features:**
- Pending request review
- Approval/rejection workflow
- Employee information display
- Batch processing capabilities

## State Management

The feature uses Preact Signals for reactive state management:

```tsx
import { 
  sessionMetricsSignal,
  employeeMetricsSignal,
  engagementMetricsSignal,
  programStatsSignal 
} from '@/src/features/employer-dashboard';

// Access reactive state
const sessionMetrics = sessionMetricsSignal.value;
const employeeMetrics = employeeMetricsSignal.value;
```

### Available Signals
- `sessionMetricsSignal`: Session allocation and completion data
- `employeeMetricsSignal`: Employee participation and demographics
- `engagementMetricsSignal`: Platform engagement analytics
- `programStatsSignal`: High-level program performance

## Types

Comprehensive TypeScript definitions ensure type safety:

```tsx
import type { 
  SponsoredGroup,
  SessionMetrics,
  EmployeeMetrics,
  CreditRequest 
} from '@/src/features/employer-dashboard';
```

### Key Types
- `SponsoredGroup`: Core group entity with metrics
- `SessionMetrics`: Session allocation and utilization data
- `EmployeeMetrics`: Employee participation statistics
- `CreditRequest`: Employee credit request information

## Integration Points

### Authentication
Uses Clerk for user authentication:
```tsx
import { useUser } from '@clerk/nextjs';

const { isSignedIn, user } = useUser();
```

### Styling
Built with Tailwind CSS and follows design system:
```tsx
import { COLORS } from '@/src/styles/colors';
import { cn } from '@/src/lib/utils';
```

### Analytics
Integrated with PostHog for tracking:
```tsx
// Tracking is handled automatically in components
// No manual integration required
```

## API Dependencies

The feature expects these API endpoints:
- `/api/employer/sponsored-groups` - CRUD operations for groups
- `/api/employer/metrics` - Dashboard metrics and analytics
- `/api/employer/credit-requests` - Credit request management

## Usage Examples

### Basic Dashboard Setup
```tsx
import { 
  EmployerNavbar,
  ProgramOverviewSection,
  SponsoredGroupsSection,
  SessionsSection,
  EngagementSection
} from '@/src/features/employer-dashboard';

function EmployerDashboard() {
  return (
    <div className="min-h-screen bg-gray-50">
      <EmployerNavbar />
      <main className="pt-16 px-4 max-w-7xl mx-auto">
        <ProgramOverviewSection />
        <SponsoredGroupsSection />
        <div className="grid md:grid-cols-2 gap-6">
          <SessionsSection />
          <EngagementSection />
        </div>
      </main>
    </div>
  );
}
```

### Custom Metrics Display
```tsx
import { 
  sessionMetricsSignal,
  SessionAllocationChart 
} from '@/src/features/employer-dashboard';

function CustomMetrics() {
  const metrics = sessionMetricsSignal.value;
  
  return (
    <div className="bg-white rounded-lg p-6">
      <h3>Session Analytics</h3>
      <SessionAllocationChart 
        data={metrics}
        height={300}
        colorScheme="purple"
      />
    </div>
  );
}
```

## Development Notes

### Performance Considerations
- Components use React.memo for optimization
- Signals provide efficient reactivity
- Charts are lazily loaded
- Images use Next.js optimization

### Accessibility
- ARIA labels on interactive elements
- Keyboard navigation support
- Color contrast compliance
- Screen reader compatibility

### Testing
```bash
# Run component tests
npm test employer-dashboard

# Type checking
npm run type-check

# Linting
npm run lint
```

## Troubleshooting

### Common Issues

1. **Missing Company Branding**: Ensure UTM parameters are set correctly
2. **Chart Not Loading**: Verify data format matches interface requirements
3. **State Not Updating**: Check signal subscriptions and component updates

### Debug Mode
Enable debug logging:
```tsx
import { logger } from '@/src/lib/logger';

logger.debug('Employer Dashboard', { metrics, user });
```

## Contributing

1. Follow TypeScript strict mode requirements
2. Add comprehensive JSDoc comments
3. Include unit tests for new components
4. Update this README for new features
5. Follow the established naming conventions

## Dependencies

- `@clerk/nextjs`: Authentication
- `lucide-react`: Icons
- `@preact-signals/safe-react`: State management
- `next/image`: Optimized images
- `tailwindcss`: Styling 