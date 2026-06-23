'use client'

import Link from 'next/link'
import type { ReactNode } from 'react'

import { HomepageMobileFabricRibbon } from '@/features/homepage/homepage-mobile-fabric-ribbon'
import { HomepageSearch } from '@/features/homepage/homepage-search'
import { Logo } from '@/features/logo/logo'
import { MobileNavMenu } from '@/features/layout/mobile-nav-menu'
import { cn } from '@/features/theme/cn'

const REGIONS = ['Burkina Faso', 'Gambia', 'Guinea', 'Ivory Coast', 'Mali', 'Senegal'] as const

type ActionCardVariant = 'browse' | 'modify' | 'listen'

type ActionCardProps = {
  variant?: ActionCardVariant
  children: ReactNode
  href: string
  label: string
  title: string
}

const actionCardClass: Record<ActionCardVariant | 'default', string> = {
  browse:
    'border-redy/40 bg-redy/5 hover:bg-redy/10 dark:border-redy/30 dark:bg-redy/5 dark:hover:bg-redy/10',
  modify:
    'border-yellowy/40 bg-yellowy/5 hover:bg-yellowy/10 dark:border-yellowy/30 dark:bg-yellowy/5 dark:hover:bg-yellowy/10',
  listen:
    'border-greeny/40 bg-greeny/5 hover:bg-greeny/10 dark:border-greeny/30 dark:bg-greeny/5 dark:hover:bg-greeny/10',
  default:
    'border-zinc-200 bg-zinc-50/80 hover:bg-zinc-100/80 dark:border-zinc-800 dark:bg-zinc-900/40 dark:hover:bg-zinc-900/70',
}

const actionCardLabelClass: Record<ActionCardVariant | 'default', string> = {
  browse: 'text-redy',
  modify: 'text-yellowy',
  listen: 'text-greeny',
  default: 'text-zinc-500 dark:text-zinc-400',
}

const ActionCard = ({ variant, children, href, label, title }: ActionCardProps) => (
  <Link
    className={cn(
      'group flex flex-col gap-2 rounded-xl border px-4 py-4 transition active:scale-[0.99]',
      actionCardClass[variant ?? 'default'],
    )}
    href={href}
  >
    <span
      className={cn(
        'text-[0.65rem] font-semibold uppercase tracking-[0.2em]',
        actionCardLabelClass[variant ?? 'default'],
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

    <MobileNavMenu className="fixed top-2 left-2 z-50" variant="homepage" />

    <div className="flex min-w-0 flex-1 flex-col">
      <main className="flex flex-1 flex-col gap-8 overflow-y-auto px-5 pb-12 pt-8">
        <section className="flex flex-col items-center gap-5">
          <Logo className="scale-60" onPage />
          <div className="space-y-3 text-center">
            <h1 className="text-pretty text-2xl font-black leading-tight tracking-tighter text-zinc-900 dark:text-zinc-100">
              <span className="text-redy uppercase font-black text-xl">browse </span>
              <span className="opacity-20">{' · '}</span>
              <span className="text-yellowy uppercase font-black text-xl">modify </span>
              <span className="opacity-20">{' · '}</span>
              <span className="text-greeny uppercase font-black text-xl">listen</span>
              <br />
              West African Rhythms
            </h1>
            <p className="text-pretty text-sm leading-relaxed tracking-wide text-zinc-600 dark:text-zinc-400">
              Djembe &amp; dundun grooves with an integrated player — explore the library or compose
              your own stories in music.
            </p>
          </div>
        </section>

        <section
          aria-label="Regions"
          className="-mx-1 flex gap-2 flex-wrap justify-center px-1 pb-1"
        >
          {REGIONS.map((region) => (
            <span
              key={region}
              className="shrink-0 rounded-full px-3 py-1 text-xs tracking-wide bg-zinc-200 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
            >
              {region}
            </span>
          ))}
        </section>

        <section className="flex flex-col gap-3">
          <label className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500 dark:text-zinc-400 text-center">
            Find a groove
          </label>
          <HomepageSearch />
        </section>

        <section className="flex flex-col gap-3">
          <ActionCard variant="browse" href="/garage" label="Garage" title="Browse the collection">
            <span className="text-sm text-zinc-600 dark:text-zinc-400">
              Dig through growing pages of rhythms from Casamance, Kouroussa, Hamana.
              <br/><br/>Listen to the melodies of both Balandougou and Bamako.
              <br/><br/>Try the Khassonké style.
            </span>
          </ActionCard>

          <ActionCard variant="modify" href="/editor" label="Rhythm Editor" title="Write your own rhythm">
            <span className="text-sm text-zinc-600 dark:text-zinc-400">
              Got inspiration? Shape it in the most beautiful language known to mankind - music.
            </span>
          </ActionCard>
        </section>

        <section className="flex flex-col gap-3">
          <h2 className="text-center text-sm font-semibold uppercase tracking-[0.18em] text-zinc-500 dark:text-zinc-400">
            New here?
          </h2>
          <ActionCard variant="listen" href="/player" label="Player Demo" title="Try the GroovyPlayer">
            <span className="text-sm text-zinc-600 dark:text-zinc-400">
              Explore built-in demo composition and djembe notation — play along and try audio
              controls, tempo, metronome, and swing.
            </span>
            <span className="text-sm text-zinc-600 dark:text-zinc-400">
              <strong className="tracking-widest">Fork</strong> the demo, or any other rhythm to
              extend it or add custom variations.
            </span>
          </ActionCard>
        </section>
      </main>
    </div>
  </div>
)
