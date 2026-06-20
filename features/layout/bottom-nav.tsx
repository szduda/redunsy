'use client'

import { type ReactNode } from 'react'

import { BOTTOM_NAV_HEIGHT_CLASS } from '@/features/layout/constants'
import { cn } from '@/features/theme/cn'

type BottomNavProps = {
  children?: ReactNode
  className?: string
}

export const BottomNav = ({ children, className }: BottomNavProps) => {
  if (!children) return null

  return (
    <nav
      className={cn(
        'fixed inset-x-0 bottom-0 z-20 flex items-center border-t border-zinc-200 bg-white/95 text-zinc-900 backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/95 dark:text-zinc-100',
        BOTTOM_NAV_HEIGHT_CLASS,
        className,
      )}
    >
      {children}
    </nav>
  )
}
