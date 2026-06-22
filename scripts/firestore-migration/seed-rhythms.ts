import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

import { config } from 'dotenv'

import type { FirestoreExport } from './transform'

config({ path: '.env.local' })
config({ path: '.env' })

const EXPORT_PATH = resolve(
  process.cwd(),
  'scripts/firestore-migration/firestore-joined-2026-06-19.json',
)

const main = async () => {
  // Imported lazily so dotenv runs before the client reads the connection string.
  const { db } = await import('@/db/client')
  const { rhythms } = await import('@/db/schema')
  const { transformFirestoreExport } = await import('./transform')

  const data = JSON.parse(readFileSync(EXPORT_PATH, 'utf8')) as FirestoreExport
  const rows = transformFirestoreExport(data)

  // Small, fully-derived catalogue: replace wholesale so re-seeding is idempotent.
  await db.transaction(async (tx) => {
    await tx.delete(rhythms)
    await tx.insert(rhythms).values(rows)
  })

  const published = rows.filter((row) => row.published).length
  console.log(`Seeded ${rows.length} rhythms (${published} published).`)
  process.exit(0)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
