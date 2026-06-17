import { Button } from '@/features/theme/button'

export const dynamic = 'force-static'

const Home = () => (
  <main className="flex flex-1 flex-col items-center justify-center gap-4 p-6">
    <Button href="/player" link>
      Player
    </Button>
    <Button href="/raw" link>
      Raw Text
    </Button>
  </main>
)

export default Home
