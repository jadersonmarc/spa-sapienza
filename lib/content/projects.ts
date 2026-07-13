import { and, asc, desc, eq, ne } from "drizzle-orm"
import { db, schema } from "@/lib/db"

// Degraus da escada de capacidade (ver lib/content/degraus.ts). Espelha o enum
// `degrau` do banco (lib/db/schema.ts).
export type Degrau = "presenca" | "operacao" | "plataforma" | "fronteira"

// Projeto como exibido no site (prova de engenharia + estudo de caso).
export interface Project {
  id: string
  slug: string
  nome: string
  resumo: string
  problema: string
  stack: string[]
  degrau: Degrau
  destaque: boolean
  ordem: number
  arquitetura: string | null
  decisoes: string | null
  resultado: string | null
  coverImage?: string
}

type Row = typeof schema.projects.$inferSelect

function toProject(row: Row): Project {
  return {
    id: row.id,
    slug: row.slug,
    nome: row.nome,
    resumo: row.resumo,
    problema: row.problema,
    stack: Array.isArray(row.stack) ? (row.stack as string[]) : [],
    degrau: row.degrau as Degrau,
    destaque: row.destaque,
    ordem: row.ordem,
    arquitetura: row.arquitetura,
    decisoes: row.decisoes,
    resultado: row.resultado,
    coverImage: row.coverImageUrl ?? undefined,
  }
}

// ── Público ──────────────────────────────────────────────────────────────────

// Publicados, ordenados por destaque desc e depois pela ordem manual.
export async function getPublishedProjects(): Promise<Project[]> {
  const { projects } = schema
  const rows = await db
    .select()
    .from(projects)
    .where(eq(projects.publicado, true))
    .orderBy(desc(projects.destaque), asc(projects.ordem))
  return rows.map(toProject)
}

export async function getProjectBySlug(slug: string): Promise<Project | undefined> {
  const { projects } = schema
  const [row] = await db
    .select()
    .from(projects)
    .where(and(eq(projects.slug, slug), eq(projects.publicado, true)))
    .limit(1)
  return row ? toProject(row) : undefined
}

// Publicados agrupados por degrau (para a página /engenharia).
export async function getProjectsByDegrau(): Promise<Record<Degrau, Project[]>> {
  const grouped: Record<Degrau, Project[]> = {
    presenca: [],
    operacao: [],
    plataforma: [],
    fronteira: [],
  }
  for (const p of await getPublishedProjects()) grouped[p.degrau].push(p)
  return grouped
}

// ── Admin ────────────────────────────────────────────────────────────────────

export async function listProjectsForAdmin(): Promise<Project[]> {
  const { projects } = schema
  const rows = await db
    .select()
    .from(projects)
    .orderBy(asc(projects.ordem), desc(projects.updatedAt))
  return rows.map(toProject)
}

export async function getProjectForAdmin(id: string): Promise<Project | undefined> {
  const { projects } = schema
  const [row] = await db.select().from(projects).where(eq(projects.id, id)).limit(1)
  return row ? toProject(row) : undefined
}

export async function projectSlugExists(slug: string, exceptId?: string): Promise<boolean> {
  const { projects } = schema
  const [row] = await db
    .select({ id: projects.id })
    .from(projects)
    .where(
      exceptId
        ? and(eq(projects.slug, slug), ne(projects.id, exceptId))
        : eq(projects.slug, slug),
    )
    .limit(1)
  return !!row
}

export type ProjectInput = {
  slug: string
  nome: string
  resumo: string
  problema: string
  stack: string[]
  degrau: Degrau
  destaque: boolean
  ordem: number
  publicado: boolean
  arquitetura: string | null
  decisoes: string | null
  resultado: string | null
  coverImageUrl: string | null
}

export async function createProject(data: ProjectInput, authorId: string): Promise<string> {
  const { projects } = schema
  const [row] = await db
    .insert(projects)
    .values({ ...data, authorId })
    .returning({ id: projects.id })
  return row.id
}

export async function updateProject(id: string, data: ProjectInput): Promise<void> {
  const { projects } = schema
  await db
    .update(projects)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(projects.id, id))
}

export async function deleteProject(id: string): Promise<void> {
  const { projects } = schema
  await db.delete(schema.projects).where(eq(projects.id, id))
}
