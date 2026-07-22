import { describe, expect, it } from 'vitest'

import {
  cycleSwingSymbolBackward,
  cycleSwingSymbolForward,
  swingPatternWithLockedDownbeat,
} from '@/features/groovy-player/swing-pattern-cycle'

describe('swing pattern cycle', () => {
  it('cycles forward through all groove symbols', () => {
    expect(cycleSwingSymbolForward('-')).toBe('(')
    expect(cycleSwingSymbolForward('(')).toBe('<')
    expect(cycleSwingSymbolForward('<')).toBe('>')
    expect(cycleSwingSymbolForward('>')).toBe(')')
    expect(cycleSwingSymbolForward(')')).toBe('-')
  })

  it('cycles backward through all groove symbols', () => {
    expect(cycleSwingSymbolBackward('-')).toBe(')')
    expect(cycleSwingSymbolBackward(')')).toBe('>')
    expect(cycleSwingSymbolBackward('>')).toBe('<')
    expect(cycleSwingSymbolBackward('<')).toBe('(')
    expect(cycleSwingSymbolBackward('(')).toBe('-')
  })

  it('locks the first downbeat to straight', () => {
    expect(swingPatternWithLockedDownbeat('>->->->', 6)).toBe('-->->-')
    expect(swingPatternWithLockedDownbeat('-<(-<(', 6)).toBe('-<(-<(')
  })
})
