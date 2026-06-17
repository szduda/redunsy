'use client'

import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react'

import { cn } from '@/features/theme/cn'

export type PopoverDirection = 'top' | 'bottom' | 'left' | 'right'

const POPOVER_MARGIN_PX = 8

const OPPOSITE_DIRECTION: Record<PopoverDirection, PopoverDirection> = {
  top: 'bottom',
  bottom: 'top',
  left: 'right',
  right: 'left',
}

export const popoverPanelBaseClass =
  'absolute z-20 touch-none overscroll-contain flex flex-col gap-1 rounded-md bg-white p-3 shadow-lg dark:bg-black border border-zinc-200 dark:border-zinc-500/50'

export const popoverTriggerOpenClass =
  'bg-zinc-200/60 !text-yellowy dark:bg-zinc-700/50 !dark:text-yellowy'

const directionPanelClass: Record<PopoverDirection, string> = {
  bottom: 'top-full left-1/2 -translate-x-1/2 translate-y-1',
  top: 'bottom-full left-1/2 -translate-x-1/2 -translate-y-1',
  left: 'right-full top-1/2 -translate-y-1/2 -translate-x-1',
  right: 'left-full top-1/2 -translate-y-1/2 translate-x-1',
}

export const popoverPanelClass = cn(popoverPanelBaseClass, directionPanelClass.bottom, 'w-32')

const resolveDirection = (
  preferred: PopoverDirection,
  trigger: DOMRect,
  panel: { width: number; height: number },
): PopoverDirection => {
  const space = {
    top: trigger.top - POPOVER_MARGIN_PX,
    bottom: window.innerHeight - trigger.bottom - POPOVER_MARGIN_PX,
    left: trigger.left - POPOVER_MARGIN_PX,
    right: window.innerWidth - trigger.right - POPOVER_MARGIN_PX,
  }

  const size = {
    top: panel.height,
    bottom: panel.height,
    left: panel.width,
    right: panel.width,
  }

  const fits = (direction: PopoverDirection) => space[direction] >= size[direction]

  if (fits(preferred)) return preferred

  const opposite = OPPOSITE_DIRECTION[preferred]
  if (fits(opposite)) return opposite

  return space[preferred] >= space[opposite] ? preferred : opposite
}

type PopoverRenderProps = {
  open: boolean
  toggle: () => void
}

type PopoverProps = {
  panel: ReactNode
  panelClassName?: string
  preferredDirection?: PopoverDirection
  children: (props: PopoverRenderProps) => ReactNode
}

export const Popover = ({
  panel,
  panelClassName,
  preferredDirection = 'bottom',
  children,
}: PopoverProps) => {
  const [open, setOpen] = useState(false)
  const [direction, setDirection] = useState<PopoverDirection>(preferredDirection)
  const rootRef = useRef<HTMLDivElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)

  const updateDirection = () => {
    const trigger = rootRef.current
    const panelEl = panelRef.current
    if (!trigger || !panelEl) return

    setDirection(
      resolveDirection(preferredDirection, trigger.getBoundingClientRect(), {
        width: panelEl.offsetWidth,
        height: panelEl.offsetHeight,
      }),
    )
  }

  useLayoutEffect(() => {
    if (!open) {
      setDirection(preferredDirection)
      return
    }
    updateDirection()
  }, [open, preferredDirection, panel])

  useEffect(() => {
    if (!open) return
    const onViewportChange = () => updateDirection()
    window.addEventListener('resize', onViewportChange)
    window.addEventListener('scroll', onViewportChange, true)
    return () => {
      window.removeEventListener('resize', onViewportChange)
      window.removeEventListener('scroll', onViewportChange, true)
    }
  }, [open, preferredDirection])

  useEffect(() => {
    if (!open) return
    const onPointerDown = ({ target }: PointerEvent) => {
      if (!rootRef.current?.contains(target as Node)) setOpen(false)
    }
    document.addEventListener('pointerdown', onPointerDown)
    return () => document.removeEventListener('pointerdown', onPointerDown)
  }, [open])

  const toggle = () => setOpen((value) => !value)

  return (
    <div ref={rootRef} className="relative">
      {children({ open, toggle })}
      {open ? (
        <div
          ref={panelRef}
          className={cn(popoverPanelBaseClass, directionPanelClass[direction], 'w-32', panelClassName)}
          onPointerDown={(event) => event.stopPropagation()}
        >
          {panel}
        </div>
      ) : null}
    </div>
  )
}
