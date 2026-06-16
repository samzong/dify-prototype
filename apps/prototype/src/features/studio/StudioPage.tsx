import { useMemo, useState } from 'react'
import { prototypeApps } from './fixtures/apps'
import { AppCard } from './components/AppCard'
import { FilterChip } from './components/FilterChip'
import { NewAppCard } from './components/NewAppCard'
import { SearchInput } from './components/SearchInput'

export function StudioPage({ onOpenWorkflow }: { onOpenWorkflow: (appId?: string) => void }) {
  const [keywords, setKeywords] = useState('')

  const filteredApps = useMemo(() => {
    const query = keywords.trim().toLowerCase()
    if (!query)
      return prototypeApps

    return prototypeApps.filter(app => `${app.name} ${app.description} ${app.tags.join(' ')}`.toLowerCase().includes(query))
  }, [keywords])

  return (
    <main className="relative flex h-0 shrink-0 grow flex-col overflow-y-auto bg-background-body">
      <div className="sticky top-0 z-10 flex flex-wrap items-center justify-between gap-x-4 gap-y-2 bg-background-body px-12 pt-7 pb-5">
        <div className="flex flex-wrap items-center gap-2">
          <FilterChip iconClassName="i-ri-apps-2-line" label="Types" />
          <FilterChip iconClassName="i-ri-user-3-line" label="Created by anyone" />
          <FilterChip iconClassName="i-ri-price-tag-3-line" label="Tags" />
          <SearchInput value={keywords} onChange={setKeywords} />
        </div>
        <a href="#" className="flex h-8 items-center rounded-lg px-3 text-sm font-semibold text-text-secondary hover:bg-state-base-hover hover:text-text-primary">
          View Snippets
        </a>
      </div>
      <div className="relative grid grow grid-cols-1 content-start gap-4 px-12 pt-2 sm:grid-cols-1 md:grid-cols-2 xl:grid-cols-4 2xl:grid-cols-5">
        <NewAppCard onOpenWorkflow={() => onOpenWorkflow()} />
        {filteredApps.map(app => (
          <AppCard
            key={app.id}
            app={app}
            onOpenWorkflow={() => onOpenWorkflow(app.id)}
          />
        ))}
      </div>
      <div className="flex items-center justify-center gap-2 py-4 text-text-quaternary" role="region" aria-label="Drop DSL file here to create app">
        <span className="i-ri-drag-drop-line size-4" />
        <span className="system-xs-regular">Drop DSL file here to create app</span>
      </div>
    </main>
  )
}
