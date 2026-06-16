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

Os posts ficam em `app/blog/posts/*.mdx` (frontmatter YAML + corpo Markdown).
Há um pipeline editorial que, ao entrar um post novo na `main`, dispara uma
GitHub Action que aciona um webhook do n8n e publica nas redes (Instagram e
LinkedIn). Detalhes, pré-requisitos e troubleshooting em
[`docs/AUTOMACAO_EDITORIAL.md`](docs/AUTOMACAO_EDITORIAL.md).

## Deploy

VPS Hostinger via **Coolify** (não é Vercel). Por isso `images.unoptimized`
está ligado no `next.config.mjs`.

## Roadmap

- [`docs/PLANO-DE-ACAO.md`](docs/PLANO-DE-ACAO.md): plano vigente (SPEC-13+).
- [`docs/REFATORACAO.md`](docs/REFATORACAO.md): primeira rodada (SPEC-01 a SPEC-12), concluída.
- `docs/analises/`: relatórios das auditorias de UX, branding e design.
