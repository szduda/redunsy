'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

import { HelpIcon } from '@/features/icons/help-icon'
import { AppLogo } from '@/features/layout/app-logo'
import { TOP_NAV_BG_CLASS, TOP_NAV_HEIGHT_CLASS } from '@/features/layout/constants'
import { topNavItemClass } from '@/features/layout/top-nav-item'
import { TopNavMenu } from '@/features/layout/top-nav-menu'
import { usesOpenDesktopNav } from '@/features/layout/uses-open-desktop-nav'
import { useUiStore } from '@/features/store/ui.store'
import { cn } from '@/features/theme/cn'

export const TopNav = () => {
  const pathname = usePathname()
  const topNavSticky = useUiStore((state) => state.topNavSticky)
  const openDesktopNav = usesOpenDesktopNav(pathname)

  if (pathname === '/') return null

  return (
    <header
      className={cn(
        'z-20 border-b border-zinc-300/60 dark:border-zinc-800 text-zinc-100 backdrop-blur',
        TOP_NAV_BG_CLASS,
        TOP_NAV_HEIGHT_CLASS,
        topNavSticky ? 'fixed inset-x-0 top-0' : 'relative',
        openDesktopNav && 'md:hidden',
      )}
    >
      <nav className="mx-auto flex h-full max-w-8xl items-center justify-between px-3 md:px-4">
        <TopNavMenu />

        <AppLogo />

        <Link
          aria-current={pathname === '/help' ? 'page' : undefined}
          aria-label="Help"
          className={cn(topNavItemClass, pathname === '/help' && 'text-zinc-100')}
          href="/help"
        >
          <HelpIcon />
        </Link>
      </nav>
    </header>
  )
}
