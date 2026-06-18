import Link from 'next/link'

import type { Snippet } from '@/features/garage/snippet.types'
import { Text } from '@/features/theme/text'
import { cn } from '@/features/theme/cn'

type SnippetCardProps = {
  snippet: Snippet
  className?: string
}

export const SnippetCard = ({ snippet, className }: SnippetCardProps) => (
  <Link
    className={cn(
      'block rounded-xl border border-zinc-200 bg-white p-4 transition-colors hover:border-zinc-300 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:border-zinc-700 dark:hover:bg-zinc-900/60',
      className,
    )}
    href={`/player`}
  >
    <div className="flex flex-wrap items-baseline justify-between gap-2">
      <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">{snippet.name}</h2>
      <Text className="!text-zinc-500" variant="mono">
        {snippet.meter}/4 · {snippet.longestTrack} bars
      </Text>
    </div>

    <Text className="mt-1">
      {snippet.artist.join(' · ')} · {snippet.origin.join(' · ')}
    </Text>

    <Text className="mt-2" variant="mono">
      {snippet.instruments.join(' · ')}
    </Text>

    <div className="mt-3 flex flex-wrap gap-1.5">
      {snippet.tags.map((tag) => (
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
