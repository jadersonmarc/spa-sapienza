"use client"

import { useActionState } from "react"
import { Button } from "@/components/ui/button"
import { savePageAction, type PageFormState } from "./actions"
import type { HomeBlocks } from "@/lib/content/pages"

const field =
  "rounded-md border border-white/10 bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-white/30"

type FieldDef = { name: string; label: string; long?: boolean }
const SECTIONS: { title: string; fields: FieldDef[] }[] = [
  {
    title: "Hero",
    fields: [
      { name: "hero.badge", label: "Badge" },
      { name: "hero.titleLead", label: "Título (início)" },
      { name: "hero.titleHighlight", label: "Título (destaque)" },
      { name: "hero.subtitle", label: "Subtítulo", long: true },
      { name: "hero.ctaLabel", label: "Botão (CTA)" },
    ],
  },
  { title: "Serviços", fields: [
    { name: "services.title", label: "Título" },
    { name: "services.subtitle", label: "Subtítulo", long: true },
  ] },
  { title: "Como funciona", fields: [
    { name: "howItWorks.eyebrow", label: "Eyebrow" },
    { name: "howItWorks.title", label: "Título" },
    { name: "howItWorks.subtitle", label: "Subtítulo", long: true },
  ] },
  { title: "Portfólio", fields: [
    { name: "portfolio.title", label: "Título" },
    { name: "portfolio.subtitle", label: "Subtítulo", long: true },
  ] },
  { title: "Confiança", fields: [
    { name: "trust.eyebrow", label: "Eyebrow" },
    { name: "trust.title", label: "Título" },
    { name: "trust.subtitle", label: "Subtítulo", long: true },
  ] },
  { title: "Diferenciais", fields: [
    { name: "differentials.eyebrow", label: "Eyebrow" },
    { name: "differentials.titleLead", label: "Título (início)" },
    { name: "differentials.titleHighlight", label: "Título (destaque)" },
    { name: "differentials.subtitle", label: "Subtítulo", long: true },
  ] },
]

function valueOf(initial: HomeBlocks, name: string): string {
  const [a, b] = name.split(".")
  const section = (initial as unknown as Record<string, Record<string, string>>)[a]
  return section?.[b] ?? ""
}

export function HomeForm({ initial }: { initial: HomeBlocks }) {
  const [state, formAction, pending] = useActionState<PageFormState, FormData>(savePageAction, {})

  return (
    <form action={formAction} className="flex max-w-3xl flex-col gap-6">
      {SECTIONS.map((sec) => (
        <fieldset key={sec.title} className="flex flex-col gap-3 rounded-md border border-white/10 p-4">
          <legend className="px-1 text-sm text-muted-foreground">{sec.title}</legend>
          {sec.fields.map((f) => (
            <label key={f.name} className="flex flex-col gap-1.5 text-sm">
              <span className="text-muted-foreground">{f.label}</span>
              {f.long ? (
                <textarea name={f.name} defaultValue={valueOf(initial, f.name)} rows={3} className={field} />
              ) : (
                <input name={f.name} defaultValue={valueOf(initial, f.name)} className={field} />
              )}
            </label>
          ))}
        </fieldset>
      ))}

      {state.error ? <p className="text-sm text-red-400" role="alert">{state.error}</p> : null}
      {state.ok ? <p className="text-sm text-green-400">Salvo (rascunho). Publique para refletir no site.</p> : null}

      <Button type="submit" disabled={pending} className="self-start">
        {pending ? "Salvando..." : "Salvar rascunho"}
      </Button>
    </form>
  )
}
