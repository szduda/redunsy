import { timingSafeEqual } from 'node:crypto'

export const BODY_SIZE_LIMIT = '64kb'

export const INTERNAL_KEY_HEADER = 'x-dunsy-internal-key'
export const REQUEST_ID_HEADER = 'x-dunsy-request-id'
export const GOOGLE_SUB_HEADER = 'x-dunsy-google-sub'
export const EMAIL_HEADER = 'x-dunsy-email'

export const DEFAULT_BROWSER_ORIGINS = ['https://re.dunsy.app', 'http://localhost:3000']

export const parseCommaList = (raw: string | undefined): string[] =>
  (raw ?? '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)

export const parseAdminEmails = (raw: string | undefined): Set<string> =>
  new Set(parseCommaList(raw).map((email) => email.toLowerCase()))

export const isAdminEmail = (
  email: string | null | undefined,
  rawAllowlist: string | undefined,
) => {
  if (!email) return false
  return parseAdminEmails(rawAllowlist).has(email.toLowerCase())
}

export const browserOrigins = (): string[] => {
  const configured = parseCommaList(process.env.DUNSY_ALLOWED_BROWSER_ORIGINS)
  return configured.length > 0 ? configured : DEFAULT_BROWSER_ORIGINS
}

export const isForbiddenBrowserOrigin = (origin: string): boolean => {
  if (browserOrigins().includes(origin)) return true
  try {
    const { hostname } = new URL(origin)
    return hostname === 'vercel.app' || hostname.endsWith('.vercel.app')
  } catch {
    return false
  }
}

export const headerValue = (value: string | string[] | undefined): string => {
  if (Array.isArray(value)) return value[0]?.trim() ?? ''
  return value?.trim() ?? ''
}

export const extractInternalKey = (headers: {
  [key: string]: string | string[] | undefined
}): string => {
  const fromHeader = headerValue(headers[INTERNAL_KEY_HEADER])
  if (fromHeader) return fromHeader
  const authorization = headerValue(headers.authorization)
  const match = /^Bearer\s+(.+)$/i.exec(authorization)
  return match?.[1]?.trim() ?? ''
}

export const secretsEqual = (provided: string, expected: string): boolean => {
  if (!provided || !expected) return false
  const expectedBuffer = Buffer.from(expected)
  const providedBuffer = Buffer.from(provided)
  if (providedBuffer.length !== expectedBuffer.length) {
    timingSafeEqual(expectedBuffer, expectedBuffer)
    return false
  }
  return timingSafeEqual(providedBuffer, expectedBuffer)
}
