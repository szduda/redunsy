import { decompressFromEncodedURIComponent } from 'lz-string'

/** Partial playground payload as encoded in dunsy `?q=` URLs (lz-string + JSON). */
export type PlaygroundSnippet = {
  swing?: string
  tempo?: string
  signal?: string
  beatSize?: number
  patterns?: Record<string, string>
  volumes?: Record<string, number>
}

const formValidRegexp =
  /swing|beatSize|tempo|signal|patterns|volumes|dundunba|sangban|kenkeni2?|bell|djembe|"[btsfrxo-]+"|"\d{1,3}"|[<>-]{1,3}|[:,"{}\d\.]/g

const validateUrlSeed = (decodedString: string) =>
  decodedString.replaceAll(formValidRegexp, '').length === 0

/** Decode a playground `q` param the same way dunsy `usePlayground` does. */
export const decodePlaygroundQuery = (encoded: string): PlaygroundSnippet => {
  const decodedString = decompressFromEncodedURIComponent(encoded)
  if (!decodedString || !validateUrlSeed(decodedString)) {
    throw new Error('Invalid or corrupt playground query payload')
  }
  return JSON.parse(decodedString) as PlaygroundSnippet
}

export const playgroundQueryFromUrl = (url: string): string | null => {
  const normalized = url.startsWith('http') ? url : `https://${url}`
  try {
    const parsed = new URL(normalized)
    return parsed.searchParams.get('q')
  } catch {
    return null
  }
}
