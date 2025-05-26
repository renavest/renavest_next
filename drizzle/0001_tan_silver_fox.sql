CREATE TYPE "public"."google_integration_status" AS ENUM('not_connected', 'connected', 'error');--> statement-breakpoint
CREATE TYPE "public"."payment_status" AS ENUM('pending', 'succeeded', 'failed', 'canceled', 'refunded');--> statement-breakpoint
CREATE TYPE "public"."payout_status" AS ENUM('pending', 'completed', 'failed', 'refunded');--> statement-breakpoint
CREATE TYPE "public"."payout_type" AS ENUM('session_fee', 'async_credit', 'refund');--> statement-breakpoint
CREATE TYPE "public"."session_status" AS ENUM('pending', 'confirmed', 'scheduled', 'completed', 'cancelled', 'rescheduled');--> statement-breakpoint
CREATE TYPE "public"."user_role" AS ENUM('employee', 'therapist', 'employer_admin', 'super_admin');--> statement-breakpoint
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
	"stripe_payment_intent_id" varchar(255) NOT NULL,
	"total_amount_cents" integer NOT NULL,
	"subsidy_used_cents" integer DEFAULT 0 NOT NULL,
	"out_of_pocket_cents" integer NOT NULL,
	"status" "payment_status" DEFAULT 'pending' NOT NULL,
	"charged_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "session_payments_booking_session_id_unique" UNIQUE("booking_session_id"),
	CONSTRAINT "session_payments_stripe_payment_intent_id_unique" UNIQUE("stripe_payment_intent_id")
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
ALTER TABLE "therapists" RENAME COLUMN "hourly_rate" TO "hourly_rate_cents";--> statement-breakpoint
ALTER TABLE "booking_sessions" DROP CONSTRAINT "booking_sessions_user_id_users_clerk_id_fk";
--> statement-breakpoint
ALTER TABLE "booking_sessions" DROP CONSTRAINT "booking_sessions_therapist_id_therapists_id_fk";
--> statement-breakpoint
ALTER TABLE "user_onboarding" DROP CONSTRAINT "user_onboarding_user_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "booking_sessions" ALTER COLUMN "user_id" SET DATA TYPE integer;--> statement-breakpoint
ALTER TABLE "booking_sessions" ALTER COLUMN "status" SET DATA TYPE session_status;--> statement-breakpoint
ALTER TABLE "booking_sessions" ALTER COLUMN "status" SET DEFAULT 'pending';--> statement-breakpoint
ALTER TABLE "client_notes" ALTER COLUMN "user_id" SET DATA TYPE integer;--> statement-breakpoint
ALTER TABLE "therapists" ALTER COLUMN "user_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "booking_sessions" ADD COLUMN "session_end_time" timestamp NOT NULL;--> statement-breakpoint
ALTER TABLE "booking_sessions" ADD COLUMN "timezone" varchar(50) DEFAULT 'UTC' NOT NULL;--> statement-breakpoint
ALTER TABLE "booking_sessions" ADD COLUMN "google_event_id" text;--> statement-breakpoint
ALTER TABLE "booking_sessions" ADD COLUMN "cancellation_reason" text;--> statement-breakpoint
ALTER TABLE "therapists" ADD COLUMN "stripe_account_id" varchar(255);--> statement-breakpoint
ALTER TABLE "therapists" ADD COLUMN "onboarding_status" varchar(50) DEFAULT 'not_started';--> statement-breakpoint
ALTER TABLE "therapists" ADD COLUMN "charges_enabled" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "therapists" ADD COLUMN "payouts_enabled" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "therapists" ADD COLUMN "details_submitted" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "therapists" ADD COLUMN "deleted_at" timestamp;--> statement-breakpoint
ALTER TABLE "therapists" ADD COLUMN "google_calendar_access_token" text;--> statement-breakpoint
ALTER TABLE "therapists" ADD COLUMN "google_calendar_refresh_token" text;--> statement-breakpoint
ALTER TABLE "therapists" ADD COLUMN "google_calendar_email" text;--> statement-breakpoint
ALTER TABLE "therapists" ADD COLUMN "google_calendar_integration_status" "google_integration_status" DEFAULT 'not_connected' NOT NULL;--> statement-breakpoint
ALTER TABLE "therapists" ADD COLUMN "google_calendar_integration_date" timestamp;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "role" "user_role" DEFAULT 'employee' NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "employer_id" integer;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "subscription_status" varchar(50);--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "stripe_subscription_id" varchar(255);--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "subscription_end_date" timestamp;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "cancel_at_period_end" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "employer_subsidies" ADD CONSTRAINT "employer_subsidies_employer_id_employers_id_fk" FOREIGN KEY ("employer_id") REFERENCES "public"."employers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "employer_subsidies" ADD CONSTRAINT "employer_subsidies_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session_payments" ADD CONSTRAINT "session_payments_booking_session_id_booking_sessions_id_fk" FOREIGN KEY ("booking_session_id") REFERENCES "public"."booking_sessions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session_payments" ADD CONSTRAINT "session_payments_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "stripe_customers" ADD CONSTRAINT "stripe_customers_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "therapist_availability" ADD CONSTRAINT "therapist_availability_therapist_id_therapists_id_fk" FOREIGN KEY ("therapist_id") REFERENCES "public"."therapists"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "therapist_blocked_times" ADD CONSTRAINT "therapist_blocked_times_therapist_id_therapists_id_fk" FOREIGN KEY ("therapist_id") REFERENCES "public"."therapists"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "therapist_payouts" ADD CONSTRAINT "therapist_payouts_therapist_id_therapists_id_fk" FOREIGN KEY ("therapist_id") REFERENCES "public"."therapists"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "therapist_payouts" ADD CONSTRAINT "therapist_payouts_booking_session_id_booking_sessions_id_fk" FOREIGN KEY ("booking_session_id") REFERENCES "public"."booking_sessions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_subsidies_active" ON "employer_subsidies" USING btree ("user_id") WHERE "employer_subsidies"."remaining_cents" > 0 AND "employer_subsidies"."expires_at" IS NULL;--> statement-breakpoint
ALTER TABLE "booking_sessions" ADD CONSTRAINT "booking_sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "booking_sessions" ADD CONSTRAINT "booking_sessions_therapist_id_therapists_id_fk" FOREIGN KEY ("therapist_id") REFERENCES "public"."therapists"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "client_notes" ADD CONSTRAINT "client_notes_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "client_notes" ADD CONSTRAINT "client_notes_therapist_id_therapists_id_fk" FOREIGN KEY ("therapist_id") REFERENCES "public"."therapists"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "client_notes" ADD CONSTRAINT "client_notes_session_id_booking_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."booking_sessions"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "therapists" ADD CONSTRAINT "therapists_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_onboarding" ADD CONSTRAINT "user_onboarding_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_employer_id_employers_id_fk" FOREIGN KEY ("employer_id") REFERENCES "public"."employers"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "uix_therapist_slot" ON "booking_sessions" USING btree ("therapist_id","session_start_time");--> statement-breakpoint
ALTER TABLE "therapists" DROP COLUMN "email";--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN "therapist_id";--> statement-breakpoint
ALTER TABLE "therapists" ADD CONSTRAINT "therapists_user_id_unique" UNIQUE("user_id");--> statement-breakpoint
ALTER TABLE "user_onboarding" ADD CONSTRAINT "user_onboarding_user_id_unique" UNIQUE("user_id");--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_stripe_subscription_id_unique" UNIQUE("stripe_subscription_id");