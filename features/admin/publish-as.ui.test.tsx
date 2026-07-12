// @vitest-environment happy-dom

import { cleanup, fireEvent, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { PublishPopover } from '@/features/admin/publish-popover'
import { PublishSlugInput } from '@/features/admin/publish-slug-input'
import {
  renderWithPublishProviders,
  sampleRhythm,
  stubPopoverLayoutMetrics,
} from '@/features/admin/publish-as.test-helpers'

const publishFetchMock = vi.fn()
const pageStatusFetchMock = vi.fn()

const routeFetch = (input: RequestInfo | URL, init?: RequestInit) => {
  const url = typeof input === 'string' ? input : input.toString()

  if (url.includes('/api/admin/rhythms')) {
    return publishFetchMock(url, init)
  }

  if (init?.method === 'HEAD' && url.includes('/rhythm/')) {
    return pageStatusFetchMock(url, init)
  }

  return Promise.reject(new Error(`Unexpected fetch: ${url}`))
}

describe('PublishSlugInput', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.stubGlobal('fetch', routeFetch)
    pageStatusFetchMock.mockResolvedValue({ status: 404, ok: false })
  })

  afterEach(() => {
    cleanup()
    vi.unstubAllGlobals()
  })

  it('checks slug availability on blur and shows 404 for new slugs', async () => {
    const onChange = vi.fn()

    renderWithPublishProviders(<PublishSlugInput onChange={onChange} value="brand-new-slug" />)

    fireEvent.blur(screen.getByPlaceholderText('slug'))

    await waitFor(() => {
      expect(pageStatusFetchMock).toHaveBeenCalledWith(
        'http://localhost:3000/rhythm/brand-new-slug',
        { method: 'HEAD', cache: 'no-store' },
      )
    })

    expect(await screen.findByLabelText('Page status 404')).toHaveTextContent('404')
  })

  it('shows 200 when the slug page already exists', async () => {
    pageStatusFetchMock.mockResolvedValue({ status: 200, ok: true })
    const user = userEvent.setup()

    renderWithPublishProviders(<PublishSlugInput onChange={vi.fn()} value="existing-slug" />)

    await user.click(screen.getByLabelText('Check if rhythm page exists'))

    expect(await screen.findByLabelText('Page status 200')).toHaveTextContent('200')
  })

  it('clears slug check result when the input value changes', async () => {
    pageStatusFetchMock.mockResolvedValue({ status: 200, ok: true })
    const user = userEvent.setup()
    const onChange = vi.fn()

    renderWithPublishProviders(<PublishSlugInput onChange={onChange} value="existing-slug" />)
    await user.click(screen.getByLabelText('Check if rhythm page exists'))
    expect(await screen.findByLabelText('Page status 200')).toBeInTheDocument()

    await user.clear(screen.getByPlaceholderText('slug'))
    await user.type(screen.getByPlaceholderText('slug'), 'another-slug')

    expect(screen.queryByLabelText(/Page status/)).not.toBeInTheDocument()
    expect(screen.getByLabelText('Check if rhythm page exists')).toBeInTheDocument()
  })
})

describe('PublishPopover', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    stubPopoverLayoutMetrics()
    vi.stubGlobal('fetch', routeFetch)
    pageStatusFetchMock.mockResolvedValue({ status: 404, ok: false })
    publishFetchMock.mockImplementation(async () => ({
      ok: true,
      json: async () => ({
        ok: true,
        slug: 'brand-new-slug',
        created: true,
        url: '/rhythm/brand-new-slug',
        indexRefresh: 'queued',
      }),
    }))
  })

  afterEach(() => {
    cleanup()
    vi.unstubAllGlobals()
  })

  it('toggles the publish panel open and closed', async () => {
    const user = userEvent.setup()
    renderWithPublishProviders(<PublishPopover rhythm={sampleRhythm()} />)

    const trigger = screen.getByRole('button', { name: /Publish as/i })
    expect(screen.queryByPlaceholderText('slug')).not.toBeInTheDocument()

    await user.click(trigger)
    expect(screen.getByPlaceholderText('slug')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /^Publish$/ })).toBeInTheDocument()

    await user.click(trigger)
    await waitFor(() => {
      expect(screen.queryByPlaceholderText('slug')).not.toBeInTheDocument()
    })
  })

  it('prefills slug from the rhythm and surfaces API errors', async () => {
    publishFetchMock.mockImplementation(async () => ({
      ok: false,
      json: async () => ({ error: 'Database unavailable' }),
    }))

    const user = userEvent.setup()
    renderWithPublishProviders(<PublishPopover rhythm={sampleRhythm()} />)

    await user.click(screen.getByRole('button', { name: /Publish as/i }))

    const slugInput = screen.getByPlaceholderText('slug')
    expect(slugInput).toHaveValue('my-rhythm-abc12')

    await user.click(screen.getByRole('switch', { name: "I know what I'm doing" }))
    await user.click(screen.getByRole('button', { name: /^Publish$/ }))

    expect((await screen.findAllByText('Database unavailable')).length).toBeGreaterThan(0)
    expect(screen.getByPlaceholderText('slug')).toBeInTheDocument()
  })

  it('fetches slug status then publishes to a new slug', async () => {
    const user = userEvent.setup()
    renderWithPublishProviders(<PublishPopover rhythm={sampleRhythm()} />)

    await user.click(screen.getByRole('button', { name: /Publish as/i }))

    const slugInput = screen.getByPlaceholderText('slug')
    await user.clear(slugInput)
    await user.type(slugInput, 'brand-new-slug')
    fireEvent.blur(slugInput)

    await waitFor(() => {
      expect(pageStatusFetchMock).toHaveBeenCalledWith(
        'http://localhost:3000/rhythm/brand-new-slug',
        { method: 'HEAD', cache: 'no-store' },
      )
    })
    expect(await screen.findByLabelText('Page status 404')).toHaveTextContent('404')

    await user.click(screen.getByRole('switch', { name: "I know what I'm doing" }))
    await user.click(screen.getByRole('button', { name: /^Publish$/ }))

    await waitFor(() => {
      expect(publishFetchMock).toHaveBeenCalledOnce()
    })

    const [, publishInit] = publishFetchMock.mock.calls[0] as [string, RequestInit]
    expect(JSON.parse(String(publishInit.body))).toEqual({
      slug: 'brand-new-slug',
      rhythm: sampleRhythm(),
    })

    expect(await screen.findByText('Created new published rhythm')).toBeInTheDocument()
    expect(screen.getByText('Rhythm page revalidated')).toBeInTheDocument()
    expect(screen.getByText('Garage index redeploy queued')).toBeInTheDocument()
    expect(screen.getByText('Live at /rhythm/brand-new-slug')).toBeInTheDocument()

    await waitFor(() => {
      expect(screen.queryByPlaceholderText('slug')).not.toBeInTheDocument()
    })
  })

  it('publishes to an existing slug as an update', async () => {
    pageStatusFetchMock.mockResolvedValue({ status: 200, ok: true })
    publishFetchMock.mockImplementation(async () => ({
      ok: true,
      json: async () => ({
        ok: true,
        slug: 'existing-slug',
        created: false,
        url: '/rhythm/existing-slug',
        indexRefresh: 'queued',
      }),
    }))

    const user = userEvent.setup()
    renderWithPublishProviders(<PublishPopover rhythm={sampleRhythm()} />)

    await user.click(screen.getByRole('button', { name: /Publish as/i }))

    const slugInput = screen.getByPlaceholderText('slug')
    await user.clear(slugInput)
    await user.type(slugInput, 'existing-slug')
    await user.click(screen.getByLabelText('Check if rhythm page exists'))

    expect(await screen.findByLabelText('Page status 200')).toHaveTextContent('200')

    await user.click(screen.getByRole('switch', { name: "I know what I'm doing" }))
    await user.click(screen.getByRole('button', { name: /^Publish$/ }))

    await waitFor(() => {
      expect(publishFetchMock).toHaveBeenCalledOnce()
    })

    expect(await screen.findByText('Updated published rhythm')).toBeInTheDocument()
    expect(screen.getByText('Live at /rhythm/existing-slug')).toBeInTheDocument()
  })
})
