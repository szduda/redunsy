'use client'

import { useSyncExternalStore } from 'react'

const TABLET_QUERY = '(min-width: 768px) and (max-width: 1023px)'

const subscribe = (onStoreChange: () => void) => {
  const media = window.matchMedia(TABLET_QUERY)
  media.addEventListener('change', onStoreChange)
  return () => media.removeEventListener('change', onStoreChange)
}

const getSnapshot = () => window.matchMedia(TABLET_QUERY).matches

const getServerSnapshot = () => false

export const useIsTablet = () => useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
