'use client'

import { GlobeIcon } from '@/features/icons/globe-icon'
import { cn } from '@/features/theme/cn'

export type FetchUrlButtonState = 'idle' | 'loading' | 'result'

type FetchUrlButtonProps = {
  state: FetchUrlButtonState
  status: number | null
  onClick: () => void
}

const statusClass = (status: number | null) => {
  if (status === null) return 'text-zinc-500 dark:text-zinc-400'
  if (status >= 200 && status < 300) return 'text-emerald-600 dark:text-emerald-400'
  if (status === 404) return 'text-amber-600 dark:text-amber-400'
  return 'text-red-600 dark:text-red-400'
}

export const FetchUrlButton = ({ state, status, onClick }: FetchUrlButtonProps) => (
  <button
    aria-label={state === 'result' ? `Page status ${status}` : 'Check if rhythm page exists'}
    className={cn(
      'absolute right-1 top-1/2 flex size-7 -translate-y-1/2 items-center justify-center rounded-md transition-colors',
      state === 'loading'
        ? 'cursor-default text-zinc-400'
        : 'text-zinc-500 hover:bg-zinc-100 hover:text-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-200',
    )}
    disabled={state === 'loading'}
    onClick={onClick}
    onMouseDown={(event) => event.preventDefault()}
    type="button"
  >
    {state === 'loading' ? (
      <span className="size-3.5 animate-spin rounded-full border-2 border-zinc-300 border-t-zinc-700 dark:border-zinc-600 dark:border-t-zinc-200" />
    ) : state === 'result' ? (
      <span className={cn('font-mono text-[11px] font-semibold leading-none', statusClass(status))}>
        {status ?? '—'}
      </span>
    ) : (
      <GlobeIcon className="size-3.5" />
    )}
  </button>
)
