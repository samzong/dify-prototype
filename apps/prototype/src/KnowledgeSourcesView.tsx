import { Button } from '@langgenius/dify-ui/button'
import { Checkbox } from '@langgenius/dify-ui/checkbox'
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
import { toast } from '@langgenius/dify-ui/toast'
import {
  RiAddLine,
  RiArrowLeftLine,
  RiBookOpenLine,
  RiCheckLine,
  RiCloudLine,
  RiDriveLine,
  RiEqualizer2Line,
  RiFileTextLine,
  RiFolderCloudLine,
  RiGlobalLine,
  RiGoogleLine,
  RiMoreFill,
  RiNotionLine,
  RiPagesLine,
  RiPlugLine,
  RiSearchLine,
  RiStoreLine,
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
  type SourceFreshnessStrategy,
} from './knowledge-2-data'

const sourceTypeIcons: Record<KnowledgeSourceType, React.ComponentType<{ className?: string }>> = {
  'website-crawl': RiGlobalLine,
  'online-documents': RiFileTextLine,
  'online-drive': RiDriveLine,
}

const addSourceTypeOptions = knowledgeSourceTypeOptions

export const defaultSourceFreshnessByType: Record<KnowledgeSourceType, SourceFreshness> = {
  'website-crawl': { strategy: 'ttl', staleAfterSeconds: 86400 },
  'online-documents': { strategy: 'async' },
  'online-drive': { strategy: 'async' },
}

const sourceSyncPolicyStrategiesByType: Record<KnowledgeSourceType, SourceFreshnessStrategy[]> = {
  'website-crawl': ['ttl', 'manual'],
  'online-documents': ['async', 'manual'],
  'online-drive': ['async', 'ttl', 'manual'],
}

export const sourceSyncPolicyOptions = (type: KnowledgeSourceType) => sourceSyncPolicyStrategiesByType[type]
  .map(strategy => sourceFreshnessOptions.find(option => option.value === strategy))
  .filter((option): option is (typeof sourceFreshnessOptions)[number] => !!option)

export const defaultSourceFreshness = (type: KnowledgeSourceType): SourceFreshness => ({ ...defaultSourceFreshnessByType[type] })

const sourceStatusFilterOptions = [
  { value: 'all', label: 'All status' },
  { value: 'Active', label: 'Active' },
  { value: 'Syncing', label: 'Syncing' },
  { value: 'Error', label: 'Error' },
  { value: 'Disabled', label: 'Disabled' },
]

export const permissionOptions: { value: DatasetPermission; label: string }[] = [
  { value: 'only_me', label: 'Only me' },
  { value: 'all_team_members', label: 'All team members' },
  { value: 'partial_members', label: 'Partial team members' },
]

export type SourceProviderOption = {
  value: string
  label: string
  description: string
  icon: React.ComponentType<{ className?: string }>
}

export const sourceProviderOptionsByType: Record<KnowledgeSourceType, SourceProviderOption[]> = {
  'website-crawl': [
    { value: 'firecrawl', label: 'Firecrawl', description: 'Website and sitemap crawl provider.', icon: RiGlobalLine },
    { value: 'jina-reader', label: 'Jina Reader', description: 'Reader-first web extraction.', icon: RiPagesLine },
    { value: 'watercrawl', label: 'WaterCrawl', description: 'Scheduled website crawl provider.', icon: RiCloudLine },
  ],
  'online-documents': [
    { value: 'notion', label: 'Notion', description: 'Sync selected pages from a workspace.', icon: RiNotionLine },
    { value: 'google-docs', label: 'Google Docs', description: 'Sync online documents from Drive.', icon: RiGoogleLine },
    { value: 'confluence', label: 'Confluence', description: 'Sync pages from a knowledge space.', icon: RiPlugLine },
  ],
  'online-drive': [
    { value: 'google-drive', label: 'Google Drive', description: 'Browse folders and sync selected files.', icon: RiGoogleLine },
    { value: 'onedrive', label: 'OneDrive', description: 'Browse drive folders and selected assets.', icon: RiDriveLine },
    { value: 's3', label: 'Amazon S3', description: 'Mount a bucket or prefix for file sync.', icon: RiFolderCloudLine },
  ],
}

export const endpointLabels: Record<KnowledgeSourceType, { label: string; placeholder: string }> = {
  'website-crawl': { label: 'Root URL', placeholder: 'https://docs.example.com' },
  'online-documents': { label: 'Workspace or space', placeholder: 'Support workspace' },
  'online-drive': { label: 'Folder or bucket', placeholder: 'Drive folder or s3://bucket/path' },
}

type WebsiteCrawlOptions = {
  crawl_sub_pages: boolean
  use_sitemap: boolean
  limit: number | ''
  max_depth: number | ''
  excludes: string
  includes: string
  only_main_content: boolean
}

type WebsiteCrawlResult = {
  title: string
  source_url: string
  content: string
}

type WebsiteCrawlStatus = 'idle' | 'running' | 'finished'

type SourceAddMeta = {
  configSummary?: KnowledgeSourceRow['configSummary']
}

const defaultWebsiteCrawlOptions = (): WebsiteCrawlOptions => ({
  crawl_sub_pages: true,
  use_sitemap: true,
  limit: 10,
  max_depth: 2,
  excludes: '',
  includes: '',
  only_main_content: true,
})

const websiteCrawlProviderDetails: Record<string, {
  title: string
  configureLabel: string
  docTitle: string
  docLink: string
}> = {
  firecrawl: {
    title: 'Extract web content with 🔥Firecrawl',
    configureLabel: 'Configure Firecrawl',
    docTitle: 'Firecrawl docs',
    docLink: 'https://docs.firecrawl.dev/introduction',
  },
  'jina-reader': {
    title: 'Convert the entire site to Markdown',
    configureLabel: 'Configure Jina Reader',
    docTitle: 'Learn more about Jina Reader',
    docLink: 'https://jina.ai/reader',
  },
  watercrawl: {
    title: 'Extract web content with Watercrawl',
    configureLabel: 'Configure Watercrawl',
    docTitle: 'Watercrawl docs',
    docLink: 'https://watercrawl.dev',
  },
}

type AddSourceDraft = {
  type: KnowledgeSourceType
  name: string
  endpoint: string
  provider: string
  freshness: SourceFreshness
  permission: DatasetPermission
}

const defaultDraft = (type: KnowledgeSourceType): AddSourceDraft => ({
  type,
  name: '',
  endpoint: '',
  provider: sourceProviderOptionsByType[type][0]?.value ?? '',
  freshness: defaultSourceFreshness(type),
  permission: 'all_team_members',
})

export function KnowledgeSourcesView({
  item,
  onSourcesChange,
}: {
  item: Knowledge2Item
  onSourcesChange?: (sources: KnowledgeSourceRow[]) => void
}) {
  const [sources, setSources] = useState<KnowledgeSourceRow[]>(() => item.sources.map(source => ({ ...source })))
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [setupOpen, setSetupOpen] = useState(false)
  const [draft, setDraft] = useState<AddSourceDraft>(defaultDraft('website-crawl'))
  const [detailSource, setDetailSource] = useState<KnowledgeSourceRow | null>(null)

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

  const commitSources = (updater: (sources: KnowledgeSourceRow[]) => KnowledgeSourceRow[]) => {
    setSources((current) => {
      const next = updater(current)
      window.setTimeout(() => onSourcesChange?.(next), 0)
      return next
    })
  }

  const updateSource = (id: string, patch: Partial<KnowledgeSourceRow>) => {
    commitSources(current => current.map(source => source.id === id ? { ...source, ...patch } : source))
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

  const handleAddSource = (meta?: SourceAddMeta) => {
    if (!draft.name.trim())
      return
    const nextId = `${item.id}-src-${Date.now()}`
    const selectedProvider = sourceProviderOptionsByType[draft.type].find(option => option.value === draft.provider)
    const nextSource: KnowledgeSourceRow = {
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

function SourceSetupView({
  draft,
  availableTypes,
  availableSyncPolicyOptions,
  onDraftChange,
  onCancel,
  onAddSource,
}: {
  draft: AddSourceDraft
  availableTypes: typeof addSourceTypeOptions
  availableSyncPolicyOptions: ReturnType<typeof sourceSyncPolicyOptions>
  onDraftChange: React.Dispatch<React.SetStateAction<AddSourceDraft>>
  onCancel: () => void
  onAddSource: (meta?: SourceAddMeta) => void
}) {
  const providerOptions = sourceProviderOptionsByType[draft.type]
  const endpoint = endpointLabels[draft.type]
  const [crawlOptions, setCrawlOptions] = useState<WebsiteCrawlOptions>(defaultWebsiteCrawlOptions)
  const [crawlStatus, setCrawlStatus] = useState<WebsiteCrawlStatus>('idle')
  const [crawlResults, setCrawlResults] = useState<WebsiteCrawlResult[]>([])
  const [checkedCrawlUrls, setCheckedCrawlUrls] = useState<string[]>([])
  const [crawlOptionsOpen, setCrawlOptionsOpen] = useState(true)
  const selectedProvider = providerOptions.find(option => option.value === draft.provider)
  const isWebsiteCrawl = draft.type === 'website-crawl'
  const canAddSource = isWebsiteCrawl
    ? !!draft.name.trim() && !!draft.endpoint.trim() && crawlStatus === 'finished' && checkedCrawlUrls.length > 0
    : !!draft.name.trim()
  const openDataSourceMarketplace = () => {
    toast.info('Open Marketplace to install more data-source providers')
  }
  const resetWebsiteCrawl = () => {
    setCrawlStatus('idle')
    setCrawlResults([])
    setCheckedCrawlUrls([])
    setCrawlOptionsOpen(true)
  }
  const handleRunWebsiteCrawl = () => {
    const url = draft.endpoint.trim()
    const parsed = parseWebsiteUrl(url)
    if (!parsed) {
      toast.error('URL must start with http:// or https://')
      return
    }
    if (crawlOptions.limit === '') {
      toast.error('Limit is required')
      return
    }
    const total = Math.max(1, Number(crawlOptions.limit))
    const nextResults = buildWebsiteCrawlResults(parsed, total, draft.provider)
    if (!draft.name.trim()) {
      onDraftChange(current => ({
        ...current,
        name: parsed.hostname,
      }))
    }
    setCrawlStatus('running')
    setCrawlResults([])
    setCheckedCrawlUrls([])
    setCrawlOptionsOpen(false)
    window.setTimeout(() => {
      setCrawlResults(nextResults)
      setCheckedCrawlUrls(nextResults.map(result => result.source_url))
      setCrawlStatus('finished')
    }, 900)
  }
  const handleAdd = () => {
    if (!canAddSource)
      return

    onAddSource(isWebsiteCrawl
      ? {
          configSummary: buildWebsiteConfigSummary({
            providerName: selectedProvider?.label ?? draft.provider,
            provider: draft.provider,
            url: draft.endpoint.trim(),
            options: crawlOptions,
            results: crawlResults,
            checkedUrls: checkedCrawlUrls,
          }),
        }
      : undefined)
  }

  return (
    <div className="space-y-5 pr-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <Button variant="ghost" onClick={onCancel}>
            <RiArrowLeftLine className="size-4" />
            Sources
          </Button>
          <div className="h-5 w-px bg-divider-regular" />
          <div className="min-w-0">
            <div className="system-md-semibold text-text-secondary">Add source</div>
            <div className="system-xs-regular text-text-tertiary">Create a synced source connection for this knowledge base.</div>
          </div>
        </div>
        <Button variant="primary" onClick={handleAdd} disabled={!canAddSource}>
          <RiAddLine className="size-4" />
          Add source
        </Button>
      </div>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-6">
          <section>
            <div className="mb-2 system-xs-medium text-text-tertiary">Source type</div>
            <div className="grid grid-cols-1 gap-2 md:grid-cols-3">
              {availableTypes.map((option) => {
                const Icon = sourceTypeIcons[option.value]
                return (
                  <SourceSetupCard
                    key={option.value}
                    label={option.label}
                    description={option.description}
                    selected={draft.type === option.value}
                    icon={Icon}
                    onClick={() => onDraftChange(current => ({
                      ...current,
                      type: option.value,
                      endpoint: '',
                      provider: sourceProviderOptionsByType[option.value][0]?.value ?? '',
                      freshness: defaultSourceFreshness(option.value),
                    }))}
                    onAfterClick={resetWebsiteCrawl}
                  />
                )
              })}
            </div>
          </section>

          <section>
            <div className="mb-2 flex items-center justify-between gap-2">
              <div className="system-xs-medium text-text-tertiary">{sourceTypeLabels[draft.type]} provider</div>
              <button
                type="button"
                onClick={openDataSourceMarketplace}
                className="inline-flex h-7 items-center gap-1 rounded-lg px-2 system-xs-medium text-text-accent hover:bg-state-accent-hover"
              >
                <RiStoreLine className="size-3.5" />
                Install data-source
              </button>
            </div>
            <div className="grid grid-cols-1 gap-2 md:grid-cols-3">
              {providerOptions.map(option => (
                <SourceSetupCard
                  key={option.value}
                  label={option.label}
                  description={option.description}
                  selected={draft.provider === option.value}
                  icon={option.icon}
                  onClick={() => onDraftChange(current => ({ ...current, provider: option.value }))}
                  onAfterClick={resetWebsiteCrawl}
                />
              ))}
              <InstallDataSourceCard onClick={openDataSourceMarketplace} />
            </div>
          </section>
          {isWebsiteCrawl && (
            <WebsiteCrawlSetup
              provider={draft.provider}
              providerName={selectedProvider?.label ?? draft.provider}
              url={draft.endpoint}
              onUrlChange={(value) => {
                resetWebsiteCrawl()
                onDraftChange(current => ({ ...current, endpoint: value }))
              }}
              options={crawlOptions}
              onOptionsChange={(nextOptions) => {
                resetWebsiteCrawl()
                setCrawlOptions(nextOptions)
              }}
              optionsOpen={crawlOptionsOpen}
              onOptionsOpenChange={setCrawlOptionsOpen}
              status={crawlStatus}
              results={crawlResults}
              checkedUrls={checkedCrawlUrls}
              onCheckedUrlsChange={setCheckedCrawlUrls}
              onRun={handleRunWebsiteCrawl}
            />
          )}
        </div>

        <aside className="h-fit rounded-xl border border-components-panel-border bg-components-panel-bg p-4 shadow-xs">
          <div className="system-sm-semibold text-text-secondary">Source settings</div>
          <div className="mt-4 space-y-3">
            <Field label="Source name">
              <Input
                value={draft.name}
                onChange={event => onDraftChange(current => ({ ...current, name: event.target.value }))}
                placeholder="e.g. Product docs crawl"
              />
            </Field>
            {!isWebsiteCrawl && (
              <Field label={endpoint.label}>
                <Input
                  value={draft.endpoint}
                  onChange={event => onDraftChange(current => ({ ...current, endpoint: event.target.value }))}
                  placeholder={endpoint.placeholder}
                />
              </Field>
            )}
            <Field label="Sync policy">
              <Select
                items={availableSyncPolicyOptions}
                value={draft.freshness.strategy}
                onValueChange={(value) => {
                  const option = availableSyncPolicyOptions.find(entry => entry.value === value)
                  if (option)
                    onDraftChange(current => ({ ...current, freshness: { strategy: option.value, staleAfterSeconds: option.staleAfterSeconds } }))
                }}
              >
                <SelectTrigger size="large" aria-label="Sync policy" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {availableSyncPolicyOptions.map(option => (
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
                    onDraftChange(current => ({ ...current, permission: value }))
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
            {isWebsiteCrawl && (
              <div className="rounded-lg border border-divider-subtle bg-background-default-subtle px-3 py-2">
                <div className="system-xs-medium text-text-secondary">Website crawl gate</div>
                <div className="mt-1 system-xs-regular text-text-tertiary">
                  {crawlStatus === 'finished'
                    ? `${checkedCrawlUrls.length}/${crawlResults.length} pages selected`
                    : 'Run crawl and select pages before adding this source.'}
                </div>
              </div>
            )}
          </div>
        </aside>
      </div>
    </div>
  )
}

function WebsiteCrawlSetup({
  provider,
  providerName,
  url,
  onUrlChange,
  options,
  onOptionsChange,
  optionsOpen,
  onOptionsOpenChange,
  status,
  results,
  checkedUrls,
  onCheckedUrlsChange,
  onRun,
}: {
  provider: string
  providerName: string
  url: string
  onUrlChange: (value: string) => void
  options: WebsiteCrawlOptions
  onOptionsChange: (options: WebsiteCrawlOptions) => void
  optionsOpen: boolean
  onOptionsOpenChange: (open: boolean) => void
  status: WebsiteCrawlStatus
  results: WebsiteCrawlResult[]
  checkedUrls: string[]
  onCheckedUrlsChange: (urls: string[]) => void
  onRun: () => void
}) {
  const [preview, setPreview] = useState<WebsiteCrawlResult | null>(null)
  const details = websiteCrawlProviderDetails[provider] ?? websiteCrawlProviderDetails.firecrawl
  const isJinaReader = provider === 'jina-reader'
  const crawlTotal = options.limit === '' ? 0 : Number(options.limit)
  const selectedSet = new Set(checkedUrls)

  const updateOption = <Key extends keyof WebsiteCrawlOptions>(key: Key, value: WebsiteCrawlOptions[Key]) => {
    onOptionsChange({
      ...options,
      [key]: value,
    })
  }

  return (
    <section>
      <WebsiteCrawlHeader
        title={details.title}
        configureLabel={details.configureLabel}
        docTitle={details.docTitle}
        docLink={details.docLink}
        onConfigure={() => toast.info(`${details.configureLabel} opened`)}
      />
      <div className="mt-2 overflow-hidden rounded-xl border border-components-panel-border bg-background-default-subtle">
        <div className="p-4 pb-0">
          <div className="flex items-center justify-between gap-x-2">
            <Input
              value={url}
              onChange={event => onUrlChange(event.target.value)}
              placeholder="https://docs.dify.ai"
              aria-label={`${providerName} root URL`}
              className="h-11 system-md-semibold"
            />
            <Button variant="primary" onClick={onRun} disabled={status === 'running'} className="h-11 min-w-20">
              {status === 'running'
                ? <span className="i-ri-loader-4-line size-4 animate-spin" />
                : 'Run'}
            </Button>
          </div>
          <WebsiteOptionsWrap open={optionsOpen} onOpenChange={onOptionsOpenChange}>
            <WebsiteOptionCheckbox
              label="Crawl sub-pages"
              checked={options.crawl_sub_pages}
              onChange={value => updateOption('crawl_sub_pages', value)}
            />
            {isJinaReader && (
              <WebsiteOptionCheckbox
                label="Use sitemap"
                checked={options.use_sitemap}
                onChange={value => updateOption('use_sitemap', value)}
                tooltip="Follow the sitemap to crawl the site. If not, Jina Reader will crawl iteratively based on page relevance, yielding fewer but higher-quality pages."
              />
            )}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <WebsiteOptionField
                label="Limit"
                required
                value={options.limit}
                isNumber
                onChange={value => updateOption('limit', value === '' ? '' : Number(value))}
              />
              {!isJinaReader && (
                <WebsiteOptionField
                  label="Max depth"
                  value={options.max_depth}
                  isNumber
                  tooltip="Maximum depth to crawl relative to the entered URL. Depth 0 just scrapes the entered URL."
                  onChange={value => updateOption('max_depth', value === '' ? '' : Number(value))}
                />
              )}
            </div>
            {!isJinaReader && (
              <>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <WebsiteOptionField
                    label="Exclude paths"
                    value={options.excludes}
                    placeholder="blog/*, /about/*"
                    onChange={value => updateOption('excludes', String(value))}
                  />
                  <WebsiteOptionField
                    label="Include only paths"
                    value={options.includes}
                    placeholder="articles/*"
                    onChange={value => updateOption('includes', String(value))}
                  />
                </div>
                <WebsiteOptionCheckbox
                  label="Extract only main content (no headers, navs, footers, etc.)"
                  checked={options.only_main_content}
                  onChange={value => updateOption('only_main_content', value)}
                />
              </>
            )}
          </WebsiteOptionsWrap>
        </div>

        {status === 'running' && <WebsiteCrawling crawledNum={1} totalNum={crawlTotal} />}
        {status === 'finished' && (
          <WebsiteCrawledResult
            results={results}
            checkedUrls={checkedUrls}
            selectedSet={selectedSet}
            onCheckedUrlsChange={onCheckedUrlsChange}
            onPreview={setPreview}
          />
        )}
      </div>

      <Dialog open={!!preview} onOpenChange={(open) => {
        if (!open)
          setPreview(null)
      }}
      >
        {preview && (
          <DialogContent className="w-[680px] max-w-[calc(100vw-2rem)]">
            <DialogCloseButton />
            <DialogTitle className="system-md-semibold text-text-secondary">{preview.title}</DialogTitle>
            <div className="mt-2 truncate system-xs-regular text-text-tertiary">{preview.source_url}</div>
            <div className="mt-4 max-h-[420px] overflow-y-auto rounded-xl border border-divider-subtle bg-background-default-subtle p-4 system-sm-regular text-text-secondary">
              {preview.content}
            </div>
          </DialogContent>
        )}
      </Dialog>
    </section>
  )
}

function WebsiteCrawlHeader({
  title,
  configureLabel,
  docTitle,
  docLink,
  onConfigure,
}: {
  title: string
  configureLabel: string
  docTitle: string
  docLink: string
  onConfigure: () => void
}) {
  return (
    <div className="flex items-center gap-x-2">
      <div className="flex min-w-0 grow items-center gap-x-1">
        <div className="truncate system-md-semibold text-text-secondary" title={title}>{title}</div>
        <div className="mx-1 h-3.5 w-px shrink-0 bg-divider-regular" />
        <Button variant="secondary" size="small" className="gap-x-0.5 px-1.5" onClick={onConfigure}>
          <RiEqualizer2Line className="size-4" />
          <span className="system-xs-medium">{configureLabel}</span>
        </Button>
      </div>
      <a
        className="flex shrink-0 items-center gap-x-1 overflow-hidden system-xs-medium text-text-accent"
        href={docLink}
        target="_blank"
        rel="noopener noreferrer"
      >
        <RiBookOpenLine className="size-3.5 shrink-0" />
        <span className="grow truncate" title={docTitle}>{docTitle}</span>
      </a>
    </div>
  )
}

function WebsiteOptionsWrap({
  open,
  onOpenChange,
  children,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  children: React.ReactNode
}) {
  return (
    <div className={cn('mt-4', open ? 'mb-3' : 'mb-0')}>
      <button
        type="button"
        className="flex h-[26px] w-full cursor-pointer items-center gap-x-1 py-1 select-none"
        onClick={() => onOpenChange(!open)}
      >
        <div className="flex grow items-center">
          <RiEqualizer2Line className="mr-1 size-4 text-text-secondary" />
          <span className="text-[13px] leading-4 font-semibold text-text-secondary uppercase">Options</span>
        </div>
        <span className={cn('i-ri-arrow-right-s-line size-4 shrink-0 text-text-tertiary', open && 'rotate-90')} />
      </button>
      {open && (
        <div className="mb-4 space-y-2">
          {children}
        </div>
      )}
    </div>
  )
}

function WebsiteOptionCheckbox({
  label,
  checked,
  onChange,
  tooltip,
}: {
  label: string
  checked: boolean
  onChange: (checked: boolean) => void
  tooltip?: string
}) {
  return (
    <div className="flex min-h-7 items-center">
      <label className="flex min-w-0 cursor-pointer items-center">
        <Checkbox checked={checked} onCheckedChange={value => onChange(value === true)} />
        <span className="ml-2 min-w-0 text-left text-[13px] leading-4 font-medium text-text-secondary">{label}</span>
      </label>
      {tooltip && (
        <span className="ml-1 size-4 text-text-tertiary" title={tooltip}>
          <span className="i-ri-question-line size-4" />
        </span>
      )}
    </div>
  )
}

function WebsiteOptionField({
  label,
  value,
  onChange,
  placeholder = '',
  isNumber = false,
  required = false,
  tooltip,
}: {
  label: string
  value: string | number
  onChange: (value: string | number) => void
  placeholder?: string
  isNumber?: boolean
  required?: boolean
  tooltip?: string
}) {
  return (
    <div>
      <div className="flex py-[7px]">
        <div className="flex h-4 items-center text-[13px] font-semibold text-text-secondary">
          {label}
        </div>
        {required && <span className="ml-0.5 text-xs font-semibold text-text-destructive">*</span>}
        {tooltip && (
          <span className="ml-1 size-4 text-text-tertiary" title={tooltip}>
            <span className="i-ri-question-line size-4" />
          </span>
        )}
      </div>
      <input
        type={isNumber ? 'number' : 'text'}
        min={isNumber ? 0 : undefined}
        value={value}
        onChange={(event) => {
          if (isNumber) {
            const nextValue = event.target.value
            onChange(nextValue === '' ? '' : Math.max(0, Number.parseInt(nextValue, 10)))
            return
          }
          onChange(event.target.value)
        }}
        className="flex h-8 w-full rounded-lg border border-transparent bg-components-input-bg-normal p-2 system-xs-regular text-components-input-text-filled caret-[#295eff] placeholder:text-components-input-text-placeholder hover:border hover:border-components-input-border-hover hover:bg-components-input-bg-hover focus:border focus:border-components-input-border-active focus:bg-components-input-bg-active focus:shadow-xs focus:shadow-shadow-shadow-3 focus-visible:outline-hidden"
        placeholder={placeholder}
      />
    </div>
  )
}

function WebsiteCrawling({ crawledNum, totalNum }: { crawledNum: number; totalNum: number }) {
  return (
    <div className="mt-3 rounded-b-xl">
      <div className="flex h-[34px] items-center border-y-[0.5px] border-divider-regular px-4 text-xs text-text-tertiary shadow-xs shadow-shadow-shadow-3">
        Total pages scraped:
        {' '}
        {crawledNum}
        /
        {totalNum}
      </div>
      <div className="p-2">
        {[0, 1, 2, 3].map(index => (
          <div className="flex items-start gap-3 py-[9px]" key={index}>
            <div className="mt-0.5 size-4 shrink-0 rounded bg-text-quaternary opacity-25" />
            <div className="min-w-0 grow space-y-2">
              <div className="h-2.5 w-2/3 rounded bg-text-quaternary opacity-25" />
              <div className="h-2 w-11/12 rounded bg-text-quaternary opacity-20" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function WebsiteCrawledResult({
  results,
  checkedUrls,
  selectedSet,
  onCheckedUrlsChange,
  onPreview,
}: {
  results: WebsiteCrawlResult[]
  checkedUrls: string[]
  selectedSet: Set<string>
  onCheckedUrlsChange: (urls: string[]) => void
  onPreview: (result: WebsiteCrawlResult) => void
}) {
  const isCheckAll = results.length > 0 && checkedUrls.length === results.length

  return (
    <div className="mt-3 border-t-[0.5px] border-divider-regular shadow-xs shadow-shadow-shadow-3">
      <div className="flex h-[34px] items-center justify-between px-4">
        <WebsiteOptionCheckbox
          label={isCheckAll ? 'Reset All' : 'Select All'}
          checked={isCheckAll}
          onChange={() => onCheckedUrlsChange(isCheckAll ? [] : results.map(result => result.source_url))}
        />
        <div className="text-xs text-text-tertiary">Scraped {results.length} pages in total within 1.4s</div>
      </div>
      <div className="p-2">
        {results.map(result => (
          <WebsiteCrawledResultItem
            key={result.source_url}
            result={result}
            checked={selectedSet.has(result.source_url)}
            onCheckedChange={(checked) => {
              if (checked) {
                onCheckedUrlsChange([...checkedUrls, result.source_url])
                return
              }
              onCheckedUrlsChange(checkedUrls.filter(url => url !== result.source_url))
            }}
            onPreview={() => onPreview(result)}
          />
        ))}
      </div>
    </div>
  )
}

function WebsiteCrawledResultItem({
  result,
  checked,
  onCheckedChange,
  onPreview,
}: {
  result: WebsiteCrawlResult
  checked: boolean
  onCheckedChange: (checked: boolean) => void
  onPreview: () => void
}) {
  return (
    <div className="group rounded-lg p-2 hover:bg-state-base-hover">
      <div className="relative flex">
        <label className="flex min-w-0 grow cursor-pointer">
          <div className="flex h-5 items-center">
            <Checkbox
              className="mr-2 shrink-0"
              checked={checked}
              onCheckedChange={value => onCheckedChange(value === true)}
            />
          </div>
          <div className="flex min-w-0 grow flex-col">
            <div className="truncate text-sm font-medium text-text-secondary" title={result.title}>
              {result.title}
            </div>
            <div className="mt-0.5 truncate text-xs text-text-tertiary" title={result.source_url}>
              {result.source_url}
            </div>
          </div>
        </label>
        <Button
          onClick={onPreview}
          className="top-0 right-0 hidden h-6 px-1.5 text-xs font-medium uppercase group-hover:absolute group-hover:block"
        >
          Preview
        </Button>
      </div>
    </div>
  )
}

function parseWebsiteUrl(value: string) {
  try {
    const url = new URL(value)
    if (url.protocol !== 'http:' && url.protocol !== 'https:')
      return undefined
    return url
  }
  catch {
    return undefined
  }
}

function buildWebsiteCrawlResults(url: URL, limit: number, provider: string): WebsiteCrawlResult[] {
  const base = `${url.protocol}//${url.host}`
  const paths = [
    url.pathname && url.pathname !== '/' ? url.pathname : '/',
    '/docs',
    '/docs/getting-started',
    '/docs/knowledge',
    '/docs/workflow',
    '/docs/api',
    '/docs/changelog',
    '/pricing',
    '/blog/release-notes',
    '/about',
  ]
  return paths.slice(0, Math.min(paths.length, limit)).map((path, index) => {
    const sourceUrl = path === '/' ? base : `${base}${path}`
    const label = path === '/' ? url.hostname : path.split('/').filter(Boolean).map(toTitleCase).join(' / ')
    return {
      title: index === 0 ? url.hostname : label,
      source_url: sourceUrl,
      content: `${providerLabel(provider)} extracted Markdown content for ${sourceUrl}. This preview represents the page body that will enter document processing after the source sync finishes.`,
    }
  })
}

function providerLabel(provider: string) {
  return sourceProviderOptionsByType['website-crawl'].find(option => option.value === provider)?.label ?? provider
}

function toTitleCase(value: string) {
  return value.replace(/[-_]/g, ' ').replace(/\b\w/g, letter => letter.toUpperCase())
}

function buildWebsiteConfigSummary({
  providerName,
  provider,
  url,
  options,
  results,
  checkedUrls,
}: {
  providerName: string
  provider: string
  url: string
  options: WebsiteCrawlOptions
  results: WebsiteCrawlResult[]
  checkedUrls: string[]
}) {
  const isJinaReader = provider === 'jina-reader'
  const summary = [
    { label: 'Provider', value: providerName },
    { label: 'Selected pages', value: `${checkedUrls.length}/${results.length}` },
    { label: 'Crawl sub-pages', value: options.crawl_sub_pages ? 'Yes' : 'No' },
    isJinaReader ? { label: 'Use sitemap', value: options.use_sitemap ? 'Yes' : 'No' } : null,
    { label: 'Limit', value: String(options.limit) },
    !isJinaReader ? { label: 'Max depth', value: options.max_depth === '' ? 'Default' : String(options.max_depth) } : null,
    !isJinaReader ? { label: 'Exclude paths', value: options.excludes || 'None' } : null,
    !isJinaReader ? { label: 'Include only paths', value: options.includes || 'All paths' } : null,
    !isJinaReader ? { label: 'Main content only', value: options.only_main_content ? 'Yes' : 'No' } : null,
    { label: 'Root URL', value: url },
  ]
  return summary.filter((detail): detail is { label: string; value: string } => !!detail && detail.value !== '')
}

function InstallDataSourceCard({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex min-h-[96px] items-start gap-2 rounded-xl border border-dashed border-components-option-card-option-border bg-components-option-card-option-bg p-3 text-left hover:bg-components-option-card-bg-hover"
    >
      <div className="flex size-8 shrink-0 items-center justify-center rounded-lg border border-components-panel-border bg-background-default-dodge">
        <RiStoreLine className="size-4 text-text-tertiary" />
      </div>
      <div className="min-w-0">
        <div className="system-sm-medium text-text-secondary">Install more data sources</div>
        <div className="mt-0.5 system-xs-regular text-text-tertiary">Add providers from Marketplace before connecting them here.</div>
      </div>
    </button>
  )
}

function SourceSetupCard({
  label,
  description,
  selected,
  icon: Icon,
  onClick,
  onAfterClick,
}: {
  label: string
  description: string
  selected: boolean
  icon: React.ComponentType<{ className?: string }>
  onClick: () => void
  onAfterClick?: () => void
}) {
  return (
    <button
      type="button"
      onClick={() => {
        onClick()
        onAfterClick?.()
      }}
      className={cn(
        'relative flex min-h-[96px] items-start gap-2 rounded-xl border p-3 text-left',
        selected
          ? 'border-components-option-card-option-selected-border bg-components-option-card-option-selected-bg ring-[0.5px] ring-components-option-card-option-selected-border'
          : 'border-components-option-card-option-border bg-components-option-card-option-bg hover:bg-components-option-card-bg-hover',
      )}
    >
      <div className="flex size-8 shrink-0 items-center justify-center rounded-lg border border-components-panel-border bg-background-default-dodge">
        <Icon className="size-4 text-text-tertiary" />
      </div>
      <div className="min-w-0 pr-5">
        <div className="system-sm-medium text-text-secondary">{label}</div>
        <div className="mt-0.5 system-xs-regular text-text-tertiary">{description}</div>
      </div>
      {selected && (
        <div className="absolute top-3 right-3 flex size-4 items-center justify-center rounded-full bg-components-button-primary-bg">
          <RiCheckLine className="size-3 text-text-primary-on-surface" />
        </div>
      )}
    </button>
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
