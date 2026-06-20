import { Suspense } from 'react'

import { EditorPage } from '@/features/editor/editor-page'

export const dynamic = 'force-static'

const Page = () => (
  <main className="flex flex-1 justify-center p-2 lg:p-4 xl:p-6">
    <Suspense>
      <EditorPage />
    </Suspense>
  </main>
)

export default Page
