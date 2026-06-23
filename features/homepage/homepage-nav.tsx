'use client'

import Link from 'next/link'

import { ContactInfo } from '@/features/contact/contact-info'
import { HelpIcon } from '@/features/icons/help-icon'
import { MenuIcon } from '@/features/icons/menu-icon'
import { PAGE_BODY_BG_CLASS } from '@/features/layout/constants'
import { NavMenuContent } from '@/features/layout/nav-menu-content'
import { cn } from '@/features/theme/cn'
import { Text } from '@/features/theme/text'
import { Button } from '@/features/theme/button'

export const HomepageNav = () => (
  <aside
    className={cn(
      PAGE_BODY_BG_CLASS,
      'sticky top-0 flex h-dvh w-44 shrink-0 flex-col gap-4 px-4 py-6 sm:w-48',
    )}
  >
    <MenuIcon className="m-2 size-6 opacity-30" />

    <NavMenuContent variant="homepage" />

    <div className="flex flex-col flex-1 justify-center gap-6 opacity-70">
      <Link
        className="inline-flex items-center justify-end gap-2 self-stretch rounded-md px-3 py-2.5 text-sm text-zinc-900 transition-colors hover:bg-zinc-200/50 dark:text-zinc-100 dark:hover:bg-zinc-800/30 opacity-50 hover:opacity-100"
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
          className="saturate-0 hover:saturate-100 no-underline hover:underline tracking-widest text-black dark:text-white"
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
