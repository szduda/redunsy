export type SwingLocale = 'en' | 'pl'

export type SwingTableRow = {
  label: string
  pattern: string
  onsets: string
  ioi: string
  percent: string
  note: string
}

export type SwingTable = {
  id: string
  title: string
  caption: string
  headers: [string, string, string, string, string, string]
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
  symbolMapHeaders: [string, string, string]
  symbolMapRows: [string, string, string][]
  tables: SwingTable[]
  closingTitle: string
  closingParagraphs: string[]
}
