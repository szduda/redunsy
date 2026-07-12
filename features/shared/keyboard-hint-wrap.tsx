'use client'

import { type ReactNode } from 'react'

import { usePlayerStore } from '@/features/groovy-player/player.store'
import { KeyboardHintText } from '@/features/shared/keyboard-hint-text'
import { useIsMobile } from '@/features/shared/use-is-mobile'
import { cn } from '@/features/theme/cn'

type KeyboardHintWrapProps = {
  hint?: string
  label?: string
  labelClassName?: string
  children: ReactNode
  className?: string
}

export const KeyboardHintWrap = ({
  hint,
  label,
  labelClassName,
  children,
  className,
}: KeyboardHintWrapProps) => {
  const showKeyboardHints = usePlayerStore((state) => state.showKeyboardHints)
  const isMobile = useIsMobile()

  if ((!hint && !label) || !showKeyboardHints || isMobile) return <>{children}</>

  return (
    <div className={cn('relative', className)}>
      {label ? (
        <KeyboardHintText className={labelClassName} position="above">
          {label}
        </KeyboardHintText>
      ) : null}
      {children}
      {hint ? <KeyboardHintText position="below">{hint}</KeyboardHintText> : null}
    </div>
  )
}
