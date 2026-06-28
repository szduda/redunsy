import { playgroundQueryFromUrl } from './playground-decode'

type TextEntity = { type: string; text: string }

type TelegramMessage = {
  id: number
  date: string
  text?: string | Array<string | TextEntity>
  text_entities?: TextEntity[]
}

export type TelegramExport = {
  messages: TelegramMessage[]
}

export type ParsedTelegramRhythm = {
  messageId: number
  date: string
  title: string
  url: string
  query: string
}

const DUNSY_HOST = /(?:^|\/\/)(?:[\w-]+\.)?(dunsy(?:-git-[\w-]+-szd)?\.vercel\.app|dunsy\.app)/i

const flattenText = (text: TelegramMessage['text']): string => {
  if (!text) return ''
  if (typeof text === 'string') return text
  return text.map((part) => (typeof part === 'string' ? part : part.text)).join('')
}

const isDunsyPlaygroundUrl = (url: string) =>
  DUNSY_HOST.test(url) && url.includes('/playground') && url.includes('q=')

const titleFromMessage = (message: TelegramMessage, url: string): string => {
  const raw = flattenText(message.text).replace(url, '')
  const withoutUrls = raw.replace(/https?:\/\/\S+/gi, '').replace(/dunsy\.app\S+/gi, '')
  return withoutUrls.replace(/\s+/g, ' ').trim()
}

const pickBetterTitle = (current: string, candidate: string) => {
  if (!current) return candidate
  if (!candidate) return current
  return candidate.length > current.length ? candidate : current
}

/** Extract unique playground links with titles from a Telegram export. */
export const parseTelegramExport = (data: TelegramExport): ParsedTelegramRhythm[] => {
  const byQuery = new Map<string, ParsedTelegramRhythm>()

  for (const message of data.messages) {
    const parts = flattenText(message.text)
    const urls = [
      ...parts.matchAll(
        /(?:https?:\/\/)?(?:[\w-]+\.)?(?:dunsy(?:-git-[\w-]+-szd)?\.vercel\.app|dunsy\.app)\/playground\?[^\s]+/gi,
      ),
    ].map((match) => match[0])

    for (const url of urls) {
      if (!isDunsyPlaygroundUrl(url)) continue
      const query = playgroundQueryFromUrl(url)
      if (!query) continue

      const title = titleFromMessage(message, url)
      const existing = byQuery.get(query)

      if (!existing) {
        byQuery.set(query, {
          messageId: message.id,
          date: message.date,
          title: title || `Untitled ${message.date.slice(0, 10)}`,
          url: url.startsWith('http') ? url : `https://${url}`,
          query,
        })
        continue
      }

      byQuery.set(query, {
        ...existing,
        title: pickBetterTitle(existing.title.startsWith('Untitled') ? '' : existing.title, title),
        messageId: message.id,
        date: message.date,
        url: url.startsWith('http') ? url : `https://${url}`,
      })
    }
  }

  return [...byQuery.values()].sort((a, b) => a.date.localeCompare(b.date))
}
