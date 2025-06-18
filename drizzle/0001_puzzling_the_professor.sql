CREATE TABLE "form_assignments" (
	"id" serial PRIMARY KEY NOT NULL,
	"form_id" integer NOT NULL,
	"client_id" integer NOT NULL,
	"therapist_id" integer NOT NULL,
	"status" varchar(20) DEFAULT 'sent' NOT NULL,
	"responses" jsonb,
	"sent_at" timestamp DEFAULT now() NOT NULL,
	"completed_at" timestamp,
	"expires_at" timestamp,
	"reminders_sent" integer DEFAULT 0 NOT NULL,
	"last_reminder_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "intake_forms" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" varchar(255) NOT NULL,
	"description" text,
	"therapist_id" integer NOT NULL,
	"fields" jsonb NOT NULL,
	"status" varchar(20) DEFAULT 'draft' NOT NULL,
	"is_template" boolean DEFAULT false NOT NULL,
	"template_category" varchar(100),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_sessions" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"clerk_session_id" varchar(255) NOT NULL,
	"status" varchar(20) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"ended_at" timestamp,
	"metadata" jsonb
);
--> statement-breakpoint
ALTER TABLE "form_assignments" ADD CONSTRAINT "form_assignments_form_id_intake_forms_id_fk" FOREIGN KEY ("form_id") REFERENCES "public"."intake_forms"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "form_assignments" ADD CONSTRAINT "form_assignments_client_id_users_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "form_assignments" ADD CONSTRAINT "form_assignments_therapist_id_therapists_id_fk" FOREIGN KEY ("therapist_id") REFERENCES "public"."therapists"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "intake_forms" ADD CONSTRAINT "intake_forms_therapist_id_therapists_id_fk" FOREIGN KEY ("therapist_id") REFERENCES "public"."therapists"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_sessions" ADD CONSTRAINT "user_sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_clerk_session_id" ON "user_sessions" USING btree ("clerk_session_id");--> statement-breakpoint
CREATE INDEX "idx_user_sessions" ON "user_sessions" USING btree ("user_id","status");--> statement-breakpoint
CREATE INDEX "idx_session_status" ON "user_sessions" USING btree ("status","created_at");