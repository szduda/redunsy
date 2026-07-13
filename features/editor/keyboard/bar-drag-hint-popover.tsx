'use client'

import { Popover, popoverTriggerOpenClass } from '@/features/groovy-player/popover'
import { cn } from '@/features/theme/cn'
import { Text } from '@/features/theme/text'

export const BAR_DRAG_HINT = 'Drag & drop bars to reposition'

export const BarDragHintPopover = () => (
  <Popover
    panel={
      <div className="flex w-64 flex-col gap-2.5 sm:w-72">
        <Text className="text-pretty text-xs leading-relaxed text-zinc-700 dark:text-zinc-300">
          In <strong className="font-semibold">bar</strong> mode, click and hold a bar on the
          canvas, then drag it left or right to reorder. A ghost bar follows your cursor; release to
          drop at the new position.
        </Text>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          alt="Screen recording of dragging a bar to a new position in bar mode, with the cursor visible"
          className="w-full rounded-md border border-zinc-200 dark:border-zinc-700"
          height={180}
          src="/images/bar-drag-demo.gif"
          width={288}
        />
      </div>
    }
    panelClassName="w-auto max-w-[calc(100vw-1rem)]"
    preferredDirection="top"
    rootClassName="absolute bottom-full left-1/2 z-50 m-1 hidden -translate-x-1/2 md:block"
  >
    {({ open, toggle }) => (
      <button
        className={cn(
          'rounded-md bg-yellowy-light/10 px-2 py-1.5 text-sm text-zinc-500 transition-colors hover:bg-yellowy-light/20 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200',
          open && popoverTriggerOpenClass,
        )}
        onClick={toggle}
        type="button"
      >
        {BAR_DRAG_HINT}
      </button>
    )}
  </Popover>
)
