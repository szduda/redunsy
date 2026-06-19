'use client'

import Link from 'next/link'
import type { ReactNode } from 'react'

import { HomepageMobileFabricRibbon } from '@/features/homepage/homepage-mobile-fabric-ribbon'
import { HomepageSearch } from '@/features/homepage/homepage-search'
import { Logo } from '@/features/logo/logo'
import { cn } from '@/features/theme/cn'

const REGIONS = ['Burkina Faso', 'Gambia', 'Guinea', 'Ivory Coast', 'Mali', 'Senegal'] as const

type ActionCardProps = {
  accent?: boolean
  children: ReactNode
  href: string
  label: string
  title: string
}

const ActionCard = ({ accent = false, children, href, label, title }: ActionCardProps) => (
  <Link
    className={cn(
      'group flex flex-col gap-2 rounded-xl border px-4 py-4 transition active:scale-[0.99]',
      accent
        ? 'border-yellowy/40 bg-yellowy/5 hover:bg-yellowy/10 dark:border-yellowy/30 dark:bg-yellowy/5 dark:hover:bg-yellowy/10'
        : 'border-zinc-200 bg-zinc-50/80 hover:bg-zinc-100/80 dark:border-zinc-800 dark:bg-zinc-900/40 dark:hover:bg-zinc-900/70',
    )}
    href={href}
  >
    <span
      className={cn(
        'text-[0.65rem] font-semibold uppercase tracking-[0.2em]',
        accent ? 'text-yellowy' : 'text-zinc-500 dark:text-zinc-400',
      )}
    >
      {label}
    </span>
    <span className="text-base font-semibold leading-snug text-zinc-900 dark:text-zinc-100">
      {title}
    </span>
    {children}
  </Link>
)

export const HomepageMobile = () => (
  <div className="flex min-h-dvh flex-1 md:hidden">
    <HomepageMobileFabricRibbon />

    <div className="flex min-w-0 flex-1 flex-col">
      <main className="flex flex-1 flex-col gap-8 overflow-y-auto px-5 pb-12 pt-8">
        <section className="flex flex-col items-center gap-5">
          <Logo className="scale-60" onPage />
          <div className="space-y-3 text-center">
            <h1 className="text-pretty text-2xl font-black leading-tight tracking-tight text-zinc-900 dark:text-zinc-100">
              <span className="text-redy uppercase font-black text-xl">browse </span>
              {/* <span className="opacity-20">{' · '}</span> */}
              <span className="text-greeny uppercase font-black text-xl">play </span>
              {/* <span className="opacity-20">{' · '}</span> */}
              <span className="text-yellowy uppercase font-black text-xl">modify</span>
              <br />
              West African Rhythms
            </h1>
            <p className="text-pretty text-sm leading-relaxed tracking-wide text-zinc-600 dark:text-zinc-400">
              Djembe &amp; dundun grooves with an integrated player — explore the library or compose
              your own stories in music.
            </p>
          </div>
        </section>

        <section aria-label="Regions" className="-mx-1 flex gap-2 flex-wrap justify-center px-1 pb-1">
          {REGIONS.map((region) => (
            <span
              key={region}
              className="shrink-0 rounded-full border border-zinc-200/80 bg-white/60 px-3 py-1 text-xs tracking-wide text-zinc-600 dark:border-zinc-700 dark:bg-zinc-900/50 dark:text-zinc-400"
            >
              {region}
            </span>
          ))}
        </section>

        <section className="flex flex-col gap-3">
          <label className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500 dark:text-zinc-400">
            Find a groove
          </label>
          <HomepageSearch />
        </section>

        <section className="flex flex-col gap-3">
          <ActionCard accent href="/garage" label="Garage" title="Browse the collection">
            <span className="text-sm text-zinc-600 dark:text-zinc-400">
              Dig through growing pages of rhythms from across the Sahel and coast.
            </span>
          </ActionCard>

          <ActionCard href="/editor" label="Editor" title="Write your own rhythm">
            <span className="text-sm text-zinc-600 dark:text-zinc-400">
              Got inspiration? Shape it in the most beautiful human language there is.
            </span>
          </ActionCard>
        </section>
      </main>
    </div>
  </div>
)
