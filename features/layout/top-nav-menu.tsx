'use client'

import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'

import { MenuIcon } from '@/features/icons/menu-icon'
import { TOP_NAV_HALO_STROKE_CLASS } from '@/features/layout/constants'
import { MobileNavMenu } from '@/features/layout/mobile-nav-menu'
import { NavMenuContent } from '@/features/layout/nav-menu-content'
import { topNavItemClass } from '@/features/layout/top-nav-item'
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
}

const MenuButton = ({ open, onClick }: MenuButtonProps) => (
  <button
    aria-expanded={open}
    aria-label={open ? 'Close menu' : 'Open menu'}
    className={cn(topNavItemClass, open && 'text-zinc-100')}
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
}

const DesktopMenuPanel = ({ open, onClose }: DesktopMenuPanelProps) => {
  useEffect(() => {
    if (!open) return
    const onKeyDown = ({ key }: KeyboardEvent) => {
      if (key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [onClose, open])

  if (!open) return null

  return createPortal(
    <>
      <button
        aria-label="Close menu"
        className="fixed inset-0 z-30 bg-black/40"
        onClick={onClose}
        type="button"
      />
      <div
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
      </div>
    </>,
    document.body,
  )
}

export const TopNavMenu = () => {
  const isMobile = useIsMobile()
  const [open, setOpen] = useState(false)
  const close = () => setOpen(false)

  if (isMobile) return <MobileNavMenu />

  return (
    <>
      <MenuButton onClick={() => setOpen((value) => !value)} open={open} />
      <DesktopMenuPanel onClose={close} open={open} />
    </>
  )
}
