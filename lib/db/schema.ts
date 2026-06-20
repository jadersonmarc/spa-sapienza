import {
  pgTable,
  pgEnum,
  uuid,
  text,
  timestamp,
  jsonb,
  boolean,
  integer,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core"

// ── Enums ────────────────────────────────────────────────────────────────────
export const contentType = pgEnum("content_type", ["post", "page"])
export const contentStatus = pgEnum("content_status", [
  "draft",
  "in_review",
  "scheduled",
  "published",
  "archived",
])
export const pilar = pgEnum("pilar", ["p1", "p2", "p3"]) // p1 Engenharia+IA, p2 Negócio/PME, p3 Bastidores
export const analysisType = pgEnum("analysis_type", [
  "quality",
  "seo",
  "emotional",
  "thematic",
])
export const platform = pgEnum("platform", ["instagram", "linkedin"])
export const socialStatus = pgEnum("social_status", ["draft", "approved", "sent"])
export const userRole = pgEnum("user_role", ["admin", "editor"])

// ── users (identidade do admin; auth via Auth.js) ────────────────────────────
export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  role: userRole("role").notNull().default("editor"),
  // R4: bump invalida sessões JWT antigas (após troca de senha).
  sessionVersion: integer("session_version").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
})

// ── content_items ────────────────────────────────────────────────────────────
export const contentItems = pgTable(
  "content_items",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    type: contentType("type").notNull(),
    slug: text("slug").notNull(),
    pilar: pilar("pilar"), // null para páginas
    status: contentStatus("status").notNull().default("draft"),
    // FK definida via migration/relations para evitar ciclo com content_revisions
    currentRevisionId: uuid("current_revision_id"),
    scheduledAt: timestamp("scheduled_at", { withTimezone: true }),
    publishedAt: timestamp("published_at", { withTimezone: true }),
    authorId: uuid("author_id")
      .notNull()
      .references(() => users.id),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    uniqueIndex("content_items_slug_idx").on(t.slug),
    index("content_items_type_status_idx").on(t.type, t.status),
    index("content_items_pilar_idx").on(t.pilar),
  ],
)

// ── content_revisions (snapshot completo por save) ───────────────────────────
export const contentRevisions = pgTable(
  "content_revisions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    contentItemId: uuid("content_item_id")
      .notNull()
      .references(() => contentItems.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    bodyMarkdown: text("body_markdown").notNull(),
    excerpt: text("excerpt").notNull().default(""),
    // { title?: string; description?: string; keywords?: string[] }
    seo: jsonb("seo").notNull().default({}),
    // Páginas (type='page'): blocos nomeados por seção. Null para posts.
    blocks: jsonb("blocks"),
    // R1: revisão proposta por IA (não vira current até aceita).
    isProposed: boolean("is_proposed").notNull().default(false),
    // R1: rastreio { analysisType, recommendation } da recomendação que gerou.
    proposedFrom: jsonb("proposed_from"),
    authorId: uuid("author_id")
      .notNull()
      .references(() => users.id),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("content_revisions_item_idx").on(t.contentItemId)],
)

// ── ai_analyses (atada à revisão em que rodou) ───────────────────────────────
export const aiAnalyses = pgTable(
  "ai_analyses",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    contentItemId: uuid("content_item_id")
      .notNull()
      .references(() => contentItems.id, { onDelete: "cascade" }),
    revisionId: uuid("revision_id")
      .notNull()
      .references(() => contentRevisions.id, { onDelete: "cascade" }),
    type: analysisType("type").notNull(),
    payload: jsonb("payload").notNull(),
    model: text("model").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("ai_analyses_revision_idx").on(t.revisionId)],
)

// ── social_drafts ────────────────────────────────────────────────────────────
export const socialDrafts = pgTable(
  "social_drafts",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    contentItemId: uuid("content_item_id")
      .notNull()
      .references(() => contentItems.id, { onDelete: "cascade" }),
    revisionId: uuid("revision_id")
      .notNull()
      .references(() => contentRevisions.id, { onDelete: "cascade" }),
    platform: platform("platform").notNull(),
    body: text("body").notNull(),
    hashtags: jsonb("hashtags").notNull().default([]),
    status: socialStatus("status").notNull().default("draft"),
    imageUrl: text("image_url"), // R2-img: capa (OG PNG) servida via R2
    postUrl: text("post_url"), // link do post após o envio
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("social_drafts_item_idx").on(t.contentItemId)],
)

// ── audit_log (transições editoriais) ────────────────────────────────────────
export const auditLog = pgTable(
  "audit_log",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    contentItemId: uuid("content_item_id")
      .notNull()
      .references(() => contentItems.id, { onDelete: "cascade" }),
    actorId: uuid("actor_id")
      .notNull()
      .references(() => users.id),
    fromStatus: contentStatus("from_status"),
    toStatus: contentStatus("to_status").notNull(),
    note: text("note"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("audit_log_item_idx").on(t.contentItemId)],
)
