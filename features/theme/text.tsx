import { type ComponentPropsWithoutRef } from 'react'

import { cn } from './cn'

type TextVariant = 'body' | 'mono'

type TextProps = ComponentPropsWithoutRef<'p'> & {
  variant?: TextVariant
}

const variants: Record<TextVariant, string> = {
  body: 'text-sm text-zinc-600 dark:text-zinc-400',
  mono: 'font-mono text-xs text-zinc-500',
}

export const Text = ({ variant = 'body', className, ...props }: TextProps) => (
  <p className={cn(variants[variant], className)} {...props} />
)
