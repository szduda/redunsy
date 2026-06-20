'use client'

import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useCallback, useEffect } from 'react'

import { sanitizeGarageFilters, selectGarageFilters, useGarageFiltersStore } from '@/features/garage/garage-filters.store'
import {
  buildAppQueryHref,
  filtersEqual,
  parseAppQueryFromSearchParams,
} from '@/features/store/app-query-state'
import { useSearchStore } from '@/features/store/search.store'

const syncUrlToStores = (searchParams: URLSearchParams) => {
  const { searchTerm, filters: rawFilters } = parseAppQueryFromSearchParams(searchParams)
  const filters = sanitizeGarageFilters(rawFilters)
  const currentSearch = useSearchStore.getState().searchTerm
  const currentFilters = selectGarageFilters(useGarageFiltersStore.getState())

  if (currentSearch !== searchTerm) {
    useSearchStore.setState({ searchTerm })
  }

  if (!filtersEqual(currentFilters, filters)) {
    useGarageFiltersStore.setState(filters)
  }
}

export const SearchUrlSync = () => {
  const pathname = usePathname()
  const router = useRouter()
  const searchParams = useSearchParams()
  const queryString = searchParams.toString()

  const syncStoresToUrl = useCallback(() => {
    const searchTerm = useSearchStore.getState().searchTerm
    const filters = selectGarageFilters(useGarageFiltersStore.getState())
    const nextHref = buildAppQueryHref(pathname, searchTerm, filters)
    const currentHref = queryString ? `${pathname}?${queryString}` : pathname
    if (nextHref === currentHref) return
    router.replace(nextHref, { scroll: false })
  }, [pathname, queryString, router])

  useEffect(() => {
    syncUrlToStores(searchParams)
  }, [pathname, queryString, searchParams])

  useEffect(() => {
    const unsubscribeSearch = useSearchStore.subscribe((state, previous) => {
      if (state.searchTerm === previous.searchTerm) return
      syncStoresToUrl()
    })

    const unsubscribeFilters = useGarageFiltersStore.subscribe((state, previous) => {
      const current = selectGarageFilters(state)
      const prior = selectGarageFilters(previous)
      if (filtersEqual(current, prior)) return
      syncStoresToUrl()
    })

    return () => {
      unsubscribeSearch()
      unsubscribeFilters()
    }
  }, [syncStoresToUrl])

  useEffect(() => {
    const onPopState = () => syncUrlToStores(new URLSearchParams(window.location.search))
    window.addEventListener('popstate', onPopState)
    return () => window.removeEventListener('popstate', onPopState)
  }, [])

  return null
}
