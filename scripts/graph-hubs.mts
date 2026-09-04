export type Hub = {
  source: string
  inbound: number
  outbound: number
  shared: boolean
}

/** Folders that are supposed to be imported from everywhere. High fan-in is healthy. */
export const SHARED_KERNELS = [
  'features/theme',
  'features/icons',
  'features/layout',
  'features/shared',
  'features/store',
  'features/rhythm',
  'features/logo',
  'features/groovy-player',
  'lib',
  'lib/midinike',
] as const

export const isSharedKernel = (source: string) =>
  SHARED_KERNELS.some((kernel) => source === kernel || source.startsWith(`${kernel}/`))

export const rankHubs = (modules: { source: string; dependencies: { resolved: string }[] }[]) => {
  const inbound = new Map<string, number>()
  for (const mod of modules) {
    if (!inbound.has(mod.source)) inbound.set(mod.source, 0)
    for (const dep of mod.dependencies) {
      inbound.set(dep.resolved, (inbound.get(dep.resolved) ?? 0) + 1)
    }
  }
  return modules
    .map((mod) => ({
      source: mod.source,
      inbound: inbound.get(mod.source) ?? 0,
      outbound: mod.dependencies.length,
      shared: isSharedKernel(mod.source),
    }))
    .sort((left, right) => right.inbound - left.inbound || right.outbound - left.outbound)
}

export const classifyHubs = (hubs: Hub[]) => ({
  shared: hubs.filter((hub) => hub.shared && hub.inbound > 0),
  other: hubs.filter((hub) => !hub.shared && hub.inbound >= 3),
})
