import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

import { config } from 'dotenv'
import { inArray } from 'drizzle-orm'

import type { RhythmInsert } from '@/db/schema'

config({ path: '.env.local' })
config({ path: '.env' })

const SEED_PATH = resolve(process.cwd(), 'scripts/telegram-export-migration/telegram-rhythms.json')

const main = async () => {
  const { db } = await import('@/db/client')
  const { rhythms } = await import('@/db/schema')

  const rows = JSON.parse(readFileSync(SEED_PATH, 'utf8')) as RhythmInsert[]
  const existing = await db.select({ slug: rhythms.slug, id: rhythms.id }).from(rhythms)
  const existingSlugs = new Set(existing.map((row) => row.slug))
  const existingIds = new Set(existing.map((row) => row.id))

  const toInsert = rows.filter((row) => !existingSlugs.has(row.slug) && !existingIds.has(row.id))

  if (toInsert.length > 0) {
    await db.insert(rhythms).values(
      toInsert.map((row) => ({
        ...row,
        published: true,
        createdAt: row.createdAt ? new Date(row.createdAt) : undefined,
        updatedAt: row.updatedAt ? new Date(row.updatedAt) : undefined,
      })),
    )
    console.log(`Inserted ${toInsert.length} new rhythms.`)
    toInsert.forEach((row) => console.log(`  + ${row.title} (${row.slug})`))
  }

  const seedIds = rows.map((row) => row.id).filter(Boolean) as string[]
  const published = await db
    .update(rhythms)
    .set({ published: true })
    .where(inArray(rhythms.id, seedIds))
    .returning({ slug: rhythms.slug, title: rhythms.title })

  console.log(`Published ${published.length} telegram rhythms.`)
  published.forEach((row) => console.log(`  ✓ ${row.title} (${row.slug})`))
  process.exit(0)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
