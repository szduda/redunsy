// @vitest-environment happy-dom

import { beforeEach, describe, expect, it } from 'vitest'

import { shouldAdoptSearchIndex } from '@/features/search-index/search-index.apply'
import { SEARCH_INDEX_SEED_VERSION } from '@/features/search-index/search-index.config'
import { useSearchIndexStore } from '@/features/search-index/search-index.store'
import type { SearchIndexPayload } from '@/features/search-index/search-index.types'

const payload = (overrides: Partial<SearchIndexPayload> = {}): SearchIndexPayload => ({
  version: 'live-1',
  generatedAt: 100,
  count: 0,
  cards: [],
  ...overrides,
})

describe('shouldAdoptSearchIndex', () => {
  beforeEach(() => {
    useSearchIndexStore.setState({
      cards: [],
      version: '',
      generatedAt: 0,
      status: 'idle',
    })
  })

  it('adopts when the store is empty', () => {
    expect(shouldAdoptSearchIndex(payload())).toBe(true)
  })

  it('rejects seed when a live version is already loaded', () => {
    useSearchIndexStore.getState().setIndex(payload())
    expect(
      shouldAdoptSearchIndex(
        payload({ version: SEARCH_INDEX_SEED_VERSION, generatedAt: 0, count: 0 }),
      ),
    ).toBe(false)
  })

  it('rejects older generatedAt', () => {
    useSearchIndexStore.getState().setIndex(payload({ generatedAt: 200 }))
    expect(shouldAdoptSearchIndex(payload({ version: 'live-2', generatedAt: 150 }))).toBe(false)
  })

  it('adopts a newer version', () => {
    useSearchIndexStore.getState().setIndex(payload())
    expect(shouldAdoptSearchIndex(payload({ version: 'live-2', generatedAt: 200 }))).toBe(true)
  })
})
