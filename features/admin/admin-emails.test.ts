import { describe, expect, it } from 'vitest'

import { isAdminEmail, parseAdminEmails } from '@/features/admin/admin-emails'

describe('parseAdminEmails', () => {
  it('returns an empty set for undefined input', () => {
    expect(parseAdminEmails(undefined).size).toBe(0)
  })

  it('returns an empty set for blank input', () => {
    expect(parseAdminEmails('   , , ').size).toBe(0)
  })

  it('parses comma-separated emails case-insensitively', () => {
    const emails = parseAdminEmails(' Admin@Gmail.com , other@example.com ')

    expect(emails.has('admin@gmail.com')).toBe(true)
    expect(emails.has('other@example.com')).toBe(true)
    expect(emails.size).toBe(2)
  })

  it('deduplicates repeated entries', () => {
    const emails = parseAdminEmails('admin@gmail.com, ADMIN@gmail.com, admin@gmail.com')

    expect(emails.size).toBe(1)
    expect(emails.has('admin@gmail.com')).toBe(true)
  })

  it('ignores empty segments between commas', () => {
    const emails = parseAdminEmails('one@test.com,, ,two@test.com,')

    expect([...emails]).toEqual(['one@test.com', 'two@test.com'])
  })
})

describe('isAdminEmail', () => {
  it('matches allowlisted emails case-insensitively', () => {
    expect(isAdminEmail('Admin@Gmail.com', 'admin@gmail.com,other@example.com')).toBe(true)
    expect(isAdminEmail('OTHER@example.com', 'admin@gmail.com,other@example.com')).toBe(true)
  })

  it('rejects emails not on the allowlist', () => {
    expect(isAdminEmail('other@gmail.com', 'admin@gmail.com')).toBe(false)
  })

  it('rejects null, undefined, and empty email', () => {
    expect(isAdminEmail(null, 'admin@gmail.com')).toBe(false)
    expect(isAdminEmail(undefined, 'admin@gmail.com')).toBe(false)
    expect(isAdminEmail('', 'admin@gmail.com')).toBe(false)
  })

  it('rejects every email when the allowlist is empty', () => {
    expect(isAdminEmail('admin@gmail.com', undefined)).toBe(false)
    expect(isAdminEmail('admin@gmail.com', '')).toBe(false)
    expect(isAdminEmail('admin@gmail.com', ' , ')).toBe(false)
  })
})
