import 'server-only'

import { get, put } from '@vercel/blob'

import {
  SEARCH_INDEX_BLOB_LATEST_PATH,
  SEARCH_INDEX_LATEST_CACHE_SECONDS,
} from '@/features/search-index/search-index.config'
import type { BlobReadResult, SearchIndexPayload } from '@/features/search-index/search-index.types'

export const hasBlobToken = () => Boolean(process.env.BLOB_READ_WRITE_TOKEN?.trim())

export const readLatestSearchIndexFromBlob = async (): Promise<BlobReadResult> => {
  if (!hasBlobToken()) return { status: 'missing-token' }

  try {
    const result = await get(SEARCH_INDEX_BLOB_LATEST_PATH, {
      access: 'public',
      useCache: false,
    })
    if (!result || result.statusCode === 304 || !result.stream) {
      return { status: 'not-found' }
    }
    const text = await new Response(result.stream).text()
    const payload = JSON.parse(text) as SearchIndexPayload
    if (!payload?.cards || !payload.version) return { status: 'not-found' }
    return { status: 'ok', payload }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Blob read failed'
    return { status: 'error', message }
  }
}

export const writeSearchIndexToBlob = async (payload: SearchIndexPayload): Promise<void> => {
  // Only overwrite `latest.json` — no versioned copies (cheap + soft-unpublish safe).
  // Skip write if Blob already has a newer generatedAt (last-write-wins guard).
  const existing = await readLatestSearchIndexFromBlob()
  if (existing.status === 'ok' && existing.payload.generatedAt > payload.generatedAt) {
    return
  }

  await put(SEARCH_INDEX_BLOB_LATEST_PATH, JSON.stringify(payload), {
    access: 'public',
    contentType: 'application/json',
    addRandomSuffix: false,
    allowOverwrite: true,
    cacheControlMaxAge: SEARCH_INDEX_LATEST_CACHE_SECONDS,
  })
}
