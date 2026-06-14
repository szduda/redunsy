'use client'

import { useSyncExternalStore } from 'react'

const MOBILE_QUERY = '(max-width: 767px)'

const subscribe = (onStoreChange: () => void) => {
  const media = window.matchMedia(MOBILE_QUERY)
  media.addEventListener('change', onStoreChange)
  return () => media.removeEventListener('change', onStoreChange)
}

const getSnapshot = () => window.matchMedia(MOBILE_QUERY).matches

const getServerSnapshot = () => true

export const useIsMobile = () => useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
