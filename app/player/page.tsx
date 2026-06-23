import { Suspense } from 'react'

import { GroovyPlayer } from '@/features/groovy-player/groovy-player'

export const dynamic = 'force-static'

const PlayerPage = () => (
  <main className="flex flex-1 justify-center pb-12 lg:pb-16">
    <Suspense>
      <GroovyPlayer />
    </Suspense>
  </main>
)

export default PlayerPage
