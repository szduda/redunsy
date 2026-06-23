'use client'

import { ForkIcon } from '@/features/icons/fork-icon'
import { Button } from '@/features/theme/button'
import { Text } from '@/features/theme/text'

type PlayerDemoBannerProps = {
  onFork: () => void
}

export const PlayerDemoBanner = ({ onFork }: PlayerDemoBannerProps) => (
  <section
    className="mt-4 mb-1 mx-4 md:mx-auto md:mb-8 flex max-w-xl flex-col gap-4 rounded-xl border border-greeny/30 bg-greeny/30 px-4 py-4 dark:border-greeny/20 dark:bg-greeny/5"
    aria-labelledby="player-demo-heading"
  >
    <div className="space-y-2">
      <h2
        className="text-base font-semibold text-zinc-900 dark:text-zinc-100"
        id="player-demo-heading"
      >
        Player Demo — Soli
      </h2>
      <Text className="text-pretty leading-relaxed text-zinc-700 dark:text-zinc-300">
        This is a demo example of a Soli rhythm arrangement: dundun accompaniment plus a short
        djembe solo. Play along, try tempo and swing, then fork it into Rhythm Editor and adapt it
        to your liking.
      </Text>
    </div>
    <Button
      className="self-start font-semibold tracking-wide !bg-greeny-lighter/80 hover:!bg-greeny-lighter"
      onClick={onFork}
      variant="filled"
    >
      <ForkIcon className="mr-1.5 size-4" />
      Fork to My Rhythms
    </Button>
  </section>
)
