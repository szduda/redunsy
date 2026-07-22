import type { IFuseOptions } from 'fuse.js'

import type { RhythmCard } from '@/features/rhythm/rhythm.types'

export const SEARCH_INDEX_API_PATH = '/api/search-index'
export const SEARCH_INDEX_REBUILD_API_PATH = '/api/admin/search-index/rebuild'

export const SEARCH_INDEX_BLOB_LATEST_PATH = 'search-index/latest.json'

/**
 * CDN cache for overwritten `latest.json` (seconds).
 * Passive refreshers may lag a rebuild by up to
 * SEARCH_INDEX_LATEST_CACHE_SECONDS + SEARCH_INDEX_STALE_WHILE_REVALIDATE_SECONDS
 * (~6 minutes). Admins bypass this by applying rebuild `cards` locally.
 */
export const SEARCH_INDEX_LATEST_CACHE_SECONDS = 60
export const SEARCH_INDEX_STALE_WHILE_REVALIDATE_SECONDS = 300

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
