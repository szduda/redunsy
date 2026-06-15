import Link from 'next/link'
import { type ComponentPropsWithoutRef } from 'react'

import { cn } from './cn'

type ButtonVariant = 'primary' | 'secondary' | 'subtle' | 'link'

type ButtonProps = Omit<ComponentPropsWithoutRef<'button'>, 'href'> & {
  variant?: ButtonVariant
  link?: boolean
  href?: string
}

const base =
  'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors duration-150 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50'

const linkBase =
  'inline font-semibold text-yellowy underline underline-offset-4 transition-colors duration-150 hover:text-yellowy-light hover:underline-offset-2'

const variants: Record<ButtonVariant, string> = {
  primary:
    'px-4 py-2 bg-zinc-900 text-white hover:bg-zinc-700 active:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300 dark:active:bg-zinc-200',
  secondary:
    'px-4 py-2 border border-zinc-300 text-zinc-900 hover:border-zinc-400 hover:bg-zinc-100 active:bg-zinc-200 dark:border-zinc-700 dark:text-zinc-100 dark:hover:border-zinc-500 dark:hover:bg-zinc-800 dark:active:bg-zinc-700',
  subtle:
    'p-2 border border-transparent bg-transparent text-zinc-500 hover:bg-zinc-100/80 active:bg-zinc-200/60 dark:text-zinc-400 dark:hover:bg-zinc-800/50 dark:active:bg-zinc-700/50',
  link: '',
}

export const Button = ({
  variant,
  className,
  type = 'button',
  link = false,
  href,
  disabled,
  children,
  ...props
}: ButtonProps) => {
  const resolvedVariant = variant ?? (link || href ? 'link' : 'secondary')
  const isLink = resolvedVariant === 'link'
  const styles = cn(
    isLink ? linkBase : base,
    !isLink && variants[resolvedVariant],
    className,
  )

  if (href) {
    return (
      <Link
        aria-disabled={disabled}
        className={cn(styles, disabled && 'pointer-events-none opacity-50')}
        href={href}
      >
        {children}
      </Link>
    )
  }

  return (
    <button className={styles} disabled={disabled} type={type} {...props}>
      {children}
    </button>
  )
}
