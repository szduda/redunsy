import { Suspense } from 'react'

import { EditorPage } from '@/features/editor/editor-page'

export const dynamic = 'force-static'

const Page = () => (
  <main className="flex flex-1 flex-col">
    <Suspense>
      <EditorPage />
    </Suspense>
  </main>
)

export default Page
