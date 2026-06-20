export const THEME_STORAGE_KEY = 'redunsy-theme'

export const themeInitScript = `(() => {
  try {
    const raw = localStorage.getItem(${JSON.stringify(THEME_STORAGE_KEY)})
    if (!raw) {
      document.documentElement.classList.add('dark')
      return
    }
    const theme = JSON.parse(raw)?.state?.theme
    if (theme !== 'light') document.documentElement.classList.add('dark')
  } catch {
    document.documentElement.classList.add('dark')
  }
})()`
