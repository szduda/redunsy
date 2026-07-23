import type { SwingTable } from '@/features/learn/swing/swing-article.types'
import { Text } from '@/features/theme/text'
import { cn } from '@/features/theme/cn'

type SwingRatioTableProps = {
  table: SwingTable
}

export const SwingRatioTable = ({ table }: SwingRatioTableProps) => (
  <section aria-labelledby={`swing-table-${table.id}`} className="space-y-3">
    <div className="space-y-2">
      <h3
        className="text-lg font-semibold tracking-tight text-zinc-900 dark:text-zinc-100"
        id={`swing-table-${table.id}`}
      >
        {table.title}
      </h3>
      <Text className="text-pretty leading-relaxed">{table.caption}</Text>
    </div>

    <div className="overflow-x-auto rounded-md border border-zinc-200 dark:border-zinc-800">
      <table className="min-w-full border-collapse text-left text-sm">
        <thead className="bg-zinc-50 dark:bg-zinc-900/60">
          <tr>
            {table.headers.map((header, index) => (
              <th
                className="whitespace-nowrap border-b border-zinc-200 px-3 py-2 font-semibold text-zinc-700 dark:border-zinc-800 dark:text-zinc-300"
                key={`h-${index}-${header || 'blank'}`}
                scope="col"
              >
                {header || <span className="sr-only">Source</span>}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {table.rows.map((item) => (
            <tr
              className={cn(
                'align-top',
                item.highlight
                  ? 'bg-yellowy/15 dark:bg-yellowy/10'
                  : 'odd:bg-zinc-50/70 dark:odd:bg-zinc-900/30',
              )}
              key={`${table.id}-${item.label}`}
            >
              <th
                className={cn(
                  'whitespace-nowrap border-b border-zinc-200 px-3 py-2 font-mono text-xs dark:border-zinc-800',
                  item.highlight
                    ? 'font-semibold text-zinc-900 dark:text-zinc-100'
                    : 'font-medium text-zinc-800 dark:text-zinc-200',
                )}
                scope="row"
              >
                {item.label}
              </th>
              <td
                className={cn(
                  'border-b border-zinc-200 px-3 py-2 font-mono text-xs dark:border-zinc-800',
                  item.highlight
                    ? 'font-semibold text-zinc-900 dark:text-zinc-100'
                    : 'text-zinc-700 dark:text-zinc-300',
                )}
              >
                {item.percent}
              </td>
              <td className="border-b border-zinc-200 px-3 py-2 text-zinc-600 dark:border-zinc-800 dark:text-zinc-400">
                {item.note}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </section>
)
