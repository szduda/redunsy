import Link from 'next/link'

import { HelpIcon } from '@/features/icons/help-icon'
import { ThemeSwitch } from '@/features/theme/theme-switch'
import { cn } from '@/features/theme/cn'

export const NAV_MENU_ITEMS = [
  { href: '/', label: 'Home' },
  { href: '/garage', label: 'Garage' },
  { href: '/player', label: 'Player Demo' },
  { href: '/editor', label: 'Rhythm Editor' },
] as const

const linkStyles = {
  default:
    'rounded-md px-3 py-2.5 text-sm text-zinc-700 transition-colors hover:bg-zinc-100 dark:text-zinc-200 dark:hover:bg-zinc-800',
  mobile:
    'rounded px-4 py-3 text-base text-zinc-300 transition-colors hover:bg-zinc-800 hover:text-zinc-100',
  homepage:
    'rounded-md px-3 py-2.5 text-sm text-zinc-900 transition-colors hover:bg-zinc-200/50 dark:text-zinc-100 dark:hover:bg-zinc-800/30 opacity-50 hover:opacity-100',
} as const

type NavMenuContentProps = {
  onClose?: () => void
  variant?: keyof typeof linkStyles
}

export const NavMenuContent = ({ onClose, variant = 'default' }: NavMenuContentProps) => {
  const items =
    variant === 'homepage' ? NAV_MENU_ITEMS.filter((item) => item.href !== '/') : NAV_MENU_ITEMS

  return (
    <nav className="flex flex-col gap-1">
      {items.map(({ href, label }) => (
        <Link key={href} className={linkStyles[variant]} href={href} onClick={onClose}>
          {label}
        </Link>
      ))}
      <div
        className={cn(
          'mt-2 pt-4',
          variant === 'homepage'
            ? 'opacity-50 hover:opacity-100 ml-1'
            : 'border-t border-zinc-200 dark:border-zinc-800',
        )}
      >
        <ThemeSwitch className="px-2 opacity-60" />
      </div>
      {variant === 'homepage' ? (
        <Link
          className={cn(linkStyles.homepage, 'mt-12 inline-flex items-center gap-2')}
          href="/help"
          onClick={onClose}
        >
          <HelpIcon className="size-5 shrink-0" />
          Help
        </Link>
      ) : null}
    </nav>
  )
}
