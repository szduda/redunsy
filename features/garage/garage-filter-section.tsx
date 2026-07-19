'use client'

import { type ReactNode } from 'react'

import { cn } from '@/features/theme/cn'
import { KEYBOARD_FOCUS_VISIBLE_CLASS } from '@/features/theme/keyboard-focus'

type GarageFilterSectionProps = {
  title: string
  children: ReactNode
}

export const GarageFilterSection = ({ title, children }: GarageFilterSectionProps) => (
  <section className="flex flex-col gap-2">
    <h3 className="text-xs font-semibold tracking-widest text-zinc-500 uppercase dark:text-zinc-400">
      {title}
    </h3>
    <div className="flex flex-col gap-1">{children}</div>
  </section>
)

type GarageFilterOptionProps = {
  checked: boolean
  label: string
  onChange: () => void
}

export const GarageFilterOption = ({ checked, label, onChange }: GarageFilterOptionProps) => (
  <label className="flex cursor-pointer items-center gap-2 rounded px-1 py-0.5 text-sm text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-900">
    <input
      checked={checked}
      className={cn(KEYBOARD_FOCUS_VISIBLE_CLASS, 'accent-zinc-900 dark:accent-zinc-100')}
      onChange={onChange}
      type="checkbox"
    />
    <span>{label}</span>
  </label>
)

type GarageFilterChipListProps<T extends string> = {
  values: readonly T[]
  selected: T[]
  onToggle: (value: T) => void
  className?: string
  formatLabel?: (value: T) => string
}

export const GarageFilterChipList = <T extends string>({
  values,
  selected,
  onToggle,
  className,
  formatLabel = (value) => value,
}: GarageFilterChipListProps<T>) => (
  <div className={cn('flex flex-wrap gap-1', className)}>
    {values.map((value) => {
      const active = selected.includes(value)
      return (
        <button
          key={value || '__empty__'}
          aria-pressed={active}
          className={cn(
            KEYBOARD_FOCUS_VISIBLE_CLASS,
            'rounded-full border px-2.5 py-1 text-xs transition-colors',
            active
              ? 'border-zinc-900 bg-zinc-900 text-white dark:border-zinc-100 dark:bg-zinc-100 dark:text-zinc-900'
              : 'border-zinc-300 text-zinc-600 hover:border-zinc-400 dark:border-zinc-700 dark:text-zinc-400 dark:hover:border-zinc-500',
          )}
          onClick={() => onToggle(value)}
          type="button"
        >
          {formatLabel(value)}
        </button>
      )
    })}
  </div>
)
