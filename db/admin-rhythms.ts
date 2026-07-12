import 'server-only'

import { eq } from 'drizzle-orm'

import { rhythmToPublishedRow } from '@/features/admin/rhythm-to-row'
import type { Rhythm } from '@/features/rhythm/rhythm.types'

import { db } from '@/db/client'
import { rhythms } from '@/db/schema'

export const upsertPublishedRhythm = async (slug: string, rhythm: Rhythm) => {
  const row = rhythmToPublishedRow(slug, rhythm)
  const [existing] = await db.select().from(rhythms).where(eq(rhythms.slug, slug)).limit(1)

  if (existing) {
    await db
      .update(rhythms)
      .set({
        title: row.title,
        meter: row.meter,
        instruments: row.instruments,
        description: row.description,
        author: row.author,
        origin: row.origin,
        tags: row.tags,
        rhythmGroup: row.rhythmGroup,
        swingPattern: row.swingPattern,
        tempo: row.tempo,
        signalPattern: row.signalPattern,
        patterns: row.patterns,
        published: true,
        updatedAt: row.updatedAt,
      })
      .where(eq(rhythms.slug, slug))
    return { created: false, slug }
  }

  await db.insert(rhythms).values({
    id: slug,
    slug: row.slug,
    title: row.title,
    meter: row.meter,
    instruments: row.instruments,
    description: row.description,
    author: row.author,
    origin: row.origin,
    tags: row.tags,
    rhythmGroup: row.rhythmGroup,
    swingPattern: row.swingPattern,
    tempo: row.tempo,
    signalPattern: row.signalPattern,
    patterns: row.patterns,
    published: true,
    createdAt: new Date(rhythm.createdAt),
    updatedAt: row.updatedAt,
  })

  return { created: true, slug }
}
