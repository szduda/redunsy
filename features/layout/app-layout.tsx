'use client'

import { useCallback, useState, type ReactNode } from 'react'

import { BottomNav } from '@/features/layout/bottom-nav'
import { BOTTOM_NAV_PADDING_CLASS, TOP_NAV_PADDING_CLASS } from '@/features/layout/constants'
import { BottomNavSlotProvider } from '@/features/layout/page-bottom-nav'
import { TopNav } from '@/features/layout/top-nav'
import { useUiStore } from '@/features/store/ui.store'
import { cn } from '@/features/theme/cn'

type AppLayoutProps = {
  children: ReactNode
}

export const AppLayout = ({ children }: AppLayoutProps) => {
  const [bottomNavContent, setBottomNavContent] = useState<ReactNode>(null)
  const onBottomNavChange = useCallback((content: ReactNode) => setBottomNavContent(content), [])
  const topNavSticky = useUiStore((state) => state.topNavSticky)

  return (
    <BottomNavSlotProvider onContentChange={onBottomNavChange}>
      <TopNav />
      <div
        className={cn(
          'flex min-h-full flex-1 flex-col bg-white dark:bg-zinc-950',
          topNavSticky && TOP_NAV_PADDING_CLASS,
          bottomNavContent ? BOTTOM_NAV_PADDING_CLASS : 'pb-0',
        )}
      >
        {children}
      </div>
      <BottomNav>{bottomNavContent}</BottomNav>
    </BottomNavSlotProvider>
  )
}
