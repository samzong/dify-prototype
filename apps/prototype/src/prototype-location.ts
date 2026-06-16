import type { SettingsTab } from './AccountSettingsView'

export type PrototypeRoute =
  | { section: 'signin' }
  | { section: 'studio' }
  | { section: 'knowledge'; knowledgeScreen: 'list' | `create:${string}` | string }
  | { section: 'workflow'; appId: string }

const settingsTabs = new Set<SettingsTab>([
  'provider',
  'members',
  'billing',
  'data-source',
  'api-extension',
  'custom',
  'language',
])

export function parsePrototypePathname(pathname: string): PrototypeRoute {
  const segments = pathname.split('/').filter(Boolean)
  const [first, second, third] = segments

  if (first === 'signin')
    return { section: 'signin' }

  if (first === 'datasets') {
    if (!second)
      return { section: 'knowledge', knowledgeScreen: 'list' }

    if (second === 'create')
      return { section: 'knowledge', knowledgeScreen: `create:${third ?? 'standard'}` }

    if (second === 'create-from-pipeline')
      return { section: 'knowledge', knowledgeScreen: 'create:pipeline' }

    if (second === 'connect')
      return { section: 'knowledge', knowledgeScreen: 'create:external' }

    return { section: 'knowledge', knowledgeScreen: second }
  }

  if (first === 'app' && second && third === 'workflow')
    return { section: 'workflow', appId: second }

  if (!first || first === 'apps')
    return { section: 'studio' }

  return { section: 'studio' }
}

export function buildPrototypePathname(route: PrototypeRoute) {
  switch (route.section) {
    case 'signin':
      return '/signin'
    case 'studio':
      return '/apps'
    case 'workflow':
      return `/app/${route.appId}/workflow`
    case 'knowledge': {
      if (route.knowledgeScreen === 'list')
        return '/datasets'

      if (route.knowledgeScreen.startsWith('create:')) {
        const mode = route.knowledgeScreen.slice('create:'.length)
        if (mode === 'standard')
          return '/datasets/create'
        if (mode === 'pipeline')
          return '/datasets/create-from-pipeline'
        if (mode === 'external')
          return '/datasets/connect'
        return `/datasets/create/${mode}`
      }

      return `/datasets/${route.knowledgeScreen}`
    }
  }
}

export function parseSettingsTab(search: string): SettingsTab | null {
  const value = new URLSearchParams(search).get('settings')
  if (!value || !settingsTabs.has(value as SettingsTab))
    return null

  return value as SettingsTab
}

export function buildPrototypeUrl(route: PrototypeRoute, settingsTab?: SettingsTab | null) {
  const pathname = buildPrototypePathname(route)
  if (!settingsTab)
    return pathname

  return `${pathname}?settings=${settingsTab}`
}
