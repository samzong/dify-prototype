import { Button } from '@langgenius/dify-ui/button'
import { Checkbox } from '@langgenius/dify-ui/checkbox'
import { useMemo, useState } from 'react'
import type { DatasetItem } from '../../fixtures/items'
import type { DatasetCreateMode } from '../../types/create'
import { FilterChip, ListCard, NewDatasetCard, SearchInput } from './list-shared'

export function ListPage({
  items,
  loading,
  error,
  loadingMore,
  hasMore,
  onOpenDetail,
  onOpenCreate,
  onLoadMore,
  onRefresh,
  onDelete,
}: {
  items: DatasetItem[]
  loading?: boolean
  error?: string | null
  loadingMore?: boolean
  hasMore?: boolean
  onOpenDetail: (id: string) => void
  onOpenCreate: (mode: DatasetCreateMode) => void
  onLoadMore?: () => void
  onRefresh?: () => void
  onDelete?: (id: string) => Promise<void>
}) {
  const [keywords, setKeywords] = useState('')
  const [includeAll, setIncludeAll] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const filteredItems = useMemo(() => {
    const query = keywords.trim().toLowerCase()
    return items.filter((item) => {
      if (!query)
        return true
      return `${item.name} ${item.description} ${item.tags.join(' ')}`.toLowerCase().includes(query)
    })
  }, [items, keywords])

  const handleDelete = async (id: string) => {
    if (!onDelete)
      return
    setDeletingId(id)
    try {
      await onDelete(id)
    }
    finally {
      setDeletingId(null)
    }
  }

  return (
    <main className="relative flex h-0 shrink-0 grow flex-col overflow-y-auto bg-background-body">
      <div className="sticky top-0 z-10 flex items-center justify-end gap-x-1 bg-background-body px-12 pt-4 pb-2">
        <label className="mr-2 flex h-8 cursor-pointer items-center gap-2 rounded-lg px-2 text-text-secondary hover:bg-state-base-hover">
          <Checkbox checked={includeAll} onCheckedChange={setIncludeAll} aria-label="All Knowledge" />
          <span className="system-md-regular">All Knowledge</span>
        </label>
        <FilterChip iconClassName="i-ri-price-tag-3-line" label="Tags" />
        <SearchInput value={keywords} onChange={setKeywords} className="w-[200px]" />
        <Button className="gap-0.5 shadow-xs">
          <span className="i-custom-vender-solid-development-api-connection-mod size-4 text-components-button-secondary-text" />
          <span className="flex items-center justify-center gap-1 px-0.5 system-sm-medium text-components-button-secondary-text">External Knowledge API</span>
        </Button>
      </div>

      {error && (
        <div className="mx-12 mb-2 flex items-center justify-between rounded-xl border border-util-colors-warning-warning-500/30 bg-util-colors-warning-warning-50 px-4 py-3 dark:bg-util-colors-warning-warning-500/10">
          <span className="system-sm-regular text-text-secondary">{error}</span>
          {onRefresh && (
            <Button variant="secondary" size="small" onClick={() => void onRefresh()}>Retry</Button>
          )}
        </div>
      )}

      <nav className="grid grow grid-cols-1 content-start gap-3 px-12 pt-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        <NewDatasetCard onOpenCreate={onOpenCreate} />
        {loading && filteredItems.length === 0
          ? Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="h-47.5 w-full min-w-0 animate-pulse rounded-xl border border-components-card-border bg-components-card-bg" />
            ))
          : filteredItems.map(item => (
              <ListCard
                key={item.id}
                item={item}
                onOpen={() => onOpenDetail(item.id)}
                deleting={deletingId === item.id}
                onDelete={onDelete ? () => void handleDelete(item.id) : undefined}
              />
            ))}
      </nav>

      {hasMore && (
        <div className="flex justify-center px-12 py-4">
          <Button variant="secondary" loading={loadingMore} onClick={() => void onLoadMore?.()}>
            Load more
          </Button>
        </div>
      )}

      <footer className="shrink-0 px-12 py-6">
        <h3 className="text-gradient text-xl/tight font-semibold">Did you know?</h3>
        <p className="mt-1 text-sm/tight font-normal text-text-secondary">
          The Knowledge can be integrated into the Dify application
          {' '}
          <span className="inline-flex items-center gap-1 text-text-accent">as a context</span>
          ,
          <br />
          or it
          {' '}
          <span className="inline-flex items-center gap-1 text-text-accent">can be published</span>
          {' '}
          as an independent service.
        </p>
      </footer>
    </main>
  )
}
