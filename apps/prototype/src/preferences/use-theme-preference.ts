import { useCallback, useEffect, useState } from 'react'
import {
  applyThemeToDocument,
  type AppearanceMode,
  readAppearanceMode,
  resolveTheme,
  writeAppearanceMode,
} from './theme-preference'

export function useThemePreference() {
  const [appearanceMode, setAppearanceModeState] = useState<AppearanceMode>(() => readAppearanceMode())
  const [theme, setTheme] = useState<'light' | 'dark'>(() => resolveTheme(readAppearanceMode()))

  useEffect(() => {
    const nextTheme = resolveTheme(appearanceMode)
    setTheme(nextTheme)
    applyThemeToDocument(nextTheme)
  }, [appearanceMode])

  useEffect(() => {
    if (appearanceMode !== 'system')
      return

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handleChange = () => {
      const nextTheme = resolveTheme('system')
      setTheme(nextTheme)
      applyThemeToDocument(nextTheme)
    }

    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [appearanceMode])

  const setAppearanceMode = useCallback((mode: AppearanceMode) => {
    writeAppearanceMode(mode)
    setAppearanceModeState(mode)
  }, [])

  const setThemePreference = useCallback((nextTheme: 'light' | 'dark') => {
    setAppearanceMode(nextTheme)
  }, [setAppearanceMode])

  return {
    appearanceMode,
    theme,
    setAppearanceMode,
    setThemePreference,
  }
}
