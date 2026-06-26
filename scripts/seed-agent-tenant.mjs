// Cadastra/atualiza um tenant do motor no console e (opcional) marca um usuário
// como superadmin. O token do motor é guardado criptografado (AES-256-GCM),
// mesmo formato do lib/agent/crypto.ts.
//
// Uso:
//   node scripts/seed-agent-tenant.mjs \
//     --name "Sapienza Labs" \
//     --url "https://motor.exemplo.com" \
//     --motor-id "11111111-1111-1111-1111-111111111111" \
//     --token "<token gerado no motor>" \
//     [--superadmin-email a@b.com]
//
// Requer DATABASE_URL e AGENT_TOKEN_ENC_KEY (.env.local ou ambiente).

import { readFileSync } from "node:fs"
import { fileURLToPath } from "node:url"
import { dirname, join } from "node:path"
import crypto from "node:crypto"
import postgres from "postgres"

const __dirname = dirname(fileURLToPath(import.meta.url))

function loadEnvLocal() {
  try {
    const file = readFileSync(join(__dirname, "..", ".env.local"), "utf8")
    for (const line of file.split("\n")) {
      const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/)
      if (m && !(m[1] in process.env)) process.env[m[1]] = m[2]
    }
  } catch {
    /* sem .env.local */
  }
}

function arg(name) {
  const i = process.argv.indexOf(`--${name}`)
  return i >= 0 ? process.argv[i + 1] : undefined
}

function encryptToken(plain, keyB64) {
  const key = Buffer.from(keyB64, "base64")
  if (key.length !== 32) throw new Error("AGENT_TOKEN_ENC_KEY deve ter 32 bytes (base64)")
  const iv = crypto.randomBytes(12)
  const cipher = crypto.createCipheriv("aes-256-gcm", key, iv)
  const ct = Buffer.concat([cipher.update(plain, "utf8"), cipher.final()])
  const tag = cipher.getAuthTag()
  return [iv, tag, ct].map((b) => b.toString("base64")).join(":")
}

loadEnvLocal()

const name = arg("name")
const url = arg("url")
const motorId = arg("motor-id")
const token = arg("token")
const superadminEmail = arg("superadmin-email")

if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL não definida (.env.local ou ambiente).")
  process.exit(1)
}
if (!process.env.AGENT_TOKEN_ENC_KEY) {
  console.error("AGENT_TOKEN_ENC_KEY não definida (gere com: openssl rand -base64 32).")
  process.exit(1)
}
if (!name || !url || !motorId || !token) {
  console.error("Informe --name, --url, --motor-id e --token.")
  process.exit(1)
}

const sql = postgres(process.env.DATABASE_URL, { prepare: false })

try {
  const enc = encryptToken(token, process.env.AGENT_TOKEN_ENC_KEY)
  const existing = await sql`select id from agent_tenants where motor_tenant_id = ${motorId} limit 1`
  let id
  if (existing.length) {
    ;[{ id }] = await sql`
      update agent_tenants
         set name = ${name}, agent_api_url = ${url}, agent_token_enc = ${enc}, updated_at = now()
       where id = ${existing[0].id}
       returning id`
    console.log(`✓ tenant atualizado: ${name} — id ${id}`)
  } else {
    ;[{ id }] = await sql`
      insert into agent_tenants (name, agent_api_url, agent_token_enc, motor_tenant_id)
      values (${name}, ${url}, ${enc}, ${motorId})
      returning id`
    console.log(`✓ tenant criado: ${name} — id ${id}`)
  }

  if (superadminEmail) {
    const rows = await sql`
      update users set is_superadmin = true, updated_at = now()
      where email = ${superadminEmail.toLowerCase().trim()}
      returning email`
    if (rows.length) console.log(`✓ superadmin: ${rows[0].email}`)
    else console.warn(`! usuário ${superadminEmail} não encontrado (crie com db:seed)`)
  }
} catch (err) {
  console.error("Falha no seed:", err.message)
  process.exitCode = 1
} finally {
  await sql.end()
}
