'use client'

import { useEffect, useRef, useState, type RefObject } from 'react'
import { createPortal } from 'react-dom'

import { MenuIcon } from '@/features/icons/menu-icon'
import { TOP_NAV_HALO_STROKE_CLASS } from '@/features/layout/constants'
import { MobileNavMenu } from '@/features/layout/mobile-nav-menu'
import { NavMenuContent } from '@/features/layout/nav-menu-content'
import { topNavItemClass } from '@/features/layout/top-nav-item'
import { useFocusTrap } from '@/features/shared/use-focus-trap'
import { useIsMobile } from '@/features/shared/use-is-mobile'
import { cn } from '@/features/theme/cn'

const MenuCloseBadge = () => (
  <svg aria-hidden className="size-3" fill="none" viewBox="0 0 24 24">
    <path
      className={TOP_NAV_HALO_STROKE_CLASS}
      d="M6 6l12 12M18 6L6 18"
      strokeLinecap="round"
      strokeWidth={5}
    />
    <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeLinecap="round" strokeWidth={2.75} />
  </svg>
)

type MenuButtonProps = {
  open: boolean
  onClick: () => void
  triggerRef?: RefObject<HTMLButtonElement | null>
}

const MenuButton = ({ open, onClick, triggerRef }: MenuButtonProps) => (
  <button
    ref={triggerRef}
    aria-expanded={open}
    aria-label={open ? 'Close menu' : 'Open menu'}
    className={cn(topNavItemClass, open && 'text-zinc-700 dark:text-zinc-100')}
    onClick={onClick}
    type="button"
  >
    <span className="relative inline-flex size-6 shrink-0">
      <MenuIcon />
      {open ? (
        <span className="pointer-events-none absolute top-0 right-0 -translate-y-px translate-x-px">
          <MenuCloseBadge />
        </span>
      ) : null}
    </span>
  </button>
)

type DesktopMenuPanelProps = {
  open: boolean
  onClose: () => void
  excludeRef: RefObject<HTMLElement | null>
}

const DesktopMenuPanel = ({ open, onClose, excludeRef }: DesktopMenuPanelProps) => {
  const panelRef = useRef<HTMLDivElement>(null)

  useFocusTrap(panelRef, open, { excludeFromTabOrder: excludeRef })

  useEffect(() => {
    if (!open) return
    const onKeyDown = ({ key }: KeyboardEvent) => {
      if (key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [onClose, open])

  useEffect(() => {
    if (!open) return
    const onPointerDown = ({ target }: PointerEvent) => {
      const node = target as Node
      if (panelRef.current?.contains(node) || excludeRef.current?.contains(node)) return
      onClose()
    }
    document.addEventListener('pointerdown', onPointerDown)
    return () => document.removeEventListener('pointerdown', onPointerDown)
  }, [excludeRef, onClose, open])

  if (!open) return null

  return createPortal(
    <div
      ref={panelRef}
      className={cn(
        'fixed left-0 top-10 z-40 w-80 max-h-[calc(100dvh-2.5rem)] overflow-y-auto shadow-lg',
        'border border-t-0 border-l-0 border-zinc-200 bg-background p-6 dark:border-zinc-800',
        'rounded-br-xl',
      )}
      role="dialog"
      aria-modal
      aria-label="Menu"
    >
      <NavMenuContent onClose={onClose} />
    </div>,
    document.body,
  )
}

export const TopNavMenu = () => {
  const isMobile = useIsMobile()
  const [open, setOpen] = useState(false)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const close = () => setOpen(false)

  if (isMobile) return <MobileNavMenu />

  return (
    <>
      <MenuButton onClick={() => setOpen((value) => !value)} open={open} triggerRef={triggerRef} />
      <DesktopMenuPanel excludeRef={triggerRef} onClose={close} open={open} />
    </>
  )
}
