'use client'

import { Button } from '@/features/theme/button'

export const ZOOM_STEPS = [1, 2, 3, 4, 6, 8] as const

export type ZoomBarsPerRow = (typeof ZOOM_STEPS)[number]

type ZoomToggleProps = {
  value: ZoomBarsPerRow
  onChange: (value: ZoomBarsPerRow) => void
}

const nextZoom = (current: ZoomBarsPerRow) => {
  const index = ZOOM_STEPS.indexOf(current)
  return ZOOM_STEPS[(index + 1) % ZOOM_STEPS.length]
}

const prevZoom = (current: ZoomBarsPerRow) => {
  const index = ZOOM_STEPS.indexOf(current)
  return ZOOM_STEPS[(index - 1 + ZOOM_STEPS.length) % ZOOM_STEPS.length]
}

export const ZoomToggle = ({ value, onChange }: ZoomToggleProps) => (
  <Button
    onClick={() => onChange(nextZoom(value))}
    onContextMenu={(event) => {
      event.preventDefault()
      onChange(prevZoom(value))
    }}
    variant="secondary"
  >
    {value} col{value === 1 ? '' : 's'}
  </Button>
)
