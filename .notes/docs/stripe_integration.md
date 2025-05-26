🎯 Renavest Stripe Integration Plan: Phase 1 (MVP - Database-Centric)

To Claude, the LLM implementing Phase 1:

Your primary task is to implement the core Stripe payment and Connect functionalities for Renavest. For this initial phase, we are prioritizing direct database interaction (using your Drizzle ORM knowledge for PostgreSQL) and reliance on Stripe Webhooks for data synchronization.

Crucially, in Phase 1, you will NOT implement any caching layer (e.g., Redis/KV store) for Stripe data. All relevant Stripe state required by the application will be stored in, and read from, the PostgreSQL database directly, or fetched fresh from the Stripe API when necessary.

You have access to the Stripe SDK and can look up documentation for specific API calls (e.g., stripe.customers.create, stripe.checkout.sessions.create, stripe.paymentIntents.create, stripe.webhooks.constructEvent).
✅ Phase 1 Goal:

Enable the following core functionalities:

    Employee Subscriptions: Employees can sign up for recurring subscriptions.

    Employee Live Session Payments: Employees can book and be charged for one-off live sessions.

    Employer Subsidies: Employers can provide credits that reduce employee subscription or session costs.

    Therapist Payouts: Therapists are onboarded via Stripe Connect Express and receive payouts for live sessions.

    Renavest Platform Fees: Renavest accurately collects its platform fees.

🏗️ Core Architecture & Component Map (Phase 1 Focus)
Component	Purpose	Phase 1 Implementation Note
Stripe Connect (Marketplace)	Onboard & pay therapists (with Express accounts)	Implement OAuth flow, update therapists table with stripeAccountId.
Subscriptions	Recurring access for employees	Use stripe.checkout.sessions.create (subscription mode). Update users table based on customer.subscription webhooks.
One-off payments (PaymentIntents)	Live sessions booked a la carte	Use stripe.paymentIntents.create with capture_method: 'manual' and transfer_data. Update sessionPayments table based on payment_intent webhooks.
Customer balance	Employer subsidy credits for employees	Manage in your employerSubsidies Drizzle table; apply credits during PaymentIntent creation.
Transfers / Application fees	Revenue split between Renavest and therapists	Use transfer_data.destination and application_fee_amount on PaymentIntents.
Promo codes / Coupons (optional)	Employer discounts on sessions	Optional for Phase 1. If implemented, use Stripe's native promo codes applied to PaymentIntent or CheckoutSession.
Webhooks	Critical for real-time state synchronization with your database	PRIMARY MECHANISM for keeping your DB consistent with Stripe. Implement robust verification and processing.
🛠️ Phase 1 Implementation Plan: Actionable Steps for Claude
0. Pre-requisites & Assumptions:

    Technology Stack: TypeScript, Next.js (or similar JS backend), PostgreSQL, Drizzle ORM.

    Authentication: Clerk is used for user authentication and session management. You will need to integrate with Clerk's webhook system.

    Existing Database Tables: Assume users, employers, therapists, and bookingSessions tables already exist.

    Environment Variables: You must use STRIPE_SECRET_KEY, STRIPE_PUBLISHABLE_KEY, STRIPE_WEBHOOK_SECRET, STRIPE_CONNECT_CLIENT_ID, STRIPE_SUBSCRIPTION_PRICE_ID_STARTER, etc.

I. Core Data Model (Drizzle Schema):

Implement the following Drizzle schema additions/modifications.

      
import { pgTable, serial, integer, varchar, timestamp, text, unique } from 'drizzle-orm/pg-core';
import { users, employers, therapists, bookingSessions } from './schema'; // Assuming these exist

// 1. Stripe Customer Linking Table
// Purpose: Maps your internal users.id to Stripe's cus_ ID. Essential for consistent Stripe customer identification.
export const stripeCustomers = pgTable('stripe_customers', {
  id: serial('id').primaryKey(),
  userId: integer('user_id')
    .references(() => users.id, { onDelete: 'cascade' })
    .unique() // Each user has one Stripe customer ID
    .notNull(),
  stripeCustomerId: varchar('stripe_customer_id', { length: 255 }).notNull().unique(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// 2. Employer Subsidy Credits (applied to employees)
// Purpose: Tracks employer-provided credits for specific employees.
export const employerSubsidies = pgTable('employer_subsidies', {
  id: serial('id').primaryKey(),
  employerId: integer('employer_id')
    .references(() => employers.id, { onDelete: 'cascade' })
    .notNull(),
  userId: integer('user_id')
    .references(() => users.id, { onDelete: 'cascade' })
    .notNull(),
  creditAmountCents: integer('credit_amount_cents').notNull(), // e.g., 200 = $2.00
  reason: text('reason'), // e.g., 'Starter plan subsidy', 'Session credit'
  expiresAt: timestamp('expires_at'), // Optional expiry for credits
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// 3. Therapist Payout Ledger
// Purpose: A ledger for all payouts made to therapists (live sessions, async credits, refunds).
export const therapistPayouts = pgTable('therapist_payouts', {
  id: serial('id').primaryKey(),
  therapistId: integer('therapist_id')
    .references(() => therapists.id, { onDelete: 'cascade' })
    .notNull(),
  bookingSessionId: integer('booking_session_id') // Nullable for async credits
    .references(() => bookingSessions.id, { onDelete: 'cascade' }),
  amountCents: integer('amount_cents').notNull(), // e.g., 13500 = $135.00
  stripeTransferId: varchar('stripe_transfer_id', { length: 255 }), // Stripe ID for the transfer/payout
  paidAt: timestamp('paid_at'),
  status: varchar('status', { length: 50 }).default('pending').notNull(), // pending, completed, failed, refunded
  payoutType: varchar('payout_type', { length: 50 }).notNull(), // session_fee, async_credit, refund
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('created_at').defaultNow().notNull(),
});

// 4. Session Payments (Stripe receipts)
// Purpose: Records payment details for each individual booking session.
export const sessionPayments = pgTable('session_payments', {
  id: serial('id').primaryKey(),
  bookingSessionId: integer('booking_session_id')
    .references(() => bookingSessions.id, { onDelete: 'cascade' })
    .notNull()
    .unique(), // One payment record per session
  userId: integer('user_id')
    .references(() => users.id, { onDelete: 'cascade' })
    .notNull(),
  stripePaymentIntentId: varchar('stripe_payment_intent_id', { length: 255 }).notNull().unique(),
  totalAmountCents: integer('total_amount_cents').notNull(),
  subsidyUsedCents: integer('subsidy_used_cents').default(0).notNull(),
  outOfPocketCents: integer('out_of_pocket_cents').notNull(),
  status: varchar('status', { length: 50 }).default('pending').notNull(), // pending, succeeded, failed, refunded
  chargedAt: timestamp('charged_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('created_at').defaultNow().notNull(),
});

// 5. User Subscription Status (Add to your existing `users` table or create `userSubscriptions` if more complex state is needed)
// For Phase 1, assume these fields are added to the existing `users` table:
// - `subscriptionStatus`: varchar('subscription_status', { length: 50 }), // e.g., 'active', 'canceled', 'trialing', 'past_due', 'unpaid', 'none'
// - `stripeSubscriptionId`: varchar('stripe_subscription_id', { length: 255 }), // The actual Stripe subscription ID
// - `subscriptionEndDate`: timestamp('subscription_end_date'), // When the current subscription period ends
// - `cancelAtPeriodEnd`: boolean('cancel_at_period_end').default(false),

    

IGNORE_WHEN_COPYING_START
Use code with caution. TypeScript
IGNORE_WHEN_COPYING_END
II. Stripe Client Initialization & Helpers:

    Stripe Client:

        File: src/lib/stripe.ts

        Task: Initialize the Stripe Node.js client using STRIPE_SECRET_KEY.

          
    import Stripe from 'stripe';
    export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: '2023-10-16', // Or latest recommended API version
    });

        

    IGNORE_WHEN_COPYING_START

    Use code with caution. TypeScript
    IGNORE_WHEN_COPYING_END

    getOrCreateStripeCustomer Utility:

        File: src/lib/stripe/utils.ts

        Task: Implement a function that ensures every internal userId has a corresponding stripeCustomerId in your stripeCustomers Drizzle table.

        Logic:

            Given userId and userEmail.

            Query stripeCustomers table for userId.

            If found, return stripeCustomerId.

            If not found:

                Call stripe.customers.create({ email: userEmail, metadata: { userId: userId } }).

                Insert the new stripeCustomerId and userId into your stripeCustomers Drizzle table.

                Return the new stripeCustomerId.

III. Webhook Handling (The Source of Truth for State Sync):

This is paramount for keeping your database consistent with Stripe.

    Clerk Webhook Handler:

        File: src/app/api/webhooks/clerk/route.ts (or handlers.ts if structured that way)

        Task: Listen for Clerk user.created and user.updated events.

        Logic: When these events fire, use the getOrCreateStripeCustomer utility (from src/lib/stripe/utils.ts) to ensure the corresponding Stripe customer exists and is linked in your stripeCustomers table. This preemptively creates Stripe customers.

    Stripe Webhook Endpoint:

        File: src/app/api/webhooks/stripe/route.ts

        Task: Implement the main Stripe webhook listener.

        Security: MUST verify the webhook signature using stripe.webhooks.constructEvent. If verification fails, return 400.

        Event Processing (processEvent function): Based on the event.type, update your Drizzle database. This is where your database gets updated directly from Stripe's definitive state.

            checkout.session.completed:

                Extract session.customer (Stripe Customer ID) and session.metadata (which should include bookingSessionId if it was a session payment, or a flag for subscription).

                If it was a session payment: Update sessionPayments table: Set status to 'succeeded', link stripePaymentIntentId from the session.

                Do NOT directly infer subscription status from this event. Rely on customer.subscription.* events for that.

            customer.subscription.created / customer.subscription.updated / customer.subscription.deleted / customer.subscription.resumed / customer.subscription.paused:

                Extract subscription.customer (Stripe Customer ID) and the subscription object itself.

                Using stripeCustomers table, find the associated userId.

                Update the users table (or your userSubscriptions table if created) with the latest subscriptionStatus (e.g., 'active', 'canceled', 'trialing', 'none'), stripeSubscriptionId, subscriptionEndDate, and cancelAtPeriodEnd. This is how your app knows if a user is subscribed.

            payment_intent.succeeded:

                Extract paymentIntent.id and paymentIntent.metadata (which should include bookingSessionId, userId, therapistId).

                Update sessionPayments table: Set status to 'succeeded', chargedAt timestamp.

                Update bookingSessions table: Mark the session as 'completed' or 'paid'.

                Insert a record into therapistPayouts table: Derive amountCents for the therapist's share (e.g., 90% of paymentIntent.amount), link to bookingSessionId, set payoutType: 'session_fee', status: 'pending'. The actual Stripe transfer will have already happened via transfer_data.destination on the PaymentIntent, this is just recording it internally.

            payment_intent.payment_failed / payment_intent.canceled:

                Extract paymentIntent.id.

                Update sessionPayments table: Set status accordingly.

            account.updated (for Connect accounts):

                Extract account.id (Stripe Connect Account ID).

                Using your therapists table, find the associated therapistId (linked by stripeAccountId).

                Update relevant fields in the therapists table (e.g., payouts_enabled, charges_enabled, details_submitted).

            payout.succeeded / payout.failed: (Only relevant if you manually initiate payouts from your system for async credits)

                Extract payout.id and payout.status.

                Update therapistPayouts table: Mark the record as completed or failed, update paidAt timestamp.

        Allowed Events Constant: Define a constant like this for your webhook to only process relevant events:

          
    const ALLOWED_STRIPE_WEBHOOK_EVENTS: Stripe.Event.Type[] = [
      "checkout.session.completed",
      "customer.subscription.created",
      "customer.subscription.updated",
      "customer.subscription.deleted",
      "customer.subscription.paused",
      "customer.subscription.resumed",
      // "customer.subscription.pending_update_applied", // Less critical for MVP
      // "customer.subscription.pending_update_expired", // Less critical for MVP
      "customer.subscription.trial_will_end", // Useful for notifications
      "invoice.paid", // Confirms payment for subscriptions
      "invoice.payment_failed", // Critical for failed payments
      // "invoice.payment_action_required", // Less critical for MVP
      "payment_intent.succeeded", // CRITICAL for session payments
      "payment_intent.payment_failed",
      "payment_intent.canceled",
      "account.updated", // For Connect accounts onboarding status
      // "payout.succeeded", // If doing manual payouts
      // "payout.failed",    // If doing manual payouts
    ];

        

    IGNORE_WHEN_COPYING_START

    Use code with caution. TypeScript
    IGNORE_WHEN_COPYING_END

IV. Frontend-Initiated API Endpoints:

Implement these server routes that your frontend will call.

    Subscription Management API:

        File: src/app/api/stripe/subscriptions/route.ts

        POST (Create Checkout Session):

            Authenticate user (Clerk).

            Get userId.

            Call getOrCreateStripeCustomer(userId, userEmail) to get stripeCustomerId.

            Create stripe.checkout.sessions.create in subscription mode (using mode: 'subscription', line_items, and customer: stripeCustomerId).

            Set success_url to /billing/success.

            Return checkoutSession.url to the client.

        GET (Get Subscription Status):

            Authenticate user (Clerk).

            Get userId.

            Query stripeCustomers Drizzle table to get the stripeCustomerId.

            DIRECTLY call stripe.subscriptions.list({ customer: stripeCustomerId, limit: 1, status: 'all' }) to fetch the real-time status from Stripe.

            Return a simplified object with status (e.g., status, priceId, currentPeriodEnd, cancelAtPeriodEnd). No caching of this result in Phase 1.

    Live Session Payment API:

        File: src/app/api/stripe/session-payment/route.ts

        POST (Create PaymentIntent):

            Authenticate user (Clerk).

            Get userId.

            Retrieve bookingSessionId, calculate totalAmountCents for the session.

            Query employerSubsidies Drizzle table for userId to find available credits.

            Apply subsidy logic: Deduct subsidyUsedCents from totalAmountCents. Update/delete used subsidy records in employerSubsidies within a database transaction.

            Get therapist.stripeAccountId for the booked therapist from your therapists table.

            Create stripe.paymentIntents.create with:

                amount: outOfPocketCents (after subsidy).

                currency: 'usd'.

                customer: stripeCustomerId (from getOrCreateStripeCustomer).

                capture_method: 'manual' (for 36-hour delay).

                application_fee_amount: Renavest's 10% fee.

                transfer_data.destination: Therapist's stripeAccountId.

                metadata: { bookingSessionId, userId, therapistId, subsidyUsedCents }.

            Return paymentIntent.client_secret.

        PATCH (Capture PaymentIntent - Backend Only):

            This endpoint is for a backend service (e.g., a scheduled cron job or queue worker) that runs 36 hours after a session.

            Receive paymentIntentId as input.

            Call stripe.paymentIntents.capture(paymentIntentId).

            Reliance on Webhook: The actual update to sessionPayments and bookingSessions (to 'succeeded') will occur via the payment_intent.succeeded webhook triggered by this capture.

    Employer Subsidy Management API:

        File: src/app/api/employer/subsidies/route.ts

        POST (Add Subsidy):

            Authenticate (ensure employer permissions).

            Receive employerId, userId, creditAmountCents, reason, expiresAt.

            Insert directly into employerSubsidies Drizzle table.

        GET (Fetch Subsidies):

            Authenticate (ensure employer/admin permissions).

            Receive employerId or userId.

            Query employerSubsidies Drizzle table to retrieve active subsidies.

    Stripe Connect Onboarding & Callback APIs:

        Files: src/app/api/stripe/connect/oauth/route.ts (for initiating OAuth) and src/app/api/stripe/connect/oauth/callback/route.ts (for handling redirect).

        Task: Implement the OAuth flow for therapists to create/link Express accounts.

        Logic: Upon successful OAuth, retrieve stripeAccountId from the access_token response. Update the therapists Drizzle table with this stripeAccountId and set relevant status flags (e.g., onboardingStatus: 'completed').

        GET (Get Connect Status):

            File: src/app/api/stripe/connect/status/route.ts

            Task: Allow the therapist dashboard to check their Connect account status.

            Logic:

                Authenticate therapist.

                Query therapists table for stripeAccountId.

                DIRECTLY call stripe.accounts.retrieve(therapistStripeAccountId) to fetch the real-time status from Stripe.

                Return relevant status details (e.g., charges_enabled, payouts_enabled, details_submitted). No caching in Phase 1.

V. Frontend Integration Points:

    PaymentFlow Components: Use stripe-js (e.g., useStripe, useElements) to handle client-side collection of card details and confirm payments.

        For Subscriptions: Redirect to checkoutSession.url received from api/stripe/subscriptions.

        For Sessions: Call stripe.confirmCardPayment using client_secret received from api/stripe/session-payment.

    Billing Success Page:

        File: src/app/billing/success/page.tsx

        Purpose: This page is the success_url for Stripe Checkout sessions. It provides immediate UI feedback to the user.

        Logic:

            On page load, retrieve session_id from query parameters.

            Authenticate user (Clerk).

            Query stripeCustomers Drizzle table to get the stripeCustomerId for the current user.

            Immediately trigger an internal update: Call a server action or API route (e.g., a specialized version of the subscription GET endpoint that updates the DB) to directly query Stripe for the user's latest subscription status (stripe.subscriptions.list) and update the users table (or userSubscriptions table) with this status.

            Redirect the user to their dashboard or billing overview page. This ensures the UI is updated quickly, even before webhooks might fully process.

VI. Async Therapist Payouts (Beyond Live Sessions):

    Task: Implement a mechanism to pay therapists for async replies ($4 per reply, batched weekly).

    Logic:

        Internal Tracking: You'll need an internal system (e.g., a separate table or flags on therapistPayouts with payoutType: 'async_credit') to track accumulated async reply credits for each therapist.

        Weekly Job: Implement a weekly cron job or background worker.

        Payout Execution: For each therapist with accumulated async credits:

            Calculate total amount due.

            Call stripe.payouts.create or stripe.transfers.create to the therapist's stripeAccountId. (Stripe Connect Express accounts typically allow direct payouts).

            Update therapistPayouts records for these async credits to reflect the payout status (pending, then later completed/failed via payout.succeeded/payout.failed webhooks).

🔒 Security & Best Practices (Phase 1):

    Environment Variables: All API keys, secrets, and price IDs MUST be configured as environment variables.

    Webhook Security: Absolutely critical. Always verify Stripe webhook signatures using stripe.webhooks.constructEvent. Without this, your endpoint is vulnerable.

    Idempotency: Implement idempotency_key for all Stripe API calls that create or modify resources (e.g., checkout.sessions.create, paymentIntents.create, payouts.create). This prevents duplicate actions if requests are retried.

    Error Handling & Logging: Implement robust try/catch blocks for all Stripe API calls and webhook processing. Log errors comprehensively for debugging.

    PCI Compliance: Always use Stripe Checkout or Stripe Elements for collecting card data on the client-side. Never handle raw card data on your servers.

    Data Minimization: Only store necessary Stripe IDs and critical status flags in your Drizzle database. Avoid replicating Stripe's entire data model; fetch details from Stripe API when needed for display or deeper processing.

    Transactionality: When applying employer subsidies or updating multiple related tables in your database, use Drizzle's transactional capabilities to ensure atomicity.

✅ Definition of Done (Phase 1):

Phase 1 is complete when:

    Employees can successfully subscribe to a plan, and their subscriptionStatus is accurately reflected in the users table.

    Employees can successfully book a live session, make an out-of-pocket payment, and the sessionPayments and bookingSessions tables are updated correctly.

    Employers can add subsidies, and these are stored in employerSubsidies and correctly applied during employee session payments.

    Therapists can onboard via Stripe Connect Express, and their stripeAccountId and onboarding status are updated in the therapists table.

    Therapists automatically receive their 90% share for live sessions, and this is recorded in therapistPayouts.

    All ALLOWED_STRIPE_WEBHOOK_EVENTS are correctly handled and update the database accordingly.

    All API endpoints function as described, fetching data directly from the DB or Stripe API without a caching layer.


Phase 2: Performance & Scalability (Introducing ElastiCache)

This phase is about optimizing the GET calls and reducing redundant Stripe API calls by introducing ElastiCache as a caching layer.

Introduce ElastiCache Client (src/lib/kv.ts):

Configure ioredis to connect to your ElastiCache Redis instance.

Enhance syncStripeSubscriptionStatus(stripeCustomerId) (or similar sync functions):

Modify this function to now update both the primary Drizzle database (for critical status flags) and the ElastiCache. ElastiCache would hold the more detailed Stripe object snapshot.

Optimize GET Endpoints:

Subscription Status (/api/stripe/subscriptions/route.ts GET):

First, attempt to read from ElastiCache (kv.get('stripe:customer:<stripeCustomerId>')).

If not found or deemed stale, then call syncStripeSubscriptionStatus(stripeCustomerId) (which will fetch from Stripe API, update DB, and populate cache).

Connect Status (/api/stripe/connect/status/route.ts GET):

Similarly, for therapist Stripe Connect account status, first check ElastiCache.

Proactive Caching:

After the checkout.session.completed webhook, the customer.subscription.created/updated webhooks will trigger the enhanced sync functions, populating the cache quickly.

Similarly, after a successful Stripe Connect onboarding, the account.updated webhook will trigger a sync that populates the cache for the therapist's Stripe account status.

This phased approach allows you to build out the core functionality and ensure data integrity first, then optimize for performance as needed.