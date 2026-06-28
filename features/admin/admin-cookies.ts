export const ADMIN_HINT_COOKIE = 'redunsy_admin_hint'

export const hasAdminHintCookie = () => {
  if (typeof document === 'undefined') return false
  return document.cookie.split(';').some((part) => part.trim().startsWith(`${ADMIN_HINT_COOKIE}=`))
}
