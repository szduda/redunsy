// @vitest-environment happy-dom

import { afterEach, describe, expect, it } from 'vitest'

import { SEARCH_INDEX_LOCAL_STORAGE_KEY } from '@/features/search-index/search-index.config'
import {
  readSearchIndexLocalCache,
  writeSearchIndexLocalCache,
} from '@/features/search-index/search-index.local-cache'

describe('search-index local cache', () => {
  afterEach(() => {
    localStorage.removeItem(SEARCH_INDEX_LOCAL_STORAGE_KEY)
  })

  it('round-trips a valid payload', () => {
    const payload = {
      version: 'abc',
      generatedAt: 123,
      count: 1,
      cards: [
        {
          slug: 'kuku',
          title: 'Kuku',
          description: '',
          meter: 4 as const,
          instruments: ['djembe' as const],
          longestTrack: 2,
          author: [],
          origin: [],
          tags: [],
          rhythmGroup: [],
          swingPattern: '',
          tempo: 100,
          signalPattern: '',
          createdAt: 1,
          updatedAt: 2,
        },
      ],
    }

    writeSearchIndexLocalCache(payload)
    expect(readSearchIndexLocalCache()).toEqual(payload)
  })

  it('returns null for corrupt storage', () => {
    localStorage.setItem(SEARCH_INDEX_LOCAL_STORAGE_KEY, '{not-json')
    expect(readSearchIndexLocalCache()).toBeNull()
  })
})
