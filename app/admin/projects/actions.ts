"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { requireUser, isAdmin } from "@/lib/auth/session"
import {
  createProject,
  updateProject,
  deleteProject,
  getProjectForAdmin,
  projectSlugExists,
  type Degrau,
  type ProjectInput,
} from "@/lib/content/projects"

export type FormState = { error?: string }

const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/
const DEGRAUS: Degrau[] = ["presenca", "operacao", "plataforma", "fronteira"]

// Lê e valida os campos do form de projeto (criar/editar).
function parseForm(formData: FormData): { data: ProjectInput } | { error: string } {
  const slug = String(formData.get("slug") ?? "").trim().toLowerCase()
  const nome = String(formData.get("nome") ?? "").trim()
  const resumo = String(formData.get("resumo") ?? "").trim()
  const problema = String(formData.get("problema") ?? "").trim()
  const degrau = String(formData.get("degrau") ?? "") as Degrau
  const ordemRaw = String(formData.get("ordem") ?? "0").trim()

  if (!nome) return { error: "Nome é obrigatório." }
  if (!SLUG_RE.test(slug))
    return { error: "Slug inválido (use minúsculas, números e hifens)." }
  if (!DEGRAUS.includes(degrau)) return { error: "Selecione o degrau." }

  const ordem = Number.parseInt(ordemRaw, 10)
  if (Number.isNaN(ordem)) return { error: "Ordem deve ser um número." }

  // Stack: uma por linha ou separada por vírgula.
  const stack = String(formData.get("stack") ?? "")
    .split(/[\n,]/)
    .map((s) => s.trim())
    .filter(Boolean)

  const opt = (k: string) => {
    const v = String(formData.get(k) ?? "").trim()
    return v || null
  }

  return {
    data: {
      slug,
      nome,
      resumo,
      problema,
      stack,
      degrau,
      destaque: formData.get("destaque") === "on",
      ordem,
      publicado: formData.get("publicado") === "on",
      arquitetura: opt("arquitetura"),
      decisoes: opt("decisoes"),
      resultado: opt("resultado"),
      coverImageUrl: opt("coverImageUrl"),
    },
  }
}

export async function createProjectAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const user = await requireUser()
  const parsed = parseForm(formData)
  if ("error" in parsed) return parsed

  if (await projectSlugExists(parsed.data.slug))
    return { error: "Já existe projeto com esse slug." }

  await createProject(parsed.data, user.id)
  revalidatePath("/admin/projects")
  revalidatePath("/engenharia")
  revalidatePath("/projetos")
  revalidatePath("/")
  redirect("/admin/projects")
}

export async function saveProjectAction(
  id: string,
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  await requireUser()
  const parsed = parseForm(formData)
  if ("error" in parsed) return parsed

  if (await projectSlugExists(parsed.data.slug, id))
    return { error: "Já existe outro projeto com esse slug." }

  await updateProject(id, parsed.data)
  revalidatePath("/admin/projects")
  revalidatePath(`/admin/projects/${id}`)
  revalidatePath("/engenharia")
  revalidatePath("/projetos")
  revalidatePath(`/projetos/${parsed.data.slug}`)
  revalidatePath("/")
  redirect("/admin/projects")
}

// Exclui um projeto. Só admin. Retorna { error } para a UI exibir.
export async function deleteProjectAction(id: string): Promise<FormState> {
  const user = await requireUser()
  if (!isAdmin(user.role)) return { error: "Apenas administradores podem excluir." }
  if (!id) return { error: "Projeto inválido." }

  const project = await getProjectForAdmin(id)
  if (!project) return { error: "Projeto não encontrado." }

  try {
    await deleteProject(id)
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Falha ao excluir." }
  }

  revalidatePath("/admin/projects")
  revalidatePath("/engenharia")
  revalidatePath("/projetos")
  revalidatePath(`/projetos/${project.slug}`)
  revalidatePath("/")
  return {}
}
