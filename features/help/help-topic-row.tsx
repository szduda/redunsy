import { NoteGlyphIcon } from '@/features/editor/note-glyph-icon'
import { HelpBarBeatsDemo } from '@/features/help/help-bar-beats-demo'
import { HelpTopicIcon, HelpTopicIcons } from '@/features/help/help-topic-icon'
import type { HelpTopic } from '@/features/help/help.types'
import { Text } from '@/features/theme/text'
import { cn } from '@/features/theme/cn'

type HelpTopicRowProps = {
  topic: HelpTopic
  nested?: boolean
}

const hasIconsColumn = (topic: HelpTopic) =>
  Boolean(topic.icons?.length || topic.icon || topic.glyphs?.length)

const HelpTopicIconsColumn = ({
  topic,
  compact = false,
}: {
  topic: HelpTopic
  compact?: boolean
}) => (
  <div
    className={cn(
      'flex flex-col items-center justify-center gap-3',
      compact ? 'w-20 shrink-0 lg:w-28' : 'pt-0.5',
    )}
  >
    {topic.icons?.length ? <HelpTopicIcons icons={topic.icons} /> : null}
    {!topic.icons?.length && topic.icon ? <HelpTopicIcon icon={topic.icon} /> : null}
    {topic.glyphs?.length ? (
      <div className="flex flex-col items-center gap-2">
        {topic.glyphs.map((glyph) => (
          <NoteGlyphIcon
            key={`${glyph.instrument}-${glyph.note}`}
            className="size-14 lg:size-20"
            instrument={glyph.instrument}
            note={glyph.note}
          />
        ))}
      </div>
    ) : null}
  </div>
)

const HelpTopicDemo = ({ demo }: { demo: HelpTopic['demo'] }) => {
  if (demo === 'bar-beats') return <HelpBarBeatsDemo />
  return null
}

const HelpTopicContent = ({ topic }: { topic: HelpTopic }) => (
  <div className="min-w-0 space-y-1">
    <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">{topic.title}</h3>
    <Text className="text-pretty leading-relaxed">{topic.description}</Text>
    {topic.demo ? <HelpTopicDemo demo={topic.demo} /> : null}
    {topic.extra}
  </div>
)

const HelpNestedTopicRow = ({ topic }: { topic: HelpTopic }) => (
  <article className="grid grid-cols-[auto_minmax(0,1fr)] items-start gap-x-4 py-3">
    <HelpTopicIconsColumn compact topic={topic} />
    <HelpTopicContent topic={topic} />
  </article>
)

export const HelpTopicRow = ({ topic, nested = false }: HelpTopicRowProps) => {
  if (nested) return <HelpNestedTopicRow topic={topic} />

  if (topic.subitems?.length || !hasIconsColumn(topic)) {
    return (
      <article className="border-b border-zinc-200/80 py-6 last:border-b-0 dark:border-zinc-800/80">
        <HelpTopicContent topic={topic} />
        {topic.subitems?.length ? (
          <div className="mt-4 space-y-1">
            {topic.subitems.map((subitem) => (
              <HelpNestedTopicRow key={subitem.title} topic={subitem} />
            ))}
          </div>
        ) : null}
      </article>
    )
  }

  return (
    <article className="grid grid-cols-[minmax(0,1fr)_minmax(0,3fr)] gap-x-6 gap-y-2 border-b border-zinc-200/80 py-6 last:border-b-0 dark:border-zinc-800/80">
      <HelpTopicIconsColumn topic={topic} />
      <HelpTopicContent topic={topic} />
    </article>
  )
}
