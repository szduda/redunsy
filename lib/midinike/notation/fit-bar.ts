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
