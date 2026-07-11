export const replaceEditorSlugUrl = (slug: string) => {
  if (typeof window === 'undefined') return
  const path = `/editor/${slug}`
  if (window.location.pathname === path) return
  window.history.replaceState(window.history.state, '', path)
}
