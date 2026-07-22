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

export const searchIndexUnavailableError = (message: string) => {
  const error = new Error(message)
  error.name = 'SearchIndexUnavailableError'
  return error
}

export const isSearchIndexUnavailableError = (error: unknown) =>
  error instanceof Error && error.name === 'SearchIndexUnavailableError'

/**
 * Read the live index from Blob. Seed is only used when Blob is not configured
 * or has never been written — transient Blob errors throw instead of poisoning
 * clients with a stale seed.
 */
export const readSearchIndexPayload = async (): Promise<SearchIndexPayload> => {
  const fromBlob = await readLatestSearchIndexFromBlob()
  if (fromBlob.status === 'ok') return fromBlob.payload
  if (fromBlob.status === 'missing-token' || fromBlob.status === 'not-found') {
    return loadSeedPayload()
  }
  throw searchIndexUnavailableError(fromBlob.message)
}

export const rebuildSearchIndex = async (): Promise<RebuildSearchIndexResult> => {
  const cards = await getRhythmCardIndex()
  const payload = toSearchIndexPayload(cards, crypto.randomUUID())
  const meta = metaFromPayload(payload)

  if (!hasBlobToken()) {
    return { ...meta, status: 'not-configured', cards: payload.cards }
  }

  try {
    await writeSearchIndexToBlob(payload)
    return { ...meta, status: 'rebuilt', cards: payload.cards }
  } catch {
    return { ...meta, status: 'failed', cards: null }
  }
}
