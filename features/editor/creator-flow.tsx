'use client'

import { useEditorStore } from '@/features/editor/editor.store'
import type { RhythmInstrument } from '@/features/rhythm/rhythm.types'
import { Button } from '@/features/theme/button'
import { Input } from '@/features/theme/input'
import { Text } from '@/features/theme/text'

const LAYER_OPTIONS: RhythmInstrument[] = ['djembe', 'dundunba', 'sangban', 'kenkeni', 'bell']

export const CreatorFlow = () => {
  const creatorStep = useEditorStore((state) => state.creatorStep)
  const draft = useEditorStore((state) => state.creatorDraft)
  const updateCreatorDraft = useEditorStore((state) => state.updateCreatorDraft)
  const setCreatorStep = useEditorStore((state) => state.setCreatorStep)
  const finishCreator = useEditorStore((state) => state.finishCreator)

  if (creatorStep === 1) {
    return (
      <div className="flex w-full max-w-lg flex-col gap-4">
        <Text>Step 1 — rhythm info (optional)</Text>
        <Input
          onChange={(event) => updateCreatorDraft({ title: event.target.value })}
          placeholder="Title (auto-generated if empty)"
          value={draft.title}
        />
        <Input
          onChange={(event) => updateCreatorDraft({ author: event.target.value })}
          placeholder="Author"
          value={draft.author}
        />
        <Input
          onChange={(event) => updateCreatorDraft({ description: event.target.value })}
          placeholder="Description"
          value={draft.description}
        />
        <Input
          onChange={(event) => updateCreatorDraft({ tags: event.target.value })}
          placeholder="Tags (comma separated)"
          value={draft.tags}
        />
        <label className="flex flex-col gap-1 text-sm text-zinc-600 dark:text-zinc-400">
          Beat size
          <select
            className="rounded-lg border border-zinc-200 bg-white px-3 py-2 dark:border-zinc-700 dark:bg-zinc-950"
            onChange={(event) => updateCreatorDraft({ meter: Number(event.target.value) as 3 | 4 })}
            value={draft.meter}
          >
            <option value={4}>4 (default)</option>
            <option value={3}>3</option>
          </select>
        </label>
        <label className="flex flex-col gap-1 text-sm text-zinc-600 dark:text-zinc-400">
          Tempo
          <Input
            max={200}
            min={60}
            onChange={(event) => updateCreatorDraft({ tempo: Number(event.target.value) })}
            type="number"
            value={draft.tempo}
          />
        </label>
        <Input
          maxLength={draft.meter * 2}
          onChange={(event) => updateCreatorDraft({ swingPattern: event.target.value })}
          placeholder="Swing pattern"
          value={draft.swingPattern}
        />
        <Input
          onChange={(event) => updateCreatorDraft({ signalPattern: event.target.value })}
          placeholder="Signal pattern"
          value={draft.signalPattern}
        />
        <div className="flex gap-2">
          <Button onClick={() => setCreatorStep(2)}>Continue</Button>
          <Button onClick={() => setCreatorStep(2)} variant="outlined">
            Skip
          </Button>
        </div>
      </div>
    )
  }

  if (creatorStep === 2) {
    return (
      <div className="flex w-full max-w-lg flex-col gap-4">
        <Text>Step 2 — choose instrument layers</Text>
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
          <label className="flex items-center gap-2 text-sm text-zinc-700 dark:text-zinc-300">
            <input
              checked={draft.fillDjembe}
              onChange={(event) => updateCreatorDraft({ fillDjembe: event.target.checked })}
              type="checkbox"
            />
            Prefill djembe with {draft.meter === 4 ? '2× s--ss-tt' : '2× s-ts--'}
          </label>
        ) : null}
        <div className="flex gap-2">
          <Button disabled={draft.layers.length === 0} onClick={() => setCreatorStep(3)}>
            Continue
          </Button>
          <Button onClick={() => setCreatorStep(1)} variant="outlined">
            Back
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex w-full max-w-lg flex-col gap-4">
      <Text>Step 3 — ready to edit</Text>
      <Text className="opacity-70">
        Two empty bars per layer. Metadata stays collapsed at the top in the editor and saves automatically.
      </Text>
      <div className="flex gap-2">
        <Button onClick={finishCreator}>Open editor</Button>
        <Button onClick={() => setCreatorStep(2)} variant="outlined">
          Back
        </Button>
      </div>
    </div>
  )
}
