import { barCellCount } from './cell-duration'

/** Notation cells must not exceed groove length; shorter bars use time scaling — never pad. */
export const validateBarForGroove = (bar: string, grooveLength: number) => {
  const count = barCellCount(bar)
  if (count > grooveLength) {
    throw new Error(`Bar "${bar}" has ${count} cells, more than groove length ${grooveLength}`)
  }
}

export const validateBarsForGroove = (bars: string[], grooveLength: number) => {
  bars.forEach((bar) => validateBarForGroove(bar, grooveLength))
}

export const barFitsGrooveLength = (bar: string, grooveLength: number) => {
  const count = barCellCount(bar)
  return count > 0 && count <= grooveLength
}

export const barsFitGrooveLength = (bars: string[], grooveLength: number) =>
  bars.length > 0 && bars.every((bar) => barFitsGrooveLength(bar, grooveLength))

export const tracksFitGrooveLength = (tracks: Record<string, string[]>, grooveLength: number) =>
  Object.values(tracks).every((bars) => barsFitGrooveLength(bars, grooveLength))

/** True when every bar uses the full groove width (no time scaling). */
export const barsMatchGrooveLength = (bars: string[], grooveLength: number) =>
  bars.every((bar) => barCellCount(bar) === grooveLength)

export const tracksMatchGrooveLength = (tracks: Record<string, string[]>, grooveLength: number) =>
  Object.values(tracks).every((bars) => barsMatchGrooveLength(bars, grooveLength))
