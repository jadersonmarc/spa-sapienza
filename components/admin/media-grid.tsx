"use client"

import { useState, type ReactNode } from "react"
import { cn } from "@/lib/utils"

export type MediaObject = {
  key: string
  url: string
  size?: number
  lastModified?: string
}

export function fileNameFromKey(key: string): string {
  return key.split("/").pop() || key
}

export function formatBytes(n?: number): string {
  if (typeof n !== "number") return ""
  if (n < 1024) return `${n} B`
  if (n < 1024 * 1024) return `${Math.round(n / 1024)} KB`
  return `${(n / (1024 * 1024)).toFixed(1)} MB`
}

function MediaCard({
  obj,
  selected,
  onSelect,
  actions,
}: {
  obj: MediaObject
  selected?: boolean
  onSelect?: (obj: MediaObject) => void
  actions?: (obj: MediaObject) => ReactNode
}) {
  const [dims, setDims] = useState("")
  const name = fileNameFromKey(obj.key)
  const meta = [dims, formatBytes(obj.size)].filter(Boolean).join(" · ")

  const img = (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={obj.url}
      alt={name}
      loading="lazy"
      onLoad={(e) => setDims(`${e.currentTarget.naturalWidth}×${e.currentTarget.naturalHeight}`)}
      className="aspect-square w-full object-cover"
    />
  )

  return (
    <div className="flex flex-col gap-1">
      {onSelect ? (
        <button
          type="button"
          onClick={() => onSelect(obj)}
          className={cn(
            "overflow-hidden rounded-md border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
            selected ? "border-primary ring-2 ring-primary" : "border-border",
          )}
        >
          {img}
        </button>
      ) : (
        <div className="overflow-hidden rounded-md border border-border">{img}</div>
      )}
      <div className="truncate font-mono text-[11px] text-muted-foreground" title={name}>
        {name}
      </div>
      {meta ? <div className="font-mono text-[11px] text-muted-foreground">{meta}</div> : null}
      {actions ? <div className="flex flex-wrap gap-1">{actions(obj)}</div> : null}
    </div>
  )
}

// Grade de miniaturas reutilizada na biblioteca e no seletor. Dimensões lidas no
// client via naturalWidth/naturalHeight (custo zero, sem buscar bytes no server).
export function MediaGrid({
  objects,
  onSelect,
  selectedUrl,
  actions,
  className,
}: {
  objects: MediaObject[]
  onSelect?: (obj: MediaObject) => void
  selectedUrl?: string
  actions?: (obj: MediaObject) => ReactNode
  className?: string
}) {
  return (
    <div className={cn("grid grid-cols-3 gap-3", className)}>
      {objects.map((o) => (
        <MediaCard
          key={o.key}
          obj={o}
          onSelect={onSelect}
          selected={selectedUrl === o.url}
          actions={actions}
        />
      ))}
    </div>
  )
}
