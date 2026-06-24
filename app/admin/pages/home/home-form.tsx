"use client"

import { useActionState, useState } from "react"
import { Button } from "@/components/ui/button"
import { savePageAction, type PageFormState } from "./actions"
import type { HomeBlocks, PlanCard } from "@/lib/content/pages"

const field =
  "rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-ring focus:ring-1 focus:ring-ring"

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

const emptyPlan = (): PlanCard => ({ name: "", audience: "", features: [], ctaLabel: "Consultar valores" })

// Editor dos cards de plano (Portfólio). Sem preço — só nome, público, itens e CTA.
function PlansEditor({ initial }: { initial: PlanCard[] }) {
  const [plans, setPlans] = useState<PlanCard[]>(initial)

  const update = (i: number, patch: Partial<PlanCard>) =>
    setPlans((prev) => prev.map((p, idx) => (idx === i ? { ...p, ...patch } : p)))
  const remove = (i: number) => setPlans((prev) => prev.filter((_, idx) => idx !== i))
  const add = () => setPlans((prev) => [...prev, emptyPlan()])
  const move = (i: number, dir: -1 | 1) =>
    setPlans((prev) => {
      const j = i + dir
      if (j < 0 || j >= prev.length) return prev
      const next = [...prev]
      ;[next[i], next[j]] = [next[j], next[i]]
      return next
    })

  return (
    <fieldset className="flex flex-col gap-4 rounded-md border border-border p-4">
      <legend className="px-1 text-sm text-muted-foreground">Planos (cards do Portfólio)</legend>
      <input type="hidden" name="portfolio.items" value={JSON.stringify(plans)} />

      {plans.length === 0 && (
        <p className="text-sm text-muted-foreground">Nenhum plano. Adicione o primeiro abaixo.</p>
      )}

      {plans.map((plan, i) => (
        <div key={i} className="flex flex-col gap-3 rounded-md border border-border/60 p-3">
          <div className="flex items-center justify-between gap-2">
            <span className="font-mono text-xs text-muted-foreground">#{i + 1}</span>
            <div className="flex gap-1">
              <Button type="button" variant="outline" size="sm" disabled={i === 0} onClick={() => move(i, -1)} aria-label="Mover para cima">↑</Button>
              <Button type="button" variant="outline" size="sm" disabled={i === plans.length - 1} onClick={() => move(i, 1)} aria-label="Mover para baixo">↓</Button>
              <Button type="button" variant="outline" size="sm" onClick={() => remove(i)} aria-label="Remover plano">Remover</Button>
            </div>
          </div>

          <label className="flex flex-col gap-1.5 text-sm">
            <span className="text-muted-foreground">Nome</span>
            <input value={plan.name} onChange={(e) => update(i, { name: e.target.value })} className={field} />
          </label>

          <label className="flex flex-col gap-1.5 text-sm">
            <span className="text-muted-foreground">Público-alvo</span>
            <textarea value={plan.audience} onChange={(e) => update(i, { audience: e.target.value })} rows={2} className={field} />
          </label>

          <label className="flex flex-col gap-1.5 text-sm">
            <span className="text-muted-foreground">Itens — um por linha (&quot;Inclui&quot; / &quot;O que faz&quot;)</span>
            <textarea
              value={plan.features.join("\n")}
              onChange={(e) => update(i, { features: e.target.value.split("\n") })}
              rows={5}
              className={field}
            />
          </label>

          <label className="flex flex-col gap-1.5 text-sm">
            <span className="text-muted-foreground">Botão (CTA)</span>
            <input value={plan.ctaLabel} onChange={(e) => update(i, { ctaLabel: e.target.value })} className={field} />
          </label>

          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={!!plan.addon} onChange={(e) => update(i, { addon: e.target.checked })} />
            <span className="text-muted-foreground">Destacar como add-on</span>
          </label>
        </div>
      ))}

      <Button type="button" variant="outline" onClick={add} className="self-start">
        + Adicionar plano
      </Button>
    </fieldset>
  )
}

export function HomeForm({ initial }: { initial: HomeBlocks }) {
  const [state, formAction, pending] = useActionState<PageFormState, FormData>(savePageAction, {})

  return (
    <form action={formAction} className="flex max-w-3xl flex-col gap-6">
      {SECTIONS.map((sec) => (
        <fieldset key={sec.title} className="flex flex-col gap-3 rounded-md border border-border p-4">
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

      <PlansEditor initial={initial.portfolio.items ?? []} />

      {state.error ? <p className="text-sm text-destructive" role="alert">{state.error}</p> : null}
      {state.ok ? <p className="text-sm text-emerald-600 dark:text-emerald-400">Salvo (rascunho). Publique para refletir no site.</p> : null}

      <Button type="submit" disabled={pending} className="self-start">
        {pending ? "Salvando..." : "Salvar rascunho"}
      </Button>
    </form>
  )
}
