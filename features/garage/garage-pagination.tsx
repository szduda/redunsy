'use client'

import { useEffect, useRef, useState } from 'react'

import { PAGE_SIZE_OPTIONS, type PageSizeOption } from '@/features/garage/pagination.store'
import { Button } from '@/features/theme/button'
import { Text } from '@/features/theme/text'
import { cn } from '@/features/theme/cn'

type PageSizePopoverProps = {
  value: PageSizeOption
  onChange: (value: PageSizeOption) => void
}

const PageSizePopover = ({ value, onChange }: PageSizePopoverProps) => {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    if (!open) return
    const onPointerDown = (event: PointerEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) setOpen(false)
    }
    document.addEventListener('pointerdown', onPointerDown)
    return () => document.removeEventListener('pointerdown', onPointerDown)
  }, [open])

  return (
    <span ref={ref} className="relative inline-block">
      <button
        aria-expanded={open}
        aria-haspopup="listbox"
        className="inline-flex items-center gap-1 rounded-md border border-zinc-300 bg-transparent px-2 py-0.5 font-mono text-xs text-zinc-900 hover:border-zinc-400 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-100 dark:hover:border-zinc-500 dark:hover:bg-zinc-900/50"
        onClick={() => setOpen((v) => !v)}
        type="button"
      >
        {value}
        <span aria-hidden className="text-[10px]">
          ▾
        </span>
      </button>
      {open ? (
        <ul
          aria-label="Page size"
          className="absolute left-0 top-full z-20 mt-1 min-w-full rounded-md border border-zinc-200 bg-white py-1 shadow-md dark:border-zinc-800 dark:bg-zinc-950"
          role="listbox"
        >
          {PAGE_SIZE_OPTIONS.map((option) => (
            <li key={option} role="option" aria-selected={option === value}>
              <button
                className={cn(
                  'w-full px-3 py-1 text-left font-mono text-xs',
                  option === value
                    ? 'bg-zinc-100 font-semibold text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100'
                    : 'text-zinc-700 hover:bg-zinc-50 dark:text-zinc-300 dark:hover:bg-zinc-900',
                )}
                onClick={() => {
                  onChange(option)
                  setOpen(false)
                }}
                type="button"
              >
                {option}
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </span>
  )
}

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
