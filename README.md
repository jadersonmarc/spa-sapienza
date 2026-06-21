# Sapienza Labs

Site institucional da Sapienza Labs — estúdio de software sob medida para PMEs da
Baixada Fluminense. Apresenta a empresa, serviços e produtos, e funciona como
canal de comunicação direta com clientes (conversão via WhatsApp).

## Stack

- Next.js 16 (App Router)
- React 19
- Tailwind CSS 4 (tokens em oklch, dark mode permanente)
- TypeScript
- shadcn/ui (estilo New York) + Radix UI + lucide-react
- Gerenciador de pacotes: **pnpm**

## Como rodar

```bash
pnpm install
pnpm dev
```

A aplicação ficará disponível em `http://localhost:3000`.

## Scripts

- `pnpm dev`: inicia o ambiente de desenvolvimento
- `pnpm build`: gera a build de produção
- `pnpm start`: sobe a build gerada
- `pnpm lint`: executa a análise estática

## Estrutura principal

- `app/`: rotas (`/`, `/sobre`, `/blog`, `/blog/[slug]`, `/contato`) e estilos globais
- `components/`: blocos visuais e componentes reutilizáveis (+ `components/ui/` do shadcn)
- `app/blog/posts/`: posts em `.mdx` (`YYYY-MM-DD-slug.mdx`)
- `lib/`: utilitários (ex.: `lib/blog.ts` lê os `.mdx` no build)
- `public/`: assets estáticos

## Blog e automação editorial

O conteúdo vive no Postgres e é gerido pelo admin (`/admin`). A automação roda
via **GitHub Actions**: `generate-draft.yml` (cron seg/qua/sex) cria rascunhos
via Claude e `publish-scheduled.yml` publica conteúdo agendado — ambos chamam os
endpoints do admin com `x-webhook-secret`. A **postagem social** (Instagram via
Facebook Graph; LinkedIn) é feita **por botão** no admin, após revisar e aprovar
o post. (O blog também mantém os `.mdx` originais em `app/blog/posts/` como
origem do import — não são mais lidos pelo site.)

## Deploy

VPS Hostinger via **Coolify** (não é Vercel). Por isso `images.unoptimized`
está ligado no `next.config.mjs`.

## Roadmap

- [`docs/PLANO-DE-ACAO.md`](docs/PLANO-DE-ACAO.md): plano vigente (SPEC-13+).
- [`docs/REFATORACAO.md`](docs/REFATORACAO.md): primeira rodada (SPEC-01 a SPEC-12), concluída.
- `docs/analises/`: relatórios das auditorias de UX, branding e design.
