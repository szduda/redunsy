import { TextGroovyPlayer } from '@/features/text-groovy-player/text-groovy-player'

export const dynamic = 'force-static'

const RawPage = () => (
  <main className="flex flex-1 items-center justify-center p-6">
    <TextGroovyPlayer />
  </main>
)

export default RawPage
