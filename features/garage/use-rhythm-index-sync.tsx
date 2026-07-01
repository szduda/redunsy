'use client'

import { useEffect } from 'react'

import { syncRhythmIndexFromApi } from '@/features/garage/sync-rhythm-index'

export const useRhythmIndexSync = () => {
  useEffect(() => {
    void syncRhythmIndexFromApi()
  }, [])
}
