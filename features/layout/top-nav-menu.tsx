'use client'

import Link from 'next/link'

import { MenuIcon } from '@/features/icons/menu-icon'
import { Popover } from '@/features/groovy-player/popover'
import { TOP_NAV_HALO_STROKE_CLASS } from '@/features/layout/constants'
import { topNavItemClass } from '@/features/layout/top-nav-item'
import { ThemeSwitch } from '@/features/theme/theme-switch'
import { cn } from '@/features/theme/cn'

const MENU_ITEMS = [
  { href: '/', label: 'Home' },
  { href: '/player', label: 'Player' },
] as const

const menuLinkClass =
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

export const TopNavMenu = () => (
  <Popover
    full
    panel={({ close }) => (
      <nav className="mx-auto flex w-full max-w-4xl flex-col px-3 py-4 md:px-4">
        {MENU_ITEMS.map(({ href, label }) => (
          <Link key={href} className={menuLinkClass} href={href} onClick={close}>
            {label}
          </Link>
        ))}
        <div className="dark mt-2 w-fit border-t border-zinc-800 px-4 pt-4">
          <ThemeSwitch />
        </div>
      </nav>
    )}
    panelClassName="!border-zinc-800 !bg-zinc-900/95 backdrop-blur"
  >
    {({ open, toggle }) => (
      <button
        aria-expanded={open}
        aria-label={open ? 'Close menu' : 'Open menu'}
        className={cn(topNavItemClass, open && 'text-zinc-100')}
        onClick={toggle}
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
    )}
  </Popover>
)
