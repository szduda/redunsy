'use client'

import Link from 'next/link'
import { useCallback, useEffect, useRef, useState, type ComponentProps } from 'react'

import { DundunSetIcon } from '@/features/icons/dundun-set-icon'
import { LogoIcon } from '@/features/icons/logo-icon'
import { cn } from '@/features/theme/cn'

const DUNDUN_CLICKS = 4
const CLICK_WINDOW_MS = 2000
const HINT_VISIBLE_MS = 500

type LogoProps = ComponentProps<'svg'> & {
  className?: string
  compact?: boolean
  href?: string
  onPage?: boolean
}

export const Logo = ({
  className,
  compact = false,
  href = '/',
  onPage = false,
  ...iconProps
}: LogoProps) => {
  const [dundunTime, setDundunTime] = useState(0)
  const [hint, setHint] = useState('')
  const [hintVisible, setHintVisible] = useState(false)
  const hintTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const clickWindowRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const clearHintTimeout = useCallback(() => {
    if (hintTimeoutRef.current) {
      clearTimeout(hintTimeoutRef.current)
      hintTimeoutRef.current = null
    }
  }, [])

  const clearClickWindow = useCallback(() => {
    if (clickWindowRef.current) {
      clearTimeout(clickWindowRef.current)
      clickWindowRef.current = null
    }
  }, [])

  useEffect(
    () => () => {
      clearHintTimeout()
      clearClickWindow()
    },
    [clearClickWindow, clearHintTimeout],
  )

  const showHint = useCallback(
    (value: number) => {
      setHint(String(value))
      if (value > 0) {
        setHintVisible(true)
        clearHintTimeout()
        hintTimeoutRef.current = setTimeout(() => setHintVisible(false), HINT_VISIBLE_MS)
      }
    },
    [clearHintTimeout],
  )

  const onStickClick = useCallback(() => {
    if (dundunTime >= DUNDUN_CLICKS) return

    clearClickWindow()
    const nextCount = dundunTime + 1
    setDundunTime(nextCount)
    showHint(nextCount)

    if (nextCount < DUNDUN_CLICKS) {
      clickWindowRef.current = setTimeout(() => {
        setDundunTime(0)
        setHint('')
        setHintVisible(false)
      }, CLICK_WINDOW_MS)
    }
  }, [clearClickWindow, dundunTime, showHint])

  const iconSize = compact ? 36 : 128
  const dundunUnlocked = dundunTime >= DUNDUN_CLICKS
  const stableLayout = onPage && !compact

  return (
    <Link
      className={cn('flex items-center', compact ? 'scale-90' : 'scale-75 md:scale-100', className)}
      href={href}
    >
      <div
        className={cn(
          'relative shrink-0 overflow-visible',
          stableLayout && 'h-32 w-48',
          !dundunUnlocked && compact && '-translate-y-4.5',
        )}
      >
        <DundunSetIcon
          height={iconSize}
          innerClass2="animate-dundun origin-center"
          {...iconProps}
          className={cn('',
            stableLayout && 'absolute top-0 left-0',
            !dundunUnlocked
              ? 'pointer-events-none opacity-0'
              : cn(
                'animate-spin-logo-once origin-center -rotate-[15deg] transition-all delay-100 duration-500',
                !stableLayout && 'absolute',
              ),
          )}
        />
        <LogoIcon
          height={iconSize}
          innerClass2="animate-dundun origin-center"
          {...iconProps}
          className={cn(
            stableLayout && 'absolute top-0 left-0',
            dundunUnlocked && 'pointer-events-none animate-spin opacity-0',
            'origin-center transition-all delay-150 duration-500',
          )}
          onStickClick={onStickClick}
        />
        <div
          className={cn(
            'absolute font-bold text-yellowy transition ease-in-out',
            hint === '4' ? 'duration-1000' : 'duration-500',
            !hintVisible && 'opacity-0',
            compact
              ? hint === '2'
                ? 'translate-x-1'
                : hint === '3'
                  ? 'translate-x-2'
                  : hint === '4'
                    ? '-translate-x-24'
                    : ''
              : hint === '2'
                ? 'translate-x-4'
                : hint === '3'
                  ? 'translate-x-8'
                  : hint === '4'
                    ? '-translate-x-96'
                    : '',
          )}
        >
          {hint}
        </div>
      </div>
      <h1
        className={cn(
          'font-black tracking-wide transition duration-500 ease-in-out',
          onPage ? 'text-zinc-900 dark:text-zinc-300' : 'text-zinc-300',
          compact ? 'text-xl' : 'text-5xl',
          stableLayout
            ? 'translate-y-12 -translate-x-1'
            : dundunUnlocked &&
            (compact ? 'translate-x-0 translate-y-4' : 'translate-y-12 -translate-x-1'),
        )}
      >
        dunsy<small className={cn('opacity-50', compact ? 'text-xs' : 'text-2xl')}>.app</small>
      </h1>
    </Link >
  )
}
