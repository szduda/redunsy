import { boolean, integer, jsonb, pgTable, text, timestamp } from 'drizzle-orm/pg-core'

import type { RhythmPattern } from '@/features/rhythm/rhythm.types'

/**
 * Single source of truth for the rhythm catalogue (code-first schema).
 *
 * One row per rhythm. Instrument patterns are denormalised into the `patterns`
 * JSONB column (see {@link RhythmPattern}) so a whole rhythm — meta + notation —
 * can be read in a single round trip at build time.
 *
 * Only identity + structural columns are `NOT NULL` (id, slug, title, meter,
 * instruments, created_at); every descriptive field is nullable and coalesced to
 * sensible defaults in {@link import('./mappers')}.
 */
export const rhythms = pgTable('rhythms', {
  id: text('id').primaryKey(),
  slug: text('slug').notNull().unique(),
  title: text('title').notNull(),
  meter: integer('meter').notNull(),
  instruments: text('instruments').array().notNull().default([]),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  description: text('description'),
  author: text('author').array(),
  origin: text('origin').array(),
  tags: text('tags').array(),
  rhythmGroup: text('rhythm_group').array(),
  swingPattern: text('swing_pattern'),
  tempo: integer('tempo'),
  signalPattern: text('signal_pattern'),
  published: boolean('published'),
  patterns: jsonb('patterns').$type<RhythmPattern[]>(),
  updatedAt: timestamp('updated_at', { withTimezone: true }),
})

export type RhythmRow = typeof rhythms.$inferSelect
export type RhythmInsert = typeof rhythms.$inferInsert

export { agentSessions } from '@/features/agent-bot/agent-session.schema'
export type { AgentSession, AgentSessionInsert } from '@/features/agent-bot/agent-session.schema'
