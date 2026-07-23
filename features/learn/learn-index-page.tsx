'use client'

import Link from 'next/link'

import { LEARN_ARTICLES } from '@/features/learn/learn-catalog'
import { LearnShell } from '@/features/learn/learn-shell'
import { Text } from '@/features/theme/text'
import { cn } from '@/features/theme/cn'
import { KEYBOARD_FOCUS_VISIBLE_CLASS } from '@/features/theme/keyboard-focus'

export const LearnIndexPage = () => (
  <LearnShell>
    <header className="mb-10 space-y-4 border-b border-zinc-200 pb-8 dark:border-zinc-800">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">Learn</p>
      <h1 className="text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
        Knowledge base
      </h1>
      <Text className="max-w-2xl text-pretty text-base leading-relaxed text-zinc-700 dark:text-zinc-300">
        Articles, lessons, and notes on West African drumming, rhythm, and how dunsy.app relates to
        real ensemble practice. Start with swing timing — the first published piece in this base.
      </Text>
    </header>

    <ul className="flex flex-col gap-6">
      {LEARN_ARTICLES.map((article) => (
        <li key={article.slug}>
          <Link
            className={cn(
              KEYBOARD_FOCUS_VISIBLE_CLASS,
              'group block space-y-2 rounded-md outline-offset-4 transition-colors',
            )}
            href={article.href}
          >
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">
              {article.tags.join(' · ')}
            </p>
            <h2 className="text-xl font-semibold tracking-tight text-zinc-900 group-hover:text-zinc-700 dark:text-zinc-100 dark:group-hover:text-zinc-300">
              {article.title}
            </h2>
            <Text className="max-w-2xl text-pretty leading-relaxed">{article.summary}</Text>
          </Link>
        </li>
      ))}
    </ul>
  </LearnShell>
)
