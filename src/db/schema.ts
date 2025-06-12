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
  'employee', // Keep original as first value
  'therapist',
  'employer_admin',
  'super_admin', // Keep original name
  'individual_consumer', // B2C user not tied to an employer - ADD this as new option
  'platform_admin', // Can be alias for super_admin in application logic
]);

export const sponsoredGroupTypeEnum = pgEnum('sponsored_group_type', [
  'erg',
  'department',
  'project_team',
  'wellness_cohort',
  'custom_group', // For any other specific grouping
  'company_wide', // A way to represent benefits for ALL employees of a company via a group
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

// Chat-related enums
export const chatChannelStatusEnum = pgEnum('chat_channel_status', [
  'active',
  'archived',
  'blocked',
]);

export const messageStatusEnum = pgEnum('message_status', ['sent', 'delivered', 'read', 'failed']);

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
  // New fields for sponsored groups and subsidies
  defaultSubsidyPercentage: integer('default_subsidy_percentage').default(0).notNull(), // Company-wide session subsidy % (0-100) if no other subsidy applies
  allowsSponsoredGroups: boolean('allows_sponsored_groups').default(true).notNull(), // Does this employer utilize sponsored groups?
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
  // Stripe subscription fields (for individual B2C users)
  subscriptionStatus: varchar('subscription_status', { length: 50 }),
  stripeSubscriptionId: varchar('stripe_subscription_id', { length: 255 }).unique(),
  subscriptionEndDate: timestamp('subscription_end_date'),
  cancelAtPeriodEnd: boolean('cancel_at_period_end').default(false),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// === 4. Sponsored Groups & Memberships ===
export const sponsoredGroups = pgTable(
  'sponsored_groups',
  {
    id: serial('id').primaryKey(),
    employerId: integer('employer_id')
      .references(() => employers.id, { onDelete: 'cascade' })
      .notNull(),
    groupType: sponsoredGroupTypeEnum('group_type').notNull(),
    name: varchar('name', { length: 255 }).notNull(),
    description: text('description'),
    isActive: boolean('is_active').default(true).notNull(),
    // Group-specific budget/benefit allocation
    allocatedSessionCredits: integer('allocated_session_credits').default(0).notNull(), // Total session credits/budget for this group from the employer
    remainingSessionCredits: integer('remaining_session_credits').default(0).notNull(),
    // Optional: metadata for type-specific info (e.g., ERG charter, department code)
    metadata: jsonb('metadata'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => ({
    remainingCreditsNonNegative: check(
      'remaining_credits_non_negative',
      sql`${table.remainingSessionCredits} >= 0`,
    ),
    allocatedCreditsNonNegative: check(
      'allocated_credits_non_negative',
      sql`${table.allocatedSessionCredits} >= 0`,
    ),
    activeGroupIdx: index('idx_active_sponsored_groups').on(table.employerId, table.isActive),
  }),
);

export const sponsoredGroupMembers = pgTable(
  'sponsored_group_members',
  {
    id: serial('id').primaryKey(),
    groupId: integer('group_id')
      .references(() => sponsoredGroups.id, { onDelete: 'cascade' })
      .notNull(),
    userId: integer('user_id')
      .references(() => users.id, { onDelete: 'cascade' })
      .notNull(),
    roleInGroup: varchar('role_in_group', { length: 50 }).default('member').notNull(), // e.g., member, leader, coordinator
    isActive: boolean('is_active').default(true).notNull(),
    joinedAt: timestamp('joined_at').defaultNow().notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (t) => ({
    userGroupUix: uniqueIndex('uix_user_sponsored_group').on(t.userId, t.groupId),
    groupMemberIdx: index('idx_group_member').on(t.groupId),
    activeMemberIdx: index('idx_active_group_members').on(t.groupId, t.isActive),
  }),
);

// === 5. Therapists ===
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

// === 6. UserOnboarding ===
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

// === 7. Therapist Availability & Blocks ===
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

// === 8. Booking Sessions & Client Notes ===
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
    metadata: jsonb('metadata'), // Includes timezones, meet links etc.
    // Subsidy tracking at session level
    sponsoringGroupId: integer('sponsoring_group_id').references(() => sponsoredGroups.id, {
      onDelete: 'set null',
    }),
    subsidyFromGroupCents: integer('subsidy_from_group_cents').default(0),
    subsidyFromEmployerDirectCents: integer('subsidy_from_employer_direct_cents').default(0), // From employerSubsidies or defaultEmployerPercentage
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (t) => ({
    // prevent double booking same start time per therapist
    therapistSlotUix: uniqueIndex('uix_therapist_slot').on(t.therapistId, t.sessionStartTime),
    sponsoringGroupIdx: index('idx_sponsoring_group').on(t.sponsoringGroupId),
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

// === Therapist Documents ===
export const therapistDocuments = pgTable(
  'therapist_documents',
  {
    id: serial('id').primaryKey(),
    therapistId: integer('therapist_id')
      .references(() => therapists.id, { onDelete: 'cascade' })
      .notNull(),
    s3Key: text('s3_key').notNull().unique(),
    fileName: varchar('file_name', { length: 255 }).notNull(),
    originalFileName: varchar('original_file_name', { length: 255 }).notNull(),
    title: varchar('title', { length: 255 }).notNull(),
    description: text('description'),
    category: varchar('category', { length: 100 }).default('general').notNull(),
    fileSize: integer('file_size').notNull(),
    mimeType: varchar('mime_type', { length: 100 }).notNull(),
    uploadedAt: timestamp('uploaded_at').defaultNow().notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => ({
    therapistDocumentsIdx: index('idx_therapist_documents').on(table.therapistId),
  }),
);

// === Therapist Document Assignments ===
export const therapistDocumentAssignments = pgTable(
  'therapist_document_assignments',
  {
    id: serial('id').primaryKey(),
    documentId: integer('document_id')
      .references(() => therapistDocuments.id, { onDelete: 'cascade' })
      .notNull(),
    userId: integer('user_id')
      .references(() => users.id, { onDelete: 'cascade' })
      .notNull(),
    isSharedWithClient: boolean('is_shared_with_client').default(false).notNull(),
    sharedAt: timestamp('shared_at'),
    assignedAt: timestamp('assigned_at').defaultNow().notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => ({
    documentAssignmentUix: uniqueIndex('uix_document_user_assignment').on(
      table.documentId,
      table.userId,
    ),
    documentAssignmentsIdx: index('idx_document_assignments').on(table.documentId),
    userAssignmentsIdx: index('idx_user_assignments').on(table.userId),
    sharedAssignmentsIdx: index('idx_shared_assignments').on(
      table.documentId,
      table.isSharedWithClient,
    ),
  }),
);

// === 9. Stripe Integration Tables ===
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

// Enhanced employer subsidies table (for direct employer-to-employee subsidies)
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

// Enhanced session payments table with detailed subsidy tracking
export const sessionPayments = pgTable('session_payments', {
  id: serial('id').primaryKey(),
  bookingSessionId: integer('booking_session_id')
    .references(() => bookingSessions.id, { onDelete: 'cascade' })
    .notNull()
    .unique(),
  userId: integer('user_id')
    .references(() => users.id, { onDelete: 'cascade' })
    .notNull(),
  totalAmountCents: integer('total_amount_cents').notNull(), // Full cost of the session before any subsidies
  subsidyUsedCents: integer('subsidy_used_cents').default(0).notNull(), // Total subsidy from all sources (group + employer)
  outOfPocketCents: integer('out_of_pocket_cents').notNull(), // Actual amount charged to user or covered by employer fully
  stripePaymentIntentId: varchar('stripe_payment_intent_id', { length: 255 }).unique(), // Can be null if fully subsidized without Stripe
  status: paymentStatusEnum('status').default('pending').notNull(),
  chargedAt: timestamp('charged_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// === Chat Feature Tables ===

// Therapist chat preferences
export const therapistChatPreferences = pgTable('therapist_chat_preferences', {
  id: serial('id').primaryKey(),
  therapistId: integer('therapist_id')
    .references(() => therapists.id, { onDelete: 'cascade' })
    .notNull()
    .unique(),
  acceptingChats: boolean('accepting_chats').default(false).notNull(),
  maxActiveChats: integer('max_active_chats').default(5).notNull(),
  autoReplyEnabled: boolean('auto_reply_enabled').default(false).notNull(),
  autoReplyMessage: text('auto_reply_message'),
  businessHoursOnly: boolean('business_hours_only').default(true).notNull(),
  businessHoursStart: varchar('business_hours_start', { length: 5 }).default('09:00').notNull(),
  businessHoursEnd: varchar('business_hours_end', { length: 5 }).default('17:00').notNull(),
  timezone: varchar('timezone', { length: 50 }).default('UTC').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Chat channels between therapists and prospects
export const chatChannels = pgTable(
  'chat_channels',
  {
    id: serial('id').primaryKey(),
    chimeChannelArn: varchar('chime_channel_arn', { length: 500 }).notNull().unique(),
    therapistId: integer('therapist_id')
      .references(() => therapists.id, { onDelete: 'cascade' })
      .notNull(),
    prospectUserId: integer('prospect_user_id')
      .references(() => users.id, { onDelete: 'cascade' })
      .notNull(),
    status: chatChannelStatusEnum('status').default('active').notNull(),
    lastMessageAt: timestamp('last_message_at'),
    lastMessagePreview: text('last_message_preview'),
    unreadCountTherapist: integer('unread_count_therapist').default(0).notNull(),
    unreadCountProspect: integer('unread_count_prospect').default(0).notNull(),
    metadata: jsonb('metadata'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => ({
    // Ensure unique channel per therapist-prospect pair
    uniqueChannelIdx: uniqueIndex('uix_therapist_prospect_channel').on(
      table.therapistId,
      table.prospectUserId,
    ),
    therapistActiveChatsIdx: index('idx_therapist_active_chats')
      .on(table.therapistId)
      .where(sql`${table.status} = 'active'`),
    lastMessageIdx: index('idx_channels_last_message').on(table.lastMessageAt),
  }),
);

// Chat messages tracking (local copy for analytics/reporting)
export const chatMessages = pgTable(
  'chat_messages',
  {
    id: serial('id').primaryKey(),
    channelId: integer('channel_id')
      .references(() => chatChannels.id, { onDelete: 'cascade' })
      .notNull(),
    chimeMessageId: varchar('chime_message_id', { length: 255 }).notNull(),
    senderId: integer('sender_id')
      .references(() => users.id, { onDelete: 'cascade' })
      .notNull(),
    content: text('content').notNull(),
    messageType: varchar('message_type', { length: 50 }).default('STANDARD').notNull(),
    status: messageStatusEnum('status').default('sent').notNull(),
    readByTherapistAt: timestamp('read_by_therapist_at'),
    readByProspectAt: timestamp('read_by_prospect_at'),
    metadata: jsonb('metadata'),
    sentAt: timestamp('sent_at').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => ({
    channelMessagesIdx: index('idx_channel_messages').on(table.channelId, table.sentAt),
    chimeMessageUniqueIdx: uniqueIndex('uix_chime_message_id').on(table.chimeMessageId),
    unreadMessagesIdx: index('idx_unread_messages').on(table.channelId, table.status),
  }),
);

// === 10. Relations ===
export const employersRelations = relations(employers, ({ many }) => ({
  employees: many(users),
  sponsoredGroups: many(sponsoredGroups),
  directSubsidies: many(employerSubsidies),
}));

export const usersRelations = relations(users, ({ one, many }) => ({
  employer: one(employers, { fields: [users.employerId], references: [employers.id] }),
  therapistProfile: one(therapists, { fields: [users.id], references: [therapists.userId] }),
  onboarding: one(userOnboarding, { fields: [users.id], references: [userOnboarding.userId] }),
  sponsoredGroupMemberships: many(sponsoredGroupMembers),
  directEmployerSubsidies: many(employerSubsidies),
  bookedSessions: many(bookingSessions),
  clientNotes: many(clientNotes),
  documentAssignments: many(therapistDocumentAssignments),
  stripeCustomer: one(stripeCustomers, {
    fields: [users.id],
    references: [stripeCustomers.userId],
  }),
  sessionPayments: many(sessionPayments),
}));

export const sponsoredGroupsRelations = relations(sponsoredGroups, ({ one, many }) => ({
  employer: one(employers, { fields: [sponsoredGroups.employerId], references: [employers.id] }),
  members: many(sponsoredGroupMembers),
  subsidizedSessions: many(bookingSessions),
}));

export const sponsoredGroupMembersRelations = relations(sponsoredGroupMembers, ({ one }) => ({
  group: one(sponsoredGroups, {
    fields: [sponsoredGroupMembers.groupId],
    references: [sponsoredGroups.id],
  }),
  user: one(users, { fields: [sponsoredGroupMembers.userId], references: [users.id] }),
}));

export const therapistsRelations = relations(therapists, ({ one, many }) => ({
  user: one(users, { fields: [therapists.userId], references: [users.id] }),
  availability: many(therapistAvailability),
  blockedTimes: many(therapistBlockedTimes),
  sessions: many(bookingSessions),
  writtenNotes: many(clientNotes),
  documents: many(therapistDocuments),
  payouts: many(therapistPayouts),
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
  sponsoringGroup: one(sponsoredGroups, {
    fields: [bookingSessions.sponsoringGroupId],
    references: [sponsoredGroups.id],
  }),
  payment: one(sessionPayments, {
    fields: [bookingSessions.id],
    references: [sessionPayments.bookingSessionId],
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

export const therapistDocumentsRelations = relations(therapistDocuments, ({ one, many }) => ({
  therapist: one(therapists, {
    fields: [therapistDocuments.therapistId],
    references: [therapists.id],
  }),
  assignments: many(therapistDocumentAssignments),
}));

export const therapistDocumentAssignmentsRelations = relations(
  therapistDocumentAssignments,
  ({ one }) => ({
    document: one(therapistDocuments, {
      fields: [therapistDocumentAssignments.documentId],
      references: [therapistDocuments.id],
    }),
    user: one(users, {
      fields: [therapistDocumentAssignments.userId],
      references: [users.id],
    }),
  }),
);

export const stripeCustomersRelations = relations(stripeCustomers, ({ one }) => ({
  user: one(users, { fields: [stripeCustomers.userId], references: [users.id] }),
}));

export const employerSubsidiesRelations = relations(employerSubsidies, ({ one }) => ({
  employer: one(employers, { fields: [employerSubsidies.employerId], references: [employers.id] }),
  user: one(users, { fields: [employerSubsidies.userId], references: [users.id] }),
}));

export const therapistPayoutsRelations = relations(therapistPayouts, ({ one }) => ({
  therapist: one(therapists, {
    fields: [therapistPayouts.therapistId],
    references: [therapists.id],
  }),
  session: one(bookingSessions, {
    fields: [therapistPayouts.bookingSessionId],
    references: [bookingSessions.id],
  }),
}));

export const sessionPaymentsRelations = relations(sessionPayments, ({ one }) => ({
  session: one(bookingSessions, {
    fields: [sessionPayments.bookingSessionId],
    references: [bookingSessions.id],
  }),
  user: one(users, { fields: [sessionPayments.userId], references: [users.id] }),
}));

// Chat relations
export const therapistChatPreferencesRelations = relations(therapistChatPreferences, ({ one }) => ({
  therapist: one(therapists, {
    fields: [therapistChatPreferences.therapistId],
    references: [therapists.id],
  }),
}));

export const chatChannelsRelations = relations(chatChannels, ({ one, many }) => ({
  therapist: one(therapists, {
    fields: [chatChannels.therapistId],
    references: [therapists.id],
  }),
  prospectUser: one(users, {
    fields: [chatChannels.prospectUserId],
    references: [users.id],
  }),
  messages: many(chatMessages),
}));

export const chatMessagesRelations = relations(chatMessages, ({ one }) => ({
  channel: one(chatChannels, {
    fields: [chatMessages.channelId],
    references: [chatChannels.id],
  }),
  sender: one(users, {
    fields: [chatMessages.senderId],
    references: [users.id],
  }),
}));

// === 12. Intake Forms ===
export const intakeForms = pgTable('intake_forms', {
  id: serial('id').primaryKey(),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description'),
  therapistId: integer('therapist_id')
    .references(() => therapists.id, { onDelete: 'cascade' })
    .notNull(),
  fields: jsonb('fields').notNull(), // FormField[] as JSON
  status: varchar('status', { length: 20 }).notNull().default('draft'), // 'draft' | 'active'
  isTemplate: boolean('is_template').default(false).notNull(),
  templateCategory: varchar('template_category', { length: 100 }), // e.g., 'general', 'anxiety', 'couples'
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const formAssignments = pgTable('form_assignments', {
  id: serial('id').primaryKey(),
  formId: integer('form_id')
    .references(() => intakeForms.id, { onDelete: 'cascade' })
    .notNull(),
  clientId: integer('client_id')
    .references(() => users.id, { onDelete: 'cascade' })
    .notNull(),
  therapistId: integer('therapist_id')
    .references(() => therapists.id, { onDelete: 'cascade' })
    .notNull(),
  status: varchar('status', { length: 20 }).notNull().default('sent'), // 'sent' | 'completed' | 'expired'
  responses: jsonb('responses'), // Record<string, unknown> as JSON
  sentAt: timestamp('sent_at').defaultNow().notNull(),
  completedAt: timestamp('completed_at'),
  expiresAt: timestamp('expires_at'), // Optional expiration
  remindersSent: integer('reminders_sent').default(0).notNull(),
  lastReminderAt: timestamp('last_reminder_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// === 12. Intake Forms Relations ===
export const intakeFormsRelations = relations(intakeForms, ({ one, many }) => ({
  therapist: one(therapists, { fields: [intakeForms.therapistId], references: [therapists.id] }),
  assignments: many(formAssignments),
}));

export const formAssignmentsRelations = relations(formAssignments, ({ one }) => ({
  form: one(intakeForms, { fields: [formAssignments.formId], references: [intakeForms.id] }),
  client: one(users, { fields: [formAssignments.clientId], references: [users.id] }),
  therapist: one(therapists, {
    fields: [formAssignments.therapistId],
    references: [therapists.id],
  }),
}));
