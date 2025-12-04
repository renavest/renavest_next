ALTER TABLE "booked_sessions" ALTER COLUMN "user_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "booked_sessions" ALTER COLUMN "therapist_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "booked_sessions" ADD COLUMN "user_email" varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE "booked_sessions" ADD COLUMN "therapist_json_id" integer;--> statement-breakpoint
ALTER TABLE "booked_sessions" ADD COLUMN "therapist_name" text;--> statement-breakpoint
ALTER TABLE "booked_sessions" ADD COLUMN "calendly_event_uri" text;--> statement-breakpoint
ALTER TABLE "booked_sessions" ADD COLUMN "calendly_invitee_uri" text;--> statement-breakpoint
ALTER TABLE "therapists" ADD COLUMN "calendly_user_id" varchar(255);--> statement-breakpoint
ALTER TABLE "booked_sessions" DROP COLUMN "meeting_url";