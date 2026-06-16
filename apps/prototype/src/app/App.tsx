import { useEffect, useState } from 'react'
import { SignInPage } from '../features/signin/SignInPage'
import { readAuthenticated, writeAuthenticated } from '../preferences/auth-preference'
import { useThemePreference } from '../preferences/use-theme-preference'
import { usePrototypeLocation } from '../routing/use-prototype-location'
import { AppProviders } from './AppProviders'
import { AuthenticatedApp } from './AuthenticatedApp'

function App() {
  const { appearanceMode, theme, setAppearanceMode, setThemePreference } = useThemePreference()
  const [authenticated, setAuthenticatedState] = useState(readAuthenticated)
  const { route, settingsTab, navigate } = usePrototypeLocation()

  const setAuthenticated = (value: boolean) => {
    writeAuthenticated(value)
    setAuthenticatedState(value)
  }

  useEffect(() => {
    if (!authenticated && route.section !== 'signin') {
      navigate({ route: { section: 'signin' }, settingsTab: null, replace: true })
      return
    }

    if (authenticated && route.section === 'signin') {
      navigate({ route: { section: 'studio' }, settingsTab: null, replace: true })
      return
    }

    if (authenticated && window.location.pathname === '/') {
      navigate({ route: { section: 'studio' }, settingsTab: null, replace: true })
    }
  }, [authenticated, navigate, route.section])

  const handleSignedIn = () => {
    setAuthenticated(true)
    if (route.section === 'signin') {
      navigate({ route: { section: 'studio' }, settingsTab: null, replace: true })
    }
  }

  const handleSignOut = () => {
    setAuthenticated(false)
    navigate({ route: { section: 'signin' }, settingsTab: null, replace: true })
  }

  return (
    <AppProviders>
      {authenticated
        ? (
            <AuthenticatedApp
              theme={theme}
              appearanceMode={appearanceMode}
              route={route.section === 'signin' ? { section: 'studio' } : route}
              settingsTab={settingsTab}
              onNavigate={navigate}
              onThemeChange={setThemePreference}
              onAppearanceChange={setAppearanceMode}
              onSignOut={handleSignOut}
            />
          )
        : (
            <SignInPage
              theme={theme}
              onThemeChange={setThemePreference}
              onSignedIn={handleSignedIn}
            />
          )}
    </AppProviders>
  )
}

export default App
