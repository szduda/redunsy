import { describe, expect, it } from 'vitest'

import { classifyHubs, isSharedKernel, rankHubs } from './graph-hubs.mts'

describe('graph hubs', () => {
  it('treats theme, icons, and layout as intended shared kernels', () => {
    expect(isSharedKernel('features/theme')).toBe(true)
    expect(isSharedKernel('features/icons')).toBe(true)
    expect(isSharedKernel('features/layout')).toBe(true)
    expect(isSharedKernel('features/groovy-player')).toBe(false)
  })

  it('splits high fan-in shared kernels from surprising feature hubs', () => {
    const hubs = rankHubs([
      { source: 'features/theme', dependencies: [] },
      { source: 'features/groovy-player', dependencies: [{ resolved: 'features/theme' }] },
      { source: 'features/editor', dependencies: [{ resolved: 'features/theme' }] },
      { source: 'features/help', dependencies: [{ resolved: 'features/groovy-player' }] },
      { source: 'app', dependencies: [{ resolved: 'features/groovy-player' }] },
      { source: 'features/garage', dependencies: [{ resolved: 'features/groovy-player' }] },
    ])
    const { shared, other } = classifyHubs(hubs)
    expect(shared.map((hub) => hub.source)).toEqual(['features/theme'])
    expect(other.map((hub) => hub.source)).toEqual(['features/groovy-player'])
  })
})
