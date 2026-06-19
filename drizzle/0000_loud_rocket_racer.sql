CREATE TYPE "public"."analysis_type" AS ENUM('quality', 'seo', 'emotional', 'thematic');--> statement-breakpoint
CREATE TYPE "public"."content_status" AS ENUM('draft', 'in_review', 'scheduled', 'published', 'archived');--> statement-breakpoint
CREATE TYPE "public"."content_type" AS ENUM('post', 'page');--> statement-breakpoint
CREATE TYPE "public"."pilar" AS ENUM('p1', 'p2', 'p3');--> statement-breakpoint
CREATE TYPE "public"."platform" AS ENUM('instagram', 'linkedin');--> statement-breakpoint
CREATE TYPE "public"."social_status" AS ENUM('draft', 'approved', 'sent');--> statement-breakpoint
CREATE TYPE "public"."user_role" AS ENUM('admin', 'editor');--> statement-breakpoint
CREATE TABLE "ai_analyses" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"content_item_id" uuid NOT NULL,
	"revision_id" uuid NOT NULL,
	"type" "analysis_type" NOT NULL,
	"payload" jsonb NOT NULL,
	"model" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "audit_log" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"content_item_id" uuid NOT NULL,
	"actor_id" uuid NOT NULL,
	"from_status" "content_status",
	"to_status" "content_status" NOT NULL,
	"note" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "content_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"type" "content_type" NOT NULL,
	"slug" text NOT NULL,
	"pilar" "pilar",
	"status" "content_status" DEFAULT 'draft' NOT NULL,
	"current_revision_id" uuid,
	"scheduled_at" timestamp with time zone,
	"published_at" timestamp with time zone,
	"author_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "content_revisions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"content_item_id" uuid NOT NULL,
	"title" text NOT NULL,
	"body_markdown" text NOT NULL,
	"excerpt" text DEFAULT '' NOT NULL,
	"seo" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"author_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "social_drafts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"content_item_id" uuid NOT NULL,
	"revision_id" uuid NOT NULL,
	"platform" "platform" NOT NULL,
	"body" text NOT NULL,
	"hashtags" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"status" "social_status" DEFAULT 'draft' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"role" "user_role" DEFAULT 'editor' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "ai_analyses" ADD CONSTRAINT "ai_analyses_content_item_id_content_items_id_fk" FOREIGN KEY ("content_item_id") REFERENCES "public"."content_items"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_analyses" ADD CONSTRAINT "ai_analyses_revision_id_content_revisions_id_fk" FOREIGN KEY ("revision_id") REFERENCES "public"."content_revisions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "audit_log" ADD CONSTRAINT "audit_log_content_item_id_content_items_id_fk" FOREIGN KEY ("content_item_id") REFERENCES "public"."content_items"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "audit_log" ADD CONSTRAINT "audit_log_actor_id_users_id_fk" FOREIGN KEY ("actor_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "content_items" ADD CONSTRAINT "content_items_author_id_users_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "content_revisions" ADD CONSTRAINT "content_revisions_content_item_id_content_items_id_fk" FOREIGN KEY ("content_item_id") REFERENCES "public"."content_items"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "content_revisions" ADD CONSTRAINT "content_revisions_author_id_users_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "social_drafts" ADD CONSTRAINT "social_drafts_content_item_id_content_items_id_fk" FOREIGN KEY ("content_item_id") REFERENCES "public"."content_items"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "social_drafts" ADD CONSTRAINT "social_drafts_revision_id_content_revisions_id_fk" FOREIGN KEY ("revision_id") REFERENCES "public"."content_revisions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "ai_analyses_revision_idx" ON "ai_analyses" USING btree ("revision_id");--> statement-breakpoint
CREATE INDEX "audit_log_item_idx" ON "audit_log" USING btree ("content_item_id");--> statement-breakpoint
CREATE UNIQUE INDEX "content_items_slug_idx" ON "content_items" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "content_items_type_status_idx" ON "content_items" USING btree ("type","status");--> statement-breakpoint
CREATE INDEX "content_items_pilar_idx" ON "content_items" USING btree ("pilar");--> statement-breakpoint
CREATE INDEX "content_revisions_item_idx" ON "content_revisions" USING btree ("content_item_id");--> statement-breakpoint
CREATE INDEX "social_drafts_item_idx" ON "social_drafts" USING btree ("content_item_id");