import { GroovyPlayer } from '@/features/groovy-player/groovy-player'

export const dynamic = 'force-static'

const PlayerPage = () => (
  <main className="flex flex-1 justify-center lg:p-4 xl:p-6">
    <GroovyPlayer />
  </main>
)

export default PlayerPage
