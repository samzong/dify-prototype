import type { DatasetDetailTab, DatasetItem } from '../../fixtures/items'
import { pageMeta } from '../../constants/detail-nav'
import { detailNavItems } from '../../constants/detail-nav'
import { DocumentsView } from '../documents/DocumentsView'
import { EvidenceView } from '../EvidenceView'
import { OverviewView } from '../OverviewView'
import { PipelineView } from '../PipelineView'
import { QualityView } from '../QualityView'
import { SettingsView } from '../settings/SettingsView'
import { SourcesView } from '../sources/SourcesView'
import { DatasetDetailSidebar, PageHeader } from './detail-sidebar'

export function DetailPage({
  item,
  activeTab,
  onTabChange,
  onUpdateDataset,
}: {
  item: DatasetItem
  activeTab: DatasetDetailTab
  onTabChange: (tab: DatasetDetailTab) => void
  onUpdateDataset: (id: string, updater: (item: DatasetItem) => DatasetItem) => void
}) {
  const navItems = detailNavItems.filter(entry => !entry.hidden?.(item))
  const meta = pageMeta[activeTab]

  return (
    <div className="flex h-0 min-h-0 shrink-0 grow overflow-hidden bg-background-body">
      <DatasetDetailSidebar item={item} navItems={navItems} activeTab={activeTab} onTabChange={onTabChange} />
      <div className="relative min-w-0 flex-1 overflow-y-auto">
        <div className="flex min-h-full flex-col py-3 pl-6">
          <PageHeader title={meta.title} description={meta.description} />
          <div className="min-h-0 flex-1">
            {activeTab === 'overview' && <OverviewView item={item} onNavigate={onTabChange} />}
            {activeTab === 'sources' && (
              <SourcesView
                item={item}
                onSourcesChange={sources => onUpdateDataset(item.id, current => ({ ...current, sources, sourceCount: sources.length }))}
              />
            )}
            {activeTab === 'documents' && (
              <DocumentsView
                item={item}
                onDocumentsChange={documents => onUpdateDataset(item.id, current => ({
                  ...current,
                  documents,
                  documentsLabel: `${documents.filter(doc => doc.indexStatus === 'ready').length} / ${documents.length}`,
                }))}
              />
            )}
            {activeTab === 'evidence' && <EvidenceView key={item.id} item={item} onOpenQuality={() => onTabChange('quality')} />}
            {activeTab === 'quality' && <QualityView item={item} />}
            {activeTab === 'settings' && <SettingsView item={item} />}
            {activeTab === 'pipeline' && item.runtimeMode === 'rag_pipeline' && <PipelineView item={item} />}
          </div>
        </div>
      </div>
    </div>
  )
}
