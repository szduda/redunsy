import { describe, expect, it } from 'vitest'

import {
  extractInternalKey,
  isAdminEmail,
  isForbiddenBrowserOrigin,
  secretsEqual,
} from '../src/config/security'

describe('security helpers', () => {
  it('treats ADMIN_EMAILS as a case-insensitive allowlist', () => {
    expect(isAdminEmail('Admin@Dunsy.app', 'admin@dunsy.app')).toBe(true)
    expect(isAdminEmail('other@dunsy.app', 'admin@dunsy.app')).toBe(false)
    expect(isAdminEmail(null, 'admin@dunsy.app')).toBe(false)
  })

  it('flags frontend and vercel.app origins', () => {
    expect(isForbiddenBrowserOrigin('https://re.dunsy.app')).toBe(true)
    expect(isForbiddenBrowserOrigin('http://localhost:3000')).toBe(true)
    expect(isForbiddenBrowserOrigin('https://foo.vercel.app')).toBe(true)
    expect(isForbiddenBrowserOrigin('https://api.example.com')).toBe(false)
  })

  it('reads the internal key from header or Bearer', () => {
    expect(extractInternalKey({ 'x-dunsy-internal-key': 'abc' })).toBe('abc')
    expect(extractInternalKey({ authorization: 'Bearer xyz' })).toBe('xyz')
    expect(extractInternalKey({})).toBe('')
  })

  it('compares secrets without treating empty as a match', () => {
    expect(secretsEqual('secret', 'secret')).toBe(true)
    expect(secretsEqual('secret', 'other')).toBe(false)
    expect(secretsEqual('', '')).toBe(false)
    expect(secretsEqual('ab', 'abcd')).toBe(false)
  })
})
