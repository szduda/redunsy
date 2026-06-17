'use client'

import { useEffect } from 'react'

import { useUiStore } from '@/features/store/ui.store'

export const useTopNavSticky = (sticky: boolean) => {
  const setTopNavSticky = useUiStore((state) => state.setTopNavSticky)

  useEffect(() => {
    setTopNavSticky(sticky)
    return () => setTopNavSticky(false)
  }, [setTopNavSticky, sticky])
}
