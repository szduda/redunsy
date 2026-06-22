import 'server-only'

/**
 * Server-only entrypoint for rhythm data access. Importing this from any client
 * module is a build error, which guarantees the browser never reaches Postgres.
 * App code (Server Components, `generateStaticParams`) imports from here;
 * build scripts import `@/db/queries` directly.
 */
export { getRhythmCardIndex, getPublishedSlugs, getRhythmDetail } from '@/db/queries'
export type { RhythmDetail } from '@/db/mappers'
