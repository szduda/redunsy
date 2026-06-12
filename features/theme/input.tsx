import { type ComponentPropsWithoutRef } from 'react'

import { cn } from './cn'

type InputProps = ComponentPropsWithoutRef<'input'>

const base =
  'rounded-md border border-zinc-300 bg-white px-3 py-2 font-mono text-sm text-zinc-900 outline-none focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100'

export const Input = ({ className, ...props }: InputProps) => (
  <input className={cn(base, className)} {...props} />
)
