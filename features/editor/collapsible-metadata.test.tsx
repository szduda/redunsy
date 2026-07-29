// @vitest-environment happy-dom

import { cleanup, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { CollapsibleMetadata } from '@/features/editor/collapsible-metadata'
import { createRhythm, createTrack } from '@/features/rhythm/rhythm-helpers'

vi.mock('@/features/shared/use-focus-trap', () => ({
  useFocusTrap: vi.fn(),
}))

describe('CollapsibleMetadata meter change', () => {
  afterEach(() => {
    cleanup()
  })

  it('opens the reattach modal instead of applying meter immediately', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    const onMeterChange = vi.fn()
    const rhythm = {
      ...createRhythm({ title: 'Demo', meter: 4, layers: ['djembe'] }),
      instruments: { djembe: createTrack('djembe', 4, ['s--ss-tt', 's--ss-tt']) },
    }

    render(
      <CollapsibleMetadata
        onChange={onChange}
        onMeterChange={onMeterChange}
        onTitleBlur={vi.fn()}
        rhythm={rhythm}
      />,
    )

    await user.click(screen.getByText('Demo'))
    await user.click(screen.getByRole('button', { name: 'on 3' }))

    expect(onChange).not.toHaveBeenCalled()
    expect(onMeterChange).not.toHaveBeenCalled()
    expect(screen.getByRole('dialog')).toBeTruthy()

    await user.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Clear all' }))
    expect(onMeterChange).toHaveBeenCalledWith(3, ['djembe'])
  })

  it('applies meter without clearing when Whatever is chosen', async () => {
    const user = userEvent.setup()
    const onMeterChange = vi.fn()
    const rhythm = createRhythm({ title: 'Demo', meter: 4, layers: ['djembe', 'bell'] })

    render(
      <CollapsibleMetadata
        onChange={vi.fn()}
        onMeterChange={onMeterChange}
        onTitleBlur={vi.fn()}
        rhythm={rhythm}
      />,
    )

    await user.click(screen.getByText('Demo'))
    await user.click(screen.getByRole('button', { name: 'on 3' }))
    await user.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Whatever' }))

    expect(onMeterChange).toHaveBeenCalledWith(3, [])
  })
})
