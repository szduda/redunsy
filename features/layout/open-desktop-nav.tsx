'use client'

import Link from 'next/link'

import { ContactInfo } from '@/features/contact/contact-info'
import { HelpIcon } from '@/features/icons/help-icon'
import { MenuIcon } from '@/features/icons/menu-icon'
import { PAGE_BODY_BG_CLASS } from '@/features/layout/constants'
import { NavMenuContent } from '@/features/layout/nav-menu-content'
import { Button } from '@/features/theme/button'
import { cn } from '@/features/theme/cn'
import { KEYBOARD_FOCUS_VISIBLE_CLASS } from '@/features/theme/keyboard-focus'
import { Text } from '@/features/theme/text'

type OpenDesktopNavProps = {
  excludeHome?: boolean
}

export const OpenDesktopNav = ({ excludeHome = false }: OpenDesktopNavProps) => (
  <aside
    className={cn(
      PAGE_BODY_BG_CLASS,
      'sticky top-0 flex h-dvh w-44 shrink-0 flex-col gap-4 px-4 py-6 sm:w-48',
    )}
  >
    <MenuIcon className="m-2 size-6 opacity-30" />

    <NavMenuContent excludeHome={excludeHome} variant="homepage" />

    <div className="flex flex-1 flex-col justify-center gap-6 opacity-70">
      <Link
        className={cn(
          KEYBOARD_FOCUS_VISIBLE_CLASS,
          'inline-flex items-center justify-end gap-2 self-stretch rounded-md px-3 py-2.5 text-sm text-zinc-900 opacity-50 transition-colors hover:bg-zinc-200/50 hover:opacity-100 dark:text-zinc-100 dark:hover:bg-zinc-800/30',
        )}
        href="/help"
      >
        <HelpIcon className="size-5 shrink-0" />
        Help
      </Link>
      <ContactInfo compact className="justify-end" />
      <Text className="text-right">
        If you have any questions or suggestions, please don&apos;t hesitate to{' '}
        <Button
          link
          className="tracking-widest text-black no-underline saturate-0 hover:underline hover:saturate-100 dark:text-white"
          href="/contact"
        >
          contact me
        </Button>
        .
        <br />
        <br />
        Thank you for using dunsy.app
        <br />
        <br />
        Best regards,
        <br />
        Szymon
      </Text>
    </div>
  </aside>
)
