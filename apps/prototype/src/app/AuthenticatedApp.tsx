import { lazy, Suspense, useEffect, useState } from 'react'
import { datasetItems as initialDatasetItems } from '../features/datasets/fixtures/dataset-items'
import type { DatasetDetailTab } from '../features/datasets/fixtures/types'
import type { DatasetItem } from '../features/datasets/fixtures/types'
import type { SettingsTab } from '../features/settings/types'
import { detailTabToPath } from '../routing/dataset-routes'
import type { PrototypeRoute } from '../routing/prototype-location'
import { buildPrototypePathname } from '../routing/prototype-location'
import type { AppearanceMode } from '../preferences/theme-preference'
import { Header, type MainSection } from '../shell/Header'
import { RouteFallback } from '../shared/components/RouteFallback'

const StudioPage = lazy(() => import('../features/studio/StudioPage').then(module => ({ default: module.StudioPage })))
const DatasetsSection = lazy(() => import('../features/datasets/DatasetsSection').then(module => ({ default: module.DatasetsSection })))
const WorkflowOrchestrate = lazy(() => import('../features/workflow').then(module => ({ default: module.WorkflowOrchestrate })))
const AccountSettingsView = lazy(() => import('../features/settings').then(module => ({ default: module.AccountSettingsView })))

export function AuthenticatedApp({
  theme,
  appearanceMode,
  route,
  settingsTab,
  onNavigate,
  onThemeChange,
  onAppearanceChange,
  onSignOut,
}: {
  theme: 'light' | 'dark'
  appearanceMode: AppearanceMode
  route: Exclude<PrototypeRoute, { section: 'signin' }>
  settingsTab: SettingsTab | null
  onNavigate: (options: { route: Exclude<PrototypeRoute, { section: 'signin' }>; settingsTab?: SettingsTab | null; replace?: boolean }) => void
  onThemeChange: (theme: 'light' | 'dark') => void
  onAppearanceChange: (mode: AppearanceMode) => void
  onSignOut: () => void
}) {
  const [datasetItems, setDatasetItems] = useState<DatasetItem[]>(() => initialDatasetItems)

  const activeSection: MainSection = route.section === 'datasets'
    ? 'datasets'
    : route.section === 'workflow'
      ? 'workflow'
      : 'studio'
  const datasetScreen = route.section === 'datasets' ? route.datasetScreen : { kind: 'list' as const }
  const settingsOpen = settingsTab !== null
  const settingsInitialTab = settingsTab ?? 'provider'

  const openSettings = (tab: SettingsTab = 'provider') => {
    onNavigate({ route, settingsTab: tab })
  }

  const closeSettings = () => {
    onNavigate({ route, settingsTab: null })
  }

  const goToStudio = () => {
    onNavigate({ route: { section: 'studio' }, settingsTab })
  }

  const goToDatasetList = () => {
    onNavigate({ route: { section: 'datasets', datasetScreen: { kind: 'list' } }, settingsTab })
  }

  const goToDatasetDetail = (datasetId: string, tab: DatasetDetailTab = 'overview') => {
    onNavigate({
      route: {
        section: 'datasets',
        datasetScreen: { kind: 'detail', datasetId, tab: detailTabToPath(tab) },
      },
      settingsTab,
    })
  }

  const goToDatasetCreate = (mode: 'standard' | 'pipeline' | 'external') => {
    onNavigate({
      route: { section: 'datasets', datasetScreen: { kind: 'create', mode } },
      settingsTab,
    })
  }

  const openWorkflow = (appId = 'sales-intake') => {
    onNavigate({ route: { section: 'workflow', appId }, settingsTab: null })
  }

  useEffect(() => {
    if (route.section !== 'datasets')
      return
    const expectedPath = buildPrototypePathname(route)
    if (window.location.pathname !== expectedPath)
      onNavigate({ route, settingsTab, replace: true })
  }, [route, settingsTab, onNavigate])

  if (route.section === 'workflow') {
    return (
      <Suspense fallback={<RouteFallback />}>
        <WorkflowOrchestrate onBack={goToStudio} />
      </Suspense>
    )
  }

  return (
    <div className="flex h-full flex-col bg-background-body text-text-primary">
      <Header
        theme={theme}
        activeSection={activeSection}
        datasetScreen={datasetScreen}
        onSectionChange={(section) => {
          if (section === 'studio')
            goToStudio()
          else if (section === 'datasets')
            goToDatasetList()
        }}
        datasetItems={datasetItems}
        onGoToDatasetList={goToDatasetList}
        onSelectDataset={id => goToDatasetDetail(id)}
        onOpenDatasetCreate={goToDatasetCreate}
        onThemeChange={onThemeChange}
        onSignOut={onSignOut}
        onOpenSettings={() => openSettings('provider')}
        onOpenSettingsTab={openSettings}
      />
      <Suspense fallback={null}>
        <AccountSettingsView
          open={settingsOpen}
          onClose={closeSettings}
          theme={theme}
          appearanceMode={appearanceMode}
          onAppearanceChange={onAppearanceChange}
          initialTab={settingsInitialTab}
        />
      </Suspense>
      {activeSection === 'studio'
        ? (
            <Suspense fallback={<RouteFallback />}>
              <StudioPage onOpenWorkflow={openWorkflow} />
            </Suspense>
          )
        : (
            <Suspense fallback={<RouteFallback />}>
              <DatasetsSection
                screen={datasetScreen}
                items={datasetItems}
                onOpenList={goToDatasetList}
                onOpenDetail={id => goToDatasetDetail(id)}
                onOpenCreate={goToDatasetCreate}
                onTabChange={(id, tab) => goToDatasetDetail(id, tab)}
                onUpdateDataset={(id, updater) => {
                  setDatasetItems(current => current.map(item => item.id === id ? updater(item) : item))
                }}
                onCreateDataset={(item) => {
                  setDatasetItems(current => [item, ...current])
                  goToDatasetDetail(item.id)
                }}
              />
            </Suspense>
          )}
    </div>
  )
}
