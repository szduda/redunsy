import { NoteGlyphIcon } from '@/features/editor/note-glyph-icon'
import { DemoBar } from '@/features/help/demo-bar'
import { HelpBarBeatsDemo } from '@/features/help/help-bar-beats-demo'
import { HelpTopicIcon, HelpTopicIcons } from '@/features/help/help-topic-icon'
import type { HelpTopic, HelpTopicDemoBar } from '@/features/help/help.types'
import { Text } from '@/features/theme/text'
import { cn } from '@/features/theme/cn'

type HelpTopicRowProps = {
  topic: HelpTopic
}

const topicRowClass = 'border-b border-zinc-200/80 py-6 last:border-b-0 dark:border-zinc-800/80'

const hasIconsColumn = (topic: HelpTopic) =>
  Boolean(topic.icons?.length || topic.icon || topic.glyphs?.length)

const HelpTopicIconsColumn = ({ topic }: { topic: HelpTopic }) => (
  <div className="flex flex-col items-center justify-center gap-3 pt-0.5">
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

const HelpTopicDemoBar = ({ demoBar }: { demoBar: HelpTopicDemoBar }) => (
  <div className="mt-3">
    <DemoBar instrument={demoBar.instrument} meter={demoBar.meter} pattern={demoBar.pattern} />
  </div>
)

const HelpTopicContent = ({ topic }: { topic: HelpTopic }) => (
  <div className="min-w-0 space-y-1">
    <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">{topic.title}</h3>
    <Text className="text-pretty leading-relaxed">{topic.description}</Text>
    {topic.demo ? <HelpTopicDemo demo={topic.demo} /> : null}
    {topic.demoBar ? <HelpTopicDemoBar demoBar={topic.demoBar} /> : null}
    {topic.extra}
  </div>
)

const HelpTopicHeader = ({ topic }: { topic: HelpTopic }) => (
  <div className="min-w-0 space-y-1">
    <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">{topic.title}</h3>
    <Text className="text-pretty leading-relaxed">{topic.description}</Text>
  </div>
)

export const HelpTopicRow = ({ topic }: HelpTopicRowProps) => {
  if (topic.subitems?.length) {
    return (
      <>
        <article className={topicRowClass}>
          <HelpTopicHeader topic={topic} />
        </article>
        {topic.subitems.map((subitem) => (
          <HelpTopicRow key={subitem.title} topic={subitem} />
        ))}
      </>
    )
  }

  if (!hasIconsColumn(topic)) {
    return (
      <article className={topicRowClass}>
        <HelpTopicContent topic={topic} />
      </article>
    )
  }

  return (
    <article
      className={cn('grid grid-cols-[minmax(0,1fr)_minmax(0,3fr)] gap-x-6 gap-y-2', topicRowClass)}
    >
      <HelpTopicIconsColumn topic={topic} />
      <HelpTopicContent topic={topic} />
    </article>
  )
}
