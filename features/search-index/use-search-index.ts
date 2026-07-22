'use client'

import { useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'

import { fetchSearchIndex } from '@/features/search-index/search-index.client'
import { writeSearchIndexLocalCache } from '@/features/search-index/search-index.local-cache'
import { loadSeedPayload } from '@/features/search-index/search-index.seed'
import {
  getSearchIndexVersion,
  useSearchIndexStore,
} from '@/features/search-index/search-index.store'

let passiveRefreshStarted = false

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
    if (passiveRefreshStarted) return
    passiveRefreshStarted = true

    const run = async () => {
      if (!getSearchIndexVersion()) {
        setStatus('loading')
        try {
          const seed = await loadSeedPayload()
          if (!getSearchIndexVersion()) setIndex(seed)
        } catch {
          setStatus('error')
        }
      }

      try {
        const live = await fetchSearchIndex()
        const current = getSearchIndexVersion()
        if (live.version !== current) {
          setIndex(live)
          writeSearchIndexLocalCache(live)
          await queryClient.invalidateQueries({ queryKey: ['garage-snippets'] })
        } else {
          writeSearchIndexLocalCache(live)
          if (useSearchIndexStore.getState().status !== 'ready') {
            setIndex(live)
          }
        }
      } catch {
        if (!getSearchIndexVersion()) setStatus('error')
      }
    }

    void run()
  }, [queryClient, setIndex, setStatus])

  return { version, status }
}
