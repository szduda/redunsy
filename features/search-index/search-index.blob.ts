import 'server-only'

import { get, put } from '@vercel/blob'

import {
  SEARCH_INDEX_BLOB_LATEST_PATH,
  SEARCH_INDEX_BLOB_META_PATH,
  SEARCH_INDEX_LATEST_CACHE_SECONDS,
  SEARCH_INDEX_VERSION_CACHE_SECONDS,
  searchIndexBlobVersionPath,
} from '@/features/search-index/search-index.config'
import { metaFromPayload } from '@/features/search-index/search-index.seed'
import type {
  SearchIndexMeta,
  SearchIndexPayload,
} from '@/features/search-index/search-index.types'

export const hasBlobToken = () => Boolean(process.env.BLOB_READ_WRITE_TOKEN?.trim())

const readJsonBlob = async <T>(pathname: string): Promise<T | null> => {
  if (!hasBlobToken()) return null

  try {
    const result = await get(pathname, { access: 'public', useCache: false })
    if (!result || result.statusCode === 304 || !result.stream) return null
    const text = await new Response(result.stream).text()
    return JSON.parse(text) as T
  } catch {
    return null
  }
}

export const readLatestSearchIndexFromBlob = async (): Promise<SearchIndexPayload | null> =>
  readJsonBlob<SearchIndexPayload>(SEARCH_INDEX_BLOB_LATEST_PATH)

export const readSearchIndexMetaFromBlob = async (): Promise<SearchIndexMeta | null> =>
  readJsonBlob<SearchIndexMeta>(SEARCH_INDEX_BLOB_META_PATH)

export const writeSearchIndexToBlob = async (payload: SearchIndexPayload): Promise<void> => {
  const body = JSON.stringify(payload)
  const meta = JSON.stringify(metaFromPayload(payload))

  await put(searchIndexBlobVersionPath(payload.version), body, {
    access: 'public',
    contentType: 'application/json',
    addRandomSuffix: false,
    cacheControlMaxAge: SEARCH_INDEX_VERSION_CACHE_SECONDS,
  })

  await put(SEARCH_INDEX_BLOB_LATEST_PATH, body, {
    access: 'public',
    contentType: 'application/json',
    addRandomSuffix: false,
    allowOverwrite: true,
    cacheControlMaxAge: SEARCH_INDEX_LATEST_CACHE_SECONDS,
  })

  await put(SEARCH_INDEX_BLOB_META_PATH, meta, {
    access: 'public',
    contentType: 'application/json',
    addRandomSuffix: false,
    allowOverwrite: true,
    cacheControlMaxAge: SEARCH_INDEX_LATEST_CACHE_SECONDS,
  })
}
