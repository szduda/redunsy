'use client'

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from 'react'
import { createPortal } from 'react-dom'

import {
  POPOVER_GAP_PX,
  resolvePopoverStyle,
  type PopoverDirection,
} from '@/features/groovy-player/popover-position'
import { useFocusTrap } from '@/features/shared/use-focus-trap'
import { cn } from '@/features/theme/cn'

export type { PopoverDirection } from '@/features/groovy-player/popover-position'

export const popoverPanelBaseClass =
  'fixed z-30 touch-none overscroll-contain flex flex-col gap-1 rounded-md bg-white p-3 shadow-lg dark:bg-black border border-zinc-200 dark:border-zinc-500/50'

export const popoverPanelFullBaseClass =
  'fixed z-30 touch-none overscroll-contain flex flex-col overflow-y-auto bg-white dark:bg-black border-t border-zinc-200 dark:border-zinc-500/50'

export const popoverTriggerOpenClass =
  'bg-zinc-200/60 !text-yellowy dark:bg-zinc-700/50 !dark:text-yellowy'

export const popoverPanelClass = cn(popoverPanelBaseClass, 'w-32')

const getFullPanelTop = (root: HTMLElement, anchor: 'header' | 'trigger'): number =>
  anchor === 'trigger'
    ? root.getBoundingClientRect().bottom + POPOVER_GAP_PX
    : (root.closest('header')?.getBoundingClientRect().bottom ?? 0)

const getFullPanelStyle = (root: HTMLElement, anchor: 'header' | 'trigger'): CSSProperties => ({
  top: getFullPanelTop(root, anchor),
  left: 0,
  right: 0,
  bottom: 0,
})

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
  fullAnchor?: 'header' | 'trigger'
  rootClassName?: string
  focusTrap?: boolean
  closeOnEsc?: boolean
  children: (props: PopoverRenderProps) => ReactNode
}

export const Popover = ({
  panel,
  panelClassName,
  preferredDirection = 'bottom',
  full = false,
  fullAnchor = 'header',
  rootClassName,
  focusTrap = true,
  closeOnEsc = true,
  children,
}: PopoverProps) => {
  const [open, setOpen] = useState(false)
  const [panelStyle, setPanelStyle] = useState<CSSProperties>()
  const rootRef = useRef<HTMLDivElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)
  const close = () => setOpen(false)

  useFocusTrap(panelRef, open && focusTrap, rootRef)

  const updatePosition = useCallback(() => {
    const trigger = rootRef.current
    const panelEl = panelRef.current
    if (!trigger || !panelEl) return

    if (full) {
      setPanelStyle(getFullPanelStyle(trigger, fullAnchor))
      return
    }

    const triggerRect = trigger.getBoundingClientRect()
    const position = resolvePopoverStyle(
      triggerRect,
      { width: panelEl.offsetWidth, height: panelEl.offsetHeight },
      preferredDirection,
      { width: window.innerWidth, height: window.innerHeight },
    )

    setPanelStyle({
      top: position.top,
      left: position.left,
      transform: position.transform,
    })
  }, [full, fullAnchor, preferredDirection])

  useLayoutEffect(() => {
    if (!open) {
      setPanelStyle(undefined)
      return
    }
    updatePosition()
  }, [open, panel, updatePosition])

  useEffect(() => {
    if (!open) return
    const onViewportChange = () => updatePosition()
    window.addEventListener('resize', onViewportChange)
    window.addEventListener('scroll', onViewportChange, true)
    return () => {
      window.removeEventListener('resize', onViewportChange)
      window.removeEventListener('scroll', onViewportChange, true)
    }
  }, [open, updatePosition])

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

  useEffect(() => {
    if (!open || !closeOnEsc) return
    const onKeyDown = ({ key }: KeyboardEvent) => {
      if (key === 'Escape') setOpen(false)
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [closeOnEsc, open])

  const toggle = () => setOpen((value) => !value)
  const panelContent = typeof panel === 'function' ? panel({ close }) : panel

  return (
    <div ref={rootRef} className={cn('relative inline-flex', rootClassName)}>
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
