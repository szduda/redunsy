'use client'

import type { ReactNode } from 'react'

import { CreatorBottomNav } from '@/features/editor/creator-bottom-nav'
import { CreatorSummary } from '@/features/editor/creator-summary'
import { useEditorStore } from '@/features/editor/editor.store'
import { RhythmMetadataForm } from '@/features/editor/rhythm-metadata-form'
import { DEMO_BAR_DEFAULT_PATTERN, DemoBar } from '@/features/help/demo-bar'
import { PageBottomNav } from '@/features/layout/page-bottom-nav'
import type { RhythmInstrument } from '@/features/rhythm/rhythm.types'
import { Button } from '@/features/theme/button'
import { Switch } from '@/features/theme/switch'
import { Text } from '@/features/theme/text'

const LAYER_OPTIONS: RhythmInstrument[] = ['djembe', 'dundunba', 'sangban', 'kenkeni', 'bell']

const CreatorConfigNotice = () => (
  <Text className="rounded-lg border border-zinc-200/80 bg-zinc-50 px-3 py-2 !text-zinc-600 dark:border-zinc-800/80 dark:bg-zinc-900/50 dark:!text-zinc-400">
    All configuration can be changed later in the editor.
  </Text>
)

const CreatorFlowShell = ({ title, children }: { title: string; children: ReactNode }) => (
  <div className="mx-auto flex w-full max-w-2xl flex-col gap-5 p-4 lg:pt-4 xl:px-6 xl:pt-6 md:p-0">
    <CreatorConfigNotice />
    <div className="flex flex-col gap-4">
      <h1 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">{title}</h1>
      {children}
    </div>
  </div>
)

export const CreatorFlow = () => {
  const creatorStep = useEditorStore((state) => state.creatorStep)
  const draft = useEditorStore((state) => state.creatorDraft)
  const updateCreatorDraft = useEditorStore((state) => state.updateCreatorDraft)
  const setCreatorStep = useEditorStore((state) => state.setCreatorStep)
  const finishCreator = useEditorStore((state) => state.finishCreator)
  const backToPicker = useEditorStore((state) => state.backToPicker)

  const onContinue = () => {
    if (creatorStep === 1) setCreatorStep(2)
    else if (creatorStep === 2) setCreatorStep(3)
    else finishCreator()
  }

  const onBack = () => {
    if (creatorStep === 1) backToPicker()
    else setCreatorStep((creatorStep - 1) as 1 | 2)
  }

  const continueDisabled = creatorStep === 2 && draft.layers.length === 0

  const stepContent = (() => {
    if (creatorStep === 1) {
      return (
        <CreatorFlowShell title="Rhythm info (optional)">
          <RhythmMetadataForm
            onChange={updateCreatorDraft}
            titlePlaceholder="Auto-generated if empty"
            values={draft}
          />
        </CreatorFlowShell>
      )
    }

    if (creatorStep === 2) {
      const prefillPattern = DEMO_BAR_DEFAULT_PATTERN[draft.meter]

      return (
        <CreatorFlowShell title="Choose instrument layers">
          <div className="flex flex-wrap gap-2">
            {LAYER_OPTIONS.map((layer) => {
              const selected = draft.layers.includes(layer)
              return (
                <Button
                  key={layer}
                  onClick={() =>
                    updateCreatorDraft({
                      layers: selected
                        ? draft.layers.filter((item) => item !== layer)
                        : [...draft.layers, layer],
                    })
                  }
                  variant={selected ? 'filled' : 'outlined'}
                >
                  {layer}
                </Button>
              )
            })}
          </div>

          {draft.layers.includes('djembe') ? (
            <div className="flex flex-col gap-3 rounded-xl border border-zinc-200 bg-zinc-50/80 p-4 dark:border-zinc-800 dark:bg-zinc-900/40">
              <div className="flex flex-col gap-2">
                <Text className="!text-zinc-600 dark:!text-zinc-400">
                  {draft.fillDjembe
                    ? 'Each bar will use this starter pattern:'
                    : 'Starter pattern if you opt in to prefill:'}
                </Text>
                <div className="flex flex-wrap items-center gap-3">
                  <DemoBar active={draft.fillDjembe} meter={draft.meter} pattern={prefillPattern} />
                  <Text className="!font-mono !text-zinc-500" variant="mono">
                    {prefillPattern}
                  </Text>
                </div>
              </div>
              <Switch
                checked={draft.fillDjembe}
                label="Prefill djembe with starter pattern (× 2 bars)"
                onChange={(fillDjembe) => updateCreatorDraft({ fillDjembe })}
              />
            </div>
          ) : null}
        </CreatorFlowShell>
      )
    }

    return (
      <CreatorFlowShell title="Ready to edit">
        <CreatorSummary draft={draft} />
      </CreatorFlowShell>
    )
  })()

  return (
    <>
      {stepContent}
      <PageBottomNav>
        <CreatorBottomNav
          continueDisabled={continueDisabled}
          currentStep={creatorStep}
          onBack={onBack}
          onContinue={onContinue}
          onStepSelect={setCreatorStep}
        />
      </PageBottomNav>
    </>
  )
}
