import { describe, expect, it } from 'vitest'

import {
  absorbPlainIntoPolyrhythmInner,
  canAbsorbPlainIntoPolyrhythm,
  hasConvertedPolyrhythmGlue,
  isEditorAnchoredPolyrhythmInner,
  shouldAbsorbPlainIntoPolyrhythm,
} from './polyrhythm-glue'
import { isGroupGlue } from './grouped-notation'

describe('polyrhythm glue', () => {
  it('detects only editor-converted polyrhythm groups', () => {
    expect(hasConvertedPolyrhythmGlue('t--s--')).toBe(true)
    expect(hasConvertedPolyrhythmGlue('b-----')).toBe(false)
    expect(hasConvertedPolyrhythmGlue('------')).toBe(false)
    expect(hasConvertedPolyrhythmGlue('fststs')).toBe(false)
  })

  it('detects edited editor-anchored polyrhythm groups', () => {
    expect(isEditorAnchoredPolyrhythmInner('t--s--')).toBe(true)
    expect(isEditorAnchoredPolyrhythmInner('ts-s--')).toBe(true)
    expect(isEditorAnchoredPolyrhythmInner('fststs')).toBe(false)
    expect(isEditorAnchoredPolyrhythmInner('b-----')).toBe(false)
  })

  it('does not treat glue before an edited editor-anchored polyrhythm group', () => {
    expect(isGroupGlue('s---s-<ss-s-->', 5)).toBe(false)
    expect(canAbsorbPlainIntoPolyrhythm('s---s-<ss-s-->', 4)).toBeNull()
  })

  it('does not treat glue before an explicit polyrhythm group as converted', () => {
    expect(isGroupGlue('b-<b----->', 1)).toBe(true)
    expect(isGroupGlue('b-<fststs>', 1)).toBe(true)
  })

  it('does not treat glue before an editor-converted polyrhythm group', () => {
    expect(isGroupGlue('b-<t--s-->', 1)).toBe(false)
  })

  it('absorbs a plain note into an all-rest polyrhythm group', () => {
    expect(canAbsorbPlainIntoPolyrhythm('b-<------>s---', 0)).toEqual({
      plain: 'b',
      glueIndex: 1,
      openIndex: 2,
      end: 9,
      inner: 'b-----',
    })
  })

  it('absorbs a plain note linked to an explicit first-slot polyrhythm group', () => {
    expect(canAbsorbPlainIntoPolyrhythm('b-<b----->s---', 0)).toEqual({
      plain: 'b',
      glueIndex: 1,
      openIndex: 2,
      end: 9,
      inner: 'b-----',
    })
    expect(canAbsorbPlainIntoPolyrhythm('b-<fststs>s---', 0)).toBeNull()
    expect(shouldAbsorbPlainIntoPolyrhythm('b', 'fststs')).toBe(false)
    expect(absorbPlainIntoPolyrhythmInner('b', 'fststs')).toBe('fststs')
  })
})
