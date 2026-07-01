export const ADMIN_HINT_COOKIE = 'redunsy_admin_hint'

const readAdminHintCookieValue = (cookieHeader: string) =>
  cookieHeader
    .split(';')
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${ADMIN_HINT_COOKIE}=`))
    ?.slice(ADMIN_HINT_COOKIE.length + 1)

export const hasAdminHintCookie = () => {
  if (typeof document === 'undefined') return false
  const value = readAdminHintCookieValue(document.cookie)
  return value !== undefined && value.length > 0
}
