'use client'

import { HomepageFabricStripe } from '@/features/homepage/homepage-fabric-background'
import { HomepageNav } from '@/features/homepage/homepage-nav'
import { HomepageSearch } from '@/features/homepage/homepage-search'
import { Logo } from '@/features/logo/logo'
import { Button } from '@/features/theme/button'
import { Text } from '@/features/theme/text'
import { cn } from '@/features/theme/cn'

const sectionHeadingClass = 'text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100'

const introClass =
  'text-pretty text-xl leading-8 tracking-[0.02em] text-zinc-700 dark:text-zinc-300 text-justify max-w-xl mb-4'
const bottomTextClass =
  'text-justify max-w-xs text-zinc-700 dark:text-zinc-300 text-lg font-medium leading-6 text-pretty tracking-[0.03em]'

export const HomepageDesktop = () => (
  <div className="hidden min-h-dvh flex-1 md:flex lg:ml-[5%] xl:ml-[10%] 2xl:ml-[15%]">
    <HomepageNav />
    <HomepageFabricStripe />

    <main className="relative z-10 mx-4 my-24 flex min-w-0 max-w-2xl flex-1 flex-col gap-12 px-6 lg:mx-12 xl:mx-24 -translate-x-4 items-center">
      <section className="flex min-h-32 justify-center w-full rounded-4xl py-4">
        <Logo onPage />
      </section>

      <Text className={introClass}>
        <span className="font-bold text-black dark:text-white tracking-wide text-center inline-block w-full py-2">
          Welcome to the digital library of West African Rhythms.
        </span>
        <br />
        You can find here music sheets for djembe &amp; dundun with an integrated audio player tuned
        to the energizing groove of Burkina Faso, Gambia, Guinea, Ivory Coast, Mali or Senegal.
        <br />
        <br />
        Built by a drummer for drummers, it contains material learned from the best djembefolas
        around the world - either from their books, recordings, assisting or attending their
        concerts and classes. I use the knowledge shared here when I play in{' '}
        <Button
          link
          className="saturate-0 hover:saturate-100 no-underline hover:underline tracking-widest text-black dark:text-white"
        >
          Koza Gada
        </Button>{' '}
        and also for solo practice, jamming or teaching.
      </Text>

      <section className="flex flex-col items-center gap-3 max-w-sm">
        <h2 className={sectionHeadingClass}>Browse the database of grooves</h2>
        <HomepageSearch />
      </section>

      <Text className={bottomTextClass}>
        The pile of pages containing material for drumming keeps growing, but don&apos;t wait for
        the next batch - instead explore our visual tool. Designed to be simple and still powerful -
        the Rhythm Editor. It helps to write your own stories in the most beautiful language known
        to mankind - music.
      </Text>

      <section className="flex flex-col items-center gap-3 w-full">
        <h2 className={sectionHeadingClass}>Got your own solo phrase or break?</h2>
        <Button
          href="/editor"
          variant="dimmed"
          className="w-md font-semibold tracking-widest text-base"
        >
          Create New Rhythm
        </Button>
      </section>
    </main>
  </div>
)
