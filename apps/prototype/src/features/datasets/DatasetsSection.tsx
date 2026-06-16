import type { DatasetDetailTab } from './fixtures/types'
import type { DatasetItem } from './fixtures/types'
import type { DatasetCreateMode } from './types/create'
import { CreatePage } from './views/create/CreatePage'
import { DetailPage } from './views/detail/DetailPage'
import { ListPage } from './views/list/ListPage'
import type { DatasetScreen } from '../../routing/dataset-routes'
import { pathToDetailTab } from '../../routing/dataset-routes'

export { DatasetsTopNav } from './components/DatasetsTopNav'

export function DatasetsSection({
  screen,
  items,
  onOpenList,
  onOpenDetail,
  onOpenCreate,
  onUpdateDataset,
  onCreateDataset,
  onTabChange,
}: {
  screen: DatasetScreen
  items: DatasetItem[]
  onOpenList: () => void
  onOpenDetail: (id: string) => void
  onOpenCreate: (mode: DatasetCreateMode) => void
  onUpdateDataset: (id: string, updater: (item: DatasetItem) => DatasetItem) => void
  onCreateDataset: (item: DatasetItem) => void
  onTabChange: (datasetId: string, tab: DatasetDetailTab) => void
}) {
  if (screen.kind === 'list')
    return <ListPage items={items} onOpenDetail={onOpenDetail} onOpenCreate={onOpenCreate} />

  if (screen.kind === 'create') {
    const mode = screen.mode as DatasetCreateMode
    return <CreatePage mode={mode} onBack={onOpenList} onCreate={onCreateDataset} />
  }

  const item = items.find(entry => entry.id === screen.datasetId)
  if (!item)
    return <ListPage items={items} onOpenDetail={onOpenDetail} onOpenCreate={onOpenCreate} />

  return (
    <DetailPage
      key={item.id}
      item={item}
      activeTab={pathToDetailTab(screen.tab)}
      onTabChange={tab => onTabChange(item.id, tab)}
      onUpdateDataset={onUpdateDataset}
    />
  )
}
