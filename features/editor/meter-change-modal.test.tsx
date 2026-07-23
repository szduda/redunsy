// @vitest-environment happy-dom

import { cleanup, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { MeterChangeModal } from '@/features/editor/meter-change-modal'
import { createTrack } from '@/features/rhythm/rhythm-helpers'

vi.mock('@/features/shared/use-focus-trap', () => ({
  useFocusTrap: vi.fn(),
}))

describe('MeterChangeModal', () => {
  const tracks = [createTrack('djembe', 4), createTrack('bell', 4)]

  afterEach(() => {
    cleanup()
  })

  it('lists tracks selected by default and labels the filled CTA Clear all', () => {
    render(
      <MeterChangeModal
        onCancel={vi.fn()}
        onClear={vi.fn()}
        onWhatever={vi.fn()}
        open
        tracks={tracks}
      />,
    )

    const dialog = screen.getByRole('dialog', { name: /meter applies only to new tracks/i })
    expect(within(dialog).getByRole('switch', { name: 'Djembe' })).toHaveAttribute(
      'aria-checked',
      'true',
    )
    expect(within(dialog).getByRole('switch', { name: 'Bell' })).toHaveAttribute(
      'aria-checked',
      'true',
    )
    expect(within(dialog).getByRole('button', { name: 'Clear all' })).toBeTruthy()
    expect(within(dialog).getByRole('button', { name: 'Whatever' })).toBeTruthy()
  })

  it('switches the filled CTA to Clear selected when a track is toggled off', async () => {
    const user = userEvent.setup()
    const onClear = vi.fn()

    render(
      <MeterChangeModal
        onCancel={vi.fn()}
        onClear={onClear}
        onWhatever={vi.fn()}
        open
        tracks={tracks}
      />,
    )

    const dialog = screen.getByRole('dialog')
    await user.click(within(dialog).getByRole('switch', { name: 'Bell' }))
    expect(within(dialog).getByRole('button', { name: 'Clear selected' })).toBeTruthy()

    await user.click(within(dialog).getByRole('button', { name: 'Clear selected' }))
    expect(onClear).toHaveBeenCalledWith(['djembe'])
  })

  it('calls onWhatever from the subtle CTA', async () => {
    const user = userEvent.setup()
    const onWhatever = vi.fn()

    render(
      <MeterChangeModal
        onCancel={vi.fn()}
        onClear={vi.fn()}
        onWhatever={onWhatever}
        open
        tracks={tracks}
      />,
    )

    await user.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Whatever' }))
    expect(onWhatever).toHaveBeenCalledOnce()
  })
})
