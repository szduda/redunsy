'use client'

import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

import { useFocusTrap } from '@/features/shared/use-focus-trap'
import type { Track } from '@/features/rhythm/rhythm.types'
import { Button } from '@/features/theme/button'
import { Switch } from '@/features/theme/switch'
import { Text } from '@/features/theme/text'
import { cn } from '@/features/theme/cn'

type MeterChangeModalProps = {
  open: boolean
  tracks: Track[]
  onClear: (trackIds: string[]) => void
  onWhatever: () => void
  onCancel: () => void
}

export const MeterChangeModal = ({
  open,
  tracks,
  onClear,
  onWhatever,
  onCancel,
}: MeterChangeModalProps) => {
  const panelRef = useRef<HTMLDivElement>(null)
  const [selectedIds, setSelectedIds] = useState(() => tracks.map((track) => track.id))

  useFocusTrap(panelRef, open)

  useEffect(() => {
    if (!open) return
    setSelectedIds(tracks.map((track) => track.id))
    // Snapshot selection when the dialog opens; ignore later track-array identity churn.
    // eslint-disable-next-line react-hooks/exhaustive-deps -- reset only on open
  }, [open])

  useEffect(() => {
    if (!open) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onCancel()
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [open, onCancel])

  if (!open || typeof document === 'undefined') return null

  const selectedCount = selectedIds.length
  const allSelected = selectedCount === tracks.length && tracks.length > 0
  const clearLabel = allSelected ? 'Clear all' : 'Clear selected'

  const onToggle = (trackId: string, checked: boolean) => {
    setSelectedIds((current) =>
      checked
        ? current.includes(trackId)
          ? current
          : [...current, trackId]
        : current.filter((id) => id !== trackId),
    )
  }

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        aria-label="Cancel meter change"
        className="absolute inset-0 bg-zinc-950/40 dark:bg-black/60"
        onClick={onCancel}
        type="button"
      />
      <div
        ref={panelRef}
        aria-labelledby="meter-change-title"
        aria-modal
        className={cn(
          'relative z-10 flex w-full max-w-sm flex-col gap-4 rounded-xl border p-5 shadow-lg',
          'border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950',
        )}
        role="dialog"
      >
        <div className="flex flex-col gap-2">
          <Text
            className="!text-base !font-semibold !text-zinc-900 dark:!text-zinc-100"
            id="meter-change-title"
          >
            Meter applies only to new tracks
          </Text>
          <Text>Existing tracks must be reattached for the new meter, which will clear them.</Text>
        </div>

        <div className="flex flex-col gap-3">
          {tracks.map((track) => (
            <Switch
              key={track.id}
              checked={selectedIds.includes(track.id)}
              label={track.name}
              onChange={(checked) => onToggle(track.id, checked)}
            />
          ))}
        </div>

        <div className="flex items-center justify-end gap-2">
          <Button onClick={onWhatever} variant="subtle">
            Whatever
          </Button>
          <Button
            disabled={selectedCount === 0}
            onClick={() => onClear(selectedIds)}
            variant="filled"
          >
            {clearLabel}
          </Button>
        </div>
      </div>
    </div>,
    document.body,
  )
}
