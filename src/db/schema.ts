import { relations, sql } from 'drizzle-orm';
import {
  pgTable,
  serial,
  text,
  varchar,
  timestamp,
  integer,
  boolean,
  jsonb,
  pgEnum,
  check,
  uniqueIndex,
  index,
} from 'drizzle-orm/pg-core';

// === 1. Enums ===
export const userRoleEnum = pgEnum('user_role', [
  'employee',
  'therapist',
  'employer_admin',
  'super_admin',
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

// Stripe‑specific enums
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

// === 2. Employers ===
export const employers = pgTable('employers', {
  id: serial('id').primaryKey(),
  clerkOrgId: varchar('clerk_org_id', { length: 255 }).unique(),
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

// === 3. Users ===
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  clerkId: varchar('clerk_id', { length: 255 }).notNull().unique(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  firstName: text('first_name'),
  lastName: text('last_name'),
  imageUrl: text('image_url'),
  role: userRoleEnum('role').notNull().default('employee'),
  isActive: boolean('is_active').default(true).notNull(),
  employerId: integer('employer_id').references(() => employers.id, { onDelete: 'set null' }),
  // Stripe subscription fields
  subscriptionStatus: varchar('subscription_status', { length: 50 }),
  stripeSubscriptionId: varchar('stripe_subscription_id', { length: 255 }).unique(),
  subscriptionEndDate: timestamp('subscription_end_date'),
  cancelAtPeriodEnd: boolean('cancel_at_period_end').default(false),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// === 4. Therapists ===
export const therapists = pgTable('therapists', {
  id: serial('id').primaryKey(),
  userId: integer('user_id')
    .references(() => users.id, { onDelete: 'cascade' })
    .unique()
    .notNull(),
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
  // Monetary field stored as integer cents for exact math
  hourlyRateCents: integer('hourly_rate_cents'),
  // Stripe Connect
  stripeAccountId: varchar('stripe_account_id', { length: 255 }),
  onboardingStatus: varchar('onboarding_status', { length: 50 }).default('not_started'),
  chargesEnabled: boolean('charges_enabled').default(false),
  payoutsEnabled: boolean('payouts_enabled').default(false),
  detailsSubmitted: boolean('details_submitted').default(false),
  // Soft delete flag
  deletedAt: timestamp('deleted_at'),
  // Google Calendar
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

// === 5. UserOnboarding ===
export const userOnboarding = pgTable('user_onboarding', {
  id: serial('id').primaryKey(),
  userId: integer('user_id')
    .references(() => users.id, { onDelete: 'cascade' })
    .notNull()
    .unique(),
  answers: jsonb('answers'),
  version: integer('version').notNull().default(1),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// === 6. Therapist Availability & Blocks ===
export const therapistAvailability = pgTable('therapist_availability', {
  id: serial('id').primaryKey(),
  therapistId: integer('therapist_id')
    .references(() => therapists.id, { onDelete: 'cascade' })
    .notNull(),
  dayOfWeek: integer('day_of_week').notNull(),
  startTime: varchar('start_time', { length: 5 }).notNull(),
  endTime: varchar('end_time', { length: 5 }).notNull(),
  timezone: varchar('timezone', { length: 50 }).default('UTC').notNull(),
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

// === 7. Booking Sessions & Client Notes ===
export const bookingSessions = pgTable(
  'booking_sessions',
  {
    id: serial('id').primaryKey(),
    userId: integer('user_id')
      .references(() => users.id, { onDelete: 'restrict' })
      .notNull(),
    therapistId: integer('therapist_id')
      .references(() => therapists.id, { onDelete: 'restrict' })
      .notNull(),
    sessionDate: timestamp('session_date').notNull(),
    sessionStartTime: timestamp('session_start_time').notNull(),
    sessionEndTime: timestamp('session_end_time').notNull(),
    timezone: varchar('timezone', { length: 50 }).default('UTC').notNull(),
    status: sessionStatusEnum('status').default('pending').notNull(),
    googleEventId: text('google_event_id'),
    cancellationReason: text('cancellation_reason'),
    metadata: jsonb('metadata'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (t) => ({
    // prevent double booking same start time per therapist
    therapistSlotUix: uniqueIndex('uix_therapist_slot').on(t.therapistId, t.sessionStartTime),
  }),
);

export const pendingTherapists = pgTable('pending_therapists', {
  id: serial('id').primaryKey(),
  clerkEmail: varchar('clerk_email', { length: 255 }).notNull().unique(),
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
  hourlyRateCents: integer('hourly_rate_cents'),
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
    .references(() => users.id, { onDelete: 'restrict' })
    .notNull(),
  therapistId: integer('therapist_id')
    .references(() => therapists.id, { onDelete: 'restrict' })
    .notNull(),
  sessionId: integer('session_id').references(() => bookingSessions.id, { onDelete: 'set null' }),
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

// === 8. Stripe Integration Tables ===
export const stripeCustomers = pgTable('stripe_customers', {
  id: serial('id').primaryKey(),
  userId: integer('user_id')
    .references(() => users.id, { onDelete: 'cascade' })
    .unique()
    .notNull(),
  stripeCustomerId: varchar('stripe_customer_id', { length: 255 }).notNull().unique(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const employerSubsidies = pgTable(
  'employer_subsidies',
  {
    id: serial('id').primaryKey(),
    employerId: integer('employer_id')
      .references(() => employers.id, { onDelete: 'cascade' })
      .notNull(),
    userId: integer('user_id')
      .references(() => users.id, { onDelete: 'cascade' })
      .notNull(),
    originalCents: integer('original_cents').notNull(),
    remainingCents: integer('remaining_cents').notNull(),
    reason: text('reason'),
    expiresAt: timestamp('expires_at'),
    appliedAt: timestamp('applied_at'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => ({
    remainingNonNegative: check('remaining_non_negative', sql`${table.remainingCents} >= 0`),
    activeIdx: index('idx_subsidies_active')
      .on(table.userId)
      .where(sql`${table.remainingCents} > 0 AND ${table.expiresAt} IS NULL`),
  }),
);

export const therapistPayouts = pgTable('therapist_payouts', {
  id: serial('id').primaryKey(),
  therapistId: integer('therapist_id')
    .references(() => therapists.id, { onDelete: 'cascade' })
    .notNull(),
  bookingSessionId: integer('booking_session_id').references(() => bookingSessions.id, {
    onDelete: 'cascade',
  }),
  amountCents: integer('amount_cents').notNull(),
  stripeTransferId: varchar('stripe_transfer_id', { length: 255 }),
  paidAt: timestamp('paid_at'),
  status: payoutStatusEnum('status').default('pending').notNull(),
  payoutType: payoutTypeEnum('payout_type').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const sessionPayments = pgTable('session_payments', {
  id: serial('id').primaryKey(),
  bookingSessionId: integer('booking_session_id')
    .references(() => bookingSessions.id, { onDelete: 'cascade' })
    .notNull()
    .unique(),
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

// === 9. Relations ===
export const employersRelations = relations(employers, ({ many }) => ({
  employees: many(users),
}));

export const usersRelations = relations(users, ({ one, many }) => ({
  employer: one(employers, { fields: [users.employerId], references: [employers.id] }),
  therapistProfile: one(therapists, { fields: [users.id], references: [therapists.userId] }),
  onboarding: one(userOnboarding, { fields: [users.id], references: [userOnboarding.userId] }),
  bookedSessions: many(bookingSessions),
  clientNotes: many(clientNotes),
}));

export const therapistsRelations = relations(therapists, ({ one, many }) => ({
  user: one(users, { fields: [therapists.userId], references: [users.id] }),
  availability: many(therapistAvailability),
  blockedTimes: many(therapistBlockedTimes),
  sessions: many(bookingSessions),
  writtenNotes: many(clientNotes),
}));

export const userOnboardingRelations = relations(userOnboarding, ({ one }) => ({
  user: one(users, { fields: [userOnboarding.userId], references: [users.id] }),
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
  user: one(users, { fields: [bookingSessions.userId], references: [users.id] }),
  therapist: one(therapists, {
    fields: [bookingSessions.therapistId],
    references: [therapists.id],
  }),
}));

export const clientNotesRelations = relations(clientNotes, ({ one }) => ({
  user: one(users, { fields: [clientNotes.userId], references: [users.id] }),
  therapist: one(therapists, { fields: [clientNotes.therapistId], references: [therapists.id] }),
  session: one(bookingSessions, {
    fields: [clientNotes.sessionId],
    references: [bookingSessions.id],
  }),
}));
