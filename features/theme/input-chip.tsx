'use client'

import { CloseIcon } from '@/features/icons/close-icon'
import { Button } from '@/features/theme/button'
import { cn } from '@/features/theme/cn'

type InputChipProps = {
  label: string
  onRemove: () => void
}

export const InputChip = ({ label, onRemove }: InputChipProps) => (
  <span
    className={cn(
      'inline-flex max-w-full items-center gap-0.5 rounded-md',
      'bg-zinc-200/70 px-1.5 py-0.5 font-mono text-xs text-zinc-800',
      'dark:bg-zinc-700/70 dark:text-zinc-100',
    )}
  >
    <span className="truncate">{label}</span>
    <Button
      aria-label={`Remove ${label}`}
      className="!min-w-0 !p-0.5"
      onClick={onRemove}
      type="button"
      variant="subtle"
    >
      <CloseIcon className="size-3" />
    </Button>
  </span>
)
