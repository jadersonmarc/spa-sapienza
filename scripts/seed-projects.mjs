// Semeia a tabela `projects` com os projetos autorais / P&D da Sapienza.
// Idempotente por slug: atualiza o conteúdo se já existir, cria se não.
// Nada de cliente ou métrica inventados — são projetos autorais / P&D.
// Uso: node scripts/seed-projects.mjs   (ou: pnpm db:seed-projects)

import { readFileSync } from "node:fs"
import { fileURLToPath } from "node:url"
import { dirname, join } from "node:path"
import postgres from "postgres"

const root = join(dirname(fileURLToPath(import.meta.url)), "..")

// Carrega .env.local (DATABASE_URL).
for (const line of readFileSync(join(root, ".env.local"), "utf8").split("\n")) {
  const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/)
  if (m && !(m[1] in process.env)) process.env[m[1]] = m[2]
}
if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL não definida (.env.local).")
  process.exit(1)
}

// Projetos autorais / P&D — degraus: presenca | operacao | plataforma | fronteira.
const PROJECTS = [
  {
    slug: "nexusagro-rj",
    nome: "NexusAgro RJ",
    resumo: "Rastreabilidade alimentar soberana, do produtor à mesa.",
    problema:
      "Cadeias de alimento perdem a origem no caminho: quem produziu, quando e sob quais condições vira informação que ninguém consegue auditar. O NexusAgro registra cada etapa de forma verificável, dando soberania de dado a quem alimenta o país.",
    stack: ["Go", "Rust", "gRPC", "Ed25519", "Merkle Tree", "BadgerDB"],
    degrau: "fronteira",
    destaque: true,
    ordem: 1,
    arquitetura:
      "Registros assinados com Ed25519 e encadeados em uma Merkle Tree, persistidos em BadgerDB; serviços em Go e Rust comunicam por gRPC. A prova de integridade é local e não depende de terceiros.",
    decisoes:
      "Rust nos pontos de verificação criptográfica pela garantia de memória; Go no restante pela produtividade. Ed25519 + Merkle Tree para tornar adulteração detectável sem uma autoridade central.",
    resultado: "Projeto autoral / P&D — prova de conceito de rastreabilidade verificável.",
  },
  {
    slug: "lexwatch",
    nome: "LexWatch",
    resumo: "Monitor de plataformas judiciais que devolve horas ao escritório.",
    problema:
      "Escritórios acompanham processos à mão em PJe, e-SAJ e Projudi — cada um com sua interface e seus prazos. O LexWatch monitora as plataformas de forma automática e alerta o que muda, antes do prazo virar risco.",
    stack: ["Go", "chromedp", "Redis Streams", "PostgreSQL"],
    degrau: "operacao",
    destaque: false,
    ordem: 2,
    arquitetura:
      "Coletores em Go navegam as plataformas via chromedp; mudanças entram em Redis Streams e são processadas de forma idempotente; o histórico e os alertas ficam em PostgreSQL.",
    decisoes:
      "Redis Streams para desacoplar coleta de processamento e absorver picos; chromedp por lidar com plataformas sem API pública. Idempotência para não duplicar alerta.",
    resultado: "Projeto autoral / P&D — automação de acompanhamento processual.",
  },
  {
    slug: "margot",
    nome: "Margot",
    resumo: "Atendente de WhatsApp com motor próprio de RAG.",
    problema:
      "PMEs perdem lead no WhatsApp por não responder a tempo. A Margot atende com contexto do negócio (RAG), qualifica e organiza — sem terceirizar a conversa a uma caixa-preta.",
    stack: ["Go", "RAG", "WhatsApp Cloud API"],
    degrau: "plataforma",
    destaque: false,
    ordem: 3,
    arquitetura:
      "Motor de RAG próprio em Go recupera trechos da base do cliente e monta a resposta; a ponte com o WhatsApp usa a Cloud API. O estado da conversa e o funil ficam sob controle do cliente.",
    decisoes:
      "Motor próprio (em vez de framework de terceiro) para manter dado do cliente na infraestrutura dele e ter controle fino sobre recuperação e resposta.",
    resultado: "Projeto autoral / produto em operação na própria Sapienza.",
  },
  {
    slug: "sapienza-oncocare",
    nome: "Sapienza OncoCare",
    resumo: "Triagem oncológica para o SUS com inferência no próprio aparelho.",
    problema:
      "Triagem oncológica na ponta esbarra em conectividade e privacidade. O OncoCare roda a inferência on-device, funcionando sem rede e sem enviar dado sensível para fora.",
    stack: ["Go", "Rust", "Flutter", "ONNX", "XGBoost"],
    degrau: "fronteira",
    destaque: true,
    ordem: 4,
    arquitetura:
      "Modelo XGBoost exportado para ONNX roda on-device via runtime em Rust; app em Flutter para a ponta; serviços de apoio em Go. A decisão acontece no aparelho, sem depender de nuvem.",
    decisoes:
      "Inferência on-device (ONNX + Rust) por privacidade e resiliência a falha de rede; XGBoost por desempenho em dado tabular clínico com amostra limitada.",
    resultado: "Projeto autoral / P&D — foco em saúde pública (SUS).",
  },
]

const sql = postgres(process.env.DATABASE_URL, { prepare: false })

try {
  const [author] = await sql`select id from users where role='admin' order by created_at limit 1`
  const authorId = author?.id ?? null // author_id é nullable

  let created = 0
  let updated = 0

  for (const p of PROJECTS) {
    const [exists] = await sql`select id from projects where slug=${p.slug} limit 1`
    if (exists) {
      await sql`
        update projects set
          nome=${p.nome}, resumo=${p.resumo}, problema=${p.problema},
          stack=${sql.json(p.stack)}, degrau=${p.degrau}, destaque=${p.destaque},
          ordem=${p.ordem}, publicado=true, arquitetura=${p.arquitetura},
          decisoes=${p.decisoes}, resultado=${p.resultado}, updated_at=now()
        where id=${exists.id}`
      updated++
      console.log(`= atualizado: ${p.slug}`)
    } else {
      await sql`
        insert into projects
          (slug, nome, resumo, problema, stack, degrau, destaque, ordem, publicado,
           arquitetura, decisoes, resultado, author_id)
        values
          (${p.slug}, ${p.nome}, ${p.resumo}, ${p.problema}, ${sql.json(p.stack)},
           ${p.degrau}, ${p.destaque}, ${p.ordem}, true,
           ${p.arquitetura}, ${p.decisoes}, ${p.resultado}, ${authorId})`
      created++
      console.log(`+ criado: ${p.slug} (${p.degrau})`)
    }
  }

  console.log(`\nResumo: ${created} criados, ${updated} atualizados, ${PROJECTS.length} no total.`)
} catch (err) {
  console.error("Falha no seed de projetos:", err.message)
  process.exitCode = 1
} finally {
  await sql.end()
}
