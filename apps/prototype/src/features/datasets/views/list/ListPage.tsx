import { Button } from '@langgenius/dify-ui/button'
import { Checkbox } from '@langgenius/dify-ui/checkbox'
import { useMemo, useState } from 'react'
import type { DatasetItem } from '../../fixtures/items'
import type { DatasetCreateMode } from '../../types/create'
import { FilterChip, ListCard, NewDatasetCard, SearchInput } from './list-shared'

export function ListPage({
  items,
  onOpenDetail,
  onOpenCreate,
}: {
  items: DatasetItem[]
  onOpenDetail: (id: string) => void
  onOpenCreate: (mode: DatasetCreateMode) => void
}) {
  const [keywords, setKeywords] = useState('')
  const [includeAll, setIncludeAll] = useState(false)

  const filteredItems = useMemo(() => {
    const query = keywords.trim().toLowerCase()
    return items.filter((item) => {
      if (!query)
        return true
      return `${item.name} ${item.description} ${item.tags.join(' ')}`.toLowerCase().includes(query)
    })
  }, [items, keywords])

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
      <nav className="grid grow grid-cols-1 content-start gap-3 px-12 pt-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        <NewDatasetCard onOpenCreate={onOpenCreate} />
        {filteredItems.map(item => (
          <ListCard key={item.id} item={item} onOpen={() => onOpenDetail(item.id)} />
        ))}
      </nav>
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
