ALTER TABLE "content_revisions" ADD COLUMN "blocks" jsonb;--> statement-breakpoint
ALTER TABLE "content_revisions" ADD COLUMN "is_proposed" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "content_revisions" ADD COLUMN "proposed_from" jsonb;--> statement-breakpoint
ALTER TABLE "social_drafts" ADD COLUMN "image_url" text;--> statement-breakpoint
ALTER TABLE "social_drafts" ADD COLUMN "post_url" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "session_version" integer DEFAULT 0 NOT NULL;