ALTER TABLE "public"."booked_sessions" ALTER COLUMN "type" SET DATA TYPE text;--> statement-breakpoint
DROP TYPE "public"."session_type";--> statement-breakpoint
CREATE TYPE "public"."session_type" AS ENUM('free', 'regular');--> statement-breakpoint
ALTER TABLE "public"."booked_sessions" ALTER COLUMN "type" SET DATA TYPE "public"."session_type" USING "type"::"public"."session_type";