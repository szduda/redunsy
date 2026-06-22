import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'

import * as schema from '@/db/schema'

/**
 * Postgres connection string provisioned by the Vercel Supabase integration.
 * Falls back to `DATABASE_URL` for local / CI overrides.
 */
const connectionString =
  process.env.POSTGRES_URL ?? process.env.POSTGRES_URL_NON_POOLING ?? process.env.DATABASE_URL

if (!connectionString) {
  throw new Error(
    'Missing Postgres connection string. Set POSTGRES_URL (Vercel Supabase) or DATABASE_URL.',
  )
}

// `prepare: false` is required for Supabase's transaction pooler (PgBouncer).
const queryClient = postgres(connectionString, { prepare: false })

export const db = drizzle(queryClient, { schema })
