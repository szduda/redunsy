import type { RhythmCard } from '@/features/rhythm/rhythm.types'

export type SearchIndexPayload = {
  version: string
  generatedAt: number
  count: number
  cards: RhythmCard[]
}

export type SearchIndexMeta = {
  version: string
  generatedAt: number
  count: number
}

/** Result of an admin-triggered index rebuild (replaces deploy-hook status). */
export type IndexRefreshStatus = 'rebuilt' | 'not-configured' | 'failed'

export type RebuildSearchIndexResult = SearchIndexMeta & {
  status: IndexRefreshStatus
}
