export const getDevicePixelRatio = () => {
  if (typeof window === 'undefined') return 1
  return Math.min(window.devicePixelRatio || 1, 3)
}

const applyDpiTransform = (context: CanvasRenderingContext2D, dpr: number) => {
  context.setTransform(dpr, 0, 0, dpr, 0, 0)
  context.imageSmoothingEnabled = true
  context.imageSmoothingQuality = 'high'
}

/** Always assigns canvas.width/height (clears the bitmap). Prefer for full rebuilds. */
export const setupCanvasDpi = (
  canvas: HTMLCanvasElement,
  logicalWidth: number,
  logicalHeight: number,
) => {
  const dpr = getDevicePixelRatio()
  canvas.width = Math.max(1, Math.round(logicalWidth * dpr))
  canvas.height = Math.max(1, Math.round(logicalHeight * dpr))

  const context = canvas.getContext('2d')
  if (!context) return null

  applyDpiTransform(context, dpr)
  return context
}

/**
 * Resize only when logical size or dpr changed. Avoids wiping the bitmap on
 * highlight-only paints that reuse the same canvas dimensions.
 */
export const ensureCanvasDpi = (
  canvas: HTMLCanvasElement,
  logicalWidth: number,
  logicalHeight: number,
) => {
  const dpr = getDevicePixelRatio()
  const nextWidth = Math.max(1, Math.round(logicalWidth * dpr))
  const nextHeight = Math.max(1, Math.round(logicalHeight * dpr))

  if (canvas.width !== nextWidth || canvas.height !== nextHeight) {
    canvas.width = nextWidth
    canvas.height = nextHeight
  }

  const context = canvas.getContext('2d')
  if (!context) return null

  applyDpiTransform(context, dpr)
  return context
}
