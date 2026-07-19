'use client'

import { PAGE_SIZE_OPTIONS, type PageSizeOption } from '@/features/garage/pagination.store'
import { Popover } from '@/features/groovy-player/popover'
import { Button } from '@/features/theme/button'
import { Text } from '@/features/theme/text'
import { cn } from '@/features/theme/cn'
import { KEYBOARD_FOCUS_VISIBLE_CLASS } from '@/features/theme/keyboard-focus'

type PageSizePopoverProps = {
  value: PageSizeOption
  onChange: (value: PageSizeOption) => void
}

const PageSizePopover = ({ value, onChange }: PageSizePopoverProps) => (
  <Popover
    panel={({ close }) => (
      <ul aria-label="Page size" className="min-w-full py-1" role="listbox">
        {PAGE_SIZE_OPTIONS.map((option) => (
          <li key={option} role="option" aria-selected={option === value}>
            <button
              className={cn(
                KEYBOARD_FOCUS_VISIBLE_CLASS,
                'w-full rounded-md px-3 py-1 text-left font-mono text-xs',
                option === value
                  ? 'bg-zinc-100 font-semibold text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100'
                  : 'text-zinc-700 hover:bg-zinc-50 dark:text-zinc-300 dark:hover:bg-zinc-900',
              )}
              onClick={() => {
                onChange(option)
                close()
              }}
              type="button"
            >
              {option}
            </button>
          </li>
        ))}
      </ul>
    )}
    panelClassName="!w-auto min-w-[4rem]"
  >
    {({ open, toggle }) => (
      <button
        aria-expanded={open}
        aria-haspopup="listbox"
        className={cn(
          KEYBOARD_FOCUS_VISIBLE_CLASS,
          'inline-flex items-center gap-1 rounded-md border border-zinc-300 bg-transparent px-2 py-0.5 font-mono text-xs text-zinc-900 hover:border-zinc-400 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-100 dark:hover:border-zinc-500 dark:hover:bg-zinc-900/50',
        )}
        onClick={toggle}
        type="button"
      >
        {value}
        <span aria-hidden className="text-[10px]">
          ▾
        </span>
      </button>
    )}
  </Popover>
)

export type GaragePaginationProps = {
  page: number
  totalPages: number
  total: number
  pageSize: PageSizeOption
  disabled: boolean
  onPageChange: (page: number) => void
  onPageSizeChange: (pageSize: PageSizeOption) => void
}

export const GaragePagination = ({
  page,
  totalPages,
  total,
  pageSize,
  disabled,
  onPageChange,
  onPageSizeChange,
}: GaragePaginationProps) =>
  Boolean(total) && (
    <nav
      aria-label="Pagination"
      className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between lg:gap-3"
    >
      <div className="flex items-center justify-between md:justify-start gap-2">
        <Button
          aria-label="Previous page"
          disabled={disabled || page <= 1}
          onClick={() => onPageChange(page - 1)}
          variant="outlined"
        >
          Previous
        </Button>
        <Button
          aria-label="Next page"
          disabled={disabled || page >= totalPages}
          onClick={() => onPageChange(page + 1)}
          variant="outlined"
        >
          Next
        </Button>
      </div>
      <div className="flex items-center justify-between gap-3 p-1 lg:contents">
        <Text variant="mono">
          Page {page} of {totalPages}
        </Text>
        <span className="font-mono text-xs text-zinc-500">
          Showing <PageSizePopover onChange={onPageSizeChange} value={pageSize} /> of {total} result
          {total === 1 ? '' : 's'}
        </span>
      </div>
    </nav>
  )
