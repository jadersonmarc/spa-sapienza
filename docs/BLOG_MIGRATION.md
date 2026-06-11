# Migração do Blog para MDX — Planejamento

> **Status**: ✅ CONCLUÍDA (antecipada). A migração foi executada como base da
> automação editorial (ver `docs/AUTOMACAO_EDITORIAL.md`), antes do gatilho
> original. Diferenças em relação a este planejamento: os posts vivem em
> `app/blog/posts/*.mdx` (não em `/content/blog/<pilar>/`); o pilar é um campo
> do frontmatter (`pme`/`engenharia`/`bastidores`), não derivado do diretório;
> e o corpo é renderizado pelo parser regex existente (restrição: única dep
> nova é `gray-matter`). A camada de acesso é `lib/blog.ts`.
> O texto abaixo é mantido como registro do diagnóstico original.

## Problema atual

Os posts vivem em `lib/posts.ts` como um array de objetos com o conteúdo em
strings de template (markdown). Isso funciona para o MVP, mas tem limites
claros:

- A cada post novo o arquivo cresce e o build time aumenta — todo o conteúdo
  é parseado a cada build, mesmo o que não mudou.
- O parsing de markdown é feito via regex manual em
  `app/blog/[slug]/page.tsx` (`parseMarkdownContent`). Não suporta tabelas,
  blocos de código com syntax highlight nem imagens inline.
- Editar conteúdo exige mexer em código TypeScript — fácil quebrar o build
  com um acento grave ou interpolação acidental dentro da template string.
- Sem frontmatter, a separação entre metadados e conteúdo é frágil.

## Arquitetura target

Posts como arquivos `.mdx` organizados por pilar de conteúdo:

```
/content/
  blog/
    negocio-pme/
      software-personalizado-vs-sistema-pronto.mdx
      automacao-de-processos-pequenas-empresas.mdx
      o-que-e-uma-api-integracao-de-sistemas.mdx
      sapienza-university-famosa-inovacao-tecnologia.mdx
      cursos-sapienza-university-qualidade-produtos-digitais.mdx
    engenharia-ia/
      spec-driven-development-na-pratica.mdx
    bastidores/
      por-que-escolhi-pme-da-baixada.mdx
```

### Frontmatter

O frontmatter YAML substitui os campos da interface `Post` de `lib/posts.ts`:

```yaml
---
title: "Software Personalizado vs. Sistema Pronto"
excerpt: "Entenda quando um sistema pronto atende suas necessidades..."
date: 2025-05-10
readingTime: "5 min"
pilar: negocio-pme        # redundante com o diretório; o diretório é a fonte
coverImage: /blog/capa-exemplo.png   # opcional
author:
  name: Marc Jaderson
  role: Fundador, Sapienza Labs
  avatarUrl: /marc.png
keywords:
  - software personalizado
  - sistema sob medida
---
```

### Stack de migração

- **Parsing**: `next-mdx-remote` (mais leve) ou `contentlayer` (typesafe,
  gera tipos a partir do schema). Decidir na hora — verificar manutenção
  ativa de ambos antes de escolher.
- **`remark-gfm`** — tabelas e extensões GitHub Flavored Markdown.
- **`rehype-highlight`** — syntax highlight em blocos de código.
- Frontmatter lido com `gray-matter` (caso `next-mdx-remote`).

## Restrições de migração

- **Preservar URLs existentes** (`/blog/[slug]`) — os slugs têm valor de SEO
  acumulado. O `generateStaticParams` passa a varrer
  `/content/blog/**/*.mdx` e extrair o slug do nome do arquivo.
- O pilar passa a ser derivado do diretório pai do arquivo (fonte única),
  mantendo o tipo `Pilar` existente.
- `lib/posts.ts` vira camada de acesso (`getAllPosts`, `getPostBySlug`)
  lendo do filesystem — a API pública usada por `app/blog/page.tsx`,
  `app/blog/[slug]/page.tsx`, `components/article-card.tsx` e
  `components/blog-filter.tsx` não muda de assinatura.
- Remover `parseMarkdownContent` (regex) de `app/blog/[slug]/page.tsx`
  quando o renderer MDX assumir.

## Passos (quando o gatilho for atingido)

1. Instalar stack escolhida e criar `/content/blog/` com 1 post migrado
   como prova de conceito.
2. Reescrever `lib/posts.ts` para ler do filesystem mantendo a mesma API.
3. Migrar os posts restantes (conversão mecânica: campos → frontmatter,
   template string → corpo do arquivo).
4. Trocar o render no template de post e remover o parser regex.
5. Verificar: `pnpm build` limpo, os 5 slugs originais respondendo,
   filtro por pilar funcionando.
