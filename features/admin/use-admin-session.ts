'use client'

import { useQuery } from '@tanstack/react-query'

import { fetchAdminSession } from '@/features/admin/admin-api'
import { adminSessionQueryKey } from '@/features/admin/admin-query-keys'

export const useAdminSession = (enabled: boolean) =>
  useQuery({
    queryKey: adminSessionQueryKey,
    queryFn: fetchAdminSession,
    enabled,
    retry: false,
  })
