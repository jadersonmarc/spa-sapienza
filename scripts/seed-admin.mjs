// Cria/atualiza um usuário do admin (Auth.js Credentials).
// Uso:
//   node scripts/seed-admin.mjs --email a@b.com --password 'senha' [--role admin|editor]
// As credenciais também podem vir de SEED_EMAIL / SEED_PASSWORD / SEED_ROLE.

import { readFileSync } from "node:fs"
import { fileURLToPath } from "node:url"
import { dirname, join } from "node:path"
import postgres from "postgres"
import bcrypt from "bcryptjs"

const __dirname = dirname(fileURLToPath(import.meta.url))

// Carrega .env.local (Node não faz isso sozinho em script avulso).
function loadEnvLocal() {
  try {
    const file = readFileSync(join(__dirname, "..", ".env.local"), "utf8")
    for (const line of file.split("\n")) {
      const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/)
      if (m && !(m[1] in process.env)) process.env[m[1]] = m[2]
    }
  } catch {
    /* sem .env.local — usa process.env */
  }
}

function arg(name) {
  const i = process.argv.indexOf(`--${name}`)
  return i >= 0 ? process.argv[i + 1] : undefined
}

loadEnvLocal()

const email = (arg("email") ?? process.env.SEED_EMAIL ?? "").toLowerCase().trim()
const password = arg("password") ?? process.env.SEED_PASSWORD ?? ""
const role = arg("role") ?? process.env.SEED_ROLE ?? "admin"

if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL não definida (.env.local ou ambiente).")
  process.exit(1)
}
if (!email || !password) {
  console.error("Informe --email e --password (ou SEED_EMAIL/SEED_PASSWORD).")
  process.exit(1)
}
if (role !== "admin" && role !== "editor") {
  console.error("--role deve ser 'admin' ou 'editor'.")
  process.exit(1)
}

const sql = postgres(process.env.DATABASE_URL, { prepare: false })

try {
  const passwordHash = await bcrypt.hash(password, 12)
  const [user] = await sql`
    insert into users (email, password_hash, role)
    values (${email}, ${passwordHash}, ${role})
    on conflict (email) do update
      set password_hash = excluded.password_hash,
          role = excluded.role,
          updated_at = now()
    returning id, email, role
  `
  console.log(`✓ usuário ${user.email} (${user.role}) — id ${user.id}`)
} catch (err) {
  console.error("Falha no seed:", err.message)
  process.exitCode = 1
} finally {
  await sql.end()
}
