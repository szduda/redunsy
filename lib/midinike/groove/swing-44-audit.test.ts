import { describe, expect, it } from 'vitest'

import { compileHits } from './compile-groove.test-helpers'
import {
  FORCE_1_OFFSET,
  FORCE_2_OFFSET,
  FORCE_3_OFFSET,
  FORCE_4_OFFSET,
  grooveOffset,
  type GrooveSymbol,
} from './groove-symbols'
import { TICKS_PER_EIGHTH } from '../notation/cell-duration'

/** 4/4 probe bar: three tones + five slaps — a hit on every eighth cell. */
const BAR = 'tttsssss'
const REFERENCE = '--------'
const GROOVE_SYMBOLS: GrooveSymbol[] = ['-', '(', '<', '[', '{', ')', '>', ']', '}']
const NOTE_CELLS = [0, 1, 2, 3, 4, 5, 6, 7] as const

const grooveWithSymbolAt = (cellIndex: number, symbol: GrooveSymbol) =>
  REFERENCE.split('')
    .map((cell, index) => (index === cellIndex ? symbol : cell))
    .join('')

/** Every symbol on every cell. Full 9^8 grids are covered by composing these. */
const singleCellPermutations = (): { groove: string; cell: number; symbol: GrooveSymbol }[] =>
  GROOVE_SYMBOLS.flatMap((symbol) =>
    NOTE_CELLS.map((cell) => ({
      groove: grooveWithSymbolAt(cell, symbol),
      cell,
      symbol,
    })),
  )

/** Every pair of symbols on adjacent swingable cells 1 and 2. */
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
      const tick1 = straight[1]! + grooveOffset(cell1)
      const tick2 = straight[2]! + grooveOffset(cell2)
      // Opposing equal-magnitude shifts can meet at the midpoint and merge.
      if (tick1 === tick2) {
        expect(swung).toEqual([0, tick1, ...straight.slice(3)])
        continue
      }
      expect(swung).toEqual(
        straight.map((tick, noteIndex) => {
          if (noteIndex === 1) return tick1
          if (noteIndex === 2) return tick2
          return tick
        }),
      )
    }
  })
})

describe('4/4 swing audit — force ladder < << <<< <<<< (and late direction)', () => {
  const straight = compileHits([BAR], REFERENCE)

  it('orders early forces by chevron count / offset', () => {
    const force1 = compileHits([BAR], '-(------')
    const force2 = compileHits([BAR], '-<------')
    const force3 = compileHits([BAR], '-[------')
    const force4 = compileHits([BAR], '-{------')
    expect(force4[1]!).toBeLessThan(force3[1]!)
    expect(force3[1]!).toBeLessThan(force2[1]!)
    expect(force2[1]!).toBeLessThan(force1[1]!)
    expect(force1[1]!).toBeLessThan(straight[1]!)
    expect(straight[1]! - force1[1]!).toBe(FORCE_1_OFFSET)
    expect(straight[1]! - force2[1]!).toBe(FORCE_2_OFFSET)
    expect(straight[1]! - force3[1]!).toBe(FORCE_3_OFFSET)
    expect(straight[1]! - force4[1]!).toBe(FORCE_4_OFFSET)
  })

  it('orders late forces by chevron count / offset', () => {
    const force1 = compileHits([BAR], '-)------')
    const force2 = compileHits([BAR], '->------')
    const force3 = compileHits([BAR], '-]------')
    const force4 = compileHits([BAR], '-}------')
    expect(force4[1]!).toBeGreaterThan(force3[1]!)
    expect(force3[1]!).toBeGreaterThan(force2[1]!)
    expect(force2[1]!).toBeGreaterThan(force1[1]!)
    expect(force1[1]!).toBeGreaterThan(straight[1]!)
    expect(force1[1]! - straight[1]!).toBe(FORCE_1_OFFSET)
    expect(force2[1]! - straight[1]!).toBe(FORCE_2_OFFSET)
    expect(force3[1]! - straight[1]!).toBe(FORCE_3_OFFSET)
    expect(force4[1]! - straight[1]!).toBe(FORCE_4_OFFSET)
  })

  it('early/late pairs are symmetric about the reference for all four forces', () => {
    const mid = straight[1]!
    for (const [early, late, force] of [
      ['(', ')', FORCE_1_OFFSET],
      ['<', '>', FORCE_2_OFFSET],
      ['[', ']', FORCE_3_OFFSET],
      ['{', '}', FORCE_4_OFFSET],
    ] as const) {
      const earlyTick = compileHits([BAR], grooveWithSymbolAt(1, early))[1]!
      const lateTick = compileHits([BAR], grooveWithSymbolAt(1, late))[1]!
      expect(mid - earlyTick).toBe(lateTick - mid)
      expect(mid - earlyTick).toBe(force)
    }
  })

  it('strength ordering holds on every non-downbeat cell', () => {
    for (const cell of NOTE_CELLS) {
      if (cell === 0) continue
      const mid = straight[cell]!
      expect(compileHits([BAR], grooveWithSymbolAt(cell, '{'))[cell]).toBe(mid - FORCE_4_OFFSET)
      expect(compileHits([BAR], grooveWithSymbolAt(cell, '['))[cell]).toBe(mid - FORCE_3_OFFSET)
      expect(compileHits([BAR], grooveWithSymbolAt(cell, '<'))[cell]).toBe(mid - FORCE_2_OFFSET)
      expect(compileHits([BAR], grooveWithSymbolAt(cell, '('))[cell]).toBe(mid - FORCE_1_OFFSET)
      expect(compileHits([BAR], grooveWithSymbolAt(cell, ')'))[cell]).toBe(mid + FORCE_1_OFFSET)
      expect(compileHits([BAR], grooveWithSymbolAt(cell, '>'))[cell]).toBe(mid + FORCE_2_OFFSET)
      expect(compileHits([BAR], grooveWithSymbolAt(cell, ']'))[cell]).toBe(mid + FORCE_3_OFFSET)
      expect(compileHits([BAR], grooveWithSymbolAt(cell, '}'))[cell]).toBe(mid + FORCE_4_OFFSET)
    }
  })
})

describe('4/4 swing audit — common patterns on tttsssss', () => {
  const straight = compileHits([BAR], REFERENCE)

  it('applies classic offbeat late swing ->->->->', () => {
    const swung = compileHits([BAR], '->->->->')
    expect(swung).toEqual(
      straight.map((tick, cell) => (cell === 0 || cell % 2 === 0 ? tick : tick + FORCE_2_OFFSET)),
    )
  })

  it('applies Soli-style early swing -<(----- on the first three cells', () => {
    const swung = compileHits([BAR], '-<(-----')
    expect(swung).toEqual([
      0,
      straight[1]! - FORCE_2_OFFSET,
      straight[2]! - FORCE_1_OFFSET,
      ...straight.slice(3),
    ])
  })

  it('applies triple-chevron early swing -[------', () => {
    const swung = compileHits([BAR], '-[------')
    expect(swung[1]).toBe(straight[1]! - FORCE_3_OFFSET)
  })

  it('applies quadruple-chevron early swing -{------', () => {
    const swung = compileHits([BAR], '-{------')
    expect(swung[1]).toBe(straight[1]! - FORCE_4_OFFSET)
  })
})
