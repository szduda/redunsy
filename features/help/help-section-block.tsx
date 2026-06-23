import { HelpContent, HelpTile } from '@/features/help/help-tile'
import { HelpTopicRow } from '@/features/help/help-topic-row'
import type { HelpSection } from '@/features/help/help.types'
import { Text } from '@/features/theme/text'
import { cn } from '@/features/theme/cn'

type HelpSectionBlockProps = {
  section: HelpSection
}

const sectionBodyClass = 'scroll-mt-24 py-8'

const HelpSectionBody = ({ section, className }: { section: HelpSection; className?: string }) => (
  <section aria-labelledby={`help-${section.id}`} className={cn(sectionBodyClass, className)}>
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

const HelpWebsiteSection = ({ section }: HelpSectionBlockProps) => {
  const plainTopics = section.topics.filter((topic) => !topic.tileBg)
  const tiledTopics = section.topics.filter((topic) => topic.tileBg)

  return (
    <>
      <HelpContent>
        <h2
          className="mb-4 text-xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100"
          id={`help-${section.id}`}
        >
          {section.title}
        </h2>
        {plainTopics.map((topic) => (
          <HelpTopicRow key={topic.title} topic={topic} />
        ))}
      </HelpContent>
      {tiledTopics.map((topic) => (
        <HelpTile key={topic.title} className={topic.tileBg}>
          <HelpTopicRow topic={topic} />
        </HelpTile>
      ))}
    </>
  )
}

export const HelpSectionBlock = ({ section }: HelpSectionBlockProps) => {
  if (section.id === 'website') return <HelpWebsiteSection section={section} />

  if (section.tileBg) {
    return (
      <HelpTile className={section.tileBg}>
        <HelpSectionBody section={section} />
      </HelpTile>
    )
  }

  return (
    <HelpContent>
      <HelpSectionBody section={section} />
    </HelpContent>
  )
}
