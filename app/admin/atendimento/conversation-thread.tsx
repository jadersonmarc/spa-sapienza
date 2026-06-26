"use client"

import { useEffect, useRef, useState, useTransition } from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { sendMessageAction, handoffAction, suggestAction } from "./actions"
import type { Message } from "@/lib/agent/types"

const POLL_MS = 4000

export function ConversationThread({
  conversationId,
  contactName,
  initialMessages,
  initialMode,
}: {
  conversationId: string
  contactName: string
  initialMessages: Message[]
  initialMode: "bot" | "human"
}) {
  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const [mode, setMode] = useState<"bot" | "human">(initialMode)
  const [text, setText] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  const lastTsRef = useRef<string | undefined>(initialMessages.at(-1)?.created_at)
  const bottomRef = useRef<HTMLDivElement>(null)

  const mergeIncoming = (incoming: Message[]) => {
    if (incoming.length === 0) return
    setMessages((prev) => {
      const seen = new Set(prev.map((m) => m.id))
      const merged = [...prev, ...incoming.filter((m) => !seen.has(m.id))]
      lastTsRef.current = merged.at(-1)?.created_at
      return merged
    })
  }

  // Polling de novas mensagens.
  useEffect(() => {
    let active = true
    const poll = async () => {
      try {
        const after = lastTsRef.current
        const url = `/api/agent/conversations/${conversationId}/messages${after ? `?after=${encodeURIComponent(after)}` : ""}`
        const res = await fetch(url, { cache: "no-store" })
        if (!res.ok) return
        const incoming = (await res.json()) as Message[]
        if (active) mergeIncoming(incoming)
      } catch {
        /* silencioso — tenta de novo no próximo tick */
      }
    }
    const t = setInterval(poll, POLL_MS)
    return () => {
      active = false
      clearInterval(t)
    }
  }, [conversationId])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const onSend = () => {
    const content = text.trim()
    if (!content) return
    startTransition(async () => {
      try {
        const msg = await sendMessageAction(conversationId, content)
        mergeIncoming([msg])
        setText("")
        setError(null)
      } catch {
        setError("Falha ao enviar a mensagem.")
      }
    })
  }

  const onSuggest = () => {
    startTransition(async () => {
      try {
        setText(await suggestAction(conversationId))
        setError(null)
      } catch {
        setError("Falha ao gerar sugestão.")
      }
    })
  }

  const onToggleMode = () => {
    const next = mode === "bot" ? "human" : "bot"
    startTransition(async () => {
      try {
        setMode(await handoffAction(conversationId, next))
        setError(null)
      } catch {
        setError("Falha ao alternar o modo.")
      }
    })
  }

  return (
    <div className="flex h-dvh flex-col">
      <header className="flex items-center justify-between border-b border-border p-4">
        <div>
          <h1 className="font-display text-base font-semibold">{contactName}</h1>
          <span
            className={cn(
              "font-mono text-[11px] uppercase tracking-wider",
              mode === "human" ? "text-amber-600" : "text-muted-foreground",
            )}
          >
            {mode === "human" ? "atendimento humano" : "bot ativo"}
          </span>
        </div>
        <Button variant="outline" size="sm" onClick={onToggleMode} disabled={pending}>
          {mode === "bot" ? "Assumir conversa" : "Devolver ao bot"}
        </Button>
      </header>

      <div className="flex-1 space-y-3 overflow-y-auto p-4">
        {messages.length === 0 && (
          <p className="text-sm text-muted-foreground">Sem mensagens ainda.</p>
        )}
        {messages.map((m) => (
          <div key={m.id} className={cn("flex", m.direction === "out" ? "justify-end" : "justify-start")}>
            <div
              className={cn(
                "max-w-[75%] rounded-2xl px-3 py-2 text-sm whitespace-pre-wrap",
                m.direction === "out"
                  ? "bg-foreground text-background"
                  : "bg-foreground/[0.06] text-foreground",
              )}
            >
              <span className="mb-0.5 block font-mono text-[10px] uppercase tracking-wider opacity-60">
                {m.sender}
              </span>
              {m.content}
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      <footer className="border-t border-border p-4">
        {error && <p className="mb-2 text-sm text-red-500">{error}</p>}
        <div className="flex items-end gap-2">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) onSend()
            }}
            rows={2}
            placeholder="Escreva uma resposta… (Ctrl/⌘+Enter envia)"
            className="flex-1 resize-none rounded-md border border-border bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
          <div className="flex flex-col gap-2">
            <Button variant="outline" size="sm" onClick={onSuggest} disabled={pending}>
              Sugerir
            </Button>
            <Button size="sm" onClick={onSend} disabled={pending || !text.trim()}>
              Enviar
            </Button>
          </div>
        </div>
      </footer>
    </div>
  )
}
