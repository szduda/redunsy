// @vitest-environment happy-dom

import { cleanup, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { PublishGate } from '@/features/admin/publish-gate'
import { hasAdminHintCookie } from '@/features/admin/admin-cookies'
import { renderWithPublishProviders, sampleRhythm } from '@/features/admin/publish-as.test-helpers'

vi.mock('@/features/admin/admin-cookies', () => ({
  hasAdminHintCookie: vi.fn(),
}))

vi.mock('next/dynamic', () => ({
  default:
    () =>
    ({ rhythm }: { rhythm: { slug: string } }) => (
      <div data-testid="publish-rhythm-button">{rhythm.slug}</div>
    ),
}))

const hasAdminHintCookieMock = vi.mocked(hasAdminHintCookie)

describe('PublishGate', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ authenticated: true }),
      }),
    )
  })

  afterEach(() => {
    cleanup()
    vi.unstubAllGlobals()
  })

  it('renders nothing when the admin hint cookie is absent', () => {
    hasAdminHintCookieMock.mockReturnValue(false)

    renderWithPublishProviders(<PublishGate rhythm={sampleRhythm()} />)

    expect(screen.queryByTestId('publish-rhythm-button')).not.toBeInTheDocument()
    expect(fetch).not.toHaveBeenCalled()
  })

  it('renders nothing when the hint cookie is present but the session is unauthenticated', async () => {
    hasAdminHintCookieMock.mockReturnValue(true)
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ authenticated: false }),
      }),
    )

    renderWithPublishProviders(<PublishGate rhythm={sampleRhythm()} />)

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith('/api/admin/session')
    })
    expect(screen.queryByTestId('publish-rhythm-button')).not.toBeInTheDocument()
  })

  it('renders the publish button when the hint cookie and session are valid', async () => {
    hasAdminHintCookieMock.mockReturnValue(true)

    renderWithPublishProviders(<PublishGate rhythm={sampleRhythm()} />)

    expect(await screen.findByTestId('publish-rhythm-button')).toHaveTextContent('my-rhythm-abc12')
    expect(fetch).toHaveBeenCalledWith('/api/admin/session')
  })

  it('renders nothing when the session check request fails', async () => {
    hasAdminHintCookieMock.mockReturnValue(true)
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        status: 401,
      }),
    )

    renderWithPublishProviders(<PublishGate rhythm={sampleRhythm()} />)

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith('/api/admin/session')
    })
    expect(screen.queryByTestId('publish-rhythm-button')).not.toBeInTheDocument()
  })
})
