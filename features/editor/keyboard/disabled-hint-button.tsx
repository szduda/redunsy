'use client'

import { useCallback, useState, type ReactNode } from 'react'

import { usePlayerStore } from '@/features/groovy-player/player.store'
import { KeyboardHintText } from '@/features/shared/keyboard-hint-text'
import { useIsMobile } from '@/features/shared/use-is-mobile'
import { cn } from '@/features/theme/cn'
import { PRESSABLE_CLASS } from '@/features/theme/pressable'

type DisabledHintButtonProps = {
  disabled?: boolean
  hint?: string
  keyboardHint?: string
  label?: string
  labelClassName?: string
  className?: string
  children: ReactNode
  onClick?: () => void
  style?: React.CSSProperties
  'aria-label'?: string
  'aria-pressed'?: boolean
}

export const DisabledHintButton = ({
  disabled = false,
  hint,
  keyboardHint,
  label,
  labelClassName,
  className,
  children,
  onClick,
  style,
  ...aria
}: DisabledHintButtonProps) => {
  const isMobile = useIsMobile()
  const showKeyboardHints = usePlayerStore((state) => state.showKeyboardHints)
  const [mobileHint, setMobileHint] = useState(false)

  const showMobileHint = useCallback(() => {
    if (!disabled || !hint || !isMobile) return
    setMobileHint(true)
    window.setTimeout(() => setMobileHint(false), 2200)
  }, [disabled, hint, isMobile])

  const handleClick = () => {
    if (disabled) {
      showMobileHint()
      return
    }
    onClick?.()
  }

  return (
    <div className="group/hint relative">
      <button
        aria-disabled={disabled}
        className={cn(PRESSABLE_CLASS, className, disabled && 'cursor-default')}
        disabled={disabled && !isMobile}
        onClick={handleClick}
        style={style}
        type="button"
        {...aria}
      >
        {children}
      </button>
      {hint && disabled && !isMobile ? (
        <span className="pointer-events-none absolute bottom-full left-1/2 z-50 mb-1.5 hidden w-max max-w-40 -translate-x-1/2 rounded-md bg-zinc-900 px-2 py-1 text-center text-[10px] leading-snug text-white opacity-0 transition-opacity group-hover/hint:opacity-100 md:block dark:bg-zinc-100 dark:text-zinc-900">
          {hint}
        </span>
      ) : null}
      {hint && disabled && isMobile && mobileHint ? (
        <span className="pointer-events-none absolute bottom-full left-1/2 z-50 mb-1.5 w-max max-w-44 -translate-x-1/2 rounded-md bg-zinc-900 px-2 py-1 text-center text-[10px] leading-snug text-white dark:bg-zinc-100 dark:text-zinc-900">
          {hint}
        </span>
      ) : null}
      {label && showKeyboardHints && !isMobile ? (
        <KeyboardHintText className={labelClassName} position="above">
          {label}
        </KeyboardHintText>
      ) : null}
      {keyboardHint && showKeyboardHints && !isMobile ? (
        <KeyboardHintText position="below">{keyboardHint}</KeyboardHintText>
      ) : null}
    </div>
  )
}
