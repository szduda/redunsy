import { type ComponentPropsWithoutRef } from 'react'

import { cn } from './cn'

type ButtonVariant = 'primary' | 'secondary'

type ButtonProps = ComponentPropsWithoutRef<'button'> & {
  variant?: ButtonVariant
}

const base = 'rounded-md px-4 py-2 text-sm font-medium transition disabled:opacity-50'

const variants: Record<ButtonVariant, string> = {
  primary:
    'bg-zinc-900 text-white hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300',
  secondary:
    'border border-zinc-300 text-zinc-900 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-100 dark:hover:bg-zinc-900',
}

export const Button = ({
  variant = 'secondary',
  className,
  type = 'button',
  ...props
}: ButtonProps) => (
  <button className={cn(base, variants[variant], className)} type={type} {...props} />
)
