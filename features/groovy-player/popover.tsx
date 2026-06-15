'use client'

import { useEffect, useRef, useState, type ReactNode } from 'react'

import { cn } from '@/features/theme/cn'

export const popoverPanelClass =
  'absolute top-full left-1/2 z-20 mb-2 w-32 -translate-x-1/2 translate-y-1 touch-none overscroll-contain flex flex-col gap-1 rounded-b-md bg-white p-3 shadow-lg dark:bg-black border border-zinc-500/50'

type PopoverRenderProps = {
  open: boolean
  toggle: () => void
}

type PopoverProps = {
  panel: ReactNode
  panelClassName?: string
  children: (props: PopoverRenderProps) => ReactNode
}

export const Popover = ({ panel, panelClassName, children }: PopoverProps) => {
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)

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
          className={cn(popoverPanelClass, panelClassName)}
          onPointerDown={(event) => event.stopPropagation()}
        >
          {panel}
        </div>
      ) : null}
    </div>
  )
}
