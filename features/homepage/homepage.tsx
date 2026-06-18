'use client'

import { HomepageSearch } from '@/features/homepage/homepage-search'
import { Logo } from '@/features/logo/logo'
import { Button } from '@/features/theme/button'
import { Text } from '@/features/theme/text'

const sectionHeadingClass =
  'text-xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100'

const introClass =
  'text-pretty text-lg leading-[1.85] tracking-[0.02em] text-zinc-700 md:text-xl md:leading-8 md:tracking-[0.03em] dark:text-zinc-300'

export const Homepage = () => (
  <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-10 px-6 py-8 md:gap-12 md:py-12">
    <section className="flex min-h-32 justify-center self-center pt-14">
      <Logo onPage />
    </section>

    <Text className={introClass}>
      Dunsy is a digital library of west african rhythms with an integrated audio player tuned to the
      energizing groove of Burkina Faso, Gambia, Guinea, Ivory Coast, Mali or Senegal. <br/><br/>The pile of pages
      containing djembe &amp; dundun material keeps growing, but don&apos;t wait for the next batch -
      instead explore the rhythm editor and write your own stories in the most beautiful human language -
      music.
    </Text>

    <section className="flex flex-col gap-3">
      <h2 className={sectionHeadingClass}>Browse the garage of grooves</h2>
      <HomepageSearch />
    </section>

    <section className="flex flex-col gap-3">
      <h2 className={sectionHeadingClass}>Got your own inspiration?</h2>
      <Button href="/editor" variant="primary">
        Explore it with the editor
      </Button>
    </section>
  </main>
)
