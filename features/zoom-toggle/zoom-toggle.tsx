'use client'

import { ColumnsIcon } from '@/features/icons/columns-icon'
import { cn } from '@/features/theme/cn'
import { usePlayerStore } from '@/features/groovy-player/player.store'

const navItemClass =
  'flex flex-col items-center gap-1 px-4 py-2 text-zinc-600 transition-colors hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100'

export const ZoomToggle = () => {
  const barsPerRow = usePlayerStore((state) => state.barsPerRow)
  const nextZoom = usePlayerStore((state) => state.nextZoom)
  const prevZoom = usePlayerStore((state) => state.prevZoom)

  return (
    <button
      className={cn(navItemClass, 'cursor-pointer')}
      onClick={() => nextZoom()}
      onContextMenu={(event) => {
        event.preventDefault()
        prevZoom()
      }}
      type="button"
    >
      <ColumnsIcon />
      <span className="text-[10px] font-medium uppercase tracking-wide">
        {barsPerRow} col{barsPerRow === 1 ? '' : 's'}
      </span>
    </button>
  )
}
