'use client'

import { cn } from '@/features/theme/cn'
import { KEYBOARD_FOCUS_VISIBLE_CLASS } from '@/features/theme/keyboard-focus'

type SwitchProps = {
  checked: boolean
  label: string
  onChange: (checked: boolean) => void
  inline?: boolean
  reversed?: boolean
  className?: string
  labelClassName?: string
}

export const Switch = ({
  checked,
  label,
  onChange,
  inline = false,
  reversed = false,
  className,
  labelClassName,
}: SwitchProps) => {
  const switchButton = (
    <button
      aria-checked={checked}
      aria-label={label}
      className={cn(
        KEYBOARD_FOCUS_VISIBLE_CLASS,
        'relative h-6 w-10 shrink-0 rounded-full transition-colors',
        checked ? 'bg-zinc-900 dark:bg-zinc-100' : 'bg-zinc-300 dark:bg-zinc-700',
      )}
      onClick={() => onChange(!checked)}
      role="switch"
      type="button"
    >
      <span
        className={cn(
          'absolute top-0.5 left-0.5 size-5 rounded-full bg-white transition-transform dark:bg-zinc-900',
          checked && 'translate-x-4',
        )}
      />
    </button>
  )

  const labelSpan = (
    <span className={cn('text-sm text-zinc-600 dark:text-zinc-400', labelClassName)}>{label}</span>
  )

  return (
    <label
      className={cn(
        'flex cursor-pointer items-center gap-3',
        inline ? 'w-fit' : 'justify-between',
        className,
      )}
    >
      {reversed ? switchButton : labelSpan}
      {reversed ? labelSpan : switchButton}
    </label>
  )
}
