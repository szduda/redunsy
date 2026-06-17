'use client'

import { type ComponentPropsWithoutRef, type ReactNode } from 'react'

import { cn } from '@/features/theme/cn'

type IconButtonProps = Omit<ComponentPropsWithoutRef<'button'>, 'children'> & {
  active?: boolean
  children: ReactNode
  circle?: boolean
  dark?: boolean
  ninja?: boolean
}

export const IconButton = ({
  active = false,
  children,
  circle = true,
  className,
  dark = false,
  ninja = true,
  type = 'button',
  ...props
}: IconButtonProps) => (
  <button
    className={cn(
      'inline-flex items-center justify-center border border-transparent text-zinc-800 transition-all ease-in-out dark:text-zinc-100',
      'active:scale-95 disabled:pointer-events-none disabled:opacity-25',
      dark
        ? 'min-w-[54px] rounded-md bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200'
        : cn('bg-transparent hover:scale-110', ninja && (active ? 'saturate-100' : 'saturate-0')),
      circle && !dark && 'rounded-full',
      dark ? 'px-3 py-2' : 'p-2',
      className,
    )}
    type={type}
    {...props}
  >
    {children}
  </button>
)
