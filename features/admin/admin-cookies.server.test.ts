import { describe, expect, it } from 'vitest'

import { hasAdminHintCookie } from '@/features/admin/admin-cookies'

describe('hasAdminHintCookie (server)', () => {
  it('returns false when document is unavailable', () => {
    const documentValue = globalThis.document
    // @ts-expect-error simulate server runtime
    delete globalThis.document

    expect(hasAdminHintCookie()).toBe(false)

    globalThis.document = documentValue
  })
})
