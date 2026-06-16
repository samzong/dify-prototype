import { useCallback, useEffect, useMemo, useState } from 'react'
import type { SettingsTab } from './AccountSettingsView'
import {
  buildPrototypeUrl,
  parsePrototypePathname,
  parseSettingsTab,
  type PrototypeRoute,
} from './prototype-location'

type NavigateOptions = {
  route: PrototypeRoute
  settingsTab?: SettingsTab | null
  replace?: boolean
}

export function usePrototypeLocation() {
  const [location, setLocation] = useState(() => ({
    pathname: window.location.pathname,
    search: window.location.search,
  }))

  useEffect(() => {
    const onPopState = () => {
      setLocation({
        pathname: window.location.pathname,
        search: window.location.search,
      })
    }

    window.addEventListener('popstate', onPopState)
    return () => window.removeEventListener('popstate', onPopState)
  }, [])

  const route = useMemo(() => parsePrototypePathname(location.pathname), [location.pathname])
  const settingsTab = useMemo(() => parseSettingsTab(location.search), [location.search])

  const navigate = useCallback((options: NavigateOptions) => {
    const url = buildPrototypeUrl(options.route, options.settingsTab)
    if (options.replace)
      window.history.replaceState(null, '', url)
    else
      window.history.pushState(null, '', url)

    const [pathname, search = ''] = url.split('?')
    setLocation({
      pathname,
      search: search ? `?${search}` : '',
    })
  }, [])

  return {
    route,
    settingsTab,
    navigate,
  }
}
