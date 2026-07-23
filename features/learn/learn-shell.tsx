'use client'

import type { ReactNode } from 'react'

import { useTopNavSticky } from '@/features/layout/use-top-nav-sticky'
import { cn } from '@/features/theme/cn'

type LearnShellProps = {
  children: ReactNode
  className?: string
}

export const LearnShell = ({ children, className }: LearnShellProps) => {
  useTopNavSticky(true)

  return (
    <div className={cn('mx-auto w-full max-w-3xl flex-1 px-4 py-8 md:px-6 md:py-12', className)}>
      {children}
    </div>
  )
}
