import type { SettingsTab } from '../features/settings/types'
import {
  buildDatasetScreenPathname,
  parseDatasetPathSegments,
  type DatasetScreen,
} from './dataset-routes'

export type { DatasetScreen } from './dataset-routes'

export type PrototypeRoute =
  | { section: 'signin' }
  | { section: 'studio' }
  | { section: 'datasets'; datasetScreen: DatasetScreen }
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
    const datasetScreen = parseDatasetPathSegments(second, third)
    if (datasetScreen)
      return { section: 'datasets', datasetScreen }
    return { section: 'datasets', datasetScreen: { kind: 'list' } }
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
    case 'datasets':
      return buildDatasetScreenPathname(route.datasetScreen)
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
