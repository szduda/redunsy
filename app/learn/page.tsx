import { LearnIndexPage } from '@/features/learn/learn-index-page'

export const dynamic = 'force-static'

export const metadata = {
  title: 'Learn | dunsy.app',
  description:
    'Knowledge base for West African drumming, rhythm, and how dunsy.app relates to ensemble practice.',
}

const LearnRoute = () => <LearnIndexPage />

export default LearnRoute
