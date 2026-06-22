import { asc, desc, eq } from 'drizzle-orm'

import { db } from '@/db/client'
import { rowToCard, rowToDetail, type RhythmDetail } from '@/db/mappers'
import { rhythms } from '@/db/schema'
import type { RhythmCard } from '@/features/rhythm/rhythm.types'

/**
 * Build-time data access. These run inside `next build` (Server Components,
 * `generateStaticParams`) and the catalogue scripts — never in the browser.
 */

/** All published rhythms as card meta, newest first (the search index). */
export const getRhythmCardIndex = async (): Promise<RhythmCard[]> => {
  const rows = await db
    .select()
    .from(rhythms)
    .where(eq(rhythms.published, true))
    .orderBy(desc(rhythms.updatedAt))
  return rows.map(rowToCard)
}

/** Slugs of every published rhythm, for `generateStaticParams`. */
export const getPublishedSlugs = async (): Promise<string[]> => {
  const rows = await db
    .select({ slug: rhythms.slug })
    .from(rhythms)
    .where(eq(rhythms.published, true))
    .orderBy(asc(rhythms.slug))
  return rows.map((row) => row.slug)
}

/** A single rhythm with its full notation, or `null` if unknown / unpublished. */
export const getRhythmDetail = async (slug: string): Promise<RhythmDetail | null> => {
  const [row] = await db.select().from(rhythms).where(eq(rhythms.slug, slug)).limit(1)
  if (!row || !row.published) return null
  return rowToDetail(row)
}
