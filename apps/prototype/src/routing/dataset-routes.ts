import type { DatasetDetailTab } from '../features/datasets/fixtures/types'

export type DatasetScreen =
  | { kind: 'list' }
  | { kind: 'create'; mode: string }
  | { kind: 'detail'; datasetId: string; tab: DatasetDetailTabPath }

export type DatasetDetailTabPath = 'overview' | 'sources' | 'documents' | 'hitTesting' | 'quality' | 'settings' | 'pipeline' | 'research' | 'files' | 'graph' | 'develop'

export const DEFAULT_DATASET_TAB_PATH: DatasetDetailTabPath = 'overview'

const datasetDetailTabPaths = new Set<DatasetDetailTabPath>([
  'overview',
  'sources',
  'documents',
  'hitTesting',
  'quality',
  'settings',
  'pipeline',
  'research',
  'files',
  'graph',
  'develop',
])

export function isDatasetDetailTabPath(value: string): value is DatasetDetailTabPath {
  return datasetDetailTabPaths.has(value as DatasetDetailTabPath)
}

export function detailTabToPath(tab: DatasetDetailTab): DatasetDetailTabPath {
  if (tab === 'evidence')
    return 'hitTesting'
  return tab
}

export function pathToDetailTab(path: DatasetDetailTabPath): DatasetDetailTab {
  if (path === 'hitTesting' || path === 'research' || path === 'graph')
    return 'evidence'
  if (path === 'files')
    return 'documents'
  return path
}

export function buildDatasetDetailPathname(datasetId: string, tab: DatasetDetailTabPath) {
  return `/datasets/${datasetId}/${tab}`
}

export function parseDatasetPathSegments(second?: string, third?: string): DatasetScreen | null {
  if (!second)
    return { kind: 'list' }

  if (second === 'create')
    return { kind: 'create', mode: third ?? 'standard' }

  if (second === 'create-from-pipeline')
    return { kind: 'create', mode: 'pipeline' }

  if (second === 'connect')
    return { kind: 'create', mode: 'external' }

  const datasetId = second
  if (!third)
    return { kind: 'detail', datasetId, tab: DEFAULT_DATASET_TAB_PATH }

  if (isDatasetDetailTabPath(third))
    return { kind: 'detail', datasetId, tab: third }

  return { kind: 'detail', datasetId, tab: DEFAULT_DATASET_TAB_PATH }
}

export function buildDatasetScreenPathname(screen: DatasetScreen) {
  if (screen.kind === 'list')
    return '/datasets'

  if (screen.kind === 'create') {
    if (screen.mode === 'standard')
      return '/datasets/create'
    if (screen.mode === 'pipeline')
      return '/datasets/create-from-pipeline'
    if (screen.mode === 'external')
      return '/datasets/connect'
    return `/datasets/create/${screen.mode}`
  }

  return buildDatasetDetailPathname(screen.datasetId, screen.tab)
}
