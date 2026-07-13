CREATE TYPE "public"."degrau" AS ENUM('presenca', 'operacao', 'plataforma', 'fronteira');--> statement-breakpoint
CREATE TABLE "projects" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" text NOT NULL,
	"nome" text NOT NULL,
	"resumo" text DEFAULT '' NOT NULL,
	"problema" text DEFAULT '' NOT NULL,
	"stack" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"degrau" "degrau" NOT NULL,
	"destaque" boolean DEFAULT false NOT NULL,
	"ordem" integer DEFAULT 0 NOT NULL,
	"publicado" boolean DEFAULT false NOT NULL,
	"arquitetura" text,
	"decisoes" text,
	"resultado" text,
	"cover_image_url" text,
	"author_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "projects" ADD CONSTRAINT "projects_author_id_users_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "projects_slug_idx" ON "projects" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "projects_publicado_idx" ON "projects" USING btree ("publicado");--> statement-breakpoint
CREATE INDEX "projects_degrau_idx" ON "projects" USING btree ("degrau");