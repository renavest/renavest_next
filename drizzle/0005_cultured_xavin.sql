ALTER TABLE "booked_sessions" ADD COLUMN "rescheduled" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "booked_sessions" ADD COLUMN "rescheduled_reason" text;--> statement-breakpoint
ALTER TABLE "booked_sessions" ADD COLUMN "original_start_time" timestamp;--> statement-breakpoint
ALTER TABLE "booked_sessions" ADD COLUMN "original_end_time" timestamp;