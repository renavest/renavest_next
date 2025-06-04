CREATE TYPE "public"."chat_channel_status" AS ENUM('active', 'archived', 'blocked');--> statement-breakpoint
CREATE TYPE "public"."google_integration_status" AS ENUM('not_connected', 'connected', 'error');--> statement-breakpoint
CREATE TYPE "public"."message_status" AS ENUM('sent', 'delivered', 'read', 'failed');--> statement-breakpoint
CREATE TYPE "public"."payment_status" AS ENUM('pending', 'succeeded', 'failed', 'canceled', 'refunded');--> statement-breakpoint
CREATE TYPE "public"."payout_status" AS ENUM('pending', 'completed', 'failed', 'refunded');--> statement-breakpoint
CREATE TYPE "public"."payout_type" AS ENUM('session_fee', 'async_credit', 'refund');--> statement-breakpoint
CREATE TYPE "public"."session_status" AS ENUM('pending', 'confirmed', 'scheduled', 'completed', 'cancelled', 'rescheduled');--> statement-breakpoint
CREATE TYPE "public"."sponsored_group_type" AS ENUM('erg', 'department', 'project_team', 'wellness_cohort', 'custom_group', 'company_wide');--> statement-breakpoint
CREATE TYPE "public"."user_role" AS ENUM('employee', 'therapist', 'employer_admin', 'super_admin', 'individual_consumer', 'platform_admin');--> statement-breakpoint
CREATE TABLE "booking_sessions" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"therapist_id" integer NOT NULL,
	"session_date" timestamp NOT NULL,
	"session_start_time" timestamp NOT NULL,
	"session_end_time" timestamp NOT NULL,
	"timezone" varchar(50) DEFAULT 'UTC' NOT NULL,
	"status" "session_status" DEFAULT 'pending' NOT NULL,
	"google_event_id" text,
	"cancellation_reason" text,
	"metadata" jsonb,
	"sponsoring_group_id" integer,
	"subsidy_from_group_cents" integer DEFAULT 0,
	"subsidy_from_employer_direct_cents" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "chat_channels" (
	"id" serial PRIMARY KEY NOT NULL,
	"chime_channel_arn" varchar(500) NOT NULL,
	"therapist_id" integer NOT NULL,
	"prospect_user_id" integer NOT NULL,
	"status" "chat_channel_status" DEFAULT 'active' NOT NULL,
	"last_message_at" timestamp,
	"last_message_preview" text,
	"unread_count_therapist" integer DEFAULT 0 NOT NULL,
	"unread_count_prospect" integer DEFAULT 0 NOT NULL,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "chat_channels_chime_channel_arn_unique" UNIQUE("chime_channel_arn")
);
--> statement-breakpoint
CREATE TABLE "chat_messages" (
	"id" serial PRIMARY KEY NOT NULL,
	"channel_id" integer NOT NULL,
	"chime_message_id" varchar(255) NOT NULL,
	"sender_id" integer NOT NULL,
	"content" text NOT NULL,
	"message_type" varchar(50) DEFAULT 'STANDARD' NOT NULL,
	"status" "message_status" DEFAULT 'sent' NOT NULL,
	"read_by_therapist_at" timestamp,
	"read_by_prospect_at" timestamp,
	"metadata" jsonb,
	"sent_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "client_notes" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"therapist_id" integer NOT NULL,
	"session_id" integer,
	"title" text NOT NULL,
	"content" jsonb,
	"is_confidential" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "employer_subsidies" (
	"id" serial PRIMARY KEY NOT NULL,
	"employer_id" integer NOT NULL,
	"user_id" integer NOT NULL,
	"original_cents" integer NOT NULL,
	"remaining_cents" integer NOT NULL,
	"reason" text,
	"expires_at" timestamp,
	"applied_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "remaining_non_negative" CHECK ("employer_subsidies"."remaining_cents" >= 0)
);
--> statement-breakpoint
CREATE TABLE "employers" (
	"id" serial PRIMARY KEY NOT NULL,
	"clerk_org_id" varchar(255),
	"name" varchar(255) NOT NULL,
	"industry" varchar(255),
	"employee_count" integer DEFAULT 0 NOT NULL,
	"plan_name" varchar(255),
	"allocated_sessions" integer DEFAULT 0 NOT NULL,
	"current_sessions_balance" integer DEFAULT 0 NOT NULL,
	"default_subsidy_percentage" integer DEFAULT 0 NOT NULL,
	"allows_sponsored_groups" boolean DEFAULT true NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "employers_clerk_org_id_unique" UNIQUE("clerk_org_id")
);
--> statement-breakpoint
CREATE TABLE "pending_therapists" (
	"id" serial PRIMARY KEY NOT NULL,
	"clerk_email" varchar(255) NOT NULL,
	"name" varchar(255) NOT NULL,
	"title" varchar(255),
	"booking_url" text,
	"expertise" text,
	"certifications" text,
	"favorite_song" text,
	"years_of_experience" integer,
	"ideal_clientele" text,
	"long_bio" text,
	"preview_blurb" text,
	"profile_image_url" text,
	"hourly_rate_cents" integer,
	"google_calendar_access_token" text,
	"google_calendar_refresh_token" text,
	"google_calendar_email" text,
	"google_calendar_integration_status" "google_integration_status" DEFAULT 'not_connected' NOT NULL,
	"google_calendar_integration_date" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "pending_therapists_clerk_email_unique" UNIQUE("clerk_email")
);
--> statement-breakpoint
CREATE TABLE "session_payments" (
	"id" serial PRIMARY KEY NOT NULL,
	"booking_session_id" integer NOT NULL,
	"user_id" integer NOT NULL,
	"total_amount_cents" integer NOT NULL,
	"subsidy_used_cents" integer DEFAULT 0 NOT NULL,
	"out_of_pocket_cents" integer NOT NULL,
	"stripe_payment_intent_id" varchar(255),
	"status" "payment_status" DEFAULT 'pending' NOT NULL,
	"charged_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "session_payments_booking_session_id_unique" UNIQUE("booking_session_id"),
	CONSTRAINT "session_payments_stripe_payment_intent_id_unique" UNIQUE("stripe_payment_intent_id")
);
--> statement-breakpoint
CREATE TABLE "sponsored_group_members" (
	"id" serial PRIMARY KEY NOT NULL,
	"group_id" integer NOT NULL,
	"user_id" integer NOT NULL,
	"role_in_group" varchar(50) DEFAULT 'member' NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"joined_at" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sponsored_groups" (
	"id" serial PRIMARY KEY NOT NULL,
	"employer_id" integer NOT NULL,
	"group_type" "sponsored_group_type" NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"allocated_session_credits" integer DEFAULT 0 NOT NULL,
	"remaining_session_credits" integer DEFAULT 0 NOT NULL,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "remaining_credits_non_negative" CHECK ("sponsored_groups"."remaining_session_credits" >= 0),
	CONSTRAINT "allocated_credits_non_negative" CHECK ("sponsored_groups"."allocated_session_credits" >= 0)
);
--> statement-breakpoint
CREATE TABLE "stripe_customers" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"stripe_customer_id" varchar(255) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "stripe_customers_user_id_unique" UNIQUE("user_id"),
	CONSTRAINT "stripe_customers_stripe_customer_id_unique" UNIQUE("stripe_customer_id")
);
--> statement-breakpoint
CREATE TABLE "therapist_availability" (
	"id" serial PRIMARY KEY NOT NULL,
	"therapist_id" integer NOT NULL,
	"day_of_week" integer NOT NULL,
	"start_time" varchar(5) NOT NULL,
	"end_time" varchar(5) NOT NULL,
	"timezone" varchar(50) DEFAULT 'UTC' NOT NULL,
	"is_recurring" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "therapist_blocked_times" (
	"id" serial PRIMARY KEY NOT NULL,
	"therapist_id" integer NOT NULL,
	"start_time" timestamp NOT NULL,
	"end_time" timestamp NOT NULL,
	"reason" text,
	"google_event_id" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "therapist_chat_preferences" (
	"id" serial PRIMARY KEY NOT NULL,
	"therapist_id" integer NOT NULL,
	"accepting_chats" boolean DEFAULT false NOT NULL,
	"max_active_chats" integer DEFAULT 5 NOT NULL,
	"auto_reply_enabled" boolean DEFAULT false NOT NULL,
	"auto_reply_message" text,
	"business_hours_only" boolean DEFAULT true NOT NULL,
	"business_hours_start" varchar(5) DEFAULT '09:00' NOT NULL,
	"business_hours_end" varchar(5) DEFAULT '17:00' NOT NULL,
	"timezone" varchar(50) DEFAULT 'UTC' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "therapist_chat_preferences_therapist_id_unique" UNIQUE("therapist_id")
);
--> statement-breakpoint
CREATE TABLE "therapist_document_assignments" (
	"id" serial PRIMARY KEY NOT NULL,
	"document_id" integer NOT NULL,
	"user_id" integer NOT NULL,
	"is_shared_with_client" boolean DEFAULT false NOT NULL,
	"shared_at" timestamp,
	"assigned_at" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "therapist_documents" (
	"id" serial PRIMARY KEY NOT NULL,
	"therapist_id" integer NOT NULL,
	"s3_key" text NOT NULL,
	"file_name" varchar(255) NOT NULL,
	"original_file_name" varchar(255) NOT NULL,
	"title" varchar(255) NOT NULL,
	"description" text,
	"category" varchar(100) DEFAULT 'general' NOT NULL,
	"file_size" integer NOT NULL,
	"mime_type" varchar(100) NOT NULL,
	"uploaded_at" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "therapist_documents_s3_key_unique" UNIQUE("s3_key")
);
--> statement-breakpoint
CREATE TABLE "therapist_payouts" (
	"id" serial PRIMARY KEY NOT NULL,
	"therapist_id" integer NOT NULL,
	"booking_session_id" integer,
	"amount_cents" integer NOT NULL,
	"stripe_transfer_id" varchar(255),
	"paid_at" timestamp,
	"status" "payout_status" DEFAULT 'pending' NOT NULL,
	"payout_type" "payout_type" NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "therapists" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"name" varchar(255) NOT NULL,
	"title" varchar(255),
	"booking_url" text,
	"expertise" text,
	"certifications" text,
	"favorite_song" text,
	"years_of_experience" integer,
	"ideal_clientele" text,
	"long_bio" text,
	"preview_blurb" text,
	"profile_image_url" text,
	"hourly_rate_cents" integer,
	"stripe_account_id" varchar(255),
	"onboarding_status" varchar(50) DEFAULT 'not_started',
	"charges_enabled" boolean DEFAULT false,
	"payouts_enabled" boolean DEFAULT false,
	"details_submitted" boolean DEFAULT false,
	"deleted_at" timestamp,
	"google_calendar_access_token" text,
	"google_calendar_refresh_token" text,
	"google_calendar_email" text,
	"google_calendar_integration_status" "google_integration_status" DEFAULT 'not_connected' NOT NULL,
	"google_calendar_integration_date" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "therapists_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "user_onboarding" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"answers" jsonb,
	"version" integer DEFAULT 1 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "user_onboarding_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"clerk_id" varchar(255) NOT NULL,
	"email" varchar(255) NOT NULL,
	"first_name" text,
	"last_name" text,
	"image_url" text,
	"role" "user_role" DEFAULT 'employee' NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"employer_id" integer,
	"subscription_status" varchar(50),
	"stripe_subscription_id" varchar(255),
	"subscription_end_date" timestamp,
	"cancel_at_period_end" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_clerk_id_unique" UNIQUE("clerk_id"),
	CONSTRAINT "users_email_unique" UNIQUE("email"),
	CONSTRAINT "users_stripe_subscription_id_unique" UNIQUE("stripe_subscription_id")
);
--> statement-breakpoint
ALTER TABLE "booking_sessions" ADD CONSTRAINT "booking_sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "booking_sessions" ADD CONSTRAINT "booking_sessions_therapist_id_therapists_id_fk" FOREIGN KEY ("therapist_id") REFERENCES "public"."therapists"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "booking_sessions" ADD CONSTRAINT "booking_sessions_sponsoring_group_id_sponsored_groups_id_fk" FOREIGN KEY ("sponsoring_group_id") REFERENCES "public"."sponsored_groups"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "chat_channels" ADD CONSTRAINT "chat_channels_therapist_id_therapists_id_fk" FOREIGN KEY ("therapist_id") REFERENCES "public"."therapists"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "chat_channels" ADD CONSTRAINT "chat_channels_prospect_user_id_users_id_fk" FOREIGN KEY ("prospect_user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "chat_messages" ADD CONSTRAINT "chat_messages_channel_id_chat_channels_id_fk" FOREIGN KEY ("channel_id") REFERENCES "public"."chat_channels"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "chat_messages" ADD CONSTRAINT "chat_messages_sender_id_users_id_fk" FOREIGN KEY ("sender_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "client_notes" ADD CONSTRAINT "client_notes_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "client_notes" ADD CONSTRAINT "client_notes_therapist_id_therapists_id_fk" FOREIGN KEY ("therapist_id") REFERENCES "public"."therapists"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "client_notes" ADD CONSTRAINT "client_notes_session_id_booking_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."booking_sessions"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "employer_subsidies" ADD CONSTRAINT "employer_subsidies_employer_id_employers_id_fk" FOREIGN KEY ("employer_id") REFERENCES "public"."employers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "employer_subsidies" ADD CONSTRAINT "employer_subsidies_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session_payments" ADD CONSTRAINT "session_payments_booking_session_id_booking_sessions_id_fk" FOREIGN KEY ("booking_session_id") REFERENCES "public"."booking_sessions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session_payments" ADD CONSTRAINT "session_payments_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sponsored_group_members" ADD CONSTRAINT "sponsored_group_members_group_id_sponsored_groups_id_fk" FOREIGN KEY ("group_id") REFERENCES "public"."sponsored_groups"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sponsored_group_members" ADD CONSTRAINT "sponsored_group_members_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sponsored_groups" ADD CONSTRAINT "sponsored_groups_employer_id_employers_id_fk" FOREIGN KEY ("employer_id") REFERENCES "public"."employers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "stripe_customers" ADD CONSTRAINT "stripe_customers_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "therapist_availability" ADD CONSTRAINT "therapist_availability_therapist_id_therapists_id_fk" FOREIGN KEY ("therapist_id") REFERENCES "public"."therapists"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "therapist_blocked_times" ADD CONSTRAINT "therapist_blocked_times_therapist_id_therapists_id_fk" FOREIGN KEY ("therapist_id") REFERENCES "public"."therapists"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "therapist_chat_preferences" ADD CONSTRAINT "therapist_chat_preferences_therapist_id_therapists_id_fk" FOREIGN KEY ("therapist_id") REFERENCES "public"."therapists"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "therapist_document_assignments" ADD CONSTRAINT "therapist_document_assignments_document_id_therapist_documents_id_fk" FOREIGN KEY ("document_id") REFERENCES "public"."therapist_documents"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "therapist_document_assignments" ADD CONSTRAINT "therapist_document_assignments_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "therapist_documents" ADD CONSTRAINT "therapist_documents_therapist_id_therapists_id_fk" FOREIGN KEY ("therapist_id") REFERENCES "public"."therapists"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "therapist_payouts" ADD CONSTRAINT "therapist_payouts_therapist_id_therapists_id_fk" FOREIGN KEY ("therapist_id") REFERENCES "public"."therapists"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "therapist_payouts" ADD CONSTRAINT "therapist_payouts_booking_session_id_booking_sessions_id_fk" FOREIGN KEY ("booking_session_id") REFERENCES "public"."booking_sessions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "therapists" ADD CONSTRAINT "therapists_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_onboarding" ADD CONSTRAINT "user_onboarding_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_employer_id_employers_id_fk" FOREIGN KEY ("employer_id") REFERENCES "public"."employers"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "uix_therapist_slot" ON "booking_sessions" USING btree ("therapist_id","session_start_time");--> statement-breakpoint
CREATE INDEX "idx_sponsoring_group" ON "booking_sessions" USING btree ("sponsoring_group_id");--> statement-breakpoint
CREATE UNIQUE INDEX "uix_therapist_prospect_channel" ON "chat_channels" USING btree ("therapist_id","prospect_user_id");--> statement-breakpoint
CREATE INDEX "idx_therapist_active_chats" ON "chat_channels" USING btree ("therapist_id") WHERE "chat_channels"."status" = 'active';--> statement-breakpoint
CREATE INDEX "idx_channels_last_message" ON "chat_channels" USING btree ("last_message_at");--> statement-breakpoint
CREATE INDEX "idx_channel_messages" ON "chat_messages" USING btree ("channel_id","sent_at");--> statement-breakpoint
CREATE UNIQUE INDEX "uix_chime_message_id" ON "chat_messages" USING btree ("chime_message_id");--> statement-breakpoint
CREATE INDEX "idx_unread_messages" ON "chat_messages" USING btree ("channel_id","status");--> statement-breakpoint
CREATE INDEX "idx_subsidies_active" ON "employer_subsidies" USING btree ("user_id") WHERE "employer_subsidies"."remaining_cents" > 0 AND "employer_subsidies"."expires_at" IS NULL;--> statement-breakpoint
CREATE UNIQUE INDEX "uix_user_sponsored_group" ON "sponsored_group_members" USING btree ("user_id","group_id");--> statement-breakpoint
CREATE INDEX "idx_group_member" ON "sponsored_group_members" USING btree ("group_id");--> statement-breakpoint
CREATE INDEX "idx_active_group_members" ON "sponsored_group_members" USING btree ("group_id","is_active");--> statement-breakpoint
CREATE INDEX "idx_active_sponsored_groups" ON "sponsored_groups" USING btree ("employer_id","is_active");--> statement-breakpoint
CREATE UNIQUE INDEX "uix_document_user_assignment" ON "therapist_document_assignments" USING btree ("document_id","user_id");--> statement-breakpoint
CREATE INDEX "idx_document_assignments" ON "therapist_document_assignments" USING btree ("document_id");--> statement-breakpoint
CREATE INDEX "idx_user_assignments" ON "therapist_document_assignments" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_shared_assignments" ON "therapist_document_assignments" USING btree ("document_id","is_shared_with_client");--> statement-breakpoint
CREATE INDEX "idx_therapist_documents" ON "therapist_documents" USING btree ("therapist_id");