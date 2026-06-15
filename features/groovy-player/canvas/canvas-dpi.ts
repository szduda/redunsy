export const getDevicePixelRatio = () => {
  if (typeof window === 'undefined') return 1
  return Math.min(window.devicePixelRatio || 1, 3)
}

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

  context.setTransform(dpr, 0, 0, dpr, 0, 0)
  context.imageSmoothingEnabled = true
  context.imageSmoothingQuality = 'high'

  return context
}
