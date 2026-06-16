import { Button } from '@langgenius/dify-ui/button'
import { Dialog, DialogCloseButton, DialogContent, DialogTitle } from '@langgenius/dify-ui/dialog'
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
import { RiAddLine, RiSearchLine } from '@remixicon/react'
import { useMemo, useState } from 'react'
import { sourceStatusTone, StatusBadge } from '../../components/badges'
import {
  datasetPermissionLabels,
  formatSourceFreshness,
  sourceTypeLabels,
  type DatasetItem,
  type DatasetSourceRow,
} from '../../fixtures/items'
import {
  addSourceTypeOptions,
  defaultDraft,
  sourceProviderOptionsByType,
  sourceStatusFilterOptions,
  sourceSyncPolicyOptions,
} from './source-options'
import { DetailRow, SourceRowActions } from './source-shared'
import { SourceSetupView } from './SourceSetupView'
import type { AddSourceDraft, SourceAddMeta } from './source-types'

export { defaultSourceFreshness, endpointLabels, permissionOptions, sourceProviderOptionsByType, sourceSyncPolicyOptions } from './source-options'

export function SourcesView({
  item,
  onSourcesChange,
}: {
  item: DatasetItem
  onSourcesChange?: (sources: DatasetSourceRow[]) => void
}) {
  const [sources, setSources] = useState<DatasetSourceRow[]>(() => item.sources.map(source => ({ ...source })))
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [setupOpen, setSetupOpen] = useState(false)
  const [draft, setDraft] = useState<AddSourceDraft>(defaultDraft('website-crawl'))
  const [detailSource, setDetailSource] = useState<DatasetSourceRow | null>(null)

  const availableTypes = addSourceTypeOptions
  const availableSyncPolicyOptions = sourceSyncPolicyOptions(draft.type)

  const filteredSources = useMemo(() => {
    const keyword = search.trim().toLowerCase()
    return sources.filter((source) => {
      if (statusFilter !== 'all' && source.status !== statusFilter)
        return false
      if (!keyword)
        return true
      return [source.name, sourceTypeLabels[source.type], source.providerName, datasetPermissionLabels[source.permission]].join(' ').toLowerCase().includes(keyword)
    })
  }, [search, sources, statusFilter])

  const commitSources = (updater: (sources: DatasetSourceRow[]) => DatasetSourceRow[]) => {
    setSources((current) => {
      const next = updater(current)
      window.setTimeout(() => onSourcesChange?.(next), 0)
      return next
    })
  }

  const updateSource = (id: string, patch: Partial<DatasetSourceRow>) => {
    commitSources(current => current.map(source => source.id === id ? { ...source, ...patch } : source))
  }

  const handleSync = (source: DatasetSourceRow) => {
    updateSource(source.id, { status: 'Syncing', lastSync: 'Syncing now' })
    window.setTimeout(() => {
      updateSource(source.id, { status: 'Active', lastSync: 'Just now' })
    }, 900)
  }

  const handleRetry = (source: DatasetSourceRow) => {
    updateSource(source.id, { status: 'Syncing', lastSync: 'Retrying' })
    window.setTimeout(() => {
      updateSource(source.id, { status: 'Active', lastSync: 'Just now' })
    }, 1200)
  }

  const handleToggleDisabled = (source: DatasetSourceRow) => {
    if (source.status === 'Disabled')
      updateSource(source.id, { status: 'Active' })
    else
      updateSource(source.id, { status: 'Disabled' })
  }

  const handleAddSource = (meta?: SourceAddMeta) => {
    if (!draft.name.trim())
      return
    const nextId = `${item.id}-src-${Date.now()}`
    const selectedProvider = sourceProviderOptionsByType[draft.type].find(option => option.value === draft.provider)
    const nextSource: DatasetSourceRow = {
      id: nextId,
      name: draft.name.trim(),
      type: draft.type,
      status: 'Syncing',
      freshness: draft.freshness,
      permission: draft.permission,
      lastSync: 'Sync queued',
      endpoint: draft.endpoint.trim() || undefined,
      providerName: selectedProvider?.label,
      configSummary: meta?.configSummary,
    }
    commitSources(current => [nextSource, ...current])
    setSetupOpen(false)
    setDraft(defaultDraft(availableTypes[0]?.value ?? 'website-crawl'))
    window.setTimeout(() => {
      updateSource(nextId, { status: 'Active', lastSync: 'Just now' })
    }, 900)
  }

  if (setupOpen) {
    return (
      <SourceSetupView
        draft={draft}
        availableTypes={availableTypes}
        availableSyncPolicyOptions={availableSyncPolicyOptions}
        onDraftChange={setDraft}
        onCancel={() => setSetupOpen(false)}
        onAddSource={handleAddSource}
      />
    )
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
        <Button variant="primary" onClick={() => setSetupOpen(true)}>
          <RiAddLine className="size-4" />
          Add source
        </Button>
      </div>

      <div className="overflow-hidden rounded-xl border border-components-panel-border bg-components-panel-bg shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1080px] border-collapse text-sm">
            <thead>
              <tr className="border-b border-divider-subtle">
                {['Source', 'Type', 'Provider', 'Status', 'Sync policy', 'Permission', 'Last sync', ''].map(column => (
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
                      <td className="px-4 py-3 system-sm-regular text-text-secondary">{source.providerName ?? 'Default'}</td>
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
                      <td colSpan={8} className="px-4 py-10 text-center system-sm-regular text-text-tertiary">
                        No sources match the current filters.
                      </td>
                    </tr>
                  )}
            </tbody>
          </table>
        </div>
      </div>

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
              {detailSource.providerName && <DetailRow label="Provider" value={detailSource.providerName} />}
              <DetailRow label="Sync policy" value={formatSourceFreshness(detailSource.freshness)} />
              <DetailRow label="Permission" value={datasetPermissionLabels[detailSource.permission]} />
              <DetailRow label="Last sync" value={detailSource.lastSync} />
              {detailSource.endpoint && <DetailRow label="Endpoint" value={detailSource.endpoint} />}
              {detailSource.configSummary?.map(detail => (
                <DetailRow key={`${detail.label}-${detail.value}`} label={detail.label} value={detail.value} />
              ))}
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
