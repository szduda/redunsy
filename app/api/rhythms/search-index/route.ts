import { getCachedRhythmSearchIndex } from '@/features/garage/rhythm-search-index-cache'

export const GET = async () => {
  try {
    const cards = await getCachedRhythmSearchIndex()
    return Response.json(cards)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to load search index'
    return Response.json({ error: message }, { status: 500 })
  }
}
