import { Suspense } from 'react'

import { EditorPage } from '@/features/editor/editor-page'

type EditorSlugPageProps = {
  params: Promise<{ slug: string }>
}

const Page = async ({ params }: EditorSlugPageProps) => {
  const { slug } = await params

  return (
    <main className="flex flex-1 justify-center lg:p-4 xl:p-6">
      <Suspense>
        <EditorPage slug={slug} />
      </Suspense>
    </main>
  )
}

export default Page
