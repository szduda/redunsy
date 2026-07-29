// @vitest-environment happy-dom

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { cleanup, render, waitFor } from '@testing-library/react'
import { createElement, type ReactNode } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { SEARCH_INDEX_LOCAL_STORAGE_KEY } from '@/features/search-index/search-index.config'
import { useSearchIndexStore } from '@/features/search-index/search-index.store'
import { useSearchIndex } from '@/features/search-index/use-search-index'

vi.mock('@/features/search-index/search-index.seed', () => ({
  loadSeedPayload: vi.fn(async () => ({
    version: 'seed',
    generatedAt: 0,
    count: 0,
    cards: [],
  })),
}))

const Probe = () => {
  const { version, status } = useSearchIndex()
  return createElement('div', {
    'data-testid': 'probe',
    'data-version': version,
    'data-status': status,
  })
}

const renderProbe = () => {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  })
  const wrapper = ({ children }: { children: ReactNode }) =>
    createElement(QueryClientProvider, { client }, children)
  return render(createElement(Probe), { wrapper })
}

describe('useSearchIndex', () => {
  beforeEach(() => {
    localStorage.removeItem(SEARCH_INDEX_LOCAL_STORAGE_KEY)
    useSearchIndexStore.setState({
      cards: [],
      version: '',
      generatedAt: 0,
      status: 'idle',
    })
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          version: 'live-1',
          generatedAt: 100,
          count: 1,
          cards: [
            {
              slug: 'kuku',
              title: 'Kuku',
              description: '',
              meter: 4,
              instruments: ['djembe'],
              longestTrack: 1,
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
        }),
      }),
    )
  })

  afterEach(() => {
    cleanup()
    vi.unstubAllGlobals()
  })

  it('bootstraps from seed then adopts the live index once', async () => {
    const { getByTestId } = renderProbe()

    await waitFor(() => {
      expect(getByTestId('probe').getAttribute('data-version')).toBe('live-1')
    })
    expect(useSearchIndexStore.getState().cards[0]?.slug).toBe('kuku')
    expect(fetch).toHaveBeenCalled()
  })

  it('does not replace a live index with a later seed response', async () => {
    useSearchIndexStore.getState().setIndex({
      version: 'live-1',
      generatedAt: 100,
      count: 0,
      cards: [],
    })
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          version: 'seed',
          generatedAt: 0,
          count: 0,
          cards: [],
        }),
      }),
    )

    const { getByTestId } = renderProbe()

    await waitFor(() => {
      expect(fetch).toHaveBeenCalled()
    })
    expect(getByTestId('probe').getAttribute('data-version')).toBe('live-1')
  })
})
