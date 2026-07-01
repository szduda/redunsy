/** Comma-separated admin allowlist from env, normalized to lowercase. */
export const parseAdminEmails = (raw: string | undefined): Set<string> =>
  new Set(
    (raw ?? '')
      .split(',')
      .map((email) => email.trim().toLowerCase())
      .filter(Boolean),
  )

export const isAdminEmail = (
  email: string | null | undefined,
  rawAllowlist: string | undefined,
) => {
  if (!email) return false
  return parseAdminEmails(rawAllowlist).has(email.toLowerCase())
}
