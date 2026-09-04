import { spawn } from 'node:child_process'
import { mkdirSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'

import { instance } from '@viz-js/viz'
import { cruise, format } from 'dependency-cruiser'
import type { ICruiseResult } from 'dependency-cruiser'
import extractDepcruiseOptions from 'dependency-cruiser/config-utl/extract-depcruise-options'
import extractTSConfig from 'dependency-cruiser/config-utl/extract-ts-config'

import { buildGraphHtml } from './graph-html.mts'

const ROOT = process.cwd()
const OUTPUT = resolve(ROOT, '.tmp/dependency-graph.html')
const COLLAPSE = '^(app|db|features/[^/]+|lib/midinike|lib)'
const ENTRYPOINTS = ['app', 'auth.ts', 'db', 'features', 'lib']

const asCruiseResult = (output: ICruiseResult | string, label: string) => {
  if (typeof output !== 'string') return output
  try {
    return JSON.parse(output) as ICruiseResult
  } catch {
    throw new Error(`Expected JSON ${label}`)
  }
}

const openHtml = (filePath: string) => {
  const [command, args] =
    process.platform === 'darwin' ? ['open', [filePath]] : ['xdg-open', [filePath]]
  const child = spawn(command, args, { stdio: 'ignore', detached: true })
  child.on('error', () => {
    console.log(`Open ${filePath} in a browser to view the graph.`)
  })
  child.unref()
}

const folderOf = (path: string) => path.match(COLLAPSE)?.[0] ?? path

const cycleHighlight = (result: ICruiseResult) => {
  const folders = result.summary.violations
    .filter((item) => item.rule.name === 'no-circular')
    .flatMap((item) => [item.from, item.to, ...(item.cycle?.map((step) => step.name) ?? [])])
    .map(folderOf)
  return [...new Set(folders)].map((path) => path.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')
}

const main = async () => {
  const cruiseOptions = await extractDepcruiseOptions(resolve(ROOT, '.dependency-cruiser.mjs'))
  const tsConfig = extractTSConfig(resolve(ROOT, 'tsconfig.json'))
  const cruised = await cruise(ENTRYPOINTS, cruiseOptions, undefined, { tsConfig })
  const result = asCruiseResult(cruised.output, 'cruise result')

  const collapsed = asCruiseResult(
    (await format(result, { outputType: 'json', collapse: COLLAPSE })).output,
    'collapsed graph',
  )
  const highlight = cycleHighlight(result)
  const { output: dot } = await format(result, {
    outputType: 'dot',
    collapse: COLLAPSE,
    ...(highlight ? { highlight } : {}),
    reporterOptions: cruiseOptions.reporterOptions,
  })
  if (typeof dot !== 'string') throw new Error('Expected DOT output')

  const viz = await instance()
  const svg = viz.renderString(dot, { format: 'svg', engine: 'dot' })
  mkdirSync(resolve(ROOT, '.tmp'), { recursive: true })
  writeFileSync(OUTPUT, buildGraphHtml(svg, result, collapsed))

  const cycles = result.summary.violations.filter((item) => item.rule.name === 'no-circular')
  const jumps = result.summary.violations.filter((item) => item.rule.name.includes('-not-to-'))
  console.log(`Wrote ${OUTPUT}`)
  console.log(`Cycles: ${cycles.length}  Layer jumps: ${jumps.length}`)
  openHtml(OUTPUT)
}

main().catch((error: unknown) => {
  console.error(error)
  process.exit(1)
})
