"use client"

import { useActionState } from "react"
import { SubmitButton } from "@/components/admin/submit-button"
import {
  applyRecommendationAction,
  runAnalysisAction,
  type AiFormState,
} from "./ai-actions"

const TYPE_LABEL: Record<string, string> = {
  quality: "Qualidade",
  seo: "SEO",
  emotional: "Impacto emocional",
  thematic: "Temática",
}

// Chaves cujos itens são recomendações acionáveis ("Aplicar").
const ACTIONABLE = new Set(["recommendations", "notes", "headingTips", "suggestions", "relatedAreas"])

type Analysis = {
  id: string
  type: string
  payload: unknown
  model: string
  createdAt: Date
}

type ApplyAction = (formData: FormData) => void

function humanize(key: string): string {
  return key.replace(/([a-z])([A-Z])/g, "$1 $2").replace(/^./, (c) => c.toUpperCase())
}

function PayloadView({
  payload,
  analysisType,
  itemId,
  revisionId,
  applyAction,
}: {
  payload: unknown
  analysisType: string
  itemId: string
  revisionId: string
  applyAction: ApplyAction
}) {
  if (!payload || typeof payload !== "object") {
    return <p className="text-sm text-muted-foreground">{String(payload)}</p>
  }
  return (
    <div className="flex flex-col gap-2 text-sm">
      {Object.entries(payload as Record<string, unknown>).map(([key, value]) => (
        <div key={key}>
          <span className="text-muted-foreground">{humanize(key)}:</span>{" "}
          {Array.isArray(value) ? (
            <ul className="ml-1 mt-1 flex flex-col gap-1">
              {value.map((v, i) => (
                <li key={i} className="flex items-start justify-between gap-2">
                  <span>• {String(v)}</span>
                  {ACTIONABLE.has(key) ? (
                    <form action={applyAction} className="shrink-0">
                      <input type="hidden" name="itemId" value={itemId} />
                      <input type="hidden" name="revisionId" value={revisionId} />
                      <input type="hidden" name="type" value={analysisType} />
                      <input type="hidden" name="recommendation" value={String(v)} />
                      <SubmitButton variant="outline" size="sm" pendingLabel="...">
                        Aplicar
                      </SubmitButton>
                    </form>
                  ) : null}
                </li>
              ))}
            </ul>
          ) : (
            <span>{String(value)}</span>
          )}
        </div>
      ))}
    </div>
  )
}

export function AnalysisPanel({
  itemId,
  revisionId,
  analyzers,
  analyses,
}: {
  itemId: string
  revisionId: string
  analyzers: { type: string; label: string }[]
  analyses: Analysis[]
}) {
  const [state, formAction] = useActionState<AiFormState, FormData>(runAnalysisAction, {})
  const [applyState, applyAction] = useActionState<AiFormState, FormData>(
    applyRecommendationAction,
    {},
  )

  return (
    <div className="flex flex-col gap-4 rounded-md border border-border p-4">
      <div>
        <h2 className="font-medium">Análises de IA</h2>
        <p className="text-sm text-muted-foreground">
          Rodam sobre a revisão atual. &ldquo;Aplicar&rdquo; gera uma revisão proposta (revisável no diff).
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {analyzers.map((a) => (
          <form key={a.type} action={formAction}>
            <input type="hidden" name="itemId" value={itemId} />
            <input type="hidden" name="revisionId" value={revisionId} />
            <input type="hidden" name="type" value={a.type} />
            <SubmitButton variant="outline" size="sm" pendingLabel="Rodando...">
              {a.label}
            </SubmitButton>
          </form>
        ))}
      </div>

      {state.error ? <p className="text-sm text-destructive" role="alert">{state.error}</p> : null}
      {applyState.error ? <p className="text-sm text-destructive" role="alert">{applyState.error}</p> : null}
      {applyState.ok ? (
        <p className="text-sm text-emerald-600 dark:text-emerald-400">Proposta criada — veja em &ldquo;Propostas pendentes&rdquo;.</p>
      ) : null}

      {analyses.length === 0 ? (
        <p className="text-sm text-muted-foreground">Nenhuma análise nesta revisão ainda.</p>
      ) : (
        <div className="flex flex-col gap-3">
          {analyses.map((a) => (
            <div key={a.id} className="rounded-md border border-border p-3">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-sm font-medium">{TYPE_LABEL[a.type] ?? a.type}</span>
                <span className="text-xs text-muted-foreground">
                  {new Date(a.createdAt).toLocaleString("pt-BR")}
                </span>
              </div>
              <PayloadView
                payload={a.payload}
                analysisType={a.type}
                itemId={itemId}
                revisionId={revisionId}
                applyAction={applyAction}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
