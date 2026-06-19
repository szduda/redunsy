import { twMerge } from 'tailwind-merge'

export const cn = (...classes: (string | undefined | false)[]) =>
  twMerge(...(classes.filter(Boolean) as string[]))
