import { describe, expect, it } from 'vitest'

import { compileHits } from './compile-groove.test-helpers'
import {
  grooveOffset,
  STRONG_GROOVE_OFFSET,
  WEAK_GROOVE_OFFSET,
  type GrooveSymbol,
} from './groove-symbols'
import { TICKS_PER_EIGHTH } from '../notation/cell-duration'

/** 4/4 probe bar: three tones + five slaps — a hit on every eighth cell. */
const BAR = 'tttsssss'
const REFERENCE = '--------'
const GROOVE_SYMBOLS: GrooveSymbol[] = ['-', '<', '(', '>', ')']
const NOTE_CELLS = [0, 1, 2, 3, 4, 5, 6, 7] as const

const grooveWithSymbolAt = (cellIndex: number, symbol: GrooveSymbol) =>
  REFERENCE.split('')
    .map((cell, index) => (index === cellIndex ? symbol : cell))
    .join('')

/** Every symbol on every cell (5 × 8). Full 5^8 grids are covered by composing these. */
const singleCellPermutations = (): { groove: string; cell: number; symbol: GrooveSymbol }[] =>
  GROOVE_SYMBOLS.flatMap((symbol) =>
    NOTE_CELLS.map((cell) => ({
      groove: grooveWithSymbolAt(cell, symbol),
      cell,
      symbol,
    })),
  )

/** Every pair of symbols on adjacent swingable cells 1 and 2 (5 × 5). */
const noteCellPairPermutations = (): {
  groove: string
  cell1: GrooveSymbol
  cell2: GrooveSymbol
}[] =>
  GROOVE_SYMBOLS.flatMap((cell1) =>
    GROOVE_SYMBOLS.map((cell2) => ({
      groove: `-${cell1}${cell2}-----`,
      cell1,
      cell2,
    })),
  )

describe('4/4 swing audit — tttsssss vs --------', () => {
  const straight = compileHits([BAR], REFERENCE)

  it('places eight notes on consecutive eighth boundaries under the reference groove', () => {
    expect(straight).toEqual(NOTE_CELLS.map((cell) => cell * TICKS_PER_EIGHTH))
  })

  it('keeps eight hits inside the bar for every single-cell swing permutation', () => {
    for (const { groove } of singleCellPermutations()) {
      const swung = compileHits([BAR], groove)
      expect(swung).toHaveLength(8)
      swung.forEach((tick) => {
        expect(tick).toBeGreaterThanOrEqual(0)
        expect(tick).toBeLessThan(8 * TICKS_PER_EIGHTH)
      })
    }
  })

  it('never shifts the downbeat (cell 0) regardless of groove symbol', () => {
    for (const symbol of GROOVE_SYMBOLS) {
      const swung = compileHits([BAR], grooveWithSymbolAt(0, symbol))
      expect(swung[0]).toBe(0)
      expect(swung.slice(1)).toEqual(straight.slice(1))
    }
  })

  it('shifts the note under each swung cell by that symbol’s offset', () => {
    for (const noteCell of NOTE_CELLS) {
      if (noteCell === 0) continue
      for (const symbol of GROOVE_SYMBOLS) {
        const swung = compileHits([BAR], grooveWithSymbolAt(noteCell, symbol))
        expect(swung[noteCell]).toBe(straight[noteCell]! + grooveOffset(symbol))
        for (const other of NOTE_CELLS) {
          if (other === noteCell) continue
          expect(swung[other]).toBe(straight[other])
        }
      }
    }
  })

  it('matches -------- for every single-cell permutation (expected delta applied)', () => {
    for (const { groove, cell, symbol } of singleCellPermutations()) {
      const swung = compileHits([BAR], groove)
      const delta = cell === 0 ? 0 : grooveOffset(symbol)
      const expected = straight.map((tick, noteIndex) => (noteIndex === cell ? tick + delta : tick))
      expect(swung).toEqual(expected)
    }
  })

  it('applies every pair permutation on swingable note cells 1 and 2', () => {
    for (const { groove, cell1, cell2 } of noteCellPairPermutations()) {
      const swung = compileHits([BAR], groove)
      expect(swung).toEqual(
        straight.map((tick, noteIndex) => {
          if (noteIndex === 1) return tick + grooveOffset(cell1)
          if (noteIndex === 2) return tick + grooveOffset(cell2)
          return tick
        }),
      )
    }
  })
})

describe('4/4 swing audit — < stronger than ( (and late direction)', () => {
  const straight = compileHits([BAR], REFERENCE)

  it('strong early < pulls further left than weak early (', () => {
    const strong = compileHits([BAR], '-<------')
    const weak = compileHits([BAR], '-(------')
    expect(strong[1]!).toBeLessThan(weak[1]!)
    expect(weak[1]!).toBeLessThan(straight[1]!)
    expect(straight[1]! - strong[1]!).toBe(STRONG_GROOVE_OFFSET)
    expect(straight[1]! - weak[1]!).toBe(WEAK_GROOVE_OFFSET)
    expect(STRONG_GROOVE_OFFSET).toBeGreaterThan(WEAK_GROOVE_OFFSET)
  })

  it('strong late > pushes further right than weak late )', () => {
    const strong = compileHits([BAR], '->------')
    const weak = compileHits([BAR], '-)------')
    expect(strong[1]!).toBeGreaterThan(weak[1]!)
    expect(weak[1]!).toBeGreaterThan(straight[1]!)
    expect(strong[1]! - straight[1]!).toBe(STRONG_GROOVE_OFFSET)
    expect(weak[1]! - straight[1]!).toBe(WEAK_GROOVE_OFFSET)
  })

  it('early/late pairs are symmetric about the reference for both strengths', () => {
    const strongEarly = compileHits([BAR], '-<------')[1]!
    const strongLate = compileHits([BAR], '->------')[1]!
    const weakEarly = compileHits([BAR], '-(------')[1]!
    const weakLate = compileHits([BAR], '-)------')[1]!
    const mid = straight[1]!

    expect(mid - strongEarly).toBe(strongLate - mid)
    expect(mid - weakEarly).toBe(weakLate - mid)
  })

  it('strength ordering holds on every non-downbeat cell', () => {
    for (const cell of NOTE_CELLS) {
      if (cell === 0) continue
      const mid = straight[cell]!
      expect(compileHits([BAR], grooveWithSymbolAt(cell, '<'))[cell]).toBe(
        mid - STRONG_GROOVE_OFFSET,
      )
      expect(compileHits([BAR], grooveWithSymbolAt(cell, '('))[cell]).toBe(mid - WEAK_GROOVE_OFFSET)
      expect(compileHits([BAR], grooveWithSymbolAt(cell, ')'))[cell]).toBe(mid + WEAK_GROOVE_OFFSET)
      expect(compileHits([BAR], grooveWithSymbolAt(cell, '>'))[cell]).toBe(
        mid + STRONG_GROOVE_OFFSET,
      )
      expect(compileHits([BAR], grooveWithSymbolAt(cell, '<'))[cell]).toBeLessThan(
        compileHits([BAR], grooveWithSymbolAt(cell, '('))[cell]!,
      )
      expect(compileHits([BAR], grooveWithSymbolAt(cell, '>'))[cell]).toBeGreaterThan(
        compileHits([BAR], grooveWithSymbolAt(cell, ')'))[cell]!,
      )
    }
  })
})

describe('4/4 swing audit — common patterns on tttsssss', () => {
  const straight = compileHits([BAR], REFERENCE)

  it('applies classic offbeat late swing ->->->->', () => {
    const swung = compileHits([BAR], '->->->->')
    expect(swung).toEqual(
      straight.map((tick, cell) =>
        cell === 0 || cell % 2 === 0 ? tick : tick + STRONG_GROOVE_OFFSET,
      ),
    )
  })

  it('applies Soli-style early swing -<(----- on the first three cells', () => {
    const swung = compileHits([BAR], '-<(-----')
    expect(swung).toEqual([
      0,
      straight[1]! - STRONG_GROOVE_OFFSET,
      straight[2]! - WEAK_GROOVE_OFFSET,
      ...straight.slice(3),
    ])
  })
})
