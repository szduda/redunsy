// @vitest-environment happy-dom

import { renderHook, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { RHYTHM_INDEX } from '@/features/garage/rhythm-index'
import { useRhythmIndexStore } from '@/features/garage/rhythm-index.store'
import {
  useRhythmIndexVersion,
  useRhythmSearchIndexHydration,
} from '@/features/garage/use-rhythm-search-index'

const sampleCards = [{ ...RHYTHM_INDEX[0], title: 'Updated from API', updatedAt: 999 }]

describe('useRhythmSearchIndexHydration', () => {
  beforeEach(() => {
    useRhythmIndexStore.setState({ cards: RHYTHM_INDEX, version: 0 })
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => sampleCards,
      }),
    )
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
  })

  it('replaces the static index with cards from the runtime API', async () => {
    renderHook(() => useRhythmSearchIndexHydration())

    await waitFor(() => {
      expect(useRhythmIndexStore.getState().cards).toEqual(sampleCards)
    })
    expect(fetch).toHaveBeenCalledWith('/api/rhythms/search-index', { cache: 'no-store' })
  })

  it('logs and keeps the static fallback when hydration fails', async () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('network error')))

    renderHook(() => useRhythmSearchIndexHydration())

    await waitFor(() => {
      expect(errorSpy).toHaveBeenCalledWith(
        'Failed to hydrate rhythm search index',
        expect.any(Error),
      )
    })
    expect(useRhythmIndexStore.getState().cards).toEqual(RHYTHM_INDEX)
  })
})

describe('useRhythmIndexVersion', () => {
  it('reflects store version bumps after hydration', async () => {
    useRhythmIndexStore.setState({ cards: RHYTHM_INDEX, version: 0 })
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => sampleCards,
      }),
    )

    const { result } = renderHook(() => ({
      hydration: useRhythmSearchIndexHydration(),
      version: useRhythmIndexVersion(),
    }))

    expect(result.current.version).toBe(0)

    await waitFor(() => {
      expect(result.current.version).toBe(1)
    })
  })
})
