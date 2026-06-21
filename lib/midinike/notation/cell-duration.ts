/** Twelve scheduler ticks per eighth — five groove positions at ±1 / ±2. */
export const TICKS_PER_EIGHTH = 12

export const plainCharCells = (length: number) => length

export const sixteenthCells = (length: number) => {
  if (length % 2 !== 0) {
    throw new Error(`Sixteenth group must have even length, got ${length}`)
  }
  return length / 2
}

export const tripletCells = (length: number) => Math.ceil(length / 3) * 2

/** `-` before `[` or `{` links a plain symbol to a group — not a rest. */
export const isGroupGlue = (bar: string, index: number) => {
  const next = bar[index + 1]
  const prev = bar[index - 1]
  if (bar[index] !== '-' || (next !== '[' && next !== '{')) return false
  if (!prev || prev === '-' || prev === '}' || prev === ']') return false

  if (next === '[') {
    const open = index + 1
    const end = bar.indexOf(']', open)
    if (end === -1) return false
    // A single [xy] pair needs its own cell — the hyphen is a rest, not glue.
    if (end - open - 1 <= 2) return false
  }

  return true
}

export const barCellCount = (bar: string) => {
  let cells = 0
  let index = 0
  while (index < bar.length) {
    if (isGroupGlue(bar, index)) {
      index += 1
      continue
    }
    const char = bar[index]
    if (char === '[') {
      const end = bar.indexOf(']', index)
      if (end === -1) throw new Error(`Unclosed sixteenth group in "${bar}"`)
      cells += sixteenthCells(end - index - 1)
      index = end + 1
      continue
    }
    if (char === '{') {
      const end = bar.indexOf('}', index)
      if (end === -1) throw new Error(`Unclosed triplet group in "${bar}"`)
      cells += tripletCells(end - index - 1)
      index = end + 1
      continue
    }
    cells += 1
    index += 1
  }
  return cells
}
