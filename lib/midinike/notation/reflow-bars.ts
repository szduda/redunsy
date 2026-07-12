import { barsCellCounts } from './grouped-notation'
import { parseGroupedNotation } from './grouped-notation'

const tokensToBar = (tokens: { text: string }[]) => tokens.map((token) => token.text).join('')

const reflowTokensToBars = (
  tokens: { text: string; cells: number }[],
  barSize: number,
): string[] => {
  const bars: string[] = []
  let current: { text: string; cells: number }[] = []
  let currentCells = 0

  const flushBar = () => {
    if (!current.length) return
    bars.push(tokensToBar(current))
    current = []
    currentCells = 0
  }

  tokens.forEach((token) => {
    if (currentCells > 0 && currentCells + token.cells > barSize) {
      flushBar()
    }
    current.push(token)
    currentCells += token.cells
    if (currentCells === barSize) flushBar()
  })

  flushBar()
  return bars
}

export const reflowBarsToSize = (bars: string[], barSize: number): string[] => {
  const { tokens } = parseGroupedNotation(bars)
  const reflowed = reflowTokensToBars(tokens, barSize)
  reflowed.forEach((bar) => validateReflowedBar(bar, barSize, reflowed))
  return reflowed
}

const validateReflowedBar = (bar: string, barSize: number, allBars: string[]) => {
  const barIndex = allBars.indexOf(bar)
  const count = barIndex >= 0 ? barsCellCounts(allBars)[barIndex] : 0
  if (count > barSize) {
    throw new Error(`Reflowed bar "${bar}" has ${count} cells, more than bar size ${barSize}`)
  }
}
