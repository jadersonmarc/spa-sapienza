import { Check, MessageCircle } from "lucide-react"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tag } from "@/components/tag"
import { Eyebrow } from "@/components/eyebrow"
import { Button } from "@/components/ui/button"
import { DEFAULT_HOME, type PlansBlock } from "@/lib/content/home-blocks"
import { whatsappUrl } from "@/lib/contact"

export function Plans({ block = DEFAULT_HOME.portfolio }: { block?: PlansBlock }) {
  return (
    <section className="py-16 px-4 sm:py-24 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-10 sm:mb-16">
          {block.eyebrow && <Eyebrow className="mb-4">{block.eyebrow}</Eyebrow>}
          <h2 className="text-2xl font-semibold text-foreground mb-3 text-balance font-display sm:text-3xl sm:mb-4 md:text-4xl">
            {block.title}
          </h2>
          <p className="text-muted-foreground text-base max-w-2xl mx-auto sm:text-lg">
            {block.subtitle}
          </p>
        </div>

        <div className="grid gap-4 sm:gap-6 md:grid-cols-3">
          {block.items.map((plan) => (
            <Card
              key={plan.name}
              className={`glass flex flex-col border-border/50 transition-colors duration-300 hover:border-primary/30 ${
                plan.addon ? "border-l-2 border-l-primary md:col-span-3" : ""
              }`}
            >
              <CardHeader>
                {plan.addon && (
                  <Tag tone="primary" className="mb-1">
                    Add-on
                  </Tag>
                )}
                <CardTitle className="text-xl font-semibold text-card-foreground font-display text-balance">
                  {plan.name}
                </CardTitle>
                <p className="text-muted-foreground text-base leading-relaxed">{plan.audience}</p>
              </CardHeader>
              <CardContent className="flex-1">
                <ul className="flex flex-col gap-2">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2 text-sm text-foreground/90">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Button
                  variant={plan.addon ? "outline" : "default"}
                  className={plan.addon ? "w-full sm:w-auto" : "w-full"}
                  asChild
                >
                  <a
                    href={whatsappUrl(
                      `Olá! Tenho interesse no plano "${plan.name}" da Sapienza Labs e gostaria de solicitar uma proposta.`,
                    )}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <MessageCircle className="mr-2 h-4 w-4" />
                    {plan.ctaLabel}
                  </a>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
