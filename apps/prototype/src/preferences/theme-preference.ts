export const APPEARANCE_STORAGE_KEY = 'dify-prototype-appearance'

export type AppearanceMode = 'system' | 'light' | 'dark'

export function readAppearanceMode(): AppearanceMode {
  try {
    const stored = localStorage.getItem(APPEARANCE_STORAGE_KEY)
    if (stored === 'system' || stored === 'light' || stored === 'dark')
      return stored
  }
  catch {
  }
  return 'light'
}

export function writeAppearanceMode(mode: AppearanceMode) {
  try {
    localStorage.setItem(APPEARANCE_STORAGE_KEY, mode)
  }
  catch {
  }
}

export function resolveTheme(mode: AppearanceMode): 'light' | 'dark' {
  if (mode === 'light' || mode === 'dark')
    return mode

  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

export function applyThemeToDocument(theme: 'light' | 'dark') {
  document.documentElement.dataset.theme = theme
}
