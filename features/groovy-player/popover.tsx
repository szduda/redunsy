'use client'

import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react'
import { createPortal } from 'react-dom'

import { cn } from '@/features/theme/cn'

export type PopoverDirection = 'top' | 'bottom' | 'left' | 'right'

const POPOVER_GAP_PX = 4
const POPOVER_MARGIN_PX = 8

const OPPOSITE_DIRECTION: Record<PopoverDirection, PopoverDirection> = {
  top: 'bottom',
  bottom: 'top',
  left: 'right',
  right: 'left',
}

export const popoverPanelBaseClass =
  'fixed z-30 touch-none overscroll-contain flex flex-col gap-1 rounded-md bg-white p-3 shadow-lg dark:bg-black border border-zinc-200 dark:border-zinc-500/50'

export const popoverPanelFullBaseClass =
  'fixed z-30 touch-none overscroll-contain flex flex-col overflow-y-auto bg-white dark:bg-black border-t border-zinc-200 dark:border-zinc-500/50'

export const popoverTriggerOpenClass =
  'bg-zinc-200/60 !text-yellowy dark:bg-zinc-700/50 !dark:text-yellowy'

export const popoverPanelClass = cn(popoverPanelBaseClass, 'w-32')

type PanelPosition = {
  top: number
  left: number
  transform: string
}

const getPanelPosition = (direction: PopoverDirection, trigger: DOMRect): PanelPosition => {
  switch (direction) {
    case 'bottom':
      return {
        top: trigger.bottom + POPOVER_GAP_PX,
        left: trigger.left + trigger.width / 2,
        transform: 'translateX(-50%)',
      }
    case 'top':
      return {
        top: trigger.top - POPOVER_GAP_PX,
        left: trigger.left + trigger.width / 2,
        transform: 'translate(-50%, -100%)',
      }
    case 'left':
      return {
        top: trigger.top + trigger.height / 2,
        left: trigger.left - POPOVER_GAP_PX,
        transform: 'translate(-100%, -50%)',
      }
    case 'right':
      return {
        top: trigger.top + trigger.height / 2,
        left: trigger.right + POPOVER_GAP_PX,
        transform: 'translateY(-50%)',
      }
  }
}

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

const getFullPanelStyle = (root: HTMLElement): CSSProperties => {
  const headerBottom = root.closest('header')?.getBoundingClientRect().bottom
  return {
    top: headerBottom ?? 0,
    left: 0,
    right: 0,
    bottom: 0,
  }
}

type PopoverRenderProps = {
  open: boolean
  toggle: () => void
}

type PopoverPanelProps = {
  close: () => void
}

type PopoverProps = {
  panel: ReactNode | ((props: PopoverPanelProps) => ReactNode)
  panelClassName?: string
  preferredDirection?: PopoverDirection
  full?: boolean
  children: (props: PopoverRenderProps) => ReactNode
}

export const Popover = ({
  panel,
  panelClassName,
  preferredDirection = 'bottom',
  full = false,
  children,
}: PopoverProps) => {
  const [open, setOpen] = useState(false)
  const [panelStyle, setPanelStyle] = useState<CSSProperties>()
  const rootRef = useRef<HTMLDivElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)
  const close = () => setOpen(false)

  const updatePosition = () => {
    const trigger = rootRef.current
    const panelEl = panelRef.current
    if (!trigger || !panelEl) return

    if (full) {
      setPanelStyle(getFullPanelStyle(trigger))
      return
    }

    const triggerRect = trigger.getBoundingClientRect()
    const direction = resolveDirection(preferredDirection, triggerRect, {
      width: panelEl.offsetWidth,
      height: panelEl.offsetHeight,
    })
    const position = getPanelPosition(direction, triggerRect)

    setPanelStyle({
      top: position.top,
      left: position.left,
      transform: position.transform,
    })
  }

  useLayoutEffect(() => {
    if (!open) {
      setPanelStyle(undefined)
      return
    }
    updatePosition()
  }, [full, open, preferredDirection, panel])

  useEffect(() => {
    if (!open) return
    const onViewportChange = () => updatePosition()
    window.addEventListener('resize', onViewportChange)
    window.addEventListener('scroll', onViewportChange, true)
    return () => {
      window.removeEventListener('resize', onViewportChange)
      window.removeEventListener('scroll', onViewportChange, true)
    }
  }, [full, open, preferredDirection])

  useEffect(() => {
    if (!open) return
    const onPointerDown = ({ target }: PointerEvent) => {
      const node = target as Node
      if (rootRef.current?.contains(node) || panelRef.current?.contains(node)) return
      setOpen(false)
    }
    document.addEventListener('pointerdown', onPointerDown)
    return () => document.removeEventListener('pointerdown', onPointerDown)
  }, [open])

  const toggle = () => setOpen((value) => !value)
  const panelContent = typeof panel === 'function' ? panel({ close }) : panel

  return (
    <div ref={rootRef} className="relative">
      {children({ open, toggle })}
      {open && typeof document !== 'undefined'
        ? createPortal(
            <div
              ref={panelRef}
              className={cn(
                full ? popoverPanelFullBaseClass : popoverPanelBaseClass,
                !full && 'w-32',
                panelClassName,
              )}
              style={panelStyle}
              onPointerDown={(event) => event.stopPropagation()}
            >
              {panelContent}
            </div>,
            document.body,
          )
        : null}
    </div>
  )
}
