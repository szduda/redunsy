import Link from 'next/link'
import { type ComponentPropsWithoutRef } from 'react'

import { cn } from './cn'

type ButtonVariant = 'filled' | 'outlined' | 'subtle' | 'dimmed' | 'link'

type ButtonProps = Omit<ComponentPropsWithoutRef<'button'>, 'href'> & {
  variant?: ButtonVariant
  link?: boolean
  href?: string
  targetBlank?: boolean
}

const base =
  'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors duration-150 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50'

const linkBase =
  'inline font-semibold text-yellowy underline underline-offset-4 transition-colors duration-150 hover:text-yellowy-light hover:underline-offset-2'

const variants: Record<ButtonVariant, string> = {
  filled:
    'px-4 py-2 border border-transparent bg-zinc-900 text-white hover:bg-zinc-700 active:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300 dark:active:bg-zinc-200',
  outlined:
    'px-4 py-2 border border-zinc-300 bg-transparent text-zinc-900 hover:border-zinc-400 hover:bg-zinc-50 active:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-100 dark:hover:border-zinc-500 dark:hover:bg-zinc-900/50 dark:active:bg-zinc-800/50',
  subtle:
    'p-2 border border-transparent bg-transparent text-zinc-500 hover:bg-zinc-100/80 active:bg-zinc-200/60 dark:text-zinc-400 dark:hover:bg-zinc-800/50 dark:active:bg-zinc-700/50',
  dimmed:
    'px-4 py-2 border border-transparent bg-zinc-200 text-zinc-700 hover:bg-zinc-300 active:bg-zinc-400 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700 dark:active:bg-zinc-600',
  link: '',
}

export const Button = ({
  variant,
  className,
  type = 'button',
  link = false,
  href,
  targetBlank = false,
  disabled,
  children,
  ...props
}: ButtonProps) => {
  const resolvedVariant = variant ?? (link || href ? 'link' : 'outlined')
  const isLink = resolvedVariant === 'link'
  const styles = cn(isLink ? linkBase : base, !isLink && variants[resolvedVariant], className)

  if (href) {
    return (
      <Link
        aria-disabled={disabled}
        className={cn(styles, disabled && 'pointer-events-none opacity-50')}
        href={href}
        rel={targetBlank ? 'noreferrer' : undefined}
        target={targetBlank ? '_blank' : undefined}
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
