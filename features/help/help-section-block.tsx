import { HelpTopicRow } from '@/features/help/help-topic-row'
import type { HelpSection } from '@/features/help/help.types'
import { Text } from '@/features/theme/text'

type HelpSectionBlockProps = {
  section: HelpSection
}

export const HelpSectionBlock = ({ section }: HelpSectionBlockProps) => (
  <section aria-labelledby={`help-${section.id}`} className="scroll-mt-24">
    <h2
      className="mb-1 text-xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100"
      id={`help-${section.id}`}
    >
      {section.title}
    </h2>
    {section.intro ? (
      <Text className="mb-4 max-w-2xl text-pretty leading-relaxed">{section.intro}</Text>
    ) : null}
    <div>
      {section.topics.map((topic) => (
        <HelpTopicRow key={topic.title} topic={topic} />
      ))}
    </div>
  </section>
)
