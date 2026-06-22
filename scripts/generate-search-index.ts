import { writeFileSync } from 'node:fs'
import { resolve } from 'node:path'

import { config } from 'dotenv'

config({ path: '.env.local' })
config({ path: '.env' })

const OUTPUT_PATH = resolve(process.cwd(), 'features/garage/rhythm-index.generated.json')

const hasConnection = Boolean(
  process.env.POSTGRES_URL ?? process.env.POSTGRES_URL_NON_POOLING ?? process.env.DATABASE_URL,
)

const main = async () => {
  if (!hasConnection) {
    console.warn(
      'No Postgres connection string found — keeping the committed search index. ' +
        'Run `npm run db:seed` after `vercel env pull` to refresh from the database.',
    )
    process.exit(0)
  }

  // Imported lazily so dotenv runs before the client reads the connection string.
  const { getRhythmCardIndex } = await import('@/db/queries')

  const cards = await getRhythmCardIndex()
  writeFileSync(OUTPUT_PATH, `${JSON.stringify(cards, null, 2)}\n`)

  console.log(`Wrote search index with ${cards.length} rhythms to ${OUTPUT_PATH}.`)
  process.exit(0)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
