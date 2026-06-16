import { Cpu, Building2, Wrench, type LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import type { Pilar } from "@/lib/blog"

// Capa programática (branded) por pilar — sem imagens externas/stock.
// Gradiente + glow + textura de pontos + ícone e wordmark da marca.
const coverConfig: Record<
  Pilar,
  { gradient: string; glow: string; icon: string; Icon: LucideIcon }
> = {
  engenharia: {
    gradient: "from-blue-500/25",
    glow: "bg-blue-500/25",
    icon: "text-blue-300",
    Icon: Cpu,
  },
  pme: {
    gradient: "from-green-500/25",
    glow: "bg-green-500/25",
    icon: "text-green-300",
    Icon: Building2,
  },
  bastidores: {
    gradient: "from-orange-500/25",
    glow: "bg-orange-500/25",
    icon: "text-orange-300",
    Icon: Wrench,
  },
}

interface ArticleCoverProps {
  pilar: Pilar
  variant?: "card" | "feature"
  className?: string
}

export function ArticleCover({ pilar, variant = "card", className }: ArticleCoverProps) {
  const cfg = coverConfig[pilar]
  const Icon = cfg.Icon

  return (
    <div
      aria-hidden="true"
      className={cn(
        "relative isolate overflow-hidden bg-gradient-to-br to-background",
        cfg.gradient,
        variant === "card" ? "aspect-[16/9]" : "aspect-[5/2]",
        className
      )}
    >
      {/* glow */}
      <div
        className={cn(
          "absolute -right-12 -top-12 rounded-full blur-3xl",
          variant === "card" ? "h-40 w-40" : "h-64 w-64",
          cfg.glow
        )}
      />
      {/* textura de pontos */}
      <div
        className="absolute inset-0 text-foreground opacity-[0.12]"
        style={{
          backgroundImage: "radial-gradient(currentColor 1px, transparent 1px)",
          backgroundSize: "16px 16px",
        }}
      />
      {/* conteúdo */}
      <div
        className={cn(
          "relative flex h-full flex-col justify-between",
          variant === "card" ? "p-4 sm:p-5" : "p-6 sm:p-8"
        )}
      >
        <Icon className={cn(cfg.icon, variant === "card" ? "h-6 w-6" : "h-9 w-9")} />
        <span
          className={cn(
            "font-mono uppercase tracking-wider text-muted-foreground",
            variant === "card" ? "text-[11px]" : "text-xs"
          )}
        >
          Sapienza Labs
        </span>
      </div>
    </div>
  )
}
