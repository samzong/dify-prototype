import type { DatasetDetailTab } from './fixtures/types'
import type { DatasetItem } from './fixtures/types'
import type { DatasetCreateMode } from './types/create'
import type { KnowledgeSpaceCatalog } from './hooks/useKnowledgeSpaceCatalog'
import { CreatePage } from './views/create/CreatePage'
import { DetailPage } from './views/detail/DetailPage'
import { ListPage } from './views/list/ListPage'
import type { DatasetScreen } from '../../routing/dataset-routes'
import { pathToDetailTab } from '../../routing/dataset-routes'
import { RouteFallback } from '../../shared/components/RouteFallback'

export { DatasetsTopNav } from './components/DatasetsTopNav'

export function DatasetsSection({
  screen,
  catalog,
  onOpenList,
  onOpenDetail,
  onOpenCreate,
  onUpdateDataset,
  onCreateDataset,
  onDeleteDataset,
  onTabChange,
}: {
  screen: DatasetScreen
  catalog: KnowledgeSpaceCatalog
  onOpenList: () => void
  onOpenDetail: (id: string) => void
  onOpenCreate: (mode: DatasetCreateMode) => void
  onUpdateDataset: (id: string, updater: (item: DatasetItem) => DatasetItem) => void
  onCreateDataset: (payload: { draft: DatasetItem; slug: string }) => Promise<void>
  onDeleteDataset: (id: string) => Promise<void>
  onTabChange: (datasetId: string, tab: DatasetDetailTab) => void
}) {
  if (screen.kind === 'list') {
    return (
      <ListPage
        items={catalog.items}
        loading={catalog.loading}
        error={catalog.error}
        loadingMore={catalog.loadingMore}
        hasMore={!!catalog.nextCursor}
        onOpenDetail={onOpenDetail}
        onOpenCreate={onOpenCreate}
        onLoadMore={() => void catalog.loadMore()}
        onRefresh={() => void catalog.refresh()}
        onDelete={onDeleteDataset}
      />
    )
  }

  if (screen.kind === 'create') {
    const mode = screen.mode as DatasetCreateMode
    return (
      <CreatePage
        mode={mode}
        onBack={onOpenList}
        onCreate={onCreateDataset}
      />
    )
  }

  const item = catalog.resolveItem(screen.datasetId)
  if (!item) {
    if (catalog.loading)
      return <RouteFallback />

    return (
      <ListPage
        items={catalog.items}
        loading={catalog.loading}
        error={catalog.error ?? 'Knowledge space not found'}
        onOpenDetail={onOpenDetail}
        onOpenCreate={onOpenCreate}
        onRefresh={() => void catalog.refresh()}
      />
    )
  }

  return (
    <DetailPage
      key={item.id}
      item={item}
      activeTab={pathToDetailTab(screen.tab)}
      onTabChange={tab => onTabChange(item.id, tab)}
      onUpdateDataset={onUpdateDataset}
      onDeleteKnowledge={onDeleteDataset}
    />
  )
}
