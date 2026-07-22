// @vitest-environment happy-dom

import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { RhythmMetadataForm } from '@/features/editor/rhythm-metadata-form'

describe('RhythmMetadataForm slug field', () => {
  it('shows the real rhythm slug, not a title-derived preview', () => {
    render(
      <RhythmMetadataForm
        onChange={vi.fn()}
        values={{
          title: 'share-test',
          slug: 'share-test-wp3',
          description: '',
          meter: 4,
          tempo: 110,
          swingPattern: '--------',
          signalPattern: '',
          rhythmGroup: [],
          origin: [],
          author: [],
          tags: [],
        }}
      />,
    )

    expect(screen.getByDisplayValue('share-test-wp3')).toBeInTheDocument()
    expect(screen.queryByDisplayValue('share-test')).toBeInTheDocument()
  })
})
