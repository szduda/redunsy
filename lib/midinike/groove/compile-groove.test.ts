import { describe, expect, it } from 'vitest'

import { TICKS_PER_EIGHTH } from '../notation/cell-duration'
import { barCellCount } from '../notation/cell-duration'
import { validateBarForGroove } from '../notation/fit-bar'

import { compileGroove } from './compile-groove'
import {
  barLocalHits,
  barSlotCount,
  compileHits,
  compileResult,
  evenSpacing,
} from './compile-groove.test-helpers'
import { grooveOffset } from './groove-symbols'

import type { BeatMatrix } from '../types'

const GROOVE_8 = '--------'
const GROOVE_6 = '------'
const DEMO_BASS_BARS = ['b---b---', 'b-[----]b-[----]', 'b-{---}b-{---}'] as const
const HALF_BAR_8 = barSlotCount(8) / 2

describe('compileGroove notation — cell counts', () => {
  it('counts plain 8th cells', () => {
    expect(barCellCount('b---b---')).toBe(8)
    expect(barCellCount('ttstts')).toBe(6)
    expect(barCellCount('b--b--')).toBe(6)
  })

  it('counts 16th groups as half a cell per pair', () => {
    expect(barCellCount('[tt]ts[tt]ts')).toBe(6)
    expect(barCellCount('b-[----]b-[----]')).toBe(6)
  })

  it('counts triplet groups as two cells per three symbols', () => {
    expect(barCellCount('{ttstts}')).toBe(4)
    expect(barCellCount('b-{---}b-{---}')).toBe(6)
  })

  it('treats hyphen before { or [ as glue, not a rest', () => {
    expect(barCellCount('b-{---}b-{---}')).toBe(6)
    expect(barCellCount('b-[----]b-[----]')).toBe(6)
    expect(() => validateBarForGroove('b-{---}b-{---}', 8)).not.toThrow()
  })

  it('treats hyphen after } as a rest between groups', () => {
    expect(barCellCount('s{tts}-{stt}')).toBe(6)
  })

  it('rejects bars with more notation cells than groove length', () => {
    expect(() => validateBarForGroove('b---b---', 6)).toThrow(/more than groove length/)
    expect(() => validateBarForGroove('ttstts', 8)).not.toThrow()
  })
})

describe('compileGroove — equal bass spacing (4/4 demo)', () => {
  it('places both bass hits half a bar apart in each demo bar', () => {
    const compiled = compileResult([...DEMO_BASS_BARS], GROOVE_8)

    expect(compiled.beats.length).toBe(barSlotCount(8) * DEMO_BASS_BARS.length)
    expect(compiled.barSlotOffsets).toEqual([0, 96, 192])

    DEMO_BASS_BARS.forEach((bar, index) => {
      expect(barLocalHits(compiled, index)).toEqual([0, HALF_BAR_8])
    })
  })

  it('keeps identical bass ticks across all three subdivision styles', () => {
    const compiled = compileResult([...DEMO_BASS_BARS], GROOVE_8)
    const barHits = DEMO_BASS_BARS.map((_, index) => barLocalHits(compiled, index))

    expect(barHits[0]).toEqual(barHits[1])
    expect(barHits[1]).toEqual(barHits[2])
  })

  it('does not require padding shorter subdivision bars to eight plain cells', () => {
    expect(barCellCount('b-[----]b-[----]')).toBeLessThan(GROOVE_8.length)
    expect(barCellCount('b-{---}b-{---}')).toBeLessThan(GROOVE_8.length)
    expect(() => compileResult(['b-[----]b-[----]'], GROOVE_8)).not.toThrow()
    expect(() => compileResult(['b-{---}b-{---}'], GROOVE_8)).not.toThrow()
  })
})

describe('compileGroove — 8th notes', () => {
  it('spaces six consecutive 8th hits evenly on a 6-cell groove', () => {
    const hits = compileHits(['ttstts'], GROOVE_6)
    expect(hits).toEqual([0, 12, 24, 36, 48, 60])
    expect(evenSpacing(hits)).toEqual([12, 12, 12, 12, 12])
  })

  it('places bass on cells 0 and 3 in a 6-cell bar', () => {
    const hits = compileHits(['b--b--'], GROOVE_6)
    expect(hits).toEqual([0, 36])
    expect(hits[1] - hits[0]).toBe(barSlotCount(6) / 2)
  })
})

describe('compileGroove — 16th notes', () => {
  it('places two hits per 16th cell at 0 and half-cell in a pure 8th bar', () => {
    const hits = compileHits(['[tt]ts[tt]ts'], GROOVE_6)
    expect(hits).toEqual([0, 6, 12, 24, 36, 42, 48, 60])
  })

  it('keeps 16th pairs six ticks apart within each 12-tick cell', () => {
    const hits = compileHits(['[tt]ts[tt]ts'], GROOVE_6)
    expect(hits[1] - hits[0]).toBe(6)
    expect(hits[5] - hits[4]).toBe(6)
  })

  it('matches 8th bar duration with the same groove length', () => {
    const eighth = compileResult(['ttstts'], GROOVE_6)
    const sixteenth = compileResult(['[tt]ts[tt]ts'], GROOVE_6)
    expect(sixteenth.beats.length).toBe(eighth.beats.length)
    expect(sixteenth.preGrooveSlots).toBe(eighth.preGrooveSlots)
  })
})

describe('compileGroove — triplets', () => {
  it('places three triplet hits across two cells at 0, ⅓, ⅔ of the span', () => {
    const hits = compileHits(['{ttstts}ss'], GROOVE_6)
    expect(hits).toEqual([0, 8, 16, 24, 32, 40, 48, 60])
  })

  it('uses wider spacing than 16ths inside the same groove length', () => {
    const tripletHits = compileHits(['{ttstts}ss'], GROOVE_6)
    const sixteenthHits = compileHits(['[tt]ts[tt]ts'], GROOVE_6)
    expect(tripletHits[1] - tripletHits[0]).toBeGreaterThan(sixteenthHits[1] - sixteenthHits[0])
    expect(compileResult(['{ttstts}ss'], GROOVE_6).beats.length).toBe(
      compileResult(['[tt]ts[tt]ts'], GROOVE_6).beats.length,
    )
  })

  it('matches bar length of an 8th-only bar with the same groove', () => {
    const triplet = compileResult(['{ttstts}ss'], GROOVE_6)
    const eighth = compileResult(['ttstts'], GROOVE_6)
    expect(triplet.beats.length).toBe(eighth.beats.length)
  })
})

describe('compileGroove — mixed subdivision bars', () => {
  it('keeps triplet internal spacing in tt{ttt}tt{ttt}', () => {
    const hits = barLocalHits(compileResult(['tt{ttt}tt{ttt}'], GROOVE_8), 0)
    expect(hits).toEqual([0, 12, 24, 32, 40, 48, 60, 72, 80, 88])
    expect(hits[3] - hits[2]).toBe(8)
    expect(hits[4] - hits[3]).toBe(8)
  })

  it('keeps 16th internal spacing in tt[tttt]tt[tttt]', () => {
    const hits = barLocalHits(compileResult(['tt[tttt]tt[tttt]'], GROOVE_8), 0)
    expect(hits).toEqual([0, 12, 24, 30, 36, 42, 48, 60, 72, 78, 84, 90])
    expect(hits[4] - hits[3]).toBe(6)
    expect(hits[5] - hits[4]).toBe(6)
  })

  it('uses the same bar slot count for triplet-heavy and 16th-heavy patterns', () => {
    const tripletBar = compileResult(['tt{ttt}tt{ttt}'], GROOVE_8)
    const sixteenthBar = compileResult(['tt[tttt]tt[tttt]'], GROOVE_8)
    expect(tripletBar.beats.length).toBe(sixteenthBar.beats.length)
    expect(tripletBar.beats.length).toBe(barSlotCount(8))
  })
})

describe('compileGroove — groove on rests is inaudible', () => {
  it('does not move bass hits when swing sits on rest-only cells (b--b--)', () => {
    const straight = compileHits(['b--b--'], GROOVE_6)
    const swung = compileHits(['b--b--'], '-<----')
    expect(swung).toEqual(straight)
  })

  it('does not move bass hits when swing sits on rest-only cells (b---b---)', () => {
    const straight = compileHits(['b---b---'], GROOVE_8)
    const swung = compileHits(['b---b---'], '-<------')
    expect(swung).toEqual(straight)
  })

  it('does not change spacing when only silent positions are swung', () => {
    const straight = compileHits(['t--t--'], GROOVE_6)
    const swung = compileHits(['t--t--'], '-<----')
    expect(swung).toEqual(straight)
  })
})

describe('compileGroove — groove modifier strength and direction', () => {
  const bar = '-t----'

  const hitOnCell = (groove: string) => compileHits([bar], groove)[0]

  it('maps symbols to symmetric tick offsets on the 12-tick grid', () => {
    expect(grooveOffset('<')).toBe(-2)
    expect(grooveOffset('(')).toBe(-1)
    expect(grooveOffset('-')).toBe(0)
    expect(grooveOffset(')')).toBe(1)
    expect(grooveOffset('>')).toBe(2)
    expect(grooveOffset('<', true)).toBe(0)
  })

  it('orders early modifiers before straight before late modifiers on cell 1', () => {
    const straight = hitOnCell('------')
    const strongEarly = hitOnCell('-<----')
    const weakEarly = hitOnCell('-(----')
    const weakLate = hitOnCell('-)----')
    const strongLate = hitOnCell('->----')

    expect(strongEarly).toBeLessThan(weakEarly)
    expect(weakEarly).toBeLessThan(straight)
    expect(straight).toBeLessThan(weakLate)
    expect(weakLate).toBeLessThan(strongLate)
  })

  it('applies expected tick shifts on cell 1', () => {
    const straight = hitOnCell('------')
    expect(straight).toBe(TICKS_PER_EIGHTH)

    expect(hitOnCell('-<----')).toBe(straight - 2)
    expect(hitOnCell('-(----')).toBe(straight - 1)
    expect(hitOnCell('->----')).toBe(straight + 2)
    expect(hitOnCell('-)----')).toBe(straight + 1)
  })

  it('keeps strong pairs equal distance from straight, opposite direction', () => {
    const straight = hitOnCell('------')
    const strongEarly = hitOnCell('-<----')
    const strongLate = hitOnCell('->----')

    expect(straight - strongEarly).toBe(strongLate - straight)
    expect(straight - strongEarly).toBe(2)
  })

  it('keeps weak pairs equal distance from straight, opposite direction', () => {
    const straight = hitOnCell('------')
    const weakEarly = hitOnCell('-(----')
    const weakLate = hitOnCell('-)----')

    expect(straight - weakEarly).toBe(weakLate - straight)
    expect(straight - weakEarly).toBe(1)
  })

  it('makes strong early earlier than weak early', () => {
    expect(hitOnCell('-<----')).toBeLessThan(hitOnCell('-(----'))
  })

  it('forces the first notation cell straight even with a swing symbol', () => {
    const hits = compileHits(['t-----'], '-<----')
    expect(hits[0]).toBe(0)
  })

  it('swings only cells with matching groove symbols in ttstts', () => {
    const straight = compileHits(['ttstts'], GROOVE_6)
    const swung = compileHits(['ttstts'], '-<--<-')

    expect(swung).toEqual([0, 10, 24, 36, 46, 60])
    expect(swung[0]).toBe(straight[0])
    expect(swung[2]).toBe(straight[2])
    expect(swung[3]).toBe(straight[3])
    expect(swung[5]).toBe(straight[5])
    expect(swung[1]).toBe(straight[1] - 2)
    expect(swung[4]).toBe(straight[4] - 2)
  })

  it('does not expand total slot count when groove is applied', () => {
    const straight = compileResult(['ttstts'], GROOVE_6)
    const swung = compileResult(['ttstts'], '-<--<-')
    expect(swung.beats.length).toBe(straight.beats.length)
    expect(swung.preGrooveSlots).toBe(straight.preGrooveSlots)
  })
})

describe('compileGroove — instrument sound maps', () => {
  it('resolves o and x to instrument-specific sample ids', () => {
    const bar = 'oxox----'
    const groove = '--------'
    const sampleIds = (beats: BeatMatrix) => beats.flatMap((slot) => slot[0])

    const sangban = compileGroove({
      bars: [bar],
      groove,
      soundMap: { o: 3310, x: 3311 },
    })
    const dundunba = compileGroove({
      bars: [bar],
      groove,
      soundMap: { o: 3312, x: 3313 },
    })
    const kenkeni = compileGroove({
      bars: [bar],
      groove,
      soundMap: { o: 3314, x: 3315 },
    })

    expect(sampleIds(sangban.beats)).toEqual(expect.arrayContaining([3310, 3311]))
    expect(sampleIds(dundunba.beats)).toEqual(expect.arrayContaining([3312, 3313]))
    expect(sampleIds(kenkeni.beats)).toEqual(expect.arrayContaining([3314, 3315]))
    expect(sampleIds(sangban.beats)).not.toEqual(expect.arrayContaining([3312, 3313]))
  })
})

describe('compileGroove — multi-bar loops', () => {
  it('concatenates demo bass bars with correct offsets', () => {
    const compiled = compileResult([...DEMO_BASS_BARS], GROOVE_8)
    const allHits = compiled.beats.flatMap((slot, index) => (slot[0].length > 0 ? [index] : []))

    expect(allHits).toEqual([0, 48, 96, 144, 192, 240])
  })

  it('preserves per-bar tick count in a mixed 8th reference loop', () => {
    const bars = ['ttstts', 'b--b--', '[tt]ts[tt]ts', 'b--b--', '{ttstts}ss', 'b--b--']
    const compiled = compileResult(bars, GROOVE_6)

    expect(compiled.barSlotOffsets.length).toBe(bars.length)
    compiled.barSlotOffsets.forEach((offset, index) => {
      const next = compiled.barSlotOffsets[index + 1] ?? compiled.beats.length
      expect(next - offset).toBe(barSlotCount(6))
    })
  })
})
