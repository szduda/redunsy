import { readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'

import { decodePlaygroundQuery } from './playground-decode'
import { parseTelegramExport, type TelegramExport } from './parse-export'
import { transformTelegramEntries } from './transform'

const DEFAULT_EXPORT = resolve(
  process.cwd(),
  'scripts/telegram-export-migration/telegram-export.json',
)

const OUTPUT_PATH = resolve(process.cwd(), 'scripts/telegram-export-migration/telegram-rhythms.json')

const exportPath = process.argv[2] ? resolve(process.argv[2]) : DEFAULT_EXPORT

const data = JSON.parse(readFileSync(exportPath, 'utf8')) as TelegramExport
const parsed = parseTelegramExport(data)

const decoded = parsed.flatMap((entry) => {
  try {
    const snippet = decodePlaygroundQuery(entry.query)
    return [{ entry, snippet }]
  } catch (error) {
    console.warn(`Skipping message ${entry.messageId}: ${error instanceof Error ? error.message : error}`)
    return []
  }
})

const rows = transformTelegramEntries(decoded)

writeFileSync(OUTPUT_PATH, `${JSON.stringify(rows, null, 2)}\n`, 'utf8')

console.log(`Parsed ${parsed.length} unique playground links from ${exportPath}`)
console.log(`Decoded ${decoded.length} snippets → ${rows.length} rhythm rows`)
console.log(`Wrote ${OUTPUT_PATH}`)

rows.forEach((row) => {
  const instrumentCount = row.patterns?.length ?? 0
  console.log(`  • ${row.title} (${row.slug}) — ${instrumentCount} patterns, meter ${row.meter}`)
})
