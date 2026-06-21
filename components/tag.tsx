import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const tagVariants = cva(
  "inline-flex w-fit shrink-0 items-center justify-center whitespace-nowrap border font-medium transition-colors",
  {
    variants: {
      tone: {
        neutral: "border-border/50 bg-transparent text-muted-foreground",
        muted: "border-border/50 bg-secondary/40 text-muted-foreground",
        primary: "border-primary/30 bg-primary/10 text-primary",
        accent: "border-accent/30 bg-accent/10 text-accent",
        blue: "border-blue-500/20 bg-blue-500/15 text-blue-400",
        green: "border-green-500/20 bg-green-500/15 text-green-400",
        orange: "border-orange-500/20 bg-orange-500/15 text-orange-400",
        yellow: "border-yellow-500/20 bg-yellow-500/15 text-yellow-400",
        purple: "border-purple-500/20 bg-purple-500/15 text-purple-400",
      },
      size: {
        xs: "px-2.5 py-0.5 text-[11px]",
        sm: "px-3 py-1 text-xs",
        md: "px-4 py-1.5 text-xs",
      },
      shape: {
        pill: "rounded-full",
        rounded: "rounded-md",
      },
      textCase: {
        upper: "uppercase tracking-wider",
        normal: "tracking-normal",
      },
      mono: {
        true: "font-mono",
        false: "",
      },
      interactive: {
        true: "hover:bg-foreground/[0.06] hover:text-foreground",
        false: "",
      },
    },
    defaultVariants: {
      tone: "neutral",
      size: "xs",
      shape: "pill",
      textCase: "upper",
      mono: false,
      interactive: false,
    },
  }
)

type TagTone = NonNullable<VariantProps<typeof tagVariants>["tone"]>

function Tag({
  className,
  tone,
  size,
  shape,
  textCase,
  mono,
  interactive,
  ...props
}: React.ComponentProps<"span"> & VariantProps<typeof tagVariants>) {
  return (
    <span
      data-slot="tag"
      className={cn(tagVariants({ tone, size, shape, textCase, mono, interactive }), className)}
      {...props}
    />
  )
}

export { Tag, tagVariants, type TagTone }
