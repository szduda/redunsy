'use client'

import Link from 'next/link'

import { RhythmEditorButton } from '@/features/rhythm/rhythm-editor-button'
import type { RhythmCard } from '@/features/rhythm/rhythm.types'
import { Text } from '@/features/theme/text'
import { cn } from '@/features/theme/cn'

type RhythmCardProps = {
  card: RhythmCard
  className?: string
}

const barsOnMeterLabel = (bars: number, meter: RhythmCard['meter']) =>
  `${bars} bars on ${meter}`

const MyRhythmBadge = () => (
  <span
    aria-hidden
    className="flex size-5 shrink-0 items-center justify-center rounded-full bg-greeny text-[9px] font-black tracking-widest text-white"
  >
    My
  </span>
)

export const RhythmCardView = ({ card, className }: RhythmCardProps) => (
  <div
    className={cn(
      'relative rounded-xl border border-zinc-200 bg-white transition-colors hover:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-900/60',
      className,
    )}
  >
    <Link
      className="flex flex-col h-full p-4"
      href={`/player?rhythm=${card.slug}`}
    >
      <div className="flex items-center gap-1.5 pr-10">
        {card.userOwned ? <MyRhythmBadge /> : null}
        <span className="font-mono text-xs text-zinc-500">
          {barsOnMeterLabel(card.longestTrack, card.meter)}
        </span>
      </div>

      <h2 className="mt-1 pr-10 text-lg font-semibold text-zinc-900 dark:text-zinc-100">
        {card.title}
      </h2>

      <Text className="mt-1">
        {card.author}
        {card.origin.length ? ` · ${card.origin.join(' · ')}` : ''}
      </Text>

      <Text className="mt-2" variant="mono">
        {card.instruments.join(' · ')}
      </Text>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {card.tags.map((tag) => (
          <span
            key={tag}
            className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"
          >
            {tag}
          </span>
        ))}
      </div>
    </Link>

    <div className="absolute top-2 right-2">
      <RhythmEditorButton slug={card.slug} userOwned={card.userOwned} />
    </div>
  </div>
)
