import type { StateStorage } from 'zustand/middleware'

type UrlQueryStorageOptions<TField extends string> = {
  param: string
  field: TField
}

const currentUrl = () =>
  `${window.location.pathname}${window.location.search}${window.location.hash}`

const replaceUrl = (pathname: string, search: string, hash: string) => {
  const next = `${pathname}${search}${hash}`
  if (next === currentUrl()) return
  window.history.replaceState(window.history.state, '', next)
}

export const createUrlQueryStorage = <TField extends string>({
  param,
  field,
}: UrlQueryStorageOptions<TField>): StateStorage => ({
  getItem: () => {
    if (typeof window === 'undefined') return null
    const value = new URLSearchParams(window.location.search).get(param)
    if (!value) return null
    return JSON.stringify({ state: { [field]: value }, version: 0 })
  },
  setItem: (_name, serialized) => {
    if (typeof window === 'undefined') return
    const parsed = JSON.parse(serialized) as { state: Record<TField, string> }
    const value = (parsed.state[field] ?? '').trim()
    const url = new URL(window.location.href)
    if (value) {
      url.searchParams.set(param, value)
    } else {
      url.searchParams.delete(param)
    }
    replaceUrl(url.pathname, url.search, url.hash)
  },
  removeItem: () => {
    if (typeof window === 'undefined') return
    const url = new URL(window.location.href)
    url.searchParams.delete(param)
    replaceUrl(url.pathname, url.search, url.hash)
  },
})
