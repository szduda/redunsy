'use client'

import { useMutation } from '@tanstack/react-query'

import { publishRhythm } from '@/features/admin/admin-api'
import { syncRhythmIndexFromApi } from '@/features/garage/sync-rhythm-index'

export const usePublishRhythm = () =>
  useMutation({
    mutationFn: publishRhythm,
    onSuccess: () => {
      void syncRhythmIndexFromApi()
    },
    retry: false,
  })
