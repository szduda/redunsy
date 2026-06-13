import { barCellCount, isGroupGlue } from './cell-duration'

type NotationToken = {
  text: string
  cells: number
}

const expandBarToTokens = (bar: string): NotationToken[] => {
  const tokens: NotationToken[] = []
  let index = 0
  let glue = ''

  while (index < bar.length) {
    if (isGroupGlue(bar, index)) {
      glue = '-'
      index += 1
      continue
    }
    const char = bar[index]
    if (char === '[') {
      const end = bar.indexOf(']', index)
      if (end === -1) throw new Error(`Unclosed sixteenth group in "${bar}"`)
      const inner = bar.slice(index + 1, end)
      for (let pair = 0; pair < inner.length; pair += 2) {
        tokens.push({ text: `${glue}[${inner.slice(pair, pair + 2)}]`, cells: 1 })
        glue = ''
      }
      index = end + 1
      continue
    }
    if (char === '{') {
      const end = bar.indexOf('}', index)
      if (end === -1) throw new Error(`Unclosed triplet group in "${bar}"`)
      const inner = bar.slice(index + 1, end)
      for (let group = 0; group < inner.length; group += 3) {
        tokens.push({ text: `${glue}{${inner.slice(group, group + 3)}}`, cells: 2 })
        glue = ''
      }
      index = end + 1
      continue
    }
    tokens.push({ text: `${glue}${char}`, cells: 1 })
    glue = ''
    index += 1
  }

  return tokens
}

const tokensToBar = (tokens: NotationToken[]) => tokens.map((token) => token.text).join('')

const reflowTokensToBars = (tokens: NotationToken[], barSize: number): string[] => {
  const bars: string[] = []
  let current: NotationToken[] = []
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
  const tokens = bars.flatMap(expandBarToTokens)
  const reflowed = reflowTokensToBars(tokens, barSize)
  reflowed.forEach((bar) => validateReflowedBar(bar, barSize))
  return reflowed
}

const validateReflowedBar = (bar: string, barSize: number) => {
  const count = barCellCount(bar)
  if (count > barSize) {
    throw new Error(`Reflowed bar "${bar}" has ${count} cells, more than bar size ${barSize}`)
  }
}

export const detectBarSizeFromBars = (barsList: string[][]): 6 | 8 => {
  const counts = barsList.flat().map(barCellCount)
  const six = counts.filter((count) => count === 6).length
  const eight = counts.filter((count) => count === 8).length
  return six >= eight ? 6 : 8
}
