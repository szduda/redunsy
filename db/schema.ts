import { boolean, integer, jsonb, pgTable, text, timestamp } from 'drizzle-orm/pg-core'

import type { RhythmPattern } from '@/features/rhythm/rhythm.types'

/**
 * Single source of truth for the rhythm catalogue (code-first schema).
 *
 * One row per rhythm. Instrument patterns are denormalised into the `patterns`
 * JSONB column (see {@link RhythmPattern}) so a whole rhythm — meta + notation —
 * can be read in a single round trip at build time.
 */
export const rhythms = pgTable('rhythms', {
  id: text('id').primaryKey(),
  slug: text('slug').notNull().unique(),
  title: text('title').notNull(),
  description: text('description').notNull().default(''),
  meter: integer('meter').notNull(),
  author: text('author').notNull().default(''),
  origin: text('origin').array().notNull().default([]),
  tags: text('tags').array().notNull().default([]),
  rhythmGroup: text('rhythm_group').array().notNull().default([]),
  instruments: text('instruments').array().notNull().default([]),
  longestTrack: integer('longest_track').notNull().default(0),
  swing: text('swing').notNull().default(''),
  swingPattern: text('swing_pattern').notNull().default(''),
  tempo: integer('tempo').notNull(),
  signalPattern: text('signal_pattern').notNull().default(''),
  published: boolean('published').notNull().default(false),
  patterns: jsonb('patterns').$type<RhythmPattern[]>().notNull().default([]),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
})

export type RhythmRow = typeof rhythms.$inferSelect
export type RhythmInsert = typeof rhythms.$inferInsert
