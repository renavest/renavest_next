import { relations } from 'drizzle-orm';
import {
  pgTable,
  serial,
  text,
  varchar,
  timestamp,
  integer,
  numeric,
  boolean,
  jsonb,
  pgEnum, // <-- Import pgEnum for explicit enums
} from 'drizzle-orm/pg-core';

// === 1. Define Enums Explicitly (Best Practice) ===
// Drizzle supports native PostgreSQL enums which are more type-safe and efficient
export const userRoleEnum = pgEnum('user_role', [
  'employee',
  'therapist',
  'employer_admin',
  'super_admin', // Example: for your internal team
]);

export const googleIntegrationStatusEnum = pgEnum('google_integration_status', [
  'not_connected',
  'connected',
  'error',
]);

export const sessionStatusEnum = pgEnum('session_status', [
  'pending',
  'confirmed',
  'scheduled',
  'completed',
  'cancelled',
  'rescheduled',
]);

// === Stripe-specific enums ===
export const paymentStatusEnum = pgEnum('payment_status', [
  'pending',
  'succeeded',
  'failed',
  'canceled',
  'refunded',
]);

export const payoutStatusEnum = pgEnum('payout_status', [
  'pending',
  'completed',
  'failed',
  'refunded',
]);

export const payoutTypeEnum = pgEnum('payout_type', ['session_fee', 'async_credit', 'refund']);

// === 2. Employers Table (Minimal Changes - Good as Is) ===
// This table represents an organization, not an individual user.
export const employers = pgTable('employers', {
  id: serial('id').primaryKey(),
  clerkOrgId: varchar('clerk_org_id', { length: 255 }).unique(), // For Clerk Organizations, good!
  name: varchar('name', { length: 255 }).notNull(),
  industry: varchar('industry', { length: 255 }),
  employeeCount: integer('employee_count').default(0).notNull(),
  planName: varchar('plan_name', { length: 255 }),
  allocatedSessions: integer('allocated_sessions').default(0).notNull(),
  currentSessionsBalance: integer('current_sessions_balance').default(0).notNull(),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// === 3. Users Table (Core Identity - KEY CHANGES) ===
// This table represents an individual person in your system.
// Every authenticated user (via Clerk) should have an entry here.
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  clerkId: varchar('clerk_id', { length: 255 }).notNull().unique(), // Link to Clerk user ID, MUST be unique
  email: varchar('email', { length: 255 }).notNull().unique(), // Primary email, MUST be unique
  firstName: text('first_name'),
  lastName: text('last_name'),
  imageUrl: text('image_url'),
  role: userRoleEnum('role').notNull().default('employee'), // Use the enum, default to 'member'
  isActive: boolean('is_active').default(true).notNull(), // For soft deletion/deactivation
  employerId: integer('employer_id').references(() => employers.id, { onDelete: 'set null' }), // Employee belongs to an employer
  // Stripe subscription fields
  subscriptionStatus: varchar('subscription_status', { length: 50 }), // e.g., 'active', 'canceled', 'trialing', 'past_due', 'unpaid', 'none'
  stripeSubscriptionId: varchar('stripe_subscription_id', { length: 255 }), // The actual Stripe subscription ID
  subscriptionEndDate: timestamp('subscription_end_date'), // When the current subscription period ends
  cancelAtPeriodEnd: boolean('cancel_at_period_end').default(false),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(), // Default to createdAt for initial update
});

// === 4. Therapists Table (Role-Specific Details - KEY CHANGES) ===
// Stores details specific to a user who is also a therapist.
// This is a one-to-one relationship with the `users` table.
export const therapists = pgTable('therapists', {
  id: serial('id').primaryKey(),
  // Foreign key to the `users` table, unique, and not null for a 1-to-1 relationship.
  // This is the direct link that signifies "this user IS a therapist."
  userId: integer('user_id')
    .references(() => users.id, { onDelete: 'cascade' }) // If user is deleted, therapist profile also goes
    .unique()
    .notNull(),
  // REMOVE email field here. It's already in the users table.
  name: varchar('name', { length: 255 }).notNull(), // Can be redundant with user firstName/lastName but often therapist wants to set their own "professional name"
  title: varchar('title', { length: 255 }),
  bookingURL: text('booking_url'),
  expertise: text('expertise'),
  certifications: text('certifications'),
  song: text('favorite_song'),
  yoe: integer('years_of_experience'),
  clientele: text('ideal_clientele'),
  longBio: text('long_bio'),
  previewBlurb: text('preview_blurb'),
  profileUrl: text('profile_image_url'), // Therapist-specific profile image
  hourlyRate: numeric('hourly_rate', { precision: 10, scale: 2 }),
  // Stripe Connect fields
  stripeAccountId: varchar('stripe_account_id', { length: 255 }), // Stripe Connect Express account ID
  onboardingStatus: varchar('onboarding_status', { length: 50 }).default('not_started'), // not_started, pending, completed
  chargesEnabled: boolean('charges_enabled').default(false),
  payoutsEnabled: boolean('payouts_enabled').default(false),
  detailsSubmitted: boolean('details_submitted').default(false),
  // Google Calendar fields
  googleCalendarAccessToken: text('google_calendar_access_token'),
  googleCalendarRefreshToken: text('google_calendar_refresh_token'),
  googleCalendarEmail: text('google_calendar_email'),
  googleCalendarIntegrationStatus: googleIntegrationStatusEnum('google_calendar_integration_status')
    .default('not_connected')
    .notNull(),
  googleCalendarIntegrationDate: timestamp('google_calendar_integration_date'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// === 5. UserOnboarding Table (Good as is, referencing users.id) ===
export const userOnboarding = pgTable('user_onboarding', {
  id: serial('id').primaryKey(),
  userId: integer('user_id')
    .references(() => users.id, { onDelete: 'cascade' })
    .notNull()
    .unique(), // Assuming one onboarding record per user
  answers: jsonb('answers'),
  version: integer('version').notNull().default(1),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// === 6. Therapist Availability & Blocked Times (Good as is) ===
export const therapistAvailability = pgTable('therapist_availability', {
  id: serial('id').primaryKey(),
  therapistId: integer('therapist_id')
    .references(() => therapists.id, { onDelete: 'cascade' })
    .notNull(),
  dayOfWeek: integer('day_of_week').notNull(),
  startTime: varchar('start_time', { length: 5 }).notNull(),
  endTime: varchar('end_time', { length: 5 }).notNull(),
  isRecurring: boolean('is_recurring').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const therapistBlockedTimes = pgTable('therapist_blocked_times', {
  id: serial('id').primaryKey(),
  therapistId: integer('therapist_id')
    .references(() => therapists.id, { onDelete: 'cascade' })
    .notNull(),
  startTime: timestamp('start_time').notNull(),
  endTime: timestamp('end_time').notNull(),
  reason: text('reason'),
  googleEventId: text('google_event_id'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// === 7. Booking Sessions & Client Notes (Good as is, referencing users.id) ===
export const bookingSessions = pgTable('booking_sessions', {
  id: serial('id').primaryKey(),
  userId: integer('user_id')
    .references(() => users.id, { onDelete: 'restrict' }) // Restrict deletion if sessions exist
    .notNull(),
  therapistId: integer('therapist_id')
    .references(() => therapists.id, { onDelete: 'restrict' })
    .notNull(),
  sessionDate: timestamp('session_date').notNull(),
  sessionStartTime: timestamp('session_start_time').notNull(),
  sessionEndTime: timestamp('session_end_time').notNull(),
  status: sessionStatusEnum('status').notNull().default('pending'),
  googleEventId: text('google_event_id'),
  cancellationReason: text('cancellation_reason'),
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const pendingTherapists = pgTable('pending_therapists', {
  id: serial('id').primaryKey(),
  clerkEmail: varchar('clerk_email', { length: 255 }).notNull().unique(), // Email they will use to sign up
  name: varchar('name', { length: 255 }).notNull(),
  title: varchar('title', { length: 255 }),
  bookingURL: text('booking_url'),
  expertise: text('expertise'),
  certifications: text('certifications'),
  song: text('favorite_song'),
  yoe: integer('years_of_experience'),
  clientele: text('ideal_clientele'),
  longBio: text('long_bio'),
  previewBlurb: text('preview_blurb'),
  profileUrl: text('profile_image_url'),
  hourlyRate: numeric('hourly_rate', { precision: 10, scale: 2 }),
  googleCalendarAccessToken: text('google_calendar_access_token'),
  googleCalendarRefreshToken: text('google_calendar_refresh_token'),
  googleCalendarEmail: text('google_calendar_email'),
  googleCalendarIntegrationStatus: googleIntegrationStatusEnum('google_calendar_integration_status')
    .default('not_connected')
    .notNull(),
  googleCalendarIntegrationDate: timestamp('google_calendar_integration_date'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const clientNotes = pgTable('client_notes', {
  id: serial('id').primaryKey(),
  userId: integer('user_id')
    .references(() => users.id, { onDelete: 'restrict' }) // Client's user ID
    .notNull(),
  therapistId: integer('therapist_id') // Therapist who created the note
    .references(() => therapists.id, { onDelete: 'restrict' })
    .notNull(),
  sessionId: integer('session_id') // Optional link to a specific session
    .references(() => bookingSessions.id, { onDelete: 'set null' }),
  title: text('title').notNull(),
  content: jsonb('content').$type<{
    keyObservations?: string[];
    progressNotes?: string[];
    actionItems?: string[];
    emotionalState?: string;
    additionalContext?: string;
  }>(),
  isConfidential: boolean('is_confidential').default(false),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// === Stripe Integration Tables ===

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
  status: payoutStatusEnum('status').default('pending').notNull(),
  payoutType: payoutTypeEnum('payout_type').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
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
  status: paymentStatusEnum('status').default('pending').notNull(),
  chargedAt: timestamp('charged_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// === 8. Relations (Updated for new schema structure) ===

export const employersRelations = relations(employers, ({ many }) => ({
  // An employer can have multiple employee users
  employees: many(users),
}));

export const usersRelations = relations(users, ({ one, many }) => ({
  // A user can be linked to one employer (if they are an employee)
  employer: one(employers, {
    fields: [users.employerId],
    references: [employers.id],
  }),
  // A user MAY BE a therapist (one-to-one relationship)
  therapistProfile: one(therapists, {
    fields: [users.id], // Link user.id to therapist.userId
    references: [therapists.userId],
  }),
  // A user has one onboarding record
  onboarding: one(userOnboarding, {
    fields: [users.id],
    references: [userOnboarding.userId],
  }),
  // A user can book many sessions (as a client)
  bookedSessions: many(bookingSessions),
  // A user can have many client notes (as a client)
  clientNotes: many(clientNotes),
}));

export const therapistsRelations = relations(therapists, ({ one, many }) => ({
  // A therapist profile belongs to one user
  user: one(users, {
    fields: [therapists.userId],
    references: [users.id],
  }),
  // A therapist has many clients (users who booked sessions with them)
  // This relation would typically be inferred via the bookingSessions table
  // You might want to define this explicitly if you track clients directly
  // beyond just session bookings. For now, rely on bookingSessions.
  // clients: many(users), // If you wanted a direct relation, but bookingSessions handles it better

  // A therapist has many availability slots
  availability: many(therapistAvailability),
  // A therapist has many blocked times
  blockedTimes: many(therapistBlockedTimes),
  // A therapist has many booked sessions (as the therapist)
  sessions: many(bookingSessions),
  // A therapist has many client notes they've written
  writtenNotes: many(clientNotes),
}));

export const userOnboardingRelations = relations(userOnboarding, ({ one }) => ({
  user: one(users, {
    fields: [userOnboarding.userId],
    references: [users.id],
  }),
}));

export const therapistAvailabilityRelations = relations(therapistAvailability, ({ one }) => ({
  therapist: one(therapists, {
    fields: [therapistAvailability.therapistId],
    references: [therapists.id],
  }),
}));

export const therapistBlockedTimesRelations = relations(therapistBlockedTimes, ({ one }) => ({
  therapist: one(therapists, {
    fields: [therapistBlockedTimes.therapistId],
    references: [therapists.id],
  }),
}));

export const bookingSessionsRelations = relations(bookingSessions, ({ one }) => ({
  user: one(users, {
    fields: [bookingSessions.userId],
    references: [users.id],
  }),
  therapist: one(therapists, {
    fields: [bookingSessions.therapistId],
    references: [therapists.id],
  }),
}));

export const clientNotesRelations = relations(clientNotes, ({ one }) => ({
  user: one(users, {
    fields: [clientNotes.userId],
    references: [users.id],
  }),
  therapist: one(therapists, {
    fields: [clientNotes.therapistId],
    references: [therapists.id],
  }),
  session: one(bookingSessions, {
    fields: [clientNotes.sessionId],
    references: [bookingSessions.id],
  }),
}));
