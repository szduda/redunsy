'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'

import { MenuIcon } from '@/features/icons/menu-icon'
import { Popover } from '@/features/groovy-player/popover'
import { TOP_NAV_HALO_STROKE_CLASS, TOP_NAV_HEIGHT_CLASS } from '@/features/layout/constants'
import { topNavItemClass } from '@/features/layout/top-nav-item'
import { useIsMobile } from '@/features/shared/use-is-mobile'
import { ThemeSwitch } from '@/features/theme/theme-switch'
import { cn } from '@/features/theme/cn'

const MENU_ITEMS = [
  { href: '/', label: 'Home' },
  { href: '/player', label: 'Player' },
  { href: '/garage', label: 'Garage' },
] as const

const menuLinkClass =
  'rounded-md px-3 py-2.5 text-sm text-zinc-700 transition-colors hover:bg-zinc-100 dark:text-zinc-200 dark:hover:bg-zinc-800'

const mobileMenuLinkClass =
  'rounded px-4 py-3 text-base text-zinc-300 transition-colors hover:bg-zinc-800 hover:text-zinc-100'

const MenuCloseBadge = () => (
  <svg aria-hidden className="size-3" fill="none" viewBox="0 0 24 24">
    <path
      className={TOP_NAV_HALO_STROKE_CLASS}
      d="M6 6l12 12M18 6L6 18"
      strokeLinecap="round"
      strokeWidth={5}
    />
    <path
      d="M6 6l12 12M18 6L6 18"
      stroke="currentColor"
      strokeLinecap="round"
      strokeWidth={2.75}
    />
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

type MenuPanelContentProps = {
  onClose: () => void
  linkClassName?: string
}

const MenuPanelContent = ({ onClose, linkClassName = menuLinkClass }: MenuPanelContentProps) => (
  <nav className="flex flex-col gap-1">
    {MENU_ITEMS.map(({ href, label }) => (
      <Link key={href} className={linkClassName} href={href} onClick={onClose}>
        {label}
      </Link>
    ))}
    <div className="mt-3 border-t border-zinc-200 pt-3 dark:border-zinc-800">
      <ThemeSwitch />
    </div>
  </nav>
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

  return (
    <>
      <button
        aria-label="Close menu"
        className="fixed inset-0 top-0 z-30 bg-black/40"
        onClick={onClose}
        type="button"
      />
      <div
        className={cn(
          'fixed left-0 z-40 w-80 max-h-[calc(100dvh-3.5rem)] overflow-y-auto',
          TOP_NAV_HEIGHT_CLASS,
          'border border-t-0 border-l-0 border-zinc-200 bg-background p-6 dark:border-zinc-800',
          'rounded-tr-xl',
        )}
        role="dialog"
        aria-modal
        aria-label="Menu"
      >
        <MenuPanelContent onClose={onClose} />
      </div>
    </>
  )
}

export const TopNavMenu = () => {
  const isMobile = useIsMobile()
  const [open, setOpen] = useState(false)
  const close = () => setOpen(false)

  if (isMobile) {
    return (
      <Popover
        full
        panel={({ close: closePopover }) => (
          <div className="mx-auto flex w-full max-w-4xl flex-col px-3 py-4 md:px-4">
            <MenuPanelContent linkClassName={mobileMenuLinkClass} onClose={closePopover} />
          </div>
        )}
        panelClassName="!border-zinc-800 !bg-zinc-900/95 backdrop-blur"
      >
        {({ open: popoverOpen, toggle }) => <MenuButton onClick={toggle} open={popoverOpen} />}
      </Popover>
    )
  }

  return (
    <>
      <MenuButton onClick={() => setOpen((value) => !value)} open={open} />
      <DesktopMenuPanel onClose={close} open={open} />
    </>
  )
}
