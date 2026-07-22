import { describe, expect, it, vi } from 'vitest'

import { ensureCanvasDpi, setupCanvasDpi } from './canvas-dpi'
import { staticBarsKey } from './static-bars-layer'

describe('ensureCanvasDpi', () => {
  it('does not reassign width/height when size is unchanged', () => {
    const canvas = {
      width: 0,
      height: 0,
      getContext: vi.fn(() => ({
        setTransform: vi.fn(),
        imageSmoothingEnabled: false,
        imageSmoothingQuality: 'low',
      })),
    } as unknown as HTMLCanvasElement

    setupCanvasDpi(canvas, 100, 50)
    const widthAfterSetup = canvas.width
    const heightAfterSetup = canvas.height

    const widthDesc = Object.getOwnPropertyDescriptor(canvas, 'width')
    let widthWrites = 0
    Object.defineProperty(canvas, 'width', {
      configurable: true,
      get: () => widthAfterSetup,
      set: () => {
        widthWrites += 1
      },
    })
    Object.defineProperty(canvas, 'height', {
      configurable: true,
      get: () => heightAfterSetup,
      set: () => {
        widthWrites += 1
      },
    })

    ensureCanvasDpi(canvas, 100, 50)
    expect(widthWrites).toBe(0)

    if (widthDesc) Object.defineProperty(canvas, 'width', widthDesc)
  })

  it('resizes when logical size changes', () => {
    const canvas = {
      width: 200,
      height: 100,
      getContext: vi.fn(() => ({
        setTransform: vi.fn(),
        imageSmoothingEnabled: false,
        imageSmoothingQuality: 'low',
      })),
    } as unknown as HTMLCanvasElement

    ensureCanvasDpi(canvas, 150, 80)
    expect(canvas.width).toBeGreaterThan(0)
    expect(canvas.height).toBeGreaterThan(0)
    expect(canvas.width).not.toBe(200)
  })
})

describe('staticBarsKey', () => {
  it('changes when highlight-irrelevant static deps change', () => {
    const base = {
      hash: 'abc',
      canvasWidth: 300,
      canvasHeight: 100,
      dpr: 2,
      barsPerRow: 2,
      instrument: 'djembe',
      theme: 'dark',
      showBarIndex: false,
      markTriplets: true,
      paddingX: 0,
      paddingY: 8,
      contentWidth: 300,
    }
    expect(staticBarsKey(base)).toBe(staticBarsKey({ ...base }))
    expect(staticBarsKey(base)).not.toBe(staticBarsKey({ ...base, hash: 'abcd' }))
    expect(staticBarsKey(base)).not.toBe(staticBarsKey({ ...base, markTriplets: false }))
  })
})
