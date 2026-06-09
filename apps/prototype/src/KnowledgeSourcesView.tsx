import { Button } from '@langgenius/dify-ui/button'
import { cn } from '@langgenius/dify-ui/cn'
import { Dialog, DialogCloseButton, DialogContent, DialogTitle } from '@langgenius/dify-ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@langgenius/dify-ui/dropdown-menu'
import { Input } from '@langgenius/dify-ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectItemIndicator,
  SelectItemText,
  SelectTrigger,
  SelectValue,
} from '@langgenius/dify-ui/select'
import {
  RiAddLine,
  RiDatabase2Line,
  RiGlobalLine,
  RiMoreFill,
  RiPlugLine,
  RiSearchLine,
  RiUploadLine,
} from '@remixicon/react'
import { useMemo, useState } from 'react'
import { sourceStatusTone, StatusBadge } from './knowledge-2-badges'
import {
  datasetPermissionLabels,
  formatSourceFreshness,
  knowledgeSourceTypeOptions,
  sourceTypeLabels,
  sourceFreshnessOptions,
  type DatasetPermission,
  type Knowledge2Item,
  type KnowledgeSourceRow,
  type KnowledgeSourceType,
  type SourceFreshness,
} from './knowledge-2-data'

const sourceTypeIcons: Record<KnowledgeSourceType, React.ComponentType<{ className?: string }>> = {
  upload: RiUploadLine,
  web: RiGlobalLine,
  connector: RiPlugLine,
  'object-storage': RiDatabase2Line,
}

const sourceStatusFilterOptions = [
  { value: 'all', label: 'All status' },
  { value: 'Active', label: 'Active' },
  { value: 'Syncing', label: 'Syncing' },
  { value: 'Error', label: 'Error' },
  { value: 'Disabled', label: 'Disabled' },
]

const permissionOptions: { value: DatasetPermission; label: string }[] = [
  { value: 'only_me', label: 'Only me' },
  { value: 'all_team_members', label: 'All team members' },
  { value: 'partial_members', label: 'Partial team members' },
]

type AddSourceDraft = {
  type: KnowledgeSourceType
  name: string
  endpoint: string
  freshness: SourceFreshness
  permission: DatasetPermission
}

const defaultDraft = (type: KnowledgeSourceType): AddSourceDraft => ({
  type,
  name: '',
  endpoint: '',
  freshness: { strategy: 'manual' },
  permission: 'all_team_members',
})

export function KnowledgeSourcesView({ item }: { item: Knowledge2Item }) {
  const [sources, setSources] = useState<KnowledgeSourceRow[]>(() => item.sources.map(source => ({ ...source })))
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [addOpen, setAddOpen] = useState(false)
  const [draft, setDraft] = useState<AddSourceDraft>(defaultDraft('upload'))
  const [detailSource, setDetailSource] = useState<KnowledgeSourceRow | null>(null)

  const availableTypes = knowledgeSourceTypeOptions

  const filteredSources = useMemo(() => {
    const keyword = search.trim().toLowerCase()
    return sources.filter((source) => {
      if (statusFilter !== 'all' && source.status !== statusFilter)
        return false
      if (!keyword)
        return true
      return [source.name, sourceTypeLabels[source.type], datasetPermissionLabels[source.permission]].join(' ').toLowerCase().includes(keyword)
    })
  }, [search, sources, statusFilter])

  const updateSource = (id: string, patch: Partial<KnowledgeSourceRow>) => {
    setSources(current => current.map(source => source.id === id ? { ...source, ...patch } : source))
  }

  const handleSync = (source: KnowledgeSourceRow) => {
    updateSource(source.id, { status: 'Syncing', lastSync: 'Syncing now' })
    window.setTimeout(() => {
      updateSource(source.id, { status: 'Active', lastSync: 'Just now' })
    }, 900)
  }

  const handleRetry = (source: KnowledgeSourceRow) => {
    updateSource(source.id, { status: 'Syncing', lastSync: 'Retrying' })
    window.setTimeout(() => {
      updateSource(source.id, { status: 'Active', lastSync: 'Just now' })
    }, 1200)
  }

  const handleToggleDisabled = (source: KnowledgeSourceRow) => {
    if (source.status === 'Disabled')
      updateSource(source.id, { status: 'Active' })
    else
      updateSource(source.id, { status: 'Disabled' })
  }

  const handleAddSource = () => {
    if (!draft.name.trim())
      return
    const nextId = `${item.id}-src-${Date.now()}`
    const nextSource: KnowledgeSourceRow = {
      id: nextId,
      name: draft.name.trim(),
      type: draft.type,
      status: 'Active',
      freshness: draft.freshness,
      permission: draft.permission,
      lastSync: 'Just now',
      endpoint: draft.endpoint.trim() || undefined,
    }
    setSources(current => [nextSource, ...current])
    setAddOpen(false)
    setDraft(defaultDraft(availableTypes[0]?.value ?? 'Upload'))
  }

  return (
    <div className="space-y-4 pr-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <Select
            items={sourceStatusFilterOptions}
            value={statusFilter}
            onValueChange={(value) => {
              if (value !== null)
                setStatusFilter(value)
            }}
          >
            <SelectTrigger size="large" aria-label="Source status" className="w-[160px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {sourceStatusFilterOptions.map(option => (
                <SelectItem key={option.value} value={option.value}>
                  <SelectItemText>{option.label}</SelectItemText>
                  <SelectItemIndicator />
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="relative w-[220px]">
            <RiSearchLine className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-text-quaternary" />
            <Input
              value={search}
              onChange={event => setSearch(event.target.value)}
              placeholder="Search sources"
              className="pl-8"
              aria-label="Search sources"
            />
          </div>
        </div>
        <Button variant="primary" onClick={() => setAddOpen(true)}>
          <RiAddLine className="size-4" />
          Add source
        </Button>
      </div>

      <div className="overflow-hidden rounded-xl border border-components-panel-border bg-components-panel-bg shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[960px] border-collapse text-sm">
            <thead>
              <tr className="border-b border-divider-subtle">
                {['Source', 'Type', 'Status', 'Freshness', 'Permission', 'Last sync', ''].map(column => (
                  <th key={column} className="px-4 py-3 text-left system-2xs-medium-uppercase text-text-tertiary">
                    {column}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredSources.length
                ? filteredSources.map(source => (
                    <tr key={source.id} className="border-b border-divider-subtle last:border-b-0 hover:bg-state-base-hover">
                      <td className="px-4 py-3">
                        <button
                          type="button"
                          className="system-sm-semibold text-text-secondary hover:text-text-accent"
                          onClick={() => setDetailSource(source)}
                        >
                          {source.name}
                        </button>
                      </td>
                      <td className="px-4 py-3 system-sm-regular text-text-secondary">{sourceTypeLabels[source.type]}</td>
                      <td className="px-4 py-3">
                        <StatusBadge label={source.status} tone={sourceStatusTone(source.status)} />
                      </td>
                      <td className="px-4 py-3 system-sm-regular text-text-secondary">{formatSourceFreshness(source.freshness)}</td>
                      <td className="px-4 py-3 system-sm-regular text-text-secondary">{datasetPermissionLabels[source.permission]}</td>
                      <td className="px-4 py-3 system-sm-regular text-text-tertiary">{source.lastSync}</td>
                      <td className="px-4 py-3">
                        <SourceRowActions
                          source={source}
                          onSync={() => handleSync(source)}
                          onRetry={() => handleRetry(source)}
                          onToggleDisabled={() => handleToggleDisabled(source)}
                          onOpen={() => setDetailSource(source)}
                        />
                      </td>
                    </tr>
                  ))
                : (
                    <tr>
                      <td colSpan={7} className="px-4 py-10 text-center system-sm-regular text-text-tertiary">
                        No sources match the current filters.
                      </td>
                    </tr>
                  )}
            </tbody>
          </table>
        </div>
      </div>

      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="w-[560px] max-w-[calc(100vw-2rem)]">
          <DialogCloseButton />
          <DialogTitle className="system-md-semibold text-text-secondary">Add source</DialogTitle>
          <p className="mt-1 system-sm-regular text-text-tertiary">
            Connect a new knowledge source. Users only see source type, freshness, permission, and sync status.
          </p>
          <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
            {availableTypes.map((option) => {
              const Icon = sourceTypeIcons[option.value]
              const selected = draft.type === option.value
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setDraft(current => ({ ...current, type: option.value }))}
                  className={cn(
                    'flex items-start gap-2 rounded-xl border p-3 text-left',
                    selected
                      ? 'border-components-option-card-option-selected-border bg-components-option-card-option-selected-bg ring-[0.5px] ring-components-option-card-option-selected-border'
                      : 'border-components-option-card-option-border bg-components-option-card-option-bg hover:bg-components-option-card-bg-hover',
                  )}
                >
                  <div className="flex size-8 shrink-0 items-center justify-center rounded-lg border border-components-panel-border bg-background-default-dodge">
                    <Icon className="size-4 text-text-tertiary" />
                  </div>
                  <div>
                    <div className="system-sm-medium text-text-secondary">{option.label}</div>
                    <div className="mt-0.5 system-xs-regular text-text-tertiary">{option.description}</div>
                  </div>
                </button>
              )
            })}
          </div>
          <div className="mt-4 space-y-3">
            <Field label="Source name">
              <Input
                value={draft.name}
                onChange={event => setDraft(current => ({ ...current, name: event.target.value }))}
                placeholder="e.g. Product docs crawl"
              />
            </Field>
            {(draft.type === 'web' || draft.type === 'object-storage') && (
              <Field label={draft.type === 'object-storage' ? 'Bucket or folder' : 'Endpoint or URL'}>
                <Input
                  value={draft.endpoint}
                  onChange={event => setDraft(current => ({ ...current, endpoint: event.target.value }))}
                  placeholder={draft.type === 'web' ? 'https://docs.example.com' : 's3://bucket/knowledge'}
                />
              </Field>
            )}
            <Field label="Freshness">
              <Select
                items={sourceFreshnessOptions}
                value={draft.freshness.strategy}
                onValueChange={(value) => {
                  const option = sourceFreshnessOptions.find(entry => entry.value === value)
                  if (option)
                    setDraft(current => ({ ...current, freshness: { strategy: option.value, staleAfterSeconds: option.staleAfterSeconds } }))
                }}
              >
                <SelectTrigger size="large" aria-label="Freshness" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {sourceFreshnessOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      <SelectItemText>{option.label}</SelectItemText>
                      <SelectItemIndicator />
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field label="Permission">
              <Select
                items={permissionOptions}
                value={draft.permission}
                onValueChange={(value) => {
                  if (value !== null)
                    setDraft(current => ({ ...current, permission: value }))
                }}
              >
                <SelectTrigger size="large" aria-label="Permission" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {permissionOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      <SelectItemText>{option.label}</SelectItemText>
                      <SelectItemIndicator />
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
          </div>
          <div className="mt-6 flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setAddOpen(false)}>Cancel</Button>
            <Button variant="primary" onClick={handleAddSource} disabled={!draft.name.trim()}>Add source</Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={!!detailSource} onOpenChange={(open) => {
        if (!open)
          setDetailSource(null)
      }}
      >
        {detailSource && (
          <DialogContent className="w-[520px] max-w-[calc(100vw-2rem)]">
            <DialogCloseButton />
            <DialogTitle className="system-md-semibold text-text-secondary">{detailSource.name}</DialogTitle>
            <div className="mt-4 space-y-3">
              <DetailRow label="Type" value={sourceTypeLabels[detailSource.type]} />
              <DetailRow label="Status" value={detailSource.status} />
              <DetailRow label="Freshness" value={formatSourceFreshness(detailSource.freshness)} />
              <DetailRow label="Permission" value={datasetPermissionLabels[detailSource.permission]} />
              <DetailRow label="Last sync" value={detailSource.lastSync} />
              {detailSource.endpoint && <DetailRow label="Endpoint" value={detailSource.endpoint} />}
            </div>
            <div className="mt-6 flex flex-wrap gap-2">
              <Button variant="secondary" size="small" onClick={() => handleSync(detailSource)}>Sync now</Button>
              {detailSource.status === 'Error' && (
                <Button variant="secondary" size="small" onClick={() => handleRetry(detailSource)}>Retry</Button>
              )}
              <Button variant="ghost" size="small" onClick={() => handleToggleDisabled(detailSource)}>
                {detailSource.status === 'Disabled' ? 'Enable' : 'Disable'}
              </Button>
            </div>
          </DialogContent>
        )}
      </Dialog>
    </div>
  )
}

function SourceRowActions({
  source,
  onSync,
  onRetry,
  onToggleDisabled,
  onOpen,
}: {
  source: KnowledgeSourceRow
  onSync: () => void
  onRetry: () => void
  onToggleDisabled: () => void
  onOpen: () => void
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label="Source actions"
        className="inline-flex size-8 items-center justify-center rounded-lg text-text-tertiary hover:bg-state-base-hover"
      >
        <RiMoreFill className="size-4" />
      </DropdownMenuTrigger>
      <DropdownMenuContent placement="bottom-end">
        <DropdownMenuItem onClick={onSync}>Sync now</DropdownMenuItem>
        {source.status === 'Error' && <DropdownMenuItem onClick={onRetry}>Retry</DropdownMenuItem>}
        <DropdownMenuItem onClick={onOpen}>Open source</DropdownMenuItem>
        <DropdownMenuItem onClick={onToggleDisabled}>
          {source.status === 'Disabled' ? 'Enable' : 'Disable'}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <div className="mb-1 system-sm-medium text-text-secondary">{label}</div>
      {children}
    </label>
  )
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-lg border border-divider-subtle bg-background-default-subtle px-3 py-2">
      <span className="system-xs-medium text-text-tertiary">{label}</span>
      <span className="system-sm-regular text-text-secondary">{value}</span>
    </div>
  )
}
