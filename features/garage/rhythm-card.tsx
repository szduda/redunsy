'use client'

import Link from 'next/link'

import type { RhythmCard } from '@/features/rhythm/rhythm.types'
import { Text } from '@/features/theme/text'
import { cn } from '@/features/theme/cn'

type RhythmCardProps = {
  card: RhythmCard
  className?: string
}

export const RhythmCardView = ({ card, className }: RhythmCardProps) => (
  <Link
    className={cn(
      'block rounded-xl border border-zinc-200 bg-white p-4 transition-colors hover:border-zinc-300 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:border-zinc-700 dark:hover:bg-zinc-900/60',
      className,
    )}
    href={card.userOwned ? `/editor?rhythm=${card.slug}` : `/player`}
  >
    <div className="flex flex-wrap items-baseline justify-between gap-2">
      <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">{card.title}</h2>
      <Text className="!text-zinc-500" variant="mono">
        {card.meter}/4 · {card.longestTrack} bars
        {card.userOwned ? ' · private' : ''}
      </Text>
    </div>

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
)

/** @deprecated Use RhythmCardView */
export const SnippetCard = ({ snippet, className }: { snippet: RhythmCard; className?: string }) => (
  <RhythmCardView card={snippet} className={className} />
)
