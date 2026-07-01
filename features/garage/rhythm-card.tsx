'use client'

import Link from 'next/link'

import { RhythmMetadataView } from '@/features/rhythm/rhythm-metadata-view'
import type { RhythmCard } from '@/features/rhythm/rhythm.types'
import { cn } from '@/features/theme/cn'

type RhythmCardProps = {
  card: RhythmCard
  className?: string
}

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
      'rounded-xl border border-zinc-200 bg-white transition-colors hover:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-900/60',
      className,
    )}
  >
    <Link
      className="flex h-full flex-col p-4"
      href={card.userOwned ? `/player?rhythm=${card.slug}` : `/rhythm/${card.slug}`}
    >
      <RhythmMetadataView
        card={card}
        leading={card.userOwned ? <MyRhythmBadge /> : undefined}
        titleAs="h2"
      />
    </Link>
  </div>
)
