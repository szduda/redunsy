'use client'

import { MenuIcon } from '@/features/icons/menu-icon'
import { PAGE_BODY_BG_CLASS, TOP_NAV_HALO_STROKE_CLASS } from '@/features/layout/constants'
import { NavMenuContent } from '@/features/layout/nav-menu-content'
import { cn } from '@/features/theme/cn'
import { Text } from '@/features/theme/text'
import { Button } from '../theme/button'

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

export const HomepageNav = () => (
  <aside
    className={cn(
      PAGE_BODY_BG_CLASS,
      'sticky top-0 flex h-dvh w-44 shrink-0 flex-col gap-4 px-4 py-6 sm:w-48',
    )}
  >
    <MenuIcon className="m-2 size-6 opacity-30" />

    <NavMenuContent variant="homepage" />

    <div className="flex flex-col flex-1 justify-center opacity-70">
      <Text className='text-right'>
        If you have any questions or suggestions, please don't hesitate to{' '}
        <Button link className='saturate-0 hover:saturate-100 no-underline hover:underline tracking-widest text-black dark:text-white' href="mailto:szymon@dunsy.app">
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
      {/* <Button href="https://szd.cat">szd.cat</Button> */}
    </div>
  </aside>
)
