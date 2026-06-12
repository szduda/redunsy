export const findPatternLength = (bars: string[], maxN = 8, n = 1): number => {
  if (n > maxN || n < 1 || n > bars.length) return bars.length
  if (n === 1) return bars.some((b) => b !== bars[0]) ? findPatternLength(bars, maxN, 2) : 1

  const firstN = bars.slice(0, n).join()
  const restNs = bars
    .map((_, i) => (i % n === 0 ? bars.slice(i, Math.min(bars.length, i + n)).join() : null))
    .filter(Boolean)

  const allSame = !restNs.some((pattern) => pattern !== firstN)
  return allSame ? n : findPatternLength(bars, maxN, n + 1)
}
