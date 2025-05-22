```markdown
# Renavest Codebase Directory Structure Overview

This document provides an overview of the directory structure for the Renavest Next.js application. The project utilizes the Next.js App Router and aims towards a **Vertical Slice Architecture**, though some parts of the current structure reflect ongoing development and may not perfectly adhere to strict standards (with plans for refinement).

The codebase is primarily organized within the `src` directory, following Next.js conventions and our chosen architectural style.

## Directory Tree

```

.
├── app
│   ├── (auth)
│   │   ├── login
│   │   │   └── page.tsx
│   │   ├── sign-up
│   │   │   └── [[...rest]]
│   │   │       └── page.tsx
│   │   ├── sso-callback
│   │   │   └── page.tsx
│   │   └── therapist-signup
│   │       ├── error
│   │       │   └── page.tsx
│   │       └── page.tsx
│   ├── (protected)
│   │   ├── employee
│   │   │   └── page.tsx
│   │   ├── employer
│   │   │   └── page.tsx
│   │   ├── explore
│   │   │   └── page.tsx
│   │   └── therapist
│   │       ├── integrations
│   │       │   └── page.tsx
│   │       ├── onboarding
│   │       │   └── page.tsx
│   │       └── page.tsx
│   ├── (public)
│   │   ├── pricing
│   │   │   └── page.tsx
│   │   ├── privacy
│   │   │   └── page.tsx
│   │   └── terms
│   │       └── page.tsx
│   ├── api
│   │   ├── employee
│   │   │   └── upcoming-sessions
│   │   │       └── route.ts
│   │   ├── google-calendar
│   │   │   ├── auth
│   │   │   │   └── callback
│   │   │   │       └── route.ts
│   │   │   ├── disconnect
│   │   │   │   └── route.ts
│   │   │   ├── events
│   │   │   │   └── route.ts
│   │   │   ├── route.ts
│   │   │   └── status
│   │   │       └── route.ts
│   │   ├── images
│   │   │   └── [key]
│   │   │       └── route.ts
│   │   ├── referrals
│   │   │   ├── count
│   │   │   │   └── route.ts
│   │   │   └── record
│   │   │       └── route.ts
│   │   ├── sessions
│   │   │   ├── availability
│   │   │   │   └── route.ts
│   │   │   ├── confirmation
│   │   │   │   └── route.ts
│   │   │   └── route.ts
│   │   ├── therapist
│   │   │   ├── client-notes
│   │   │   │   └── route.ts
│   │   │   ├── clients
│   │   │   │   └── route.ts
│   │   │   ├── id
│   │   │   │   └── route.ts
│   │   │   ├── list-therapists
│   │   │   │   └── route.ts
│   │   │   ├── new-client
│   │   │   │   └── route.ts
│   │   │   ├── sessions
│   │   │   │   └── route.ts
│   │   │   ├── statistics
│   │   │   │   └── route.ts
│   │   │   └── verify-therapist
│   │           └── route.ts
│   │   ├── track
│   │   │   └── calendly
│   │   │       └── route.ts
│   │   ├── user-ready
│   │   │   └── route.ts
│   │   └── webhooks
│   │       └── clerk
│   │           ├── handlers.ts
│   │           └── route.ts
│   ├── book
│   │   ├── [advisorId]
│   │   │   └── page.tsx
│   │   ├── alternative-confirmation
│   │   │   └── page.tsx
│   │   └── confirmation
│   │       └── page.tsx
│   ├── email-preview
│   │   └── page.tsx
│   ├── favicon.ico
│   ├── favicon\_cloud.ico
│   ├── globals.css
│   ├── google-calendar
│   │   ├── error
│   │   │   └── page.tsx
│   │   └── success
│   │       └── page.tsx
│   ├── layout.tsx
│   └── page.tsx
├── constants.ts
├── db
│   ├── index.ts
│   └── schema.ts
├── features
│   ├── advisors
│   │   ├── components
│   │   └── state
│   ├── auth
│   │   ├── components
│   │   │   ├── GoogleSignInButton.tsx
│   │   │   ├── LoginForm.tsx
│   │   │   ├── LogoutButton.tsx
│   │   │   └── OAuthButton.tsx
│   │   ├── config
│   │   ├── hooks
│   │   ├── state
│   │   │   └── authState.ts
│   │   ├── types
│   │   │   └── auth.ts
│   │   └── utils
│   │       └── authTracking.ts
│   ├── booking
│   │   ├── actions
│   │   │   ├── bookingActions.ts
│   │   │   └── sendBookingConfirmationEmail.ts
│   │   ├── components
│   │   │   ├── AlternativeBooking.tsx
│   │   │   ├── BookingConfirmation
│   │   │   │   └── BookingConfirmationModal.tsx
│   │   │   ├── BookingFlow.tsx
│   │   │   ├── BookingFormComponents
│   │   │   ├── EmailTemplates
│   │   │   │   ├── BookingConfirmationEmailTemplate.tsx
│   │   │   │   ├── TherapistBookingNotificationEmailTemplate.tsx
│   │   │   │   └── TherapistCalendlyEmail.tsx
│   │   │   ├── TherapistAvailability
│   │   │   │   ├── TimeSelectionModal.tsx
│   │   │   │   ├── index.tsx
│   │   │   │   └── useTherapistAvailability.ts
│   │   │   ├── TherapistAvailability.tsx
│   │   │   ├── calendar
│   │   │   │   └── CalendarGrid.tsx
│   │   │   ├── confirmation
│   │   │   │   ├── AlternativeBookingSuccess.tsx
│   │   │   │   └── BookingSuccess.tsx
│   │   │   └── form
│   │   │       ├── BookingForm.tsx
│   │   │       └── useBookingConfirmation.ts
│   │   ├── hooks
│   │   └── utils
│   │       ├── dateTimeUtils.ts
│   │       ├── ensureUserInDb.ts
│   │       └── stringUtils.ts
│   ├── employee-dashboard
│   │   ├── components
│   │   │   ├── ComingSoon.tsx
│   │   │   ├── DashboardClient.tsx
│   │   │   ├── EmployeeNavbar.tsx
│   │   │   ├── FinancialTherapyModal.tsx
│   │   │   ├── LimitedDashboardClient.tsx
│   │   │   ├── UpcomingSessionsSection.tsx
│   │   │   └── insights
│   │   │       ├── PersonalActionableInsights.tsx
│   │   │       ├── PersonalGoalsTracker.tsx
│   │   │       ├── ProgressComparisonChart.tsx
│   │   │       ├── TherapistConnectionSummary.tsx
│   │   │       ├── TherapistRecommendations.tsx
│   │   │       └── WeeklyFinancialReport.tsx
│   │   └── state
│   │       └── dashboardState.ts
│   ├── employer-dashboard
│   │   ├── actions
│   │   ├── components
│   │   │   ├── ChartsSections.tsx
│   │   │   ├── CreditRequestsModal.tsx
│   │   │   ├── EmployeeInsightsCard.tsx
│   │   │   ├── EmployerNavbar.tsx
│   │   │   ├── EngagementChart.tsx
│   │   │   ├── EngagementSection.tsx
│   │   │   ├── ProgramOverviewSection.tsx
│   │   │   ├── SessionAllocationChart.tsx
│   │   │   └── SessionsSection.tsx
│   │   ├── state
│   │   │   └── employerDashboardState.ts
│   │   └── types
│   ├── explore
│   │   └── components
│   │       ├── AdvisorGrid.tsx
│   │       ├── AdvisorModal.tsx
│   │       ├── ExploreNavbar.tsx
│   │       └── state
│   │           └── advisorSignals.ts
│   ├── google-calendar
│   │   ├── components
│   │   │   └── GoogleCalendarIntegration.tsx
│   │   └── utils
│   │       ├── googleCalendar.ts
│   │       └── googleCalendarIntegration.ts
│   ├── home
│   │   ├── components
│   │   │   ├── BusinessImpactSection.tsx
│   │   │   ├── CTAButton.tsx
│   │   │   ├── DataCardExample.tsx
│   │   │   ├── Footer.tsx
│   │   │   ├── HeroSection.tsx
│   │   │   ├── JasmineJourneySection.tsx
│   │   │   ├── JourneyStep.tsx
│   │   │   ├── Navbar.tsx
│   │   │   ├── PilotCohortBanner.tsx
│   │   │   ├── TestimonialSection.tsx
│   │   │   ├── WhatIsFinancialTherapySection.tsx
│   │   │   ├── WhatWeDoSection.tsx
│   │   │   └── types.ts
│   │   └── utils
│   ├── onboarding
│   │   ├── actions
│   │   │   └── onboardingActions.ts
│   │   ├── components
│   │   │   ├── OnboardingModal.tsx
│   │   │   ├── OnboardingModalContent.tsx
│   │   │   └── OnboardingModalServerWrapper.tsx
│   │   ├── hooks
│   │   │   └── useOnboardingSubmission.ts
│   │   ├── state
│   │   │   └── onboardingState.ts
│   │   └── utils
│   │       └── onboardingTracking.ts
│   ├── parallax
│   │   ├── ParallaxWrapper.tsx
│   │   ├── Providers.tsx
│   │   └── hooks
│   │       ├── useParallaxImage.tsx
│   │       └── useParallaxRoute.tsx
│   ├── posthog
│   │   ├── PostHogProvider.tsx
│   │   └── tracking.ts
│   ├── pricing
│   │   ├── components
│   │   │   ├── PricingCalculator.tsx
│   │   │   └── PricingSummaryCards.tsx
│   │   └── data
│   ├── therapist-dashboard
│   │   ├── actions
│   │   ├── components
│   │   │   ├── AddNewClientSection.tsx
│   │   │   ├── ClientNotesForm.tsx
│   │   │   ├── ClientNotesSection.tsx
│   │   │   ├── TherapistDashboardClient.tsx
│   │   │   ├── TherapistNavbar.tsx
│   │   │   ├── TherapistStatisticsCard.tsx
│   │   │   └── UpcomingSessionsCard.tsx
│   │   ├── hooks
│   │   ├── state
│   │   │   └── therapistDashboardState.ts
│   │   ├── types
│   │   │   └── index.ts
│   │   └── utils
│   │       └── noteFormTracking.ts
│   └── utm
│       ├── PageText.tsx
│       ├── companyInfo.ts
│       └── utmCustomDemo.ts
├── lib
│   ├── referralTracking.ts
│   └── utils.ts
├── middleware.ts
├── old\_config
├── scripts
│   ├── README.md
│   ├── add-self-therapist.ts
│   ├── clear-booking-table.ts
│   ├── clear-therapists.ts
│   ├── convert-user-therapist.ts
│   ├── create-clerk-users-for-therapists.ts
│   ├── create-user.ts
│   ├── db-push-pipeline.js
│   ├── delete-user.ts
│   ├── migrate-therapist-emails.ts
│   ├── migrate-therapist-rates.ts
│   ├── migrate-therapists.ts
│   ├── seed-therapist-dashboard.ts
│   ├── sync-therapist-clerk-ids.ts
│   ├── update-therapist.ts
│   └── upload-stanley-image.ts
├── services
│   ├── calendly
│   └── s3
│       └── assetUrls.ts
├── shared
│   ├── components
│   │   └── MetricCard.tsx
│   └── types.ts
├── styles
│   └── colors.ts
└── utils
    └── timezone.ts

131 directories, 174 files

public/
├── cloud\_adjusted.png
├── demo.png
├── experts
│   ├── Aitzarelys.jpeg
│   ├── Constance.jpg
│   ├── GeorgeBlount.jpg
│   ├── JenniferCalder.jpeg
│   ├── JustinD.jpeg
│   ├── Kelly\_Reddy\_Heffner.jpeg
│   ├── LaQueshiaClemons.jpeg
│   ├── Maureen.jpeg
│   ├── Michele.jpeg
│   ├── MonicaB.jpeg
│   ├── Nathan\_Astle.jpg
│   ├── PaigeW.jpg
│   ├── Sarah\_Carr\_Headshot.jpeg
│   ├── ShaniT.jpg
│   ├── TamoaDanielleSmith.jpeg
│   ├── TiffanyGrant.jpeg
│   ├── TyanaIngram.jpeg
│   ├── haylie-castillo.jpg
│   ├── herosample.jpg
│   ├── jaelyn.jpg
│   ├── placeholderexp.png
│   ├── stanley.jpg
│   └── vince.jpg
├── file.svg
├── globe.svg
├── google-logo.svg
├── logos
│   ├── alkymi.png
│   ├── azibo.png
│   ├── bitnomial.png
│   ├── bridge.png
│   ├── climbcredit.png
│   ├── collectly.png
│   ├── comfortconnect.png
│   ├── comun.png
│   ├── edxmarkets.png
│   ├── functionalfi.png
│   ├── givebacks.png
│   ├── linkmoney.png
│   ├── loanstreet.png
│   ├── rainforest.png
│   └── redcon.png
├── next.svg
├── renavestlogo.png
├── renavestlogoblue.png
├── second\_one.jpg
├── vercel.svg
├── window.svg
└── women\_staring\_up.png

3 directories, 50 files

```

## Key Directories and Their Purpose

### `src/`
Contains the majority of the application's source code.

* **`app/`**: This is the core of the Next.js App Router. It defines the routes (pages) and API endpoints of the application.
    * **`(auth)`**: Contains authentication-related pages (login, signup, SSO callbacks). Grouping `()` allows for layout/styling specific to auth flows without affecting the URL path.
    * **`(protected)`**: Contains routes requiring user authentication.
        * `employee/`: The main dashboard and related pages for employees.
        * `employer/`: The main dashboard and related pages for employers, providing insights and management tools.
        * `therapist/`: The main dashboard and related pages for financial therapists, including integrations and onboarding.
        * `explore/`: Pages for Browse available therapists.
    * **`(public)`**: Contains publicly accessible marketing and information pages (pricing, privacy, terms).
    * **`api/`**: Defines API routes. Organized by domain (e.g., `employee`, `therapist`, `sessions`) and integration (`google-calendar`, `webhooks`). This is where backend logic exposed via API is handled, including data fetching, manipulation, and external service interactions.
    * **`book/`**: Handles the booking flow for scheduling sessions with therapists.
    * **`layout.tsx`**: The root layout for the entire application or specific route segments.
    * **`page.tsx`**: The root page component (`/`).

* **`features/`**: This directory houses **Vertical Slices**. Each subdirectory here represents a distinct feature or domain of the application (e.g., `auth`, `booking`, `employee-dashboard`, `employer-dashboard`, `therapist-dashboard`). The goal is for each "slice" to contain all relevant components, actions, hooks, state management, types, and utilities needed for that feature, minimizing dependencies on other slices. *Note: While striving for vertical slices, some cross-cutting concerns or initial implementation choices mean strict adherence is an ongoing effort.*
    * Common subdirectories within a feature slice:
        * `actions/`: Server Actions or functions handling mutations/business logic related to the feature.
        * `components/`: React components specific to this feature.
        * `hooks/`: Custom React hooks for the feature's logic.
        * `state/`: State management (e.g., using Zustand, Context API, or other patterns) for the feature.
        * `types/`: TypeScript type definitions specific to the feature.
        * `utils/`: Utility functions specific to the feature.
        * `config/`: Configuration files for the feature.
        * `data/`: Data mocks or static data used by the feature.
    * Examples of slices: `auth`, `booking`, `employee-dashboard`, `employer-dashboard`, `therapist-dashboard`, `explore`, `onboarding`, `pricing`, `google-calendar`, `posthog`, `utm`, `home`, `parallax`, `advisors`.

* **`db/`**: Contains database-related code, including the schema definition (`schema.ts`) and potentially the ORM setup (`index.ts`).

* **`lib/`**: Contains shared utility functions or helper modules that don't belong to a specific feature or service integration.

* **`services/`**: Houses code for interacting with external services or APIs (e.g., `calendly` for scheduling integration, `s3` for file storage/image handling).

* **`shared/`**: Contains components, types, or utilities that are genuinely used across multiple, distinct features. Use this sparingly to avoid becoming a dumping ground and to promote the vertical slice isolation.

* **`styles/`**: Contains global stylesheets or theme definitions.

* **`utils/`**: Contains miscellaneous utility functions that don't fit elsewhere (e.g., timezone helpers).

* **`constants.ts`**: Defines application-wide constants.

* **`middleware.ts`**: Next.js middleware for handling authentication redirects, headers, etc., before requests are processed.

* **`scripts/`**: Contains utility scripts, often for development, database seeding, migrations, or other maintenance tasks.

* **`old_config/`**: Likely contains deprecated or previous configuration files that are kept for reference but not actively used. Should be removed once confirmed unnecessary.

### `public/`
This directory serves static assets directly accessible from the root of the project (e.g., images, favicons).

* `experts/`: Contains image files for therapist profiles.
* `logos/`: Contains logo files for partners or clients.
* Other root files: Various images (`.png`, `.jpg`, `.svg`) used across the site for marketing or UI elements.

## Architecture Notes & Future Refinement

NO PROPERTY DRILLING. USE PREACT SAFE SIGNALS.

The project structure reflects a move towards vertical slices, where features aim to be self-contained. However, some areas, particularly the `app/api` routes and interaction patterns between features, might not yet fully achieve this isolation. Future refactoring efforts will focus on:

* Further decoupling logic within feature slices.
* Ensuring clearer boundaries between features and shared components/utilities.
* Consolidating related API routes or moving API logic closer to the relevant feature slice if appropriate within Next.js App Router patterns.
* Reviewing the use of `lib/` and `utils/` to ensure items here are truly cross-cutting concerns.

This structure provides a foundation for building out the distinct user dashboards (Employee, Employer, Therapist) and core functionalities (booking, analytics, integrations) identified in the project overview, while allowing for iterative improvement towards a more cohesive vertical slice model.

    Move the api folders into the features: For API routes that only serve a specific vertical slice (like the employee dashboard's upcoming sessions API), you would move that api folder into the corresponding feature directory (features/employee-dashboard/api/upcoming-sessions/route.ts). This keeps the API logic coupled with the feature it supports. API routes that are truly shared across multiple features (though in a strict vertical slice, you'd question if this is necessary or if the logic should be within one slice and potentially consumed by others via a shared service) could potentially remain in a top-level api/ or be moved to a features/shared-api/ slice.
    app router as a shell: Correct. In this model, the app directory primarily serves as the routing layer and potentially houses top-level layouts, error boundaries, and loading states that apply broadly (like the (auth), (protected), (public) groupings). The actual page content and API route handlers for a specific feature would reside within the corresponding directory in the features folder, imported into the minimal page.tsx or route.ts files in app.

This approach fully encapsulates each feature, making them more independent and easier to manage. It aligns with step 3 of the refactoring plan we discussed in the directory_structure_feedback document.
```


