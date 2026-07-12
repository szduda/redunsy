import type { ReactNode } from 'react'

export type HelpIconKey =
  | 'search'
  | 'tag'
  | 'user'
  | 'artist'
  | 'edit'
  | 'fork'
  | 'play'
  | 'pause'
  | 'stop'
  | 'restart'
  | 'tempo'
  | 'djembe'
  | 'shekere'
  | 'pepper'
  | 'speaker'
  | 'collapse'
  | 'settings'
  | 'note16'
  | 'barIndex'
  | 'triplet'
  | 'polyrhythm'
  | 'screenAwake'
  | 'fullBleed'
  | 'columns'
  | 'meter'
  | 'instruments'
  | 'origin'

export type HelpGlyph = {
  instrument: string
  note: string
}

export type HelpTopicDemo = 'bar-beats'

export type HelpTopicDemoBar = {
  meter: 3 | 4
  pattern: string
  instrument?: string
}

export type HelpTopic = {
  title: string
  description: string
  icon?: HelpIconKey
  icons?: HelpIconKey[]
  glyphs?: HelpGlyph[]
  subitems?: HelpTopic[]
  demo?: HelpTopicDemo
  demoBar?: HelpTopicDemoBar
  extra?: ReactNode
  tileBg?: string
}

export type HelpSection = {
  id: string
  title: string
  intro?: string
  topics: HelpTopic[]
  tileBg?: string
}
