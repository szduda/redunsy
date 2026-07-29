'use client'

import { useEffect } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'

import { applySearchIndexLocally } from '@/features/search-index/search-index.apply'
import { fetchSearchIndex } from '@/features/search-index/search-index.client'
import { loadSeedPayload } from '@/features/search-index/search-index.seed'
import {
  getSearchIndexVersion,
  useSearchIndexStore,
} from '@/features/search-index/search-index.store'

export const SEARCH_INDEX_QUERY_KEY = ['search-index'] as const

/**
 * Bootstraps the catalogue index (localStorage → seed chunk) and passively
 * refreshes once per browser session from GET /api/search-index.
 */
export const useSearchIndex = () => {
  const setIndex = useSearchIndexStore((state) => state.setIndex)
  const setStatus = useSearchIndexStore((state) => state.setStatus)
  const version = useSearchIndexStore((state) => state.version)
  const status = useSearchIndexStore((state) => state.status)
  const queryClient = useQueryClient()

  useEffect(() => {
    if (getSearchIndexVersion()) return

    let cancelled = false
    setStatus('loading')
    void loadSeedPayload()
      .then((seed) => {
        if (cancelled || getSearchIndexVersion()) return
        setIndex(seed)
      })
      .catch(() => {
        if (!cancelled && !getSearchIndexVersion()) setStatus('error')
      })

    return () => {
      cancelled = true
    }
  }, [setIndex, setStatus])

  useQuery({
    queryKey: SEARCH_INDEX_QUERY_KEY,
    queryFn: async () => {
      const live = await fetchSearchIndex()
      await applySearchIndexLocally(live, queryClient)
      return live
    },
    staleTime: Infinity,
    gcTime: 1000 * 60 * 60 * 24,
    retry: 2,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  })

  return { version, status }
}
