'use client'

import { type ReactNode } from 'react'

import { usePlayerStore } from '@/features/groovy-player/player.store'
import { useIsMobile } from '@/features/shared/use-is-mobile'
import { cn } from '@/features/theme/cn'

type KeyboardHintWrapProps = {
  hint?: string
  children: ReactNode
  className?: string
}

export const KeyboardHintWrap = ({ hint, children, className }: KeyboardHintWrapProps) => {
  const showKeyboardHints = usePlayerStore((state) => state.showKeyboardHints)
  const isMobile = useIsMobile()

  if (!hint || !showKeyboardHints || isMobile) return <>{children}</>

  return (
    <div className={cn('relative', className)}>
      {children}
      <span className="pointer-events-none absolute -bottom-3.5 left-1/2 z-50 mb-0.5 -translate-x-1/2 text-xs font-bold uppercase text-zinc-500 dark:text-zinc-400">
        {hint}
      </span>
    </div>
  )
}
