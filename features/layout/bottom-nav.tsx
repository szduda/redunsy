'use client'

import Link from 'next/link'

import { HomeIcon } from '@/features/icons/home-icon'
import { cn } from '@/features/theme/cn'
import { ZoomToggle } from '@/features/zoom-toggle/zoom-toggle'

const navItemClass =
  'flex flex-col items-center gap-1 px-4 py-2 text-zinc-600 transition-colors hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100'

export const BottomNav = () => (
  <nav className="fixed inset-x-0 bottom-0 z-10 flex justify-around border-t border-zinc-200 bg-background/95 backdrop-blur dark:border-zinc-800">
    <Link className={cn(navItemClass)} href="/">
      <HomeIcon />
      <span className="text-[10px] font-medium uppercase tracking-wide">
        Home
      </span>
    </Link>

    <ZoomToggle />
  </nav>
)
