CREATE TYPE "public"."session_type" AS ENUM('demo', 'regular');--> statement-breakpoint
CREATE TABLE "booked_sessions" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"therapist_id" integer NOT NULL,
	"name" text,
	"type" "session_type",
	"meeting_url" text,
	"start_time" timestamp,
	"end_time" timestamp,
	"cancelled" boolean DEFAULT false NOT NULL,
	"cancelled_reason" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "booked_sessions" ADD CONSTRAINT "booked_sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "booked_sessions" ADD CONSTRAINT "booked_sessions_therapist_id_therapists_id_fk" FOREIGN KEY ("therapist_id") REFERENCES "public"."therapists"("id") ON DELETE restrict ON UPDATE no action;