export const repeatBarsToFillCols = (bars: string[], cols: number): string[] => {
  if (bars.length === 0 || cols <= bars.length) return bars

  const factor = cols / bars.length
  if (factor !== 2 && factor !== 4) return bars

  return Array.from({ length: factor }, () => bars).flat()
}
