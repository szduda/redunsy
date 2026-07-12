'use client'

import { useMutation } from '@tanstack/react-query'

import { fetchRhythmPageStatus } from '@/features/admin/admin-api'

export const useRhythmPageStatus = () =>
  useMutation({
    mutationFn: fetchRhythmPageStatus,
    retry: false,
  })
