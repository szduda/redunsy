import { cn } from '@/features/theme/cn'
import { KEYBOARD_FOCUS_VISIBLE_CLASS } from '@/features/theme/keyboard-focus'

export const topNavItemClass = cn(
  KEYBOARD_FOCUS_VISIBLE_CLASS,
  'flex items-center justify-center rounded-md p-2 text-zinc-400 transition-colors hover:text-zinc-700 dark:hover:text-zinc-100',
)
