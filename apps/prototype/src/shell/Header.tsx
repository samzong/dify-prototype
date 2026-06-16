import type { DatasetScreen } from '../routing/dataset-routes'
import type { DatasetItem } from '../features/datasets/fixtures/types'
import type { SettingsTab } from '../features/settings/types'
import { PrototypeRepoLink } from '../shared/components/PrototypeRepoLink'
import { AccountDropdown } from './AccountDropdown'
import { TopNav } from './components/TopNav'
import { RiArrowDownSLine, RiRobot2Fill, RiRobot2Line, RiSettings3Line, RiTShirt2Line } from '@remixicon/react'
import { lazy, Suspense } from 'react'

const DatasetsTopNav = lazy(() => import('../features/datasets/components/DatasetsTopNav').then(module => ({ default: module.DatasetsTopNav })))

export type MainSection = 'studio' | 'datasets' | 'workflow'

export function Header({
  theme,
  activeSection,
  datasetScreen,
  datasetItems,
  onSectionChange,
  onGoToDatasetList,
  onSelectDataset,
  onOpenDatasetCreate,
  onThemeChange,
  onSignOut,
  onOpenSettings,
  onOpenSettingsTab,
}: {
  theme: 'light' | 'dark'
  activeSection: MainSection
  datasetScreen: DatasetScreen
  datasetItems: DatasetItem[]
  onSectionChange: (section: MainSection) => void
  onGoToDatasetList: () => void
  onSelectDataset: (id: string) => void
  onOpenDatasetCreate: (mode: 'standard' | 'pipeline' | 'external') => void
  onThemeChange: (theme: 'light' | 'dark') => void
  onSignOut: () => void
  onOpenSettings: () => void
  onOpenSettingsTab: (tab: SettingsTab) => void
}) {
  return (
    <header className="sticky top-0 right-0 left-0 z-30 flex min-h-[56px] shrink-0 grow-0 basis-auto flex-col border-b border-divider-regular bg-background-body">
      <div className="flex h-[56px] items-center">
        <div className="flex min-w-0 flex-1 items-center pr-2 pl-3 min-[1280px]:pr-3">
          <a href="#" className="flex h-8 shrink-0 items-center justify-center overflow-hidden rounded-sm px-0.5 hover:opacity-80 focus-visible:ring-1 focus-visible:ring-components-input-border-active focus-visible:outline-hidden">
            <img src={theme === 'dark' ? '/logo/logo-monochrome-white.svg' : '/logo/logo.svg'} className="block h-[22px] w-12 object-contain" alt="Dify" />
          </a>
          <div className="mx-1.5 shrink-0 font-light text-divider-deep">/</div>
          <button type="button" className="flex h-8 max-w-[220px] items-center rounded-[10px] px-2 text-components-main-nav-nav-button-text hover:bg-components-main-nav-nav-button-bg-hover">
            <span className="truncate system-sm-medium">Samzong Workspace</span>
            <RiArrowDownSLine className="ml-1 size-4 shrink-0 text-text-tertiary" />
          </button>
          <div className="ml-2 rounded-md border border-components-button-secondary-border px-1.5 system-2xs-medium-uppercase text-text-tertiary">Sandbox</div>
        </div>
        <div className="flex items-center space-x-2">
          <TopNav icon={<span className="i-ri-compass-3-line size-4" />} text="Explore" />
          <TopNav
            icon={<RiRobot2Line className="size-4" />}
            activeIcon={<RiRobot2Fill className="size-4" />}
            text="Studio"
            active={activeSection === 'studio'}
            onClick={() => onSectionChange('studio')}
          />
          <Suspense fallback={<div className="h-8 w-24" />}>
            <DatasetsTopNav
              active={activeSection === 'datasets'}
              screen={datasetScreen}
              items={datasetItems}
              onActivate={() => onSectionChange('datasets')}
              onGoToList={onGoToDatasetList}
              onSelectDataset={onSelectDataset}
              onOpenCreate={onOpenDatasetCreate}
            />
          </Suspense>
          <TopNav icon={<span className="i-ri-hammer-line size-4" />} text="Tools" />
        </div>
        <div className="flex min-w-0 flex-1 items-center justify-end pr-3 pl-2 min-[1280px]:pl-3">
          <PrototypeRepoLink className="mr-2" />
          <button type="button" className="mr-2 flex size-8 items-center justify-center rounded-lg text-text-tertiary hover:bg-state-base-hover" onClick={() => onThemeChange(theme === 'light' ? 'dark' : 'light')}>
            <RiTShirt2Line className="size-4" />
          </button>
          <button type="button" aria-label="Settings" className="mr-2 flex size-8 items-center justify-center rounded-lg text-text-tertiary hover:bg-state-base-hover" onClick={onOpenSettings}>
            <RiSettings3Line className="size-4" />
          </button>
          <AccountDropdown
            theme={theme}
            onThemeChange={onThemeChange}
            onOpenSettings={onOpenSettingsTab}
            onSignOut={onSignOut}
          />
        </div>
      </div>
    </header>
  )
}
