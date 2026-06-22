import { readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'

import { transformFirestoreExport, type FirestoreExport } from '@/db/transform'
import type { RhythmCard, RhythmInstrument, RhythmMeter } from '@/features/rhythm/rhythm.types'

/**
 * DB-free generator for the static search index. Produces the exact same file
 * as `generate-search-index` (which reads Postgres) straight from the export,
 * so the app can build before the database has been provisioned / seeded.
 */
const EXPORT_PATH = resolve(process.cwd(), 'data/firestore-joined-2026-06-19.json')
const OUTPUT_PATH = resolve(process.cwd(), 'features/garage/rhythm-index.generated.json')

const data = JSON.parse(readFileSync(EXPORT_PATH, 'utf8')) as FirestoreExport

const cards: RhythmCard[] = transformFirestoreExport(data)
  .filter((row) => row.published)
  .sort((left, right) => (right.updatedAt as Date).getTime() - (left.updatedAt as Date).getTime())
  .map((row) => ({
    slug: row.slug as string,
    title: row.title as string,
    description: row.description ?? '',
    meter: row.meter as RhythmMeter,
    instruments: (row.instruments ?? []) as RhythmInstrument[],
    longestTrack: row.longestTrack ?? 0,
    author: row.author ?? '',
    origin: row.origin ?? [],
    tags: row.tags ?? [],
    rhythmGroup: row.rhythmGroup ?? [],
    swingPattern: row.swingPattern ?? '',
    tempo: row.tempo as number,
    signalPattern: row.signalPattern ?? '',
    createdAt: (row.createdAt as Date).getTime(),
    updatedAt: (row.updatedAt as Date).getTime(),
    userOwned: false,
  }))

writeFileSync(OUTPUT_PATH, `${JSON.stringify(cards, null, 2)}\n`)
console.log(`Bootstrapped search index with ${cards.length} rhythms to ${OUTPUT_PATH}.`)
