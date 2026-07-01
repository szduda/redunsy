import { getCachedRhythmCardIndex } from '@/lib/cached-rhythm-index'

export const GET = async () => {
  const cards = await getCachedRhythmCardIndex()
  return Response.json(cards)
}
