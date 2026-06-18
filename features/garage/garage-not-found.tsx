'use client'

import { GarageSearchInput } from '@/features/garage/garage-search-input'
import { Button } from '@/features/theme/button'
import { Text } from '@/features/theme/text'

type GarageNotFoundProps = {
  searchTerm: string
}

export const GarageNotFound = ({ searchTerm }: GarageNotFoundProps) => (
  <div className="flex flex-col gap-5 py-8">
    <p className="text-base text-zinc-700 dark:text-zinc-300">
      Hmm...I don&apos;t know a rhythm called{' '}
      <span className="text-yellowy">{searchTerm}</span>&nbsp;yet, but that&apos;s a great name!
    </p>


    <Button className="w-fit font-bold" href="/player" variant="filled">
      Create&nbsp;<span className="font-bold">{searchTerm}</span>&nbsp;rhythm
    </Button>

    <Text>or</Text>

    <Button className='w-fit' variant="outlined" href="/garage">Browse the database</Button>
  </div>
)
