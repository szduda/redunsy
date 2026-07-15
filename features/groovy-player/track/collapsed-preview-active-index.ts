type CollapsedPreviewActiveIndexArgs = {
  activeIndex: number
  currentBar: number
  windowStart: number
  sourceBarCount: number
  previewBarCount: number
}

export const collapsedPreviewActiveIndex = ({
  activeIndex,
  currentBar,
  windowStart,
  sourceBarCount,
  previewBarCount,
}: CollapsedPreviewActiveIndexArgs): number => {
  if (currentBar < 0 || currentBar < windowStart || currentBar >= windowStart + sourceBarCount) {
    return -1
  }

  if (previewBarCount > sourceBarCount) {
    return activeIndex % previewBarCount
  }

  return currentBar - windowStart
}
