import { describe, expect, it } from 'vitest'

import {
  defaultFlamForNote,
  flamDisableTarget,
  flamEnableTarget,
  DJEMBE_FLAMS,
  flamMainNote,
  flamSymbolsForInstrument,
  isFlamSymbol,
} from '@/features/editor/flam-sounds'

describe('flam-sounds', () => {
  it('lists djembe flam combinations without bass-main flams', () => {
    expect(flamSymbolsForInstrument('djembe')).toHaveLength(6)
    expect(DJEMBE_FLAMS.map((flam) => `${flam.grace}${flam.main}`)).toEqual([
      'ss',
      'tt',
      'ts',
      'st',
      'bt',
      'bs',
    ])
  })

  it('maps legacy r and f symbols to tone and slap doubles', () => {
    expect(flamMainNote('r')).toBe('t')
    expect(flamMainNote('f')).toBe('s')
  })

  it('returns the main stroke when disabling flam on mixed flams', () => {
    expect(flamMainNote('c')).toBe('t')
    expect(flamMainNote('g')).toBe('s')
  })

  it('assigns default double flams for tone and slap only', () => {
    expect(defaultFlamForNote('b')).toBeNull()
    expect(defaultFlamForNote('t')).toBe('r')
    expect(defaultFlamForNote('s')).toBe('f')
  })

  it('does not assign a default flam for rests', () => {
    expect(defaultFlamForNote('-')).toBeNull()
  })

  it('restores a rest when disabling flam applied from a pause', () => {
    expect(flamDisableTarget('-', 'r')).toBe('-')
    expect(flamDisableTarget('-', 'f')).toBe('-')
  })

  it('restores the main stroke when disabling flam applied from a plain note', () => {
    expect(flamDisableTarget('t', 'r')).toBe('t')
    expect(flamDisableTarget('s', 'f')).toBe('s')
  })

  it('picks enable targets for plain notes and existing flams only', () => {
    expect(flamEnableTarget('-', 'djembe')).toBeNull()
    expect(flamEnableTarget('t', 'djembe')).toBe('r')
    expect(flamEnableTarget('r', 'djembe')).toBe('r')
    expect(flamEnableTarget('-', 'dundunba')).toBeNull()
  })

  it('recognises flam symbols only for djembe', () => {
    expect(isFlamSymbol('r', 'djembe')).toBe(true)
    expect(isFlamSymbol('r', 'dundunba')).toBe(false)
  })
})
