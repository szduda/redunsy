'use client'

import { Button } from '@/features/theme/button'

export const GarageEmptyMyRhythms = () => (
  <div className="flex flex-col gap-5 py-8">
    <p className="text-base text-zinc-700 dark:text-zinc-300">
      You didn&apos;t create any rhythm on this device yet
    </p>

    <Button className="w-fit font-bold" href="/editor" variant="filled">
      Create Your First Rhythm
    </Button>
  </div>
)
