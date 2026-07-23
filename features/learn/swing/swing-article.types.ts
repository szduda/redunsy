export type SwingLocale = 'en' | 'pl'

export type SwingTableRow = {
  label: string
  percent: string
  note: string
  /** Polak reference row — rendered with emphasis. */
  highlight?: boolean
}

export type SwingTable = {
  id: string
  title: string
  caption: string
  /** First header is intentionally blank (pattern / source column). */
  headers: [string, string, string]
  rows: SwingTableRow[]
}

export type SwingSection = {
  id: string
  title: string
  paragraphs: string[]
}

export type SwingArticleCopy = {
  locale: SwingLocale
  eyebrow: string
  title: string
  lead: string[]
  sourceLabel: string
  sourceHref: string
  sourceText: string
  languagePanel: {
    message: string
    action: string
    targetLocale: SwingLocale
  }
  sections: SwingSection[]
  symbolMapTitle: string
  symbolMapCaption: string
  symbolMapHeaders: [string, string]
  symbolMapRows: [string, string][]
  tables: SwingTable[]
  closingTitle: string
  closingParagraphs: string[]
  /** Optional tonal aside after the closing section — used for the Polish edition's parting joke. */
  closingJoke?: string
}
