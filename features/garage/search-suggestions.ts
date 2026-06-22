import Fuse, { type IFuseOptions } from 'fuse.js'

import { listAllRhythmCards } from '@/features/garage/search-snippets'
import type { RhythmCard } from '@/features/rhythm/rhythm.types'

const MIN_QUERY_LENGTH = 3
const MAX_SUGGESTIONS = 8

const FUSE_SUGGESTION_OPTIONS: IFuseOptions<string> = {
  threshold: 0.3,
  ignoreLocation: true,
  includeScore: true,
  minMatchCharLength: MIN_QUERY_LENGTH,
}

const addTerm = (terms: Map<string, string>, value: string) => {
  const trimmed = value.trim()
  if (!trimmed) return
  const key = trimmed.toLowerCase()
  if (!terms.has(key)) terms.set(key, trimmed)
}

const addWords = (terms: Map<string, string>, text: string) => {
  for (const word of text.split(/[^a-zA-Z0-9]+/)) {
    if (word.length >= MIN_QUERY_LENGTH) addTerm(terms, word)
  }
}

const vocabularyFromCard = (terms: Map<string, string>, card: RhythmCard) => {
  addTerm(terms, card.title)
  addWords(terms, card.title)
  addWords(terms, card.description)
  card.author.forEach((value) => addTerm(terms, value))
  card.origin.forEach((value) => addTerm(terms, value))
  card.tags.forEach((value) => addTerm(terms, value))
  card.rhythmGroup.forEach((value) => addTerm(terms, value))
  card.instruments.forEach((value) => addTerm(terms, value))
}

const buildSearchVocabulary = () => {
  const terms = new Map<string, string>()
  listAllRhythmCards().forEach((card) => vocabularyFromCard(terms, card))
  return [...terms.values()]
}

export const suggestSearchTerms = (query: string): string[] => {
  const trimmed = query.trim()
  if (trimmed.length < MIN_QUERY_LENGTH) return []

  const fuse = new Fuse(buildSearchVocabulary(), FUSE_SUGGESTION_OPTIONS)
  return fuse.search(trimmed, { limit: MAX_SUGGESTIONS }).map(({ item }) => item)
}
