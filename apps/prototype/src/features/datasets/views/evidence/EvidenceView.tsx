import { useEffect, useState } from 'react'
import { cn } from '@langgenius/dify-ui/cn'
import type { DatasetItem } from '../../fixtures/items'
import { ResearchSections } from '../research/ResearchSections'
import { useResearchController } from '../research/useResearchController'
import { GraphContextDrawer } from './graph-context-drawer'
import { QuickTestPanel } from './QuickTestPanel'

type EvidenceSubTab = 'research' | 'quick-test'

function EvidenceTabBar({
  value,
  onChange,
  taskCount,
}: {
  value: EvidenceSubTab
  onChange: (tab: EvidenceSubTab) => void
  taskCount: number
}) {
  const tabs: { id: EvidenceSubTab; label: string }[] = [
    { id: 'research', label: 'Research' },
    { id: 'quick-test', label: `Quick test${taskCount ? '' : ''}` },
  ]

  return (
    <div className="inline-flex gap-0.5 rounded-lg bg-components-main-nav-nav-button-bg-hover p-0.5">
      {tabs.map(tab => (
        <button
          key={tab.id}
          type="button"
          onClick={() => onChange(tab.id)}
          className={cn(
            'h-7 rounded-[10px] px-3 system-sm-medium',
            value === tab.id
              ? 'bg-components-main-nav-nav-button-bg-active font-semibold text-components-main-nav-nav-button-text-active shadow-md'
              : 'text-components-main-nav-nav-button-text hover:bg-components-main-nav-nav-button-bg-hover',
          )}
        >
          {tab.label}
          {tab.id === 'research' && taskCount > 0 && (
            <span className="ml-1.5 text-text-quaternary">
              (
              {taskCount}
              )
            </span>
          )}
        </button>
      ))}
    </div>
  )
}

export function EvidenceView({
  item,
  initialSubTab = 'research',
  initialResearchQuery,
  onOpenQuality,
}: {
  item: DatasetItem
  initialSubTab?: EvidenceSubTab
  initialResearchQuery?: string
  onOpenQuality?: () => void
}) {
  const [subTab, setSubTab] = useState<EvidenceSubTab>(initialSubTab)
  const [researchSeedQuery, setResearchSeedQuery] = useState(initialResearchQuery)
  const [graphDrawerOpen, setGraphDrawerOpen] = useState(false)
  const researchController = useResearchController(item, researchSeedQuery)

  useEffect(() => {
    setSubTab(initialSubTab)
  }, [initialSubTab, item.id])

  useEffect(() => {
    if (initialResearchQuery) {
      setResearchSeedQuery(initialResearchQuery)
      setSubTab('research')
    }
  }, [initialResearchQuery])

  const switchToResearch = (query: string) => {
    setResearchSeedQuery(query)
    researchController.setQuery(query)
    setSubTab('research')
  }

  return (
    <div className="space-y-4 pr-6">
      <EvidenceTabBar
        value={subTab}
        onChange={setSubTab}
        taskCount={researchController.tasks.length}
      />

      {subTab === 'research' && (
        <ResearchSections controller={researchController} embedded />
      )}

      {subTab === 'quick-test' && (
        <QuickTestPanel
          item={item}
          onOpenQuality={onOpenQuality}
          onSwitchToResearch={switchToResearch}
          onViewGraph={() => setGraphDrawerOpen(true)}
        />
      )}

      <GraphContextDrawer
        open={graphDrawerOpen}
        item={item}
        onClose={() => setGraphDrawerOpen(false)}
      />
    </div>
  )
}
