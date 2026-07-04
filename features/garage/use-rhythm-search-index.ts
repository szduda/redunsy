'use client'

import { useEffect } from 'react'

import { selectRhythmIndexVersion, useRhythmIndexStore } from '@/features/garage/rhythm-index.store'
import type { RhythmCard } from '@/features/rhythm/rhythm.types'

const SEARCH_INDEX_URL = '/api/rhythms/search-index'

const fetchRhythmSearchIndex = async (): Promise<RhythmCard[]> => {
  const response = await fetch(SEARCH_INDEX_URL, { cache: 'no-store' })
  if (!response.ok) throw new Error('Failed to load rhythm search index')
  return response.json() as Promise<RhythmCard[]>
}

/** Hydrates the garage/search store from the runtime search-index API. */
export const useRhythmSearchIndexHydration = () => {
  useEffect(() => {
    let cancelled = false

    const hydrate = async () => {
      try {
        const cards = await fetchRhythmSearchIndex()
        if (!cancelled) useRhythmIndexStore.getState().setCards(cards)
      } catch (error) {
        console.error('Failed to hydrate rhythm search index', error)
      }
    }

    void hydrate()

    return () => {
      cancelled = true
    }
  }, [])
}

export const useRhythmIndexVersion = () => useRhythmIndexStore(selectRhythmIndexVersion)
