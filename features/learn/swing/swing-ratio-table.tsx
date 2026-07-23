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
            {table.headers.map((header) => (
              <th
                className="whitespace-nowrap border-b border-zinc-200 px-3 py-2 font-semibold text-zinc-700 dark:border-zinc-800 dark:text-zinc-300"
                key={header}
                scope="col"
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {table.rows.map((item, index) => (
            <tr
              className={cn('align-top', index % 2 === 1 && 'bg-zinc-50/70 dark:bg-zinc-900/30')}
              key={`${table.id}-${item.label}`}
            >
              <th
                className="whitespace-nowrap border-b border-zinc-200 px-3 py-2 font-medium text-zinc-900 dark:border-zinc-800 dark:text-zinc-100"
                scope="row"
              >
                {item.label}
              </th>
              <td className="border-b border-zinc-200 px-3 py-2 font-mono text-xs text-zinc-700 dark:border-zinc-800 dark:text-zinc-300">
                {item.pattern}
              </td>
              <td className="border-b border-zinc-200 px-3 py-2 font-mono text-xs text-zinc-700 dark:border-zinc-800 dark:text-zinc-300">
                {item.onsets}
              </td>
              <td className="border-b border-zinc-200 px-3 py-2 font-mono text-xs text-zinc-700 dark:border-zinc-800 dark:text-zinc-300">
                {item.ioi}
              </td>
              <td className="border-b border-zinc-200 px-3 py-2 font-mono text-xs text-zinc-700 dark:border-zinc-800 dark:text-zinc-300">
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
