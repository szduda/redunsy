import { Suspense } from 'react'

import { SharedRhythmImportView } from '@/features/share-rhythm/import/shared-rhythm-import-view'

const ShareImportPage = () => (
  <main className="flex flex-1 justify-center pb-12 lg:pb-16">
    <Suspense>
      <SharedRhythmImportView />
    </Suspense>
  </main>
)

export default ShareImportPage
