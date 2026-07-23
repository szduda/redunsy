'use client'

import type { ReactNode } from 'react'

import { OpenDesktopNav } from '@/features/layout/open-desktop-nav'
import { cn } from '@/features/theme/cn'

type OpenDesktopNavLayoutProps = {
  children: ReactNode
  className?: string
}

export const OpenDesktopNavLayout = ({ children, className }: OpenDesktopNavLayoutProps) => (
  <div className={cn('flex min-w-0 flex-1 flex-col md:flex-row', className)}>
    <div className="hidden md:block">
      <OpenDesktopNav />
    </div>
    <div className="flex min-w-0 flex-1 flex-col">{children}</div>
  </div>
)
