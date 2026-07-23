export type LearnArticle = {
  slug: string
  href: string
  title: string
  summary: string
  tags: string[]
}

/** Knowledge-base articles in reading order — swing is the first published item. */
export const LEARN_ARTICLES: LearnArticle[] = [
  {
    slug: 'swing',
    href: '/learn/swing',
    title: 'Timing and swing in Mande drumming',
    summary:
      'A research reading of Polak & London (2014) on measured beat subdivisions in Malian drumming, compared with the swing patterns available in dunsy.app.',
    tags: ['research', 'swing', 'meter', 'Mande'],
  },
]
