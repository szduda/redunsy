'use client'

import dynamic from 'next/dynamic'
import { useState } from 'react'

import { hasAdminHintCookie } from '@/features/admin/admin-cookies'
import { useAdminSession } from '@/features/admin/use-admin-session'
import { ToastProvider } from '@/features/admin/toasts'

const SearchIndexButton = dynamic(
  () =>
    import('@/features/search-index/search-index-button').then(
      (module) => module.SearchIndexButton,
    ),
  { ssr: false },
)

export const SearchIndexGate = () => {
  const [hasHint] = useState(hasAdminHintCookie)
  const { data } = useAdminSession(hasHint)

  if (!data?.authenticated && process.env.NODE_ENV !== 'development') return null

  return (
    <ToastProvider>
      <SearchIndexButton />
    </ToastProvider>
  )
}
