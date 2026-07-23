import type { ReactNode } from 'react'

import { SwingPatternInput } from '@/features/groovy-player/swing-pattern-input'

/** Embed swing patterns in copy as `⟦->)⟧` (stored groove chars). */
const PATTERN_TOKEN = /⟦([^⟧]*)⟧/g

type SwingRichTextProps = {
  text: string
  className?: string
}

const parseSwingRichText = (text: string) => {
  const nodes: ReactNode[] = []
  let lastIndex = 0
  let key = 0

  for (const match of text.matchAll(PATTERN_TOKEN)) {
    const index = match.index ?? 0
    if (index > lastIndex) nodes.push(text.slice(lastIndex, index))
    nodes.push(
      <SwingPatternInput className="mx-0.5" inline key={`swing-${key}`} value={match[1] ?? ''} />,
    )
    key += 1
    lastIndex = index + match[0].length
  }

  if (lastIndex < text.length) nodes.push(text.slice(lastIndex))
  return nodes
}

export const SwingRichText = ({ text, className }: SwingRichTextProps) => {
  const nodes = parseSwingRichText(text)
  if (className) return <span className={className}>{nodes}</span>
  return <>{nodes}</>
}
