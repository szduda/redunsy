'use client'

import { usePathname } from 'next/navigation'
import { useEffect } from 'react'

import { SEARCH_QUERY_PARAM, useSearchStore } from '@/features/store/search.store'

const syncStoredTermToUrl = (pathname: string) => {
  const term = useSearchStore.getState().searchTerm
  const params = new URLSearchParams(window.location.search)
  if (!term) {
    if (!params.has(SEARCH_QUERY_PARAM)) return
    params.delete(SEARCH_QUERY_PARAM)
  } else if (params.get(SEARCH_QUERY_PARAM) === term) {
    return
  } else {
    params.set(SEARCH_QUERY_PARAM, term)
  }
  const search = params.toString()
  const next = search ? `${pathname}?${search}` : pathname
  window.history.replaceState(window.history.state, '', next)
}

export const SearchUrlSync = () => {
  const pathname = usePathname()

  useEffect(() => {
    void useSearchStore.persist.rehydrate()
  }, [])

  useEffect(() => {
    syncStoredTermToUrl(pathname)
  }, [pathname])

  useEffect(() => {
    const onPopState = () => {
      void useSearchStore.persist.rehydrate()
    }
    window.addEventListener('popstate', onPopState)
    return () => window.removeEventListener('popstate', onPopState)
  }, [])

  return null
}
