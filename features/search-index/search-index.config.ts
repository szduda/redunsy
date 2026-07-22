import type { IFuseOptions } from 'fuse.js'

import type { RhythmCard } from '@/features/rhythm/rhythm.types'

export const SEARCH_INDEX_API_PATH = '/api/search-index'
export const SEARCH_INDEX_REBUILD_API_PATH = '/api/admin/search-index/rebuild'

export const SEARCH_INDEX_BLOB_LATEST_PATH = 'search-index/latest.json'
export const SEARCH_INDEX_BLOB_META_PATH = 'search-index/latest.meta.json'
export const searchIndexBlobVersionPath = (version: string) =>
  `search-index/versions/${version}.json`

/** CDN / Blob cache for overwritten "latest" pointers (seconds). */
export const SEARCH_INDEX_LATEST_CACHE_SECONDS = 60

/** Immutable versioned artifact cache (seconds). */
export const SEARCH_INDEX_VERSION_CACHE_SECONDS = 31_536_000

export const SEARCH_INDEX_LOCAL_STORAGE_KEY = 'redunsy:search-index'

export const SEARCH_INDEX_SEED_VERSION = 'seed'

export const SEARCH_INDEX_FUSE_OPTIONS: IFuseOptions<RhythmCard> = {
  keys: [
    { name: 'title', weight: 4 },
    { name: 'rhythmGroup', weight: 3 },
    { name: 'author', weight: 2 },
    { name: 'tags', weight: 2 },
    { name: 'origin', weight: 1.5 },
    { name: 'instruments', weight: 1 },
    { name: 'description', weight: 0.5 },
  ],
  threshold: 0.3,
  ignoreLocation: true,
  includeScore: true,
  minMatchCharLength: 2,
}
