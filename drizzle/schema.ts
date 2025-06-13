import { pgTable, index, foreignKey, unique, serial, integer, text, varchar, timestamp, check, boolean, jsonb, uniqueIndex, pgEnum } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"

export const chatChannelStatus = pgEnum("chat_channel_status", ['active', 'archived', 'blocked'])
export const googleIntegrationStatus = pgEnum("google_integration_status", ['not_connected', 'connected', 'error'])
export const messageStatus = pgEnum("message_status", ['sent', 'delivered', 'read', 'failed'])
export const paymentStatus = pgEnum("payment_status", ['pending', 'succeeded', 'failed', 'canceled', 'refunded'])
export const payoutStatus = pgEnum("payout_status", ['pending', 'completed', 'failed', 'refunded'])
export const payoutType = pgEnum("payout_type", ['session_fee', 'async_credit', 'refund'])
export const sessionStatus = pgEnum("session_status", ['pending', 'confirmed', 'scheduled', 'completed', 'cancelled', 'rescheduled'])
export const sponsoredGroupType = pgEnum("sponsored_group_type", ['erg', 'department', 'project_team', 'wellness_cohort', 'custom_group', 'company_wide'])
export const userRole = pgEnum("user_role", ['employee', 'therapist', 'employer_admin', 'super_admin', 'individual_consumer', 'platform_admin'])


export const therapistDocuments = pgTable("therapist_documents", {
	id: serial().primaryKey().notNull(),
	therapistId: integer("therapist_id").notNull(),
	s3Key: text("s3_key").notNull(),
	fileName: varchar("file_name", { length: 255 }).notNull(),
	originalFileName: varchar("original_file_name", { length: 255 }).notNull(),
	title: varchar({ length: 255 }).notNull(),
	description: text(),
	category: varchar({ length: 100 }).default('general').notNull(),
	fileSize: integer("file_size").notNull(),
	mimeType: varchar("mime_type", { length: 100 }).notNull(),
	uploadedAt: timestamp("uploaded_at", { mode: 'string' }).defaultNow().notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("idx_therapist_documents").using("btree", table.therapistId.asc().nullsLast().op("int4_ops")),
	foreignKey({
			columns: [table.therapistId],
			foreignColumns: [therapists.id],
			name: "therapist_documents_therapist_id_therapists_id_fk"
		}).onDelete("cascade"),
	unique("therapist_documents_s3_key_unique").on(table.s3Key),
]);

export const sponsoredGroups = pgTable("sponsored_groups", {
	id: serial().primaryKey().notNull(),
	employerId: integer("employer_id").notNull(),
	groupType: sponsoredGroupType("group_type").notNull(),
	name: varchar({ length: 255 }).notNull(),
	description: text(),
	isActive: boolean("is_active").default(true).notNull(),
	allocatedSessionCredits: integer("allocated_session_credits").default(0).notNull(),
	remainingSessionCredits: integer("remaining_session_credits").default(0).notNull(),
	metadata: jsonb(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("idx_active_sponsored_groups").using("btree", table.employerId.asc().nullsLast().op("int4_ops"), table.isActive.asc().nullsLast().op("int4_ops")),
	foreignKey({
			columns: [table.employerId],
			foreignColumns: [employers.id],
			name: "sponsored_groups_employer_id_employers_id_fk"
		}).onDelete("cascade"),
	check("remaining_credits_non_negative", sql`remaining_session_credits >= 0`),
	check("allocated_credits_non_negative", sql`allocated_session_credits >= 0`),
]);

export const sponsoredGroupMembers = pgTable("sponsored_group_members", {
	id: serial().primaryKey().notNull(),
	groupId: integer("group_id").notNull(),
	userId: integer("user_id").notNull(),
	roleInGroup: varchar("role_in_group", { length: 50 }).default('member').notNull(),
	isActive: boolean("is_active").default(true).notNull(),
	joinedAt: timestamp("joined_at", { mode: 'string' }).defaultNow().notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("idx_active_group_members").using("btree", table.groupId.asc().nullsLast().op("int4_ops"), table.isActive.asc().nullsLast().op("bool_ops")),
	index("idx_group_member").using("btree", table.groupId.asc().nullsLast().op("int4_ops")),
	uniqueIndex("uix_user_sponsored_group").using("btree", table.userId.asc().nullsLast().op("int4_ops"), table.groupId.asc().nullsLast().op("int4_ops")),
	foreignKey({
			columns: [table.groupId],
			foreignColumns: [sponsoredGroups.id],
			name: "sponsored_group_members_group_id_sponsored_groups_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "sponsored_group_members_user_id_users_id_fk"
		}).onDelete("cascade"),
]);

export const therapistDocumentAssignments = pgTable("therapist_document_assignments", {
	id: serial().primaryKey().notNull(),
	documentId: integer("document_id").notNull(),
	userId: integer("user_id").notNull(),
	isSharedWithClient: boolean("is_shared_with_client").default(false).notNull(),
	sharedAt: timestamp("shared_at", { mode: 'string' }),
	assignedAt: timestamp("assigned_at", { mode: 'string' }).defaultNow().notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("idx_document_assignments").using("btree", table.documentId.asc().nullsLast().op("int4_ops")),
	index("idx_shared_assignments").using("btree", table.documentId.asc().nullsLast().op("int4_ops"), table.isSharedWithClient.asc().nullsLast().op("bool_ops")),
	index("idx_user_assignments").using("btree", table.userId.asc().nullsLast().op("int4_ops")),
	uniqueIndex("uix_document_user_assignment").using("btree", table.documentId.asc().nullsLast().op("int4_ops"), table.userId.asc().nullsLast().op("int4_ops")),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "therapist_document_assignments_user_id_users_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.documentId],
			foreignColumns: [therapistDocuments.id],
			name: "therapist_document_assignments_document_id_therapist_documents_"
		}).onDelete("cascade"),
]);

export const users = pgTable("users", {
	id: serial().primaryKey().notNull(),
	clerkId: varchar("clerk_id", { length: 255 }).notNull(),
	email: varchar({ length: 255 }).notNull(),
	firstName: text("first_name"),
	lastName: text("last_name"),
	imageUrl: text("image_url"),
	isActive: boolean("is_active").default(true).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
	employerId: integer("employer_id"),
	role: userRole().default('employee').notNull(),
	subscriptionStatus: varchar("subscription_status", { length: 50 }),
	stripeSubscriptionId: varchar("stripe_subscription_id", { length: 255 }),
	subscriptionEndDate: timestamp("subscription_end_date", { mode: 'string' }),
	cancelAtPeriodEnd: boolean("cancel_at_period_end").default(false),
}, (table) => [
	foreignKey({
			columns: [table.employerId],
			foreignColumns: [employers.id],
			name: "users_employer_id_employers_id_fk"
		}).onDelete("set null"),
	unique("users_clerk_id_unique").on(table.clerkId),
	unique("users_email_unique").on(table.email),
	unique("users_stripe_subscription_id_unique").on(table.stripeSubscriptionId),
]);

export const therapists = pgTable("therapists", {
	id: serial().primaryKey().notNull(),
	userId: integer("user_id").notNull(),
	name: varchar({ length: 255 }).notNull(),
	title: varchar({ length: 255 }),
	bookingUrl: text("booking_url"),
	expertise: text(),
	certifications: text(),
	favoriteSong: text("favorite_song"),
	yearsOfExperience: integer("years_of_experience"),
	idealClientele: text("ideal_clientele"),
	longBio: text("long_bio"),
	previewBlurb: text("preview_blurb"),
	profileImageUrl: text("profile_image_url"),
	hourlyRateCents: integer("hourly_rate_cents"),
	googleCalendarAccessToken: text("google_calendar_access_token"),
	googleCalendarRefreshToken: text("google_calendar_refresh_token"),
	googleCalendarEmail: text("google_calendar_email"),
	googleCalendarIntegrationStatus: googleIntegrationStatus("google_calendar_integration_status").default('not_connected').notNull(),
	googleCalendarIntegrationDate: timestamp("google_calendar_integration_date", { mode: 'string' }),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
	stripeAccountId: varchar("stripe_account_id", { length: 255 }),
	onboardingStatus: varchar("onboarding_status", { length: 50 }).default('not_started'),
	chargesEnabled: boolean("charges_enabled").default(false),
	payoutsEnabled: boolean("payouts_enabled").default(false),
	detailsSubmitted: boolean("details_submitted").default(false),
	deletedAt: timestamp("deleted_at", { mode: 'string' }),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "therapists_user_id_users_id_fk"
		}).onDelete("cascade"),
	unique("therapists_user_id_unique").on(table.userId),
]);

export const therapistAvailability = pgTable("therapist_availability", {
	id: serial().primaryKey().notNull(),
	therapistId: integer("therapist_id").notNull(),
	dayOfWeek: integer("day_of_week").notNull(),
	startTime: varchar("start_time", { length: 5 }).notNull(),
	endTime: varchar("end_time", { length: 5 }).notNull(),
	isRecurring: boolean("is_recurring").default(true).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
	timezone: varchar({ length: 50 }).default('UTC').notNull(),
}, (table) => [
	foreignKey({
			columns: [table.therapistId],
			foreignColumns: [therapists.id],
			name: "therapist_availability_therapist_id_therapists_id_fk"
		}).onDelete("cascade"),
]);

export const therapistBlockedTimes = pgTable("therapist_blocked_times", {
	id: serial().primaryKey().notNull(),
	therapistId: integer("therapist_id").notNull(),
	startTime: timestamp("start_time", { mode: 'string' }).notNull(),
	endTime: timestamp("end_time", { mode: 'string' }).notNull(),
	reason: text(),
	googleEventId: text("google_event_id"),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.therapistId],
			foreignColumns: [therapists.id],
			name: "therapist_blocked_times_therapist_id_therapists_id_fk"
		}).onDelete("cascade"),
]);

export const employers = pgTable("employers", {
	id: serial().primaryKey().notNull(),
	clerkOrgId: varchar("clerk_org_id", { length: 255 }),
	name: varchar({ length: 255 }).notNull(),
	industry: varchar({ length: 255 }),
	employeeCount: integer("employee_count").default(0).notNull(),
	planName: varchar("plan_name", { length: 255 }),
	allocatedSessions: integer("allocated_sessions").default(0).notNull(),
	currentSessionsBalance: integer("current_sessions_balance").default(0).notNull(),
	isActive: boolean("is_active").default(true).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
	defaultSubsidyPercentage: integer("default_subsidy_percentage").default(0).notNull(),
	allowsSponsoredGroups: boolean("allows_sponsored_groups").default(true).notNull(),
}, (table) => [
	unique("employers_clerk_org_id_unique").on(table.clerkOrgId),
]);

export const pendingTherapists = pgTable("pending_therapists", {
	id: serial().primaryKey().notNull(),
	clerkEmail: varchar("clerk_email", { length: 255 }).notNull(),
	name: varchar({ length: 255 }).notNull(),
	title: varchar({ length: 255 }),
	bookingUrl: text("booking_url"),
	expertise: text(),
	certifications: text(),
	favoriteSong: text("favorite_song"),
	yearsOfExperience: integer("years_of_experience"),
	idealClientele: text("ideal_clientele"),
	longBio: text("long_bio"),
	previewBlurb: text("preview_blurb"),
	profileImageUrl: text("profile_image_url"),
	hourlyRateCents: integer("hourly_rate_cents"),
	googleCalendarAccessToken: text("google_calendar_access_token"),
	googleCalendarRefreshToken: text("google_calendar_refresh_token"),
	googleCalendarEmail: text("google_calendar_email"),
	googleCalendarIntegrationStatus: googleIntegrationStatus("google_calendar_integration_status").default('not_connected').notNull(),
	googleCalendarIntegrationDate: timestamp("google_calendar_integration_date", { mode: 'string' }),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	unique("pending_therapists_clerk_email_unique").on(table.clerkEmail),
]);

export const bookingSessions = pgTable("booking_sessions", {
	id: serial().primaryKey().notNull(),
	userId: integer("user_id").notNull(),
	therapistId: integer("therapist_id").notNull(),
	sessionDate: timestamp("session_date", { mode: 'string' }).notNull(),
	sessionStartTime: timestamp("session_start_time", { mode: 'string' }).notNull(),
	sessionEndTime: timestamp("session_end_time", { mode: 'string' }).notNull(),
	googleEventId: text("google_event_id"),
	cancellationReason: text("cancellation_reason"),
	metadata: jsonb(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
	status: sessionStatus().default('pending').notNull(),
	timezone: varchar({ length: 50 }).default('UTC').notNull(),
	sponsoringGroupId: integer("sponsoring_group_id"),
	subsidyFromGroupCents: integer("subsidy_from_group_cents").default(0),
	subsidyFromEmployerDirectCents: integer("subsidy_from_employer_direct_cents").default(0),
}, (table) => [
	index("idx_sponsoring_group").using("btree", table.sponsoringGroupId.asc().nullsLast().op("int4_ops")),
	uniqueIndex("uix_therapist_slot").using("btree", table.therapistId.asc().nullsLast().op("int4_ops"), table.sessionStartTime.asc().nullsLast().op("int4_ops")),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "booking_sessions_user_id_users_id_fk"
		}).onDelete("restrict"),
	foreignKey({
			columns: [table.therapistId],
			foreignColumns: [therapists.id],
			name: "booking_sessions_therapist_id_therapists_id_fk"
		}).onDelete("restrict"),
	foreignKey({
			columns: [table.sponsoringGroupId],
			foreignColumns: [sponsoredGroups.id],
			name: "booking_sessions_sponsoring_group_id_sponsored_groups_id_fk"
		}).onDelete("set null"),
]);

export const userOnboarding = pgTable("user_onboarding", {
	id: serial().primaryKey().notNull(),
	userId: integer("user_id").notNull(),
	answers: jsonb(),
	version: integer().default(1).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "user_onboarding_user_id_users_id_fk"
		}).onDelete("cascade"),
	unique("user_onboarding_user_id_unique").on(table.userId),
]);

export const therapistChatPreferences = pgTable("therapist_chat_preferences", {
	id: serial().primaryKey().notNull(),
	therapistId: integer("therapist_id").notNull(),
	acceptingChats: boolean("accepting_chats").default(false).notNull(),
	maxActiveChats: integer("max_active_chats").default(5).notNull(),
	autoReplyEnabled: boolean("auto_reply_enabled").default(false).notNull(),
	autoReplyMessage: text("auto_reply_message"),
	businessHoursOnly: boolean("business_hours_only").default(true).notNull(),
	businessHoursStart: varchar("business_hours_start", { length: 5 }).default('09:00').notNull(),
	businessHoursEnd: varchar("business_hours_end", { length: 5 }).default('17:00').notNull(),
	timezone: varchar({ length: 50 }).default('UTC').notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.therapistId],
			foreignColumns: [therapists.id],
			name: "therapist_chat_preferences_therapist_id_therapists_id_fk"
		}).onDelete("cascade"),
	unique("therapist_chat_preferences_therapist_id_unique").on(table.therapistId),
]);

export const intakeForms = pgTable("intake_forms", {
	id: serial().primaryKey().notNull(),
	title: varchar({ length: 255 }).notNull(),
	description: text(),
	therapistId: integer("therapist_id").notNull(),
	fields: jsonb().notNull(),
	status: varchar({ length: 20 }).default('draft').notNull(),
	isTemplate: boolean("is_template").default(false).notNull(),
	templateCategory: varchar("template_category", { length: 100 }),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.therapistId],
			foreignColumns: [therapists.id],
			name: "intake_forms_therapist_id_therapists_id_fk"
		}).onDelete("cascade"),
]);

export const clientNotes = pgTable("client_notes", {
	id: serial().primaryKey().notNull(),
	userId: integer("user_id").notNull(),
	therapistId: integer("therapist_id").notNull(),
	sessionId: integer("session_id"),
	title: text().notNull(),
	content: jsonb(),
	isConfidential: boolean("is_confidential").default(false),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "client_notes_user_id_users_id_fk"
		}).onDelete("restrict"),
	foreignKey({
			columns: [table.therapistId],
			foreignColumns: [therapists.id],
			name: "client_notes_therapist_id_therapists_id_fk"
		}).onDelete("restrict"),
	foreignKey({
			columns: [table.sessionId],
			foreignColumns: [bookingSessions.id],
			name: "client_notes_session_id_booking_sessions_id_fk"
		}).onDelete("set null"),
]);

export const formAssignments = pgTable("form_assignments", {
	id: serial().primaryKey().notNull(),
	formId: integer("form_id").notNull(),
	clientId: integer("client_id").notNull(),
	therapistId: integer("therapist_id").notNull(),
	status: varchar({ length: 20 }).default('sent').notNull(),
	responses: jsonb(),
	sentAt: timestamp("sent_at", { mode: 'string' }).defaultNow().notNull(),
	completedAt: timestamp("completed_at", { mode: 'string' }),
	expiresAt: timestamp("expires_at", { mode: 'string' }),
	remindersSent: integer("reminders_sent").default(0).notNull(),
	lastReminderAt: timestamp("last_reminder_at", { mode: 'string' }),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.formId],
			foreignColumns: [intakeForms.id],
			name: "form_assignments_form_id_intake_forms_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.clientId],
			foreignColumns: [users.id],
			name: "form_assignments_client_id_users_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.therapistId],
			foreignColumns: [therapists.id],
			name: "form_assignments_therapist_id_therapists_id_fk"
		}).onDelete("cascade"),
]);

export const sessionPayments = pgTable("session_payments", {
	id: serial().primaryKey().notNull(),
	bookingSessionId: integer("booking_session_id").notNull(),
	userId: integer("user_id").notNull(),
	stripePaymentIntentId: varchar("stripe_payment_intent_id", { length: 255 }),
	totalAmountCents: integer("total_amount_cents").notNull(),
	subsidyUsedCents: integer("subsidy_used_cents").default(0).notNull(),
	outOfPocketCents: integer("out_of_pocket_cents").notNull(),
	status: paymentStatus().default('pending').notNull(),
	chargedAt: timestamp("charged_at", { mode: 'string' }),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.bookingSessionId],
			foreignColumns: [bookingSessions.id],
			name: "session_payments_booking_session_id_booking_sessions_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "session_payments_user_id_users_id_fk"
		}).onDelete("cascade"),
	unique("session_payments_booking_session_id_unique").on(table.bookingSessionId),
	unique("session_payments_stripe_payment_intent_id_unique").on(table.stripePaymentIntentId),
]);

export const employerSubsidies = pgTable("employer_subsidies", {
	id: serial().primaryKey().notNull(),
	employerId: integer("employer_id").notNull(),
	userId: integer("user_id").notNull(),
	originalCents: integer("original_cents").notNull(),
	remainingCents: integer("remaining_cents").notNull(),
	reason: text(),
	expiresAt: timestamp("expires_at", { mode: 'string' }),
	appliedAt: timestamp("applied_at", { mode: 'string' }),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("idx_subsidies_active").using("btree", table.userId.asc().nullsLast().op("int4_ops")).where(sql`((remaining_cents > 0) AND (expires_at IS NULL))`),
	foreignKey({
			columns: [table.employerId],
			foreignColumns: [employers.id],
			name: "employer_subsidies_employer_id_employers_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "employer_subsidies_user_id_users_id_fk"
		}).onDelete("cascade"),
	check("remaining_non_negative", sql`remaining_cents >= 0`),
]);

export const stripeCustomers = pgTable("stripe_customers", {
	id: serial().primaryKey().notNull(),
	userId: integer("user_id").notNull(),
	stripeCustomerId: varchar("stripe_customer_id", { length: 255 }).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "stripe_customers_user_id_users_id_fk"
		}).onDelete("cascade"),
	unique("stripe_customers_user_id_unique").on(table.userId),
	unique("stripe_customers_stripe_customer_id_unique").on(table.stripeCustomerId),
]);

export const therapistPayouts = pgTable("therapist_payouts", {
	id: serial().primaryKey().notNull(),
	therapistId: integer("therapist_id").notNull(),
	bookingSessionId: integer("booking_session_id"),
	amountCents: integer("amount_cents").notNull(),
	stripeTransferId: varchar("stripe_transfer_id", { length: 255 }),
	paidAt: timestamp("paid_at", { mode: 'string' }),
	status: payoutStatus().default('pending').notNull(),
	payoutType: payoutType("payout_type").notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.therapistId],
			foreignColumns: [therapists.id],
			name: "therapist_payouts_therapist_id_therapists_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.bookingSessionId],
			foreignColumns: [bookingSessions.id],
			name: "therapist_payouts_booking_session_id_booking_sessions_id_fk"
		}).onDelete("cascade"),
]);

export const chatChannels = pgTable("chat_channels", {
	id: serial().primaryKey().notNull(),
	chimeChannelArn: varchar("chime_channel_arn", { length: 500 }).notNull(),
	therapistId: integer("therapist_id").notNull(),
	prospectUserId: integer("prospect_user_id").notNull(),
	status: chatChannelStatus().default('active').notNull(),
	lastMessageAt: timestamp("last_message_at", { mode: 'string' }),
	lastMessagePreview: text("last_message_preview"),
	unreadCountTherapist: integer("unread_count_therapist").default(0).notNull(),
	unreadCountProspect: integer("unread_count_prospect").default(0).notNull(),
	metadata: jsonb(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("idx_channels_last_message").using("btree", table.lastMessageAt.asc().nullsLast().op("timestamp_ops")),
	index("idx_therapist_active_chats").using("btree", table.therapistId.asc().nullsLast().op("int4_ops")).where(sql`(status = 'active'::chat_channel_status)`),
	uniqueIndex("uix_therapist_prospect_channel").using("btree", table.therapistId.asc().nullsLast().op("int4_ops"), table.prospectUserId.asc().nullsLast().op("int4_ops")),
	foreignKey({
			columns: [table.therapistId],
			foreignColumns: [therapists.id],
			name: "chat_channels_therapist_id_therapists_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.prospectUserId],
			foreignColumns: [users.id],
			name: "chat_channels_prospect_user_id_users_id_fk"
		}).onDelete("cascade"),
	unique("chat_channels_chime_channel_arn_unique").on(table.chimeChannelArn),
]);

export const chatMessages = pgTable("chat_messages", {
	id: serial().primaryKey().notNull(),
	channelId: integer("channel_id").notNull(),
	chimeMessageId: varchar("chime_message_id", { length: 255 }).notNull(),
	senderId: integer("sender_id").notNull(),
	content: text().notNull(),
	messageType: varchar("message_type", { length: 50 }).default('STANDARD').notNull(),
	status: messageStatus().default('sent').notNull(),
	readByTherapistAt: timestamp("read_by_therapist_at", { mode: 'string' }),
	readByProspectAt: timestamp("read_by_prospect_at", { mode: 'string' }),
	metadata: jsonb(),
	sentAt: timestamp("sent_at", { mode: 'string' }).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("idx_channel_messages").using("btree", table.channelId.asc().nullsLast().op("int4_ops"), table.sentAt.asc().nullsLast().op("int4_ops")),
	index("idx_unread_messages").using("btree", table.channelId.asc().nullsLast().op("enum_ops"), table.status.asc().nullsLast().op("enum_ops")),
	uniqueIndex("uix_chime_message_id").using("btree", table.chimeMessageId.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.channelId],
			foreignColumns: [chatChannels.id],
			name: "chat_messages_channel_id_chat_channels_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.senderId],
			foreignColumns: [users.id],
			name: "chat_messages_sender_id_users_id_fk"
		}).onDelete("cascade"),
]);
