CREATE TABLE "erg_groups" (
	"id" serial PRIMARY KEY NOT NULL,
	"employer_id" integer NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" text,
	"category" varchar(100),
	"max_members" integer DEFAULT 100 NOT NULL,
	"current_member_count" integer DEFAULT 0 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"allocated_sessions" integer DEFAULT 0 NOT NULL,
	"current_sessions_balance" integer DEFAULT 0 NOT NULL,
	"leader_id" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "erg_memberships" (
	"id" serial PRIMARY KEY NOT NULL,
	"erg_group_id" integer NOT NULL,
	"user_id" integer NOT NULL,
	"role" varchar(50) DEFAULT 'member' NOT NULL,
	"joined_at" timestamp DEFAULT now() NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "employers" ADD COLUMN "allows_ergs" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "employers" ADD COLUMN "erg_onboarding_enabled" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "employers" ADD COLUMN "bulk_invite_enabled" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "employers" ADD COLUMN "default_subsidy_percentage" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "employer_subsidized_access" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "erg_groups" ADD CONSTRAINT "erg_groups_employer_id_employers_id_fk" FOREIGN KEY ("employer_id") REFERENCES "public"."employers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "erg_groups" ADD CONSTRAINT "erg_groups_leader_id_users_id_fk" FOREIGN KEY ("leader_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "erg_memberships" ADD CONSTRAINT "erg_memberships_erg_group_id_erg_groups_id_fk" FOREIGN KEY ("erg_group_id") REFERENCES "public"."erg_groups"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "erg_memberships" ADD CONSTRAINT "erg_memberships_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "uix_user_erg" ON "erg_memberships" USING btree ("user_id","erg_group_id");--> statement-breakpoint
ALTER TABLE "therapists" DROP COLUMN "profile_image_version";