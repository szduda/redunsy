'use client'

import type { ReactNode } from 'react'

import { DemoBar } from '@/features/help/demo-bar'
import { HelpWarningCallout } from '@/features/help/help-warning-callout'
import { Text } from '@/features/theme/text'

type DemoBlockProps = {
  caption: string
  children: ReactNode
}

const DemoBlock = ({ caption, children }: DemoBlockProps) => (
  <div className="space-y-2">
    <Text className="text-pretty leading-relaxed">{caption}</Text>
    {children}
  </div>
)

export const HelpBarBeatsDemo = () => (
  <div className="mt-4 flex flex-col gap-6">
    <DemoBlock caption="4/4 bar — eight cells. Darker columns mark the two main beats (cells 1 and 5), where you stamp your foot. Lighter columns are off-beats between downbeats.">
      <DemoBar meter={4} />
    </DemoBlock>

    <DemoBlock caption="3/4 bar — six cells. Beats fall on cells 1 and 4; the shorter grid matches a 3/4 meter groove length.">
      <DemoBar meter={3} />
    </DemoBlock>

    <DemoBlock caption="During playback the active bar is highlighted in green so you can follow the form as it loops.">
      <div className="space-y-3">
        <DemoBar active meter={4} />
        <HelpWarningCallout>
          Bluetooth headphones or speakers can make the highlight look ahead of the sound. The
          player updates the green bar when each beat is scheduled in the browser—not when audio
          reaches your ears. Bluetooth adds extra transmission delay (often around 100–200&nbsp;ms),
          so the bar may jump before you hear the hit. Wired audio usually stays in sync; the player
          does not compensate for Bluetooth latency today.
        </HelpWarningCallout>
      </div>
    </DemoBlock>

    <DemoBlock caption="In the Rhythm Editor, the selected eighth-note slot is outlined in yellow (here: cell 3). Tap a note to select it, then change its sound from the keyboard below the bar.">
      <DemoBar meter={4} selected8th={3} />
    </DemoBlock>
  </div>
)
