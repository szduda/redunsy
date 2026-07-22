import 'server-only'

import { getRhythmCardIndex } from '@/db/queries'
import {
  hasBlobToken,
  readLatestSearchIndexFromBlob,
  writeSearchIndexToBlob,
} from '@/features/search-index/search-index.blob'
import {
  loadSeedPayload,
  metaFromPayload,
  toSearchIndexPayload,
} from '@/features/search-index/search-index.seed'
import type {
  RebuildSearchIndexResult,
  SearchIndexPayload,
} from '@/features/search-index/search-index.types'

export const readSearchIndexPayload = async (): Promise<SearchIndexPayload> => {
  const fromBlob = await readLatestSearchIndexFromBlob()
  if (fromBlob?.cards) return fromBlob
  return loadSeedPayload()
}

export const rebuildSearchIndex = async (): Promise<RebuildSearchIndexResult> => {
  const cards = await getRhythmCardIndex()
  const payload = toSearchIndexPayload(cards, crypto.randomUUID())

  if (!hasBlobToken()) {
    return { ...metaFromPayload(payload), status: 'not-configured' }
  }

  try {
    await writeSearchIndexToBlob(payload)
    return { ...metaFromPayload(payload), status: 'rebuilt' }
  } catch {
    return { ...metaFromPayload(payload), status: 'failed' }
  }
}
