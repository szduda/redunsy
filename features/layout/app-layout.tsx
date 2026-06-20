'use client'

import { useCallback, useState, Suspense, type ReactNode } from 'react'

import { BottomNav } from '@/features/layout/bottom-nav'
import {
  BOTTOM_NAV_PADDING_CLASS,
  PAGE_BODY_BG_CLASS,
  TOP_NAV_PADDING_CLASS,
} from '@/features/layout/constants'
import { BottomNavPortalTarget, BottomNavSlotProvider } from '@/features/layout/page-bottom-nav'
import { TopNav } from '@/features/layout/top-nav'
import { SearchUrlSync } from '@/features/shared/search-url-sync'
import { useUiStore } from '@/features/store/ui.store'
import { cn } from '@/features/theme/cn'

type AppLayoutProps = {
  children: ReactNode
}

export const AppLayout = ({ children }: AppLayoutProps) => {
  const [hasBottomNav, setHasBottomNav] = useState(false)
  const onHasBottomNavChange = useCallback(
    (visible: boolean) => setHasBottomNav((current) => (current === visible ? current : visible)),
    [],
  )
  const topNavSticky = useUiStore((state) => state.topNavSticky)

  return (
    <BottomNavSlotProvider onHasBottomNavChange={onHasBottomNavChange}>
      <Suspense fallback={null}>
        <SearchUrlSync />
      </Suspense>
      <TopNav />
      <div
        className={cn(
          'flex min-h-[calc(100dvh - 2.5rem)] flex-1 flex-col',
          PAGE_BODY_BG_CLASS,
          topNavSticky && TOP_NAV_PADDING_CLASS,
          hasBottomNav ? BOTTOM_NAV_PADDING_CLASS : 'pb-0',
        )}
      >
        {children}
      </div>
      <BottomNav className={cn(!hasBottomNav && 'hidden')}>
        <BottomNavPortalTarget />
      </BottomNav>
    </BottomNavSlotProvider>
  )
}
