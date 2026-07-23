import Link from 'next/link'

import { SwingPatternInput } from '@/features/groovy-player/swing-pattern-input'
import type { SwingArticleCopy } from '@/features/learn/swing/swing-article.types'
import { SwingRatioTable } from '@/features/learn/swing/swing-ratio-table'
import { SwingRichText } from '@/features/learn/swing/swing-rich-text'
import { Button } from '@/features/theme/button'
import { Text } from '@/features/theme/text'
import { cn } from '@/features/theme/cn'
import { KEYBOARD_FOCUS_VISIBLE_CLASS } from '@/features/theme/keyboard-focus'

type SwingArticleBodyProps = {
  copy: SwingArticleCopy
}

const backLabel = {
  en: '← All learn articles',
  pl: '← Wszystkie artykuły Learn',
} as const

export const SwingArticleBody = ({ copy }: SwingArticleBodyProps) => (
  <article className="space-y-10" lang={copy.locale}>
    <header className="space-y-4 border-b border-zinc-200 pb-8 dark:border-zinc-800">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">
        {copy.eyebrow}
      </p>
      <h1 className="text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
        {copy.title}
      </h1>
      {copy.lead.map((paragraph) => (
        <Text
          className="max-w-2xl text-pretty text-base leading-relaxed text-zinc-700 dark:text-zinc-300"
          key={paragraph.slice(0, 48)}
        >
          <SwingRichText text={paragraph} />
        </Text>
      ))}
      <Text className="text-pretty leading-relaxed">
        {copy.sourceLabel}:{' '}
        <Button className="text-black dark:text-white" href={copy.sourceHref} link targetBlank>
          {copy.sourceText}
        </Button>
      </Text>
    </header>

    {copy.sections.map((section) => (
      <section aria-labelledby={section.id} className="space-y-3" key={section.id}>
        <h2
          className="text-xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100"
          id={section.id}
        >
          {section.title}
        </h2>
        {section.paragraphs.map((paragraph) => (
          <Text className="text-pretty leading-relaxed" key={paragraph.slice(0, 48)}>
            <SwingRichText text={paragraph} />
          </Text>
        ))}
      </section>
    ))}

    <section aria-labelledby="symbol-map" className="space-y-3">
      <h2
        className="text-xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100"
        id="symbol-map"
      >
        {copy.symbolMapTitle}
      </h2>
      <Text className="text-pretty leading-relaxed">
        <SwingRichText text={copy.symbolMapCaption} />
      </Text>
      <div className="overflow-x-auto rounded-md border border-zinc-200 dark:border-zinc-800">
        <table className="min-w-full border-collapse text-left text-sm">
          <thead className="bg-zinc-50 dark:bg-zinc-900/60">
            <tr>
              {copy.symbolMapHeaders.map((header) => (
                <th
                  className="border-b border-zinc-200 px-3 py-2 font-semibold text-zinc-700 dark:border-zinc-800 dark:text-zinc-300"
                  key={header}
                  scope="col"
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {copy.symbolMapRows.map(([symbol, offset]) => (
              <tr key={`${symbol}-${offset}`}>
                <td className="border-b border-zinc-200 px-3 py-2 dark:border-zinc-800">
                  <SwingPatternInput inline value={symbol} />
                </td>
                <td className="border-b border-zinc-200 px-3 py-2 font-mono text-xs text-zinc-700 dark:border-zinc-800 dark:text-zinc-300">
                  {offset}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>

    <div className="space-y-10">
      {copy.tables.map((table) => (
        <SwingRatioTable key={table.id} table={table} />
      ))}
    </div>

    <section aria-labelledby="closing" className="space-y-3">
      <h2
        className="text-xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100"
        id="closing"
      >
        {copy.closingTitle}
      </h2>
      {copy.closingParagraphs.map((paragraph) => (
        <Text className="text-pretty leading-relaxed" key={paragraph.slice(0, 48)}>
          <SwingRichText text={paragraph} />
        </Text>
      ))}
      {copy.closingJoke ? (
        <Text className="text-pretty leading-relaxed italic text-zinc-500 dark:text-zinc-400">
          <SwingRichText text={copy.closingJoke} />
        </Text>
      ) : null}
    </section>

    <p>
      <Link
        className={cn(
          KEYBOARD_FOCUS_VISIBLE_CLASS,
          'text-sm font-medium text-zinc-600 underline-offset-4 hover:text-zinc-900 hover:underline dark:text-zinc-400 dark:hover:text-zinc-100',
        )}
        href="/learn"
      >
        {backLabel[copy.locale]}
      </Link>
    </p>
  </article>
)
