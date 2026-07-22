/** Next.js `useParams` can leave `+` as `%2B`, which breaks lz-string. Prefer the browser path. */
export const encodedRhythmFromPathname = (pathname: string) => {
  const match = pathname.match(/^\/share\/(.+)$/)
  if (!match?.[1]) return ''
  try {
    return decodeURIComponent(match[1])
  } catch {
    return match[1]
  }
}

export const resolveEncodedRhythmParam = (
  pathname: string,
  param: string | string[] | undefined,
) => {
  const fromPath = encodedRhythmFromPathname(pathname)
  if (fromPath) return fromPath

  const raw = Array.isArray(param) ? param.join('/') : (param ?? '')
  if (!raw) return ''
  try {
    return decodeURIComponent(raw)
  } catch {
    return raw
  }
}
