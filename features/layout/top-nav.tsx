'use client'

import { SearchIcon } from '@/features/icons/search-icon'
import { AppLogo } from '@/features/layout/app-logo'
import { TOP_NAV_BG_CLASS, TOP_NAV_HEIGHT_CLASS } from '@/features/layout/constants'
import { topNavItemClass } from '@/features/layout/top-nav-item'
import { TopNavMenu } from '@/features/layout/top-nav-menu'
import { useUiStore } from '@/features/store/ui.store'
import { cn } from '@/features/theme/cn'

export const TopNav = () => {
  const topNavSticky = useUiStore((state) => state.topNavSticky)

  return (
    <header
      className={cn(
        'dark z-20 border-b border-zinc-800 text-zinc-100 backdrop-blur',
        TOP_NAV_BG_CLASS,
        TOP_NAV_HEIGHT_CLASS,
        topNavSticky ? 'fixed inset-x-0 top-0' : 'relative',
      )}
    >
      <nav className="mx-auto flex h-full max-w-8xl items-center justify-between px-3 md:px-4">
        <TopNavMenu />

        <AppLogo />

        <button aria-label="Search" className={cn(topNavItemClass)} type="button">
          <SearchIcon />
        </button>
      </nav>
    </header>
  )
}
