'use client'

import type { ReactNode } from 'react'

import { DEMO_BAR_DEFAULT_PATTERN, DemoBar } from '@/features/help/demo-bar'
import type { CreatorDraft } from '@/features/editor/editor.store'
import { metadataSummary } from '@/features/editor/rhythm-metadata-form'
import { Text } from '@/features/theme/text'
import { cn } from '@/features/theme/cn'

type CreatorSummaryProps = {
  draft: CreatorDraft
}

const SummaryRow = ({ label, children }: { label: string; children: ReactNode }) => (
  <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:gap-4">
    <Text className="w-24 shrink-0 !text-zinc-500" variant="mono">
      {label}
    </Text>
    <div className="min-w-0 flex-1">{children}</div>
  </div>
)

const layerChipClass =
  'rounded-full border border-zinc-200 bg-zinc-50 px-2.5 py-0.5 text-xs font-medium capitalize text-zinc-700 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300'

export const CreatorSummary = ({ draft }: CreatorSummaryProps) => {
  const title = draft.title.trim() || 'Untitled rhythm'
  const prefillPattern = DEMO_BAR_DEFAULT_PATTERN[draft.meter]

  return (
    <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
      <div className="border-b border-zinc-200/80 bg-zinc-50/80 px-4 py-4 dark:border-zinc-800/80 dark:bg-zinc-900/40">
        <p className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">{title}</p>
        <Text className="mt-1">{metadataSummary(draft, draft.layers)}</Text>
      </div>

      <div className="flex flex-col gap-4 px-4 py-4">
        <SummaryRow label="Layers">
          <div className="flex flex-wrap gap-1.5">
            {draft.layers.map((layer) => (
              <span key={layer} className={layerChipClass}>
                {layer}
              </span>
            ))}
          </div>
        </SummaryRow>

        <SummaryRow label="Bars">
          <Text>Two bars per layer — empty unless prefilled below.</Text>
        </SummaryRow>

        {draft.layers.includes('djembe') ? (
          <SummaryRow label="Djembe">
            {draft.fillDjembe ? (
              <div className="flex flex-col gap-2">
                <Text>Prefilled with the starter pattern (× 2 bars)</Text>
                <div className="flex flex-wrap items-center gap-2">
                  <DemoBar meter={draft.meter} pattern={prefillPattern} />
                  <Text className="!font-mono !text-zinc-500" variant="mono">
                    {prefillPattern}
                  </Text>
                </div>
              </div>
            ) : (
              <Text>Empty bars — add your own pattern in the editor.</Text>
            )}
          </SummaryRow>
        ) : null}

        {draft.description.trim() ? (
          <SummaryRow label="About">
            <Text>{draft.description.trim()}</Text>
          </SummaryRow>
        ) : null}
      </div>

      <div
        className={cn(
          'border-t border-zinc-200/80 px-4 py-3 dark:border-zinc-800/80',
          'bg-yellowy/10 dark:bg-yellowy/5',
        )}
      >
        <Text className="!text-zinc-700 dark:!text-zinc-300">
          Metadata stays collapsed at the top in the editor. Everything saves automatically as you
          edit.
        </Text>
      </div>
    </div>
  )
}
