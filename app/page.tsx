import { GroovyPlayer } from '@/features/groovy-player/groovy-player'

export const dynamic = 'force-static'

const Home = () => (
  <main className="flex flex-1 items-center justify-center p-6">
    <GroovyPlayer />
  </main>
)

export default Home
