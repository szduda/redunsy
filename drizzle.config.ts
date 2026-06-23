import { config } from 'dotenv'
import { defineConfig } from 'drizzle-kit'

config({ path: '.env.local' })
config({ path: '.env' })

const rawUrl =
  process.env.POSTGRES_URL_NON_POOLING ??
  process.env.POSTGRES_URL ??
  process.env.DATABASE_URL ??
  ''

// pg-connection-string maps sslmode=require to rejectUnauthorized: true (verify-full alias).
// Strip it so drizzle-kit can connect to Supabase without cert rejection.
const url = (() => {
  try {
    const parsed = new URL(rawUrl)
    parsed.searchParams.delete('sslmode')
    return parsed.toString()
  } catch {
    return rawUrl
  }
})()

export default defineConfig({
  schema: './db/schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: { url, ssl: { rejectUnauthorized: false } },
})
