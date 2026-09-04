import type { ICruiseResult, IViolation } from 'dependency-cruiser'

import { classifyHubs, rankHubs, type Hub } from './graph-hubs.mts'

const escapeHtml = (value: string) =>
  value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;')

const listItems = (items: string[], empty: string) =>
  items.length === 0
    ? `<p class="empty">${escapeHtml(empty)}</p>`
    : `<ul>${items.map((item) => `<li><code>${escapeHtml(item)}</code></li>`).join('')}</ul>`

const cycleLine = (violation: IViolation) =>
  violation.cycle?.length
    ? violation.cycle.map((step) => step.name).join(' → ')
    : `${violation.from} → ${violation.to}`

const jumpLine = (violation: IViolation) =>
  `${violation.from} → ${violation.to}  (${violation.rule.name})`

const hubLine = (hub: Hub) => `${hub.source}  ← ${hub.inbound} inbound / ${hub.outbound} outbound`

export const buildGraphHtml = (svg: string, result: ICruiseResult, collapsed: ICruiseResult) => {
  const cycles = result.summary.violations.filter((item) => item.rule.name === 'no-circular')
  const jumps = result.summary.violations.filter((item) => item.rule.name.includes('-not-to-'))
  const { shared, other } = classifyHubs(rankHubs(collapsed.modules))

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>Redunsy dependency graph</title>
    <style>
      :root { color-scheme: light; }
      body { margin: 0; font: 14px/1.45 system-ui, sans-serif; color: #0f172a; background: #f8fafc; }
      header { padding: 16px 20px 8px; max-width: 1100px; }
      h1 { font-size: 1.25rem; margin: 0 0 8px; }
      .legend { display: flex; flex-wrap: wrap; gap: 14px 20px; margin: 8px 0 12px; }
      .legend span { display: flex; align-items: center; gap: 6px; }
      .swatch { width: 12px; height: 12px; border-radius: 2px; }
      .panels { display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 12px; }
      section { background: #fff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px 12px; }
      h2 { font-size: 0.8rem; text-transform: uppercase; letter-spacing: 0.04em; margin: 0 0 6px; color: #475569; }
      h3 { font-size: 0.75rem; margin: 10px 0 4px; color: #334155; }
      ul { margin: 0; padding-left: 1.1rem; }
      li { margin: 0.2rem 0; }
      code { font-size: 12px; }
      .empty, .hint { margin: 0 0 8px; color: #64748b; }
      .graph { overflow: auto; background: #fff; border-top: 1px solid #e2e8f0; }
      .node.current path, .node.current polygon { stroke: #d946ef; stroke-width: 2; }
      .edge.current path { stroke: #d946ef; stroke-width: 3; stroke-opacity: 1; }
    </style>
  </head>
  <body>
    <header>
      <h1>Redunsy dependency graph</h1>
      <p>Collapsed to <code>app</code>, <code>features/*</code>, <code>lib</code>, <code>db</code>. A star is not a smell: shared UI should look like one. Hover a node to see its edges.</p>
      <div class="legend">
        <span><i class="swatch" style="background:#93c5fd"></i> shared kernels (expected stars)</span>
        <span><i class="swatch" style="background:#84cc16"></i> folders with cycles (lime)</span>
        <span><i class="swatch" style="background:#ef4444"></i> cycle edges (red)</span>
        <span><i class="swatch" style="background:#f97316"></i> layer jumps (orange)</span>
      </div>
      <div class="panels">
        <section>
          <h2>Hubs</h2>
          <p class="hint">High fan-in + low fan-out is the stable-dependency shape. Unexpected hubs are product features imported by many others.</p>
          <h3>Shared kernels</h3>
          ${listItems(shared.map(hubLine), 'No shared kernels with inbound edges.')}
          <h3>Other hubs</h3>
          ${listItems(other.map(hubLine), 'No surprising high-fan-in features.')}
        </section>
        <section>
          <h2>Cycles (${cycles.length})</h2>
          ${listItems(cycles.slice(0, 12).map(cycleLine), 'No circular dependencies.')}
        </section>
        <section>
          <h2>Layer jumps (${jumps.length})</h2>
          ${listItems(jumps.slice(0, 12).map(jumpLine), 'No layer jumps.')}
        </section>
      </div>
    </header>
    <div class="graph">${svg}</div>
    <script>
      const titleOf = (el) => el?.querySelector('title')?.textContent ?? ''
      const highlight = (title) => {
        document.querySelectorAll('.node, .edge').forEach((el) => {
          el.classList.toggle('current', Boolean(title) && titleOf(el).includes(title))
        })
      }
      document.addEventListener('mousemove', (event) => {
        const hit = event.target.closest('.node, .edge')
        highlight(hit ? titleOf(hit).split('->')[0] : '')
      })
      document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') highlight('')
      })
    </script>
  </body>
</html>
`
}
