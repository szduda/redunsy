import { describe, expect, it } from 'vitest'

import {
  clampPanelPosition,
  getPanelBounds,
  getPanelPosition,
  resolvePopoverStyle,
  type TriggerRect,
} from '@/features/groovy-player/popover-position'

const triggerRect = (left: number, top: number, width: number, height: number): TriggerRect => ({
  left,
  top,
  width,
  height,
  right: left + width,
  bottom: top + height,
})

describe('getPanelBounds', () => {
  it('centers bottom panels on the trigger anchor', () => {
    const bounds = getPanelBounds(
      'bottom',
      getPanelPosition('bottom', triggerRect(20, 40, 80, 24)),
      { width: 256, height: 120 },
    )

    expect(bounds.left).toBe(20 + 40 - 128)
    expect(bounds.top).toBe(64 + 4)
  })
})

describe('clampPanelPosition', () => {
  it('keeps left edge inside the viewport for bottom panels', () => {
    const position = clampPanelPosition(
      'bottom',
      getPanelPosition('bottom', triggerRect(8, 40, 80, 24)),
      { width: 256, height: 120 },
      { width: 390, height: 844 },
    )
    const bounds = getPanelBounds('bottom', position, { width: 256, height: 120 })

    expect(bounds.left).toBeGreaterThanOrEqual(8)
    expect(bounds.right).toBeLessThanOrEqual(382)
  })
})

describe('resolvePopoverStyle', () => {
  it('nudges a wide bottom panel away from the left viewport edge', () => {
    const style = resolvePopoverStyle(
      triggerRect(8, 40, 80, 24),
      { width: 256, height: 120 },
      'bottom',
      { width: 390, height: 844 },
    )
    const bounds = getPanelBounds('bottom', style, { width: 256, height: 120 })

    expect(bounds.left).toBeGreaterThanOrEqual(8)
  })
})
