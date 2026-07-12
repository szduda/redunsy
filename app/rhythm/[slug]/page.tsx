import { Suspense } from 'react'
import { notFound } from 'next/navigation'

import { detailToRhythm } from '@/db/mappers'
import { getPublishedSlugs, getRhythmDetail } from '@/db/rhythms'
import { GroovyPlayer } from '@/features/groovy-player/groovy-player'
import { RhythmMetadataView } from '@/features/rhythm/rhythm-metadata-view'

export const dynamic = 'force-static'
export const dynamicParams = true

export const generateStaticParams = async () => {
  const slugs = await getPublishedSlugs()
  return slugs.map((slug) => ({ slug }))
}

type RhythmPageProps = {
  params: Promise<{ slug: string }>
}

export const generateMetadata = async ({ params }: RhythmPageProps) => {
  const { slug } = await params
  const detail = await getRhythmDetail(slug)
  if (!detail) return {}
  return {
    title: `${detail.title} · Redunsy`,
    description: detail.description || `${detail.title} — West African drum rhythm.`,
  }
}

const RhythmPage = async ({ params }: RhythmPageProps) => {
  const { slug } = await params
  const detail = await getRhythmDetail(slug)
  if (!detail) notFound()

  const rhythm = detailToRhythm(detail)

  return (
    <main className="flex flex-1 flex-col lg:pb-4 xl:pb-6">
      <div className="mx-auto mb-3 w-full max-w-4xl px-4 lg:pt-4 xl:px-4 xl:pt-6">
        <RhythmMetadataView card={detail} showDescription />
      </div>
      <Suspense>
        <GroovyPlayer hideHeader rhythm={rhythm} />
      </Suspense>
    </main>
  )
}

export default RhythmPage
