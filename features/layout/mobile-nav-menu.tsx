'use client'

import { MenuIcon } from '@/features/icons/menu-icon'
import { Popover } from '@/features/groovy-player/popover'
import { TOP_NAV_HALO_STROKE_CLASS } from '@/features/layout/constants'
import { NavMenuContent } from '@/features/layout/nav-menu-content'
import { topNavItemClass } from '@/features/layout/top-nav-item'
import { cn } from '@/features/theme/cn'

const MOBILE_NAV_PANEL_CLASS =
  'h-[300px] !bottom-auto border-zinc-200 bg-white/95 backdrop-blur dark:border-zinc-800 dark:bg-zinc-900/95'
const MOBILE_NAV_BACKDROP_CLASS = 'bg-black/40 backdrop-blur dark:bg-zinc-900/95'

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
  variant?: 'topNav' | 'homepage'
}

const menuButtonClass = {
  topNav: topNavItemClass,
  homepage: 'flex items-center justify-center rounded-md p-2 text-white !bg-black/40',
} as const

const MenuButton = ({ open, onClick, variant = 'topNav' }: MenuButtonProps) => (
  <button
    aria-expanded={open}
    aria-label={open ? 'Close menu' : 'Open menu'}
    className={cn(menuButtonClass[variant], open && variant === 'topNav' && 'text-zinc-700 dark:text-zinc-100')}
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

type MobileNavMenuProps = {
  className?: string
  variant?: 'topNav' | 'homepage'
}

export const MobileNavMenu = ({ className, variant = 'topNav' }: MobileNavMenuProps) => (
  <Popover
    backdropClassName={MOBILE_NAV_BACKDROP_CLASS}
    full
    fullAnchor={variant === 'homepage' ? 'trigger' : 'header'}
    fullBackdrop
    panel={({ close }) => (
      <div className="mx-auto flex w-full max-w-4xl flex-col px-3 py-4 md:px-4">
        <NavMenuContent onClose={close} variant="mobile" />
      </div>
    )}
    panelClassName={MOBILE_NAV_PANEL_CLASS}
    rootClassName={className}
  >
    {({ open, toggle }) => <MenuButton onClick={toggle} open={open} variant={variant} />}
  </Popover>
)
