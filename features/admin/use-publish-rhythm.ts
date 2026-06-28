'use client'

import { useMutation } from '@tanstack/react-query'

import { publishRhythm } from '@/features/admin/admin-api'

export const usePublishRhythm = () =>
  useMutation({
    mutationFn: publishRhythm,
    retry: false,
  })
