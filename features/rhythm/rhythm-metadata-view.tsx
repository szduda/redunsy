import type { ReactNode } from 'react'

import type { RhythmCard } from '@/features/rhythm/rhythm.types'
import { SHARED_WITH_ME_TAG } from '@/features/share-rhythm/shared/share-limits'
import { Text } from '@/features/theme/text'
import { cn } from '@/features/theme/cn'

export const barsOnMeterLabel = (bars: number, meter: RhythmCard['meter']) =>
  `${bars} bars on ${meter}`

export const capitalize = (value: string) =>
  value.length ? value[0].toUpperCase() + value.slice(1) : value

export const rhythmTagChipClass = (tag: string) =>
  cn(
    'rounded-full px-2 py-0.5 text-xs',
    tag === SHARED_WITH_ME_TAG
      ? 'bg-yellowy-light/50 text-zinc-700 dark:text-zinc-300'
      : 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400',
  )

/** Shared-with-me first, then rhythm groups, then remaining tags. */
export const rhythmTags = (card: Pick<RhythmCard, 'rhythmGroup' | 'tags'>) => {
  const group = card.rhythmGroup ?? []
  const tags = (card.tags ?? []).filter((tag) => !group.includes(tag))
  const shared = tags.filter((tag) => tag === SHARED_WITH_ME_TAG)
  const rest = tags.filter((tag) => tag !== SHARED_WITH_ME_TAG)
  return [...shared, ...group, ...rest]
}

type RhythmMetadataViewProps = {
  card: RhythmCard
  className?: string
  showDescription?: boolean
  titleAs?: 'h1' | 'h2'
  leading?: ReactNode
}

export const RhythmMetadataView = ({
  card,
  className,
  showDescription = false,
  titleAs: Title = 'h1',
  leading,
}: RhythmMetadataViewProps) => {
  const credits = [...(card.author ?? []), ...(card.origin ?? []).map(capitalize)]
  const tags = rhythmTags(card)

  return (
    <div className={cn('flex flex-col', className)}>
      <div className="flex items-center gap-1.5">
        {leading}
        <span className="font-mono text-xs text-zinc-500">
          {barsOnMeterLabel(card.longestTrack, card.meter)}
        </span>
      </div>

      <Title className="mt-1 text-lg font-semibold text-zinc-900 dark:text-zinc-100">
        {card.title}
      </Title>

      {showDescription && card.description.trim() ? (
        <Text className="mt-1">{card.description.trim()}</Text>
      ) : null}

      {credits.length ? <Text className="mt-1">{credits.join(' · ')}</Text> : null}

      {card.instruments.length ? (
        <Text className="mt-2" variant="mono">
          {card.instruments.join(' · ')}
        </Text>
      ) : null}

      {tags.length ? (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {tags.map((tag) => (
            <span key={tag} className={rhythmTagChipClass(tag)}>
              {tag}
            </span>
          ))}
        </div>
      ) : null}
    </div>
  )
}
