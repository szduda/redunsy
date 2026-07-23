import { describe, expect, it } from 'vitest'

import {
  collapseSwingPattern,
  cycleSwingSymbolBackward,
  cycleSwingSymbolForward,
  expandSwingPattern,
  swingPatternWithLockedDownbeat,
  updateSwingPatternCell,
} from '@/features/groovy-player/swing-pattern-cycle'

describe('swing pattern cycle', () => {
  it('cycles forward: dot, <, <<, >, >>', () => {
    expect(cycleSwingSymbolForward('-')).toBe('(')
    expect(cycleSwingSymbolForward('(')).toBe('<')
    expect(cycleSwingSymbolForward('<')).toBe(')')
    expect(cycleSwingSymbolForward(')')).toBe('>')
    expect(cycleSwingSymbolForward('>')).toBe('-')
  })

  it('cycles backward: >>, >, <<, <, dot', () => {
    expect(cycleSwingSymbolBackward('-')).toBe('>')
    expect(cycleSwingSymbolBackward('>')).toBe(')')
    expect(cycleSwingSymbolBackward(')')).toBe('<')
    expect(cycleSwingSymbolBackward('<')).toBe('(')
    expect(cycleSwingSymbolBackward('(')).toBe('-')
  })

  it('locks the first downbeat to straight', () => {
    expect(swingPatternWithLockedDownbeat('>->->->', 6)).toBe('-->->-')
    expect(swingPatternWithLockedDownbeat('-<(-<(', 6)).toBe('-<(-<(')
  })

  it('expands a compact beat-group across the bar', () => {
    expect(expandSwingPattern('-<(', 6, 1)).toBe('-<(-<(')
    expect(expandSwingPattern('->>-', 8, 1)).toBe('->>-->>-')
  })

  it('collapses the full pattern to the first beat-group', () => {
    expect(collapseSwingPattern('-<(-<(', 6, 1)).toBe('-<(')
    expect(collapseSwingPattern('->>-->>-', 8, 1)).toBe('->>-')
  })

  it('updates a visible cell and mirrors the rest', () => {
    expect(updateSwingPatternCell('------', 6, 1, 2, '<')).toBe('--<--<')
  })
})
