# Home Feature

## Overview
The Home feature contains all components, utilities, and types for the Renavest landing page. This feature provides a comprehensive marketing website with interactive sections, testimonials, business impact metrics, and user engagement tracking.

## Architecture

### Directory Structure
```
src/features/home/
├── components/          # React components for landing page sections
├── utils/              # Utility functions for animations and tracking
├── types.ts            # Comprehensive TypeScript definitions
├── index.ts            # Centralized feature exports
└── README.md           # This documentation
```

## Key Components

### Layout Components
- **HeroSection**: Main hero section with dynamic content and CTA
- **Navbar**: Responsive navigation with mobile menu and authentication states
- **Footer**: Simple footer with branding and social links

### Content Sections
- **WhatWeDoSection**: Interactive card-based section showcasing platform features
- **TestimonialSection**: Customer testimonial with animated reveal
- **BusinessImpactSection**: Business metrics with hover tracking
- **WhatIsFinancialTherapySection**: Educational content about financial therapy
- **JasmineJourneySection**: Step-by-step user journey visualization

### Interactive Components
- **JourneyStep**: Individual journey step with animations and responsive design
- **CTAButton**: Reusable call-to-action button with tracking
- **PilotCohortBanner**: Time-sensitive banner with countdown timer
- **DataCardExample**: Interactive data visualization component

## State Management

The home feature uses minimal local state management, relying on:
- React's `useState` and `useEffect` for component-level state
- Preact signals for UTM tracking and dynamic content
- PostHog for analytics and user behavior tracking

No centralized state management is needed as components are largely presentational.

## Key Features

### 🎨 Responsive Design
- Mobile-first design approach
- Breakpoint-aware animations and layouts
- Touch-friendly interactions on mobile devices

### 📊 Analytics Integration
- Comprehensive PostHog tracking throughout all components
- Section visibility tracking with intersection observers
- User interaction tracking (clicks, hovers, scroll depth)
- A/B testing support through dynamic content signals

### ⚡ Performance Optimization
- Lazy loading for images and heavy components
- Intersection observers for efficient scroll-based animations
- Debounced and throttled event handlers
- Optimized re-renders with React.memo

### 🎭 Animation System
- Consistent animation patterns across all components
- Intersection observer-based reveal animations
- Staggered animations for lists and grids
- Responsive animation durations

## Type System

### Core Types
```typescript
// Journey and testimonial types
JourneyStep, JourneySectionProps

// Component prop types
CTAButtonProps, TestimonialCardProps, AnimatedTitleProps

// Business metrics
BusinessImpactStat, CountdownTime

// Analytics and tracking
TrackingContext, NavClickEvent, SectionViewEvent
```

### Type Safety Features
- Comprehensive JSDoc documentation
- Strict TypeScript configuration compliance
- Prop validation for all components
- Type-safe utility functions

## Utilities

### Animation Utilities (`utils/animationUtils.ts`)
- Intersection observer helpers
- CSS class generation for animations
- Responsive animation duration calculation
- Performance optimization helpers (debounce, throttle)

### Tracking Utilities (`utils/trackingUtils.ts`)
- PostHog event tracking functions
- User identification and property setting
- Specialized tracking for different component types
- Context-aware analytics helpers

## Integration Points

### External Services
- **PostHog**: Analytics and behavior tracking
- **Clerk**: Authentication state detection
- **Calendly**: External booking integration
- **UTM Tracking**: Dynamic content based on UTM parameters

### Internal Dependencies
- **Preact Signals**: For reactive UTM-based content
- **Tailwind CSS**: For styling and responsive design
- **Next.js**: Image optimization and routing
- **Sonner**: Toast notifications

## Usage Examples

### Basic Component Import
```typescript
import { HeroSection, CTAButton } from '@/src/features/home';
```

### Type Import
```typescript
import type { JourneyStep, CTAButtonProps } from '@/src/features/home';
```

### Utility Usage
```typescript
import { trackNavClick, calculateAnimationDelay } from '@/src/features/home';

// Track navigation
trackNavClick('pricing', false, { user_id: 'user123' });

// Calculate animation delay
const delay = calculateAnimationDelay(2, 0.1, 0.2); // "0.5s"
```

## Development Guidelines

### Component Structure
1. Use TypeScript with comprehensive type definitions
2. Implement proper error boundaries and loading states
3. Follow responsive design patterns
4. Include analytics tracking for user interactions
5. Use intersection observers for scroll-based animations

### Performance Considerations
1. Lazy load images and heavy components
2. Use React.memo for expensive re-renders
3. Implement debouncing for scroll and resize handlers
4. Optimize intersection observer usage

### Analytics Best Practices
1. Track all meaningful user interactions
2. Include context information in tracking events
3. Use consistent event naming conventions
4. Respect user privacy and tracking preferences

## Testing Strategy

### Component Testing
- Test all interactive functionality
- Verify responsive behavior across breakpoints
- Test animation states and transitions
- Validate analytics event firing

### Integration Testing
- Test UTM parameter handling
- Verify authentication state integration
- Test external service integrations (Calendly, PostHog)
- Validate cross-component interactions

## Accessibility

### Standards Compliance
- WCAG 2.1 AA compliance
- Proper semantic HTML structure
- Keyboard navigation support
- Screen reader compatibility
- High contrast color ratios

### Interactive Elements
- Focus management for modals and navigation
- ARIA labels for complex components
- Proper heading hierarchy
- Alternative text for images

## Browser Support

### Supported Browsers
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

### Progressive Enhancement
- Core functionality works without JavaScript
- Enhanced experience with modern browser features
- Graceful degradation for older browsers

## Contributing

### Adding New Components
1. Create component in `components/` directory
2. Add TypeScript types to `types.ts`
3. Export from `index.ts`
4. Update this README with component documentation
5. Add analytics tracking where appropriate

### Modifying Existing Components
1. Ensure backward compatibility
2. Update type definitions if needed
3. Test across all supported breakpoints
4. Verify analytics tracking still works
5. Update documentation as needed

## Troubleshooting

### Common Issues
1. **Animations not triggering**: Check intersection observer setup
2. **Analytics not tracking**: Verify PostHog initialization
3. **Responsive issues**: Check Tailwind breakpoint classes
4. **Type errors**: Ensure imports match exported types

### Debugging Tips
1. Use React DevTools for component state inspection
2. Check browser console for JavaScript errors
3. Use PostHog debugger for analytics verification
4. Test on real devices for mobile responsiveness 