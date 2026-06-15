import { Button } from '@langgenius/dify-ui/button'
import { Checkbox } from '@langgenius/dify-ui/checkbox'
import { cn } from '@langgenius/dify-ui/cn'
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
import { Textarea } from '@langgenius/dify-ui/textarea'
import {
  RiAddLine,
  RiArrowLeftLine,
  RiArrowDownSLine,
  RiBarChartFill,
  RiBarChartLine,
  RiBookOpenLine,
  RiCheckLine,
  RiCloseCircleFill,
  RiDashboardFill,
  RiDashboardLine,
  RiEqualizer2Fill,
  RiEqualizer2Line,
  RiFileTextFill,
  RiFileTextLine,
  RiFocus2Fill,
  RiFocus2Line,
  RiFunctionAddLine,
  RiLinksFill,
  RiLinksLine,
  RiRobot2Fill,
  RiSearchLine,
  RiStoreLine,
  RiUploadCloud2Line,
} from '@remixicon/react'
import { useMemo, useState } from 'react'
import { StatusBadge } from './knowledge-2-badges'
import {
  datasetPermissionLabels,
  formatSourceFreshness,
  itemHasSourceError,
  knowledge2Items,
  sourceTypeLabels,
  type DatasetPermission,
  type KnowledgeDocumentRow,
  type Knowledge2Item,
  type KnowledgeDetailTab,
  type KnowledgeSourceRow,
  type KnowledgeSourceType,
  type SourceFreshness,
} from './knowledge-2-data'
import { KnowledgeDocumentsView } from './KnowledgeDocumentsView'
import { KnowledgeEvidenceView } from './KnowledgeEvidenceView'
import { KnowledgeOverviewView } from './KnowledgeOverviewView'
import { KnowledgePipelineView } from './KnowledgePipelineView'
import { KnowledgeQualityView } from './KnowledgeQualityView'
import { KnowledgeSettingsView } from './KnowledgeSettingsView'
import {
  defaultSourceFreshness,
  endpointLabels,
  KnowledgeSourcesView,
  permissionOptions,
  sourceProviderOptionsByType,
  sourceSyncPolicyOptions,
} from './KnowledgeSourcesView'

type NavItem = {
  id: KnowledgeDetailTab
  label: string
  icon: React.ComponentType<{ className?: string }>
  activeIcon: React.ComponentType<{ className?: string }>
  hidden?: (item: Knowledge2Item) => boolean
}

type KnowledgeCreateMode = 'standard' | 'pipeline' | 'external'

type KnowledgeStarterSource = Extract<KnowledgeSourceType, 'website-crawl' | 'online-documents' | 'online-drive'>

type KnowledgeCreateInitialPath = 'empty' | 'source' | 'documents'

type FirstSourceDraft = {
  type: KnowledgeStarterSource
  provider: string
  name: string
  endpoint: string
  freshness: SourceFreshness
  permission: DatasetPermission
  website: {
    crawlSubPages: boolean
    useSitemap: boolean
    limit: number
    maxDepth: number
    include: string
    exclude: string
    onlyMainContent: boolean
  }
}

const detailNavItems: NavItem[] = [
  { id: 'overview', label: 'Overview', icon: RiDashboardLine, activeIcon: RiDashboardFill },
  { id: 'sources', label: 'Sources', icon: RiLinksLine, activeIcon: RiLinksFill, hidden: item => item.provider === 'external' },
  {
    id: 'documents',
    label: 'Documents',
    icon: RiFileTextLine,
    activeIcon: RiFileTextFill,
    hidden: item => item.provider === 'external',
  },
  { id: 'evidence', label: 'Evidence', icon: RiFocus2Line, activeIcon: RiFocus2Fill },
  { id: 'quality', label: 'Quality', icon: RiBarChartLine, activeIcon: RiBarChartFill },
  { id: 'settings', label: 'Settings', icon: RiEqualizer2Line, activeIcon: RiEqualizer2Fill },
  {
    id: 'pipeline',
    label: 'Pipeline',
    icon: RiFunctionAddLine,
    activeIcon: RiFunctionAddLine,
    hidden: item => item.runtimeMode !== 'rag_pipeline',
  },
]

const pageMeta: Record<KnowledgeDetailTab, { title: string; description: string }> = {
  overview: {
    title: 'Overview',
    description: 'Check whether this Knowledge can safely supply Apps and Workflows.',
  },
  sources: {
    title: 'Sources',
    description: 'See where knowledge comes from, whether it is fresh, and whether sync succeeded.',
  },
  documents: {
    title: 'Documents',
    description: 'Review document assets, parser status, index inclusion, and evidence use.',
  },
  evidence: {
    title: 'Evidence',
    description: 'Test whether retrieved evidence is enough to support an answer.',
  },
  quality: {
    title: 'Quality',
    description: 'Track answer traces, bad cases, and golden questions over time.',
  },
  settings: {
    title: 'Knowledge settings',
    description: 'Manage basic info, API access, default retrieval, processing policy, retention, and admin health summaries.',
  },
  pipeline: {
    title: 'Pipeline',
    description: 'Maintain the generation pipeline for this Knowledge.',
  },
}

export function Knowledge2Section({
  screen,
  items,
  onOpenDetail,
  onOpenCreate,
  onUpdateKnowledge,
  onCreateKnowledge,
}: {
  screen: 'list' | string
  items: Knowledge2Item[]
  onOpenDetail: (id: string) => void
  onOpenCreate: (mode: KnowledgeCreateMode) => void
  onUpdateKnowledge: (id: string, updater: (item: Knowledge2Item) => Knowledge2Item) => void
  onCreateKnowledge: (item: Knowledge2Item) => void
}) {
  if (screen === 'list')
    return <KnowledgeListPage items={items} onOpenDetail={onOpenDetail} onOpenCreate={onOpenCreate} />

  if (screen.startsWith('create:')) {
    const mode = screen.replace('create:', '') as KnowledgeCreateMode
    return <KnowledgeCreatePage mode={mode} onBack={() => onOpenDetail('list')} onCreate={onCreateKnowledge} />
  }

  const item = items.find(entry => entry.id === screen)
  if (!item)
    return <KnowledgeListPage items={items} onOpenDetail={onOpenDetail} onOpenCreate={onOpenCreate} />

  return <KnowledgeDetailPage key={item.id} item={item} onUpdateKnowledge={onUpdateKnowledge} />
}

export function KnowledgeTopNav({
  active,
  screen,
  items,
  onActivate,
  onGoToList,
  onSelectKnowledge,
  onOpenCreate,
}: {
  active: boolean
  screen: 'list' | string
  items: Knowledge2Item[]
  onActivate: () => void
  onGoToList: () => void
  onSelectKnowledge: (id: string) => void
  onOpenCreate: (mode: KnowledgeCreateMode) => void
}) {
  const [hovered, setHovered] = useState(false)
  const curNav = useMemo(() => {
    if (screen === 'list')
      return undefined
    return items.find(entry => entry.id === screen)
  }, [items, screen])

  return (
    <div className={cn(
      'flex h-8 max-w-167.5 shrink-0 items-center rounded-xl px-0.5 text-sm font-medium max-[1024px]:max-w-100',
      active && 'bg-components-main-nav-nav-button-bg-active font-semibold shadow-md',
      !curNav && !active && 'hover:bg-components-main-nav-nav-button-bg-hover',
    )}
    >
      <button
        type="button"
        aria-current={active ? 'page' : undefined}
        onClick={() => {
          onActivate()
          onGoToList()
        }}
        className={cn(
          'flex h-7 cursor-pointer items-center rounded-[10px] px-2.5',
          active ? 'text-components-main-nav-nav-button-text-active' : 'text-components-main-nav-nav-button-text',
          curNav && active && 'hover:bg-components-main-nav-nav-button-bg-active-hover',
        )}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        {hovered && curNav
          ? <span className="i-custom-vender-line-arrows-arrow-narrow-left size-4" />
          : active
            ? <span className="i-ri-book-2-fill size-4" />
            : <span className="i-ri-book-2-line size-4" />}
        <span className="ml-2 max-[1024px]:hidden">Knowledge</span>
      </button>
      {curNav && active && (
        <>
          <div className="font-light text-divider-deep">/</div>
          <KnowledgeNavSelector curNav={curNav} items={items} onSelect={onSelectKnowledge} onOpenCreate={onOpenCreate} />
        </>
      )}
    </div>
  )
}

function KnowledgeNavSelector({
  curNav,
  items,
  onSelect,
  onOpenCreate,
}: {
  curNav: Knowledge2Item
  items: Knowledge2Item[]
  onSelect: (id: string) => void
  onOpenCreate: (mode: KnowledgeCreateMode) => void
}) {
  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger
        className={cn(
          'group inline-flex h-7 items-center justify-center rounded-[10px] pr-2.5 pl-2 text-[14px] font-semibold text-components-main-nav-nav-button-text-active outline-hidden',
          'hover:bg-components-main-nav-nav-button-bg-active-hover focus-visible:bg-components-main-nav-nav-button-bg-active focus-visible:ring-1 focus-visible:ring-components-input-border-hover data-popup-open:bg-components-main-nav-nav-button-bg-active',
        )}
      >
        <div className="max-w-[157px] truncate" title={curNav.name}>{curNav.name}</div>
        <RiArrowDownSLine
          className="ml-1 size-3 shrink-0 opacity-50 group-hover:opacity-100 group-data-popup-open:opacity-100"
          aria-hidden="true"
        />
      </DropdownMenuTrigger>
      <DropdownMenuContent
        placement="bottom-end"
        sideOffset={6}
        popupClassName="w-60 max-w-80 divide-y divide-divider-regular bg-components-panel-bg-blur p-0"
      >
        <div className="max-h-[50vh] overflow-auto px-1 py-1">
          {items.map(item => (
            <DropdownMenuItem
              key={item.id}
              className="h-auto truncate px-3 py-[6px] text-[14px] font-normal text-text-secondary"
              onClick={() => {
                if (curNav.id === item.id)
                  return
                onSelect(item.id)
              }}
              title={item.name}
            >
              <KnowledgeNavIcon item={item} />
              <div className="min-w-0 truncate">{item.name}</div>
            </DropdownMenuItem>
          ))}
        </div>
        <div className="p-1">
          <DropdownMenuItem className="h-9 gap-2 px-3 py-[6px]" onClick={() => onOpenCreate('standard')}>
            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md border-[0.5px] border-divider-regular bg-background-default">
              <RiAddLine className="size-4 text-text-primary" />
            </div>
            <div className="grow text-left text-[14px] font-normal text-text-secondary">Create Knowledge</div>
          </DropdownMenuItem>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

function KnowledgeNavIcon({ item }: { item: Knowledge2Item }) {
  return (
    <span
      className="relative mr-2 flex size-6 shrink-0 items-center justify-center rounded-md border-[0.5px] border-divider-regular text-sm leading-none"
      style={{ background: item.iconBackground }}
    >
      {item.icon}
    </span>
  )
}

function KnowledgeListPage({
  items,
  onOpenDetail,
  onOpenCreate,
}: {
  items: Knowledge2Item[]
  onOpenDetail: (id: string) => void
  onOpenCreate: (mode: KnowledgeCreateMode) => void
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
        <NewKnowledgeCard onOpenCreate={onOpenCreate} />
        {filteredItems.map(item => (
          <KnowledgeListCard key={item.id} item={item} onOpen={() => onOpenDetail(item.id)} />
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

function KnowledgeCreatePage({
  mode,
  onBack,
  onCreate,
}: {
  mode: KnowledgeCreateMode
  onBack: () => void
  onCreate: (item: Knowledge2Item) => void
}) {
  const [initialPath, setInitialPath] = useState<KnowledgeCreateInitialPath>('empty')
  const [sourceDraft, setSourceDraft] = useState<FirstSourceDraft>(() => createDefaultFirstSourceDraft('website-crawl'))
  const [documentName, setDocumentName] = useState('')
  const [documentDrafts, setDocumentDrafts] = useState<string[]>([])
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [permission, setPermission] = useState('Workspace')
  const normalizedPath = mode === 'external' ? 'empty' : initialPath
  const syncPolicyOptions = sourceSyncPolicyOptions(sourceDraft.type)
  const selectedProvider = sourceProviderOptionsByType[sourceDraft.type].find(option => option.value === sourceDraft.provider)
  const stagedDocumentNames = buildStagedDocumentNames(documentDrafts, documentName)
  const sourceReady = !!sourceDraft.name.trim() && (sourceDraft.type !== 'website-crawl' || !!sourceDraft.endpoint.trim())
  const documentsReady = stagedDocumentNames.length > 0
  const canCreate = !!name.trim()
    && (normalizedPath !== 'source' || sourceReady)
    && (normalizedPath !== 'documents' || documentsReady)
  const primaryLabel = createPrimaryButtonLabels[mode === 'external' ? 'external' : normalizedPath]

  const handleCreate = () => {
    if (!canCreate)
      return
    onCreate(buildCreatedKnowledge({
      mode,
      initialPath: normalizedPath,
      sourceDraft,
      documentNames: stagedDocumentNames,
      name,
      description,
      permission,
    }))
  }

  const handleSetInitialPath = (nextPath: KnowledgeCreateInitialPath) => {
    setInitialPath(nextPath)
  }

  const handleSetSourceType = (sourceType: KnowledgeStarterSource) => {
    setSourceDraft(createDefaultFirstSourceDraft(sourceType))
  }

  const handleAddDocumentDraft = () => {
    const nextName = documentName.trim()
    if (!nextName)
      return
    setDocumentDrafts(current => current.includes(nextName) ? current : [...current, nextName])
    setDocumentName('')
  }

  return (
    <main className="relative flex h-0 shrink-0 grow flex-col overflow-y-auto bg-background-body">
      <div className="sticky top-0 z-10 flex items-center justify-between gap-3 bg-background-body px-12 pt-4 pb-3">
        <div className="flex min-w-0 items-center gap-3">
          <Button variant="ghost" onClick={onBack}>
            <RiArrowLeftLine className="size-4" />
            Knowledge
          </Button>
          <div className="h-5 w-px bg-divider-regular" />
          <div className="min-w-0">
            <div className="system-md-semibold text-text-secondary">Create Knowledge</div>
            <div className="system-xs-regular text-text-tertiary">Choose how this dataset receives data and retrieval behavior.</div>
          </div>
        </div>
        <Button variant="primary" onClick={handleCreate} disabled={!canCreate}>
          {primaryLabel}
        </Button>
      </div>

      <div className="grid gap-5 px-12 py-3 xl:grid-cols-[minmax(0,1fr)_360px]">
        <section className="space-y-6">
          {mode !== 'external'
            ? (
                <>
                  <section className="rounded-xl border border-components-panel-border bg-components-panel-bg p-4 shadow-xs">
                    <div className="system-sm-semibold text-text-secondary">Start with</div>
                    <div className="mt-3 grid grid-cols-1 gap-2 md:grid-cols-3">
                      <KnowledgeCreatePathCard
                        path="empty"
                        selected={initialPath === 'empty'}
                        iconClassName="i-ri-folder-line"
                        title="Empty Knowledge"
                        description="Create the dataset shell first. Add Sources or Documents later."
                        onSelect={handleSetInitialPath}
                      />
                      <KnowledgeCreatePathCard
                        path="source"
                        selected={initialPath === 'source'}
                        iconClassName="i-ri-links-line"
                        title="First Source"
                        description="Create one synced Source connection as the first data input."
                        onSelect={handleSetInitialPath}
                      />
                      <KnowledgeCreatePathCard
                        path="documents"
                        selected={initialPath === 'documents'}
                        iconClassName="i-ri-upload-cloud-2-line"
                        title="Uploaded Documents"
                        description="Upload files into Documents without creating a Source."
                        onSelect={handleSetInitialPath}
                      />
                    </div>
                  </section>

                  {initialPath === 'source' && (
                    <section className="space-y-6 rounded-xl border border-components-panel-border bg-components-panel-bg p-4 shadow-xs">
                      <div>
                        <div className="system-sm-semibold text-text-secondary">Source type</div>
                        <div className="mt-3 grid grid-cols-1 gap-2 md:grid-cols-3">
                          <KnowledgeCreateSourceTypeCard
                            sourceType="website-crawl"
                            selected={sourceDraft.type === 'website-crawl'}
                            iconClassName="i-ri-global-line"
                            title="Website crawl"
                            description="Crawl a website or sitemap on a schedule."
                            onSelect={handleSetSourceType}
                          />
                          <KnowledgeCreateSourceTypeCard
                            sourceType="online-documents"
                            selected={sourceDraft.type === 'online-documents'}
                            iconClassName="i-ri-file-text-line"
                            title="Online documents"
                            description="Sync pages from Notion, Google Docs, or Confluence."
                            onSelect={handleSetSourceType}
                          />
                          <KnowledgeCreateSourceTypeCard
                            sourceType="online-drive"
                            selected={sourceDraft.type === 'online-drive'}
                            iconClassName="i-ri-drive-line"
                            title="Online drive"
                            description="Sync files from Drive, OneDrive, or object storage."
                            onSelect={handleSetSourceType}
                          />
                        </div>
                      </div>

                      <div>
                        <div className="mb-2 flex items-center justify-between gap-2">
                          <div className="system-sm-semibold text-text-secondary">{sourceTypeLabels[sourceDraft.type]} provider</div>
                          <button
                            type="button"
                            className="inline-flex h-7 items-center gap-1 rounded-lg px-2 system-xs-medium text-text-accent hover:bg-state-accent-hover"
                          >
                            <RiStoreLine className="size-3.5" />
                            Install data-source
                          </button>
                        </div>
                        <div className="grid grid-cols-1 gap-2 md:grid-cols-4">
                          {sourceProviderOptionsByType[sourceDraft.type].map((option) => {
                            const Icon = option.icon
                            return (
                              <KnowledgeCreateProviderCard
                                key={option.value}
                                selected={sourceDraft.provider === option.value}
                                label={option.label}
                                description={option.description}
                                icon={Icon}
                                onClick={() => setSourceDraft(current => ({ ...current, provider: option.value }))}
                              />
                            )
                          })}
                          <button
                            type="button"
                            className="flex min-h-[88px] items-start gap-3 rounded-xl border border-dashed border-divider-regular bg-background-default-subtle p-3 text-left hover:bg-state-base-hover"
                          >
                            <div className="flex size-8 shrink-0 items-center justify-center rounded-lg border border-components-panel-border bg-background-default-dodge">
                              <RiStoreLine className="size-4 text-text-tertiary" />
                            </div>
                            <div className="min-w-0">
                              <div className="system-sm-medium text-text-secondary">More providers</div>
                              <div className="mt-0.5 system-xs-regular text-text-tertiary">Install additional data-source providers.</div>
                            </div>
                          </button>
                        </div>
                      </div>

                      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
                        <div className="space-y-4">
                          <div className="grid gap-3 md:grid-cols-2">
                            <Field label="Source name">
                              <Input
                                value={sourceDraft.name}
                                onChange={event => setSourceDraft(current => ({ ...current, name: event.target.value }))}
                                placeholder={sourceNamePlaceholderByType[sourceDraft.type]}
                              />
                            </Field>
                            <Field label={endpointLabels[sourceDraft.type].label}>
                              <Input
                                value={sourceDraft.endpoint}
                                onChange={event => setSourceDraft(current => ({ ...current, endpoint: event.target.value }))}
                                placeholder={endpointLabels[sourceDraft.type].placeholder}
                              />
                            </Field>
                          </div>

                          {sourceDraft.type === 'website-crawl' && (
                            <WebsiteCrawlInlineOptions draft={sourceDraft} onDraftChange={setSourceDraft} />
                          )}
                        </div>

                        <div className="rounded-xl border border-divider-subtle bg-background-default-subtle p-3">
                          <div className="system-sm-semibold text-text-secondary">Source settings</div>
                          <div className="mt-3 space-y-3">
                            <Field label="Sync policy">
                              <Select
                                items={syncPolicyOptions}
                                value={sourceDraft.freshness.strategy}
                                onValueChange={(value) => {
                                  const option = syncPolicyOptions.find(entry => entry.value === value)
                                  if (option)
                                    setSourceDraft(current => ({ ...current, freshness: { strategy: option.value, staleAfterSeconds: option.staleAfterSeconds } }))
                                }}
                              >
                                <SelectTrigger size="large" aria-label="Sync policy" className="w-full">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {syncPolicyOptions.map(option => (
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
                                value={sourceDraft.permission}
                                onValueChange={(value) => {
                                  if (value !== null)
                                    setSourceDraft(current => ({ ...current, permission: value }))
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
                            <div className="rounded-lg border border-divider-subtle bg-background-default px-3 py-2">
                              <div className="system-xs-medium text-text-secondary">Will create Source</div>
                              <div className="mt-0.5 system-xs-regular text-text-tertiary">
                                {selectedProvider?.label ?? 'Provider'} · {formatSourceFreshness(sourceDraft.freshness)}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </section>
                  )}

                  {initialPath === 'documents' && (
                    <section className="rounded-xl border border-components-panel-border bg-components-panel-bg p-4 shadow-xs">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <div className="system-sm-semibold text-text-secondary">Upload initial Documents</div>
                          <div className="mt-0.5 system-xs-regular text-text-tertiary">These files become Documents. They do not create a Source.</div>
                        </div>
                        <Button variant="secondary" size="small" onClick={() => setDocumentName('support-handbook.pdf')}>
                          <RiUploadCloud2Line className="size-4" />
                          Choose file
                        </Button>
                      </div>
                      <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,1fr)_280px]">
                        <div className="space-y-3">
                          <div className="rounded-xl border border-dashed border-divider-regular bg-background-default-subtle p-4">
                            <div className="flex items-start gap-3">
                              <div className="flex size-10 shrink-0 items-center justify-center rounded-lg border border-components-panel-border bg-background-default-dodge">
                                <RiUploadCloud2Line className="size-5 text-text-tertiary" />
                              </div>
                              <div className="min-w-0 grow">
                                <div className="system-sm-medium text-text-secondary">Manual upload</div>
                                <div className="mt-0.5 system-xs-regular text-text-tertiary">Stage files here, then create the Knowledge and process them in Documents.</div>
                                <div className="mt-3 flex gap-2">
                                  <Input
                                    value={documentName}
                                    onChange={event => setDocumentName(event.target.value)}
                                    placeholder="e.g. refund-policy.pdf"
                                    aria-label="Document file name"
                                  />
                                  <Button variant="secondary" onClick={handleAddDocumentDraft} disabled={!documentName.trim()}>
                                    Add
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="overflow-hidden rounded-xl border border-divider-subtle bg-background-default">
                            {stagedDocumentNames.length
                              ? stagedDocumentNames.map((fileName, index) => (
                                  <div key={fileName} className="flex items-center justify-between gap-3 border-b border-divider-subtle px-3 py-2 last:border-b-0">
                                    <div className="flex min-w-0 items-center gap-2">
                                      <span className="i-ri-file-text-line size-4 shrink-0 text-text-tertiary" />
                                      <span className="truncate system-sm-medium text-text-secondary">{fileName}</span>
                                    </div>
                                    <button
                                      type="button"
                                      className="system-xs-medium text-text-tertiary hover:text-text-secondary"
                                      onClick={() => setDocumentDrafts(current => current.filter((_, draftIndex) => draftIndex !== index))}
                                    >
                                      Remove
                                    </button>
                                  </div>
                                ))
                              : (
                                  <div className="px-3 py-6 text-center system-sm-regular text-text-tertiary">
                                    No documents staged.
                                  </div>
                                )}
                          </div>
                        </div>
                        <div className="rounded-xl border border-divider-subtle bg-background-default-subtle p-3">
                          <div className="system-sm-semibold text-text-secondary">Document processing</div>
                          <div className="mt-3 space-y-2">
                            <CreateSummaryRow label="Origin" value="Manual upload" />
                            <CreateSummaryRow label="Parser" value={mode === 'pipeline' ? 'Pipeline-managed' : 'General document parser'} />
                            <CreateSummaryRow label="Index" value="Queued after creation" />
                            <CreateSummaryRow label="Evidence" value="Pending indexing" />
                          </div>
                        </div>
                      </div>
                    </section>
                  )}
                </>
              )
            : (
                <div className="rounded-xl border border-components-panel-border bg-components-panel-bg p-4 shadow-xs">
                  <div className="system-sm-semibold text-text-secondary">External retrieval</div>
                  <div className="mt-3 rounded-xl border border-divider-subtle bg-background-default-subtle p-3">
                    <div className="system-sm-medium text-text-secondary">External Knowledge API</div>
                    <div className="mt-0.5 system-xs-regular text-text-tertiary">Configure endpoint and Knowledge ID after creation.</div>
                  </div>
                </div>
              )}
        </section>

        <aside className="h-fit rounded-xl border border-components-panel-border bg-components-panel-bg p-4 shadow-xs">
          <div className="system-sm-semibold text-text-secondary">Basic info</div>
          <div className="mt-4 space-y-3">
            <Field label="Knowledge name">
              <Input
                value={name}
                onChange={event => setName(event.target.value)}
                placeholder="e.g. Customer Support Handbook"
              />
            </Field>
            <Field label="Description">
              <Textarea
                value={description}
                onValueChange={setDescription}
                placeholder="What this Knowledge is used for"
                className="min-h-20 resize-none"
                aria-label="Description"
              />
            </Field>
            <Field label="Permission">
              <Input
                value={permission}
                onChange={event => setPermission(event.target.value)}
                placeholder="Workspace"
              />
            </Field>
          </div>
          <div className="mt-4 rounded-lg border border-divider-subtle bg-background-default-subtle px-3 py-2">
            <div className="system-xs-medium text-text-secondary">{createModeSummary[mode].title}</div>
            <div className="mt-0.5 system-xs-regular text-text-tertiary">
              {mode === 'external'
                ? createModeSummary[mode].description
                : createInitialPathSummary[normalizedPath]}
            </div>
            {normalizedPath === 'source' && (
              <div className="mt-3 space-y-1.5 border-t border-divider-subtle pt-2">
                <CreateSummaryRow label="Type" value={sourceTypeLabels[sourceDraft.type]} />
                <CreateSummaryRow label="Provider" value={selectedProvider?.label ?? 'Not selected'} />
                <CreateSummaryRow label="Source" value={sourceDraft.name.trim() || 'Missing source name'} />
                <CreateSummaryRow label="Endpoint" value={sourceDraft.endpoint.trim() || 'Missing endpoint'} />
              </div>
            )}
            {normalizedPath === 'documents' && (
              <div className="mt-3 space-y-1.5 border-t border-divider-subtle pt-2">
                <CreateSummaryRow label="Documents" value={`${stagedDocumentNames.length} staged`} />
                <CreateSummaryRow label="Source" value="None created" />
              </div>
            )}
          </div>
        </aside>
      </div>
    </main>
  )
}

const createPrimaryButtonLabels: Record<KnowledgeCreateInitialPath | 'external', string> = {
  empty: 'Create empty Knowledge',
  source: 'Create Knowledge and add source',
  documents: 'Create Knowledge and upload documents',
  external: 'Create external Knowledge',
}

const createModeSummary: Record<KnowledgeCreateMode, { title: string; description: string }> = {
  standard: {
    title: 'Sources and documents stay separated',
    description: 'After creation, add synced Sources first, then review parsed files in Documents.',
  },
  pipeline: {
    title: 'Pipeline starts unpublished',
    description: 'The new Knowledge opens with Pipeline available and waits for a publish step.',
  },
  external: {
    title: 'External API owns retrieval',
    description: 'Sources and Documents are hidden because documents remain provider-managed.',
  },
}

const createInitialPathSummary: Record<KnowledgeCreateInitialPath, string> = {
  empty: 'Create only the Knowledge shell. Add Sources or Documents after creation.',
  source: 'Create the Knowledge and register the first synced Source.',
  documents: 'Create the Knowledge and upload initial Documents without creating a Source.',
}

const sourceNamePlaceholderByType: Record<KnowledgeStarterSource, string> = {
  'website-crawl': 'e.g. Product docs crawl',
  'online-documents': 'e.g. Support SOP workspace',
  'online-drive': 'e.g. Help center drive folder',
}

function KnowledgeCreatePathCard({
  path,
  selected,
  iconClassName,
  title,
  description,
  onSelect,
}: {
  path: KnowledgeCreateInitialPath
  selected: boolean
  iconClassName: string
  title: string
  description: string
  onSelect: (path: KnowledgeCreateInitialPath) => void
}) {
  return (
    <button
      type="button"
      onClick={() => onSelect(path)}
      className={cn(
        'relative flex min-h-[88px] items-start gap-3 rounded-xl border p-3 text-left',
        selected
          ? 'border-components-option-card-option-selected-border bg-components-option-card-option-selected-bg ring-[0.5px] ring-components-option-card-option-selected-border'
          : 'border-divider-subtle bg-background-default-subtle hover:bg-state-base-hover',
      )}
    >
      <div className="flex size-8 shrink-0 items-center justify-center rounded-lg border border-components-panel-border bg-background-default-dodge">
        <span className={cn('size-4 text-text-tertiary', iconClassName)} />
      </div>
      <div className="min-w-0 pr-5">
        <div className="system-sm-medium text-text-secondary">{title}</div>
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

function KnowledgeCreateSourceTypeCard({
  sourceType,
  selected,
  iconClassName,
  title,
  description,
  onSelect,
}: {
  sourceType: KnowledgeStarterSource
  selected: boolean
  iconClassName: string
  title: string
  description: string
  onSelect: (sourceType: KnowledgeStarterSource) => void
}) {
  return (
    <KnowledgeCreatePathCard
      path="source"
      selected={selected}
      iconClassName={iconClassName}
      title={title}
      description={description}
      onSelect={() => onSelect(sourceType)}
    />
  )
}

function KnowledgeCreateProviderCard({
  selected,
  label,
  description,
  icon: Icon,
  onClick,
}: {
  selected: boolean
  label: string
  description: string
  icon: React.ComponentType<{ className?: string }>
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'relative flex min-h-[88px] items-start gap-3 rounded-xl border p-3 text-left',
        selected
          ? 'border-components-option-card-option-selected-border bg-components-option-card-option-selected-bg ring-[0.5px] ring-components-option-card-option-selected-border'
          : 'border-divider-subtle bg-background-default-subtle hover:bg-state-base-hover',
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

function WebsiteCrawlInlineOptions({
  draft,
  onDraftChange,
}: {
  draft: FirstSourceDraft
  onDraftChange: React.Dispatch<React.SetStateAction<FirstSourceDraft>>
}) {
  const updateWebsiteOption = <K extends keyof FirstSourceDraft['website']>(key: K, value: FirstSourceDraft['website'][K]) => {
    onDraftChange(current => ({ ...current, website: { ...current.website, [key]: value } }))
  }

  return (
    <div className="rounded-xl border border-divider-subtle bg-background-default-subtle p-3">
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="system-sm-semibold text-text-secondary">Crawl options</div>
          <div className="mt-0.5 system-xs-regular text-text-tertiary">Expose the important web crawl controls before the first sync.</div>
        </div>
        <div className="system-xs-medium text-text-tertiary">{draft.provider}</div>
      </div>
      <div className="mt-3 grid gap-3 md:grid-cols-2">
        <label className="flex items-start gap-2 rounded-lg border border-divider-subtle bg-background-default px-3 py-2">
          <Checkbox checked={draft.website.crawlSubPages} onCheckedChange={value => updateWebsiteOption('crawlSubPages', !!value)} />
          <span>
            <span className="block system-xs-medium text-text-secondary">Crawl sub-pages</span>
            <span className="block system-xs-regular text-text-tertiary">Discover linked pages from the root URL.</span>
          </span>
        </label>
        <label className="flex items-start gap-2 rounded-lg border border-divider-subtle bg-background-default px-3 py-2">
          <Checkbox checked={draft.website.useSitemap} onCheckedChange={value => updateWebsiteOption('useSitemap', !!value)} />
          <span>
            <span className="block system-xs-medium text-text-secondary">Use sitemap</span>
            <span className="block system-xs-regular text-text-tertiary">Prefer sitemap URLs when the provider supports it.</span>
          </span>
        </label>
        <Field label="Page limit">
          <Input
            type="number"
            min={1}
            value={draft.website.limit}
            onChange={event => updateWebsiteOption('limit', Number(event.target.value) || 1)}
          />
        </Field>
        <Field label="Max depth">
          <Input
            type="number"
            min={0}
            value={draft.website.maxDepth}
            onChange={event => updateWebsiteOption('maxDepth', Number(event.target.value) || 0)}
          />
        </Field>
        <Field label="Include paths">
          <Input
            value={draft.website.include}
            onChange={event => updateWebsiteOption('include', event.target.value)}
            placeholder="/docs/*, /help/*"
          />
        </Field>
        <Field label="Exclude paths">
          <Input
            value={draft.website.exclude}
            onChange={event => updateWebsiteOption('exclude', event.target.value)}
            placeholder="/blog/*, /changelog/*"
          />
        </Field>
        <label className="flex items-start gap-2 rounded-lg border border-divider-subtle bg-background-default px-3 py-2 md:col-span-2">
          <Checkbox checked={draft.website.onlyMainContent} onCheckedChange={value => updateWebsiteOption('onlyMainContent', !!value)} />
          <span>
            <span className="block system-xs-medium text-text-secondary">Only main content</span>
            <span className="block system-xs-regular text-text-tertiary">Remove navigation, footer, and duplicated chrome before indexing.</span>
          </span>
        </label>
      </div>
    </div>
  )
}

function CreateSummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 system-xs-regular">
      <span className="shrink-0 text-text-tertiary">{label}</span>
      <span className="min-w-0 truncate text-right text-text-secondary">{value}</span>
    </div>
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

function buildCreatedKnowledge({
  mode,
  initialPath,
  sourceDraft,
  documentNames,
  name,
  description,
  permission,
}: {
  mode: KnowledgeCreateMode
  initialPath: KnowledgeCreateInitialPath
  sourceDraft: FirstSourceDraft
  documentNames: string[]
  name: string
  description: string
  permission: string
}): Knowledge2Item {
  const trimmedName = name.trim()
  const isExternal = mode === 'external'
  const isPipeline = mode === 'pipeline'
  const id = `${slugifyKnowledgeName(trimmedName)}-${Date.now().toString(36)}`
  const shouldCreateSource = !isExternal && initialPath === 'source'
  const shouldCreateDocuments = !isExternal && initialPath === 'documents'
  const initialSource = shouldCreateSource ? buildInitialSource(id, sourceDraft) : undefined
  const initialDocuments = shouldCreateDocuments ? buildInitialDocuments(id, documentNames) : []
  const sourceCount = initialSource ? 1 : 0
  const documentCount = initialDocuments.length

  return {
    ...knowledge2Items[0],
    id,
    name: trimmedName,
    description: description.trim() || createDescriptionByMode[mode],
    authorName: 'Dify Admin',
    editedAt: 'Edited just now',
    tags: isExternal ? ['External'] : isPipeline ? ['Pipeline'] : ['General'],
    icon: isExternal ? '🔌' : isPipeline ? '🧩' : '📘',
    iconBackground: isExternal ? '#F0FDF9' : '#EEF4FF',
    docForm: isExternal ? 'External Knowledge Base' : isPipeline ? 'Parent-child' : 'General',
    indexingText: isExternal ? '' : isPipeline ? 'HQ VECTOR' : 'HQ HYBRID',
    appCount: 0,
    cornerLabel: isPipeline ? 'Pipeline' : undefined,
    provider: isExternal ? 'external' : undefined,
    listHints: buildCreatedListHints(mode, initialPath, sourceDraft.type, documentCount),
    type: isExternal ? 'External' : isPipeline ? 'RAG Pipeline' : 'Internal',
    permission: permission.trim() || 'Workspace',
    apiEnabled: !isExternal,
    sourceCount,
    documentsLabel: isExternal ? 'External' : shouldCreateDocuments ? `0 / ${documentCount}` : '0 / 0',
    indexStatus: isExternal ? 'Delegated' : shouldCreateSource ? 'Syncing' : shouldCreateDocuments ? 'Building' : 'Empty',
    evidenceStatus: 'Unknown',
    usageLabel: '0 apps',
    updatedAt: 'Just now',
    runtimeMode: isPipeline ? 'rag_pipeline' : undefined,
    isPublished: isPipeline ? false : undefined,
    statusBlocks: buildCreatedStatusBlocks(mode, initialPath, sourceCount, documentCount),
    tasks: buildCreatedTasks(mode, initialPath, sourceDraft.type, documentCount),
    blockers: buildCreatedBlockers(mode, initialPath, sourceDraft.type, documentCount),
    sources: initialSource ? [initialSource] : [],
    documents: initialDocuments,
    evidenceState: 'not-enough-evidence',
    evidenceItems: [],
    missingEvidence: buildCreatedMissingEvidence(mode, initialPath, documentCount),
    conflictingEvidence: [],
    traces: [],
    goldenQuestions: [],
    badCases: [],
    qualityStats: [
      { label: 'Answerable rate', value: 'Pending', tone: 'neutral' },
      { label: 'Conflict trend', value: 'N/A', tone: 'neutral' },
      { label: 'Missing evidence', value: 'No data', tone: 'neutral' },
    ],
    qualityMissingTrend: 'No data',
    commonFailureSources: [],
    settingsConfig: buildCreatedSettings(mode, id, initialPath),
    defaultQuery: '',
    evidenceTraceId: '',
    evidenceFreshness: buildCreatedEvidenceFreshness(mode, initialPath),
    connectedWorkflows: [],
  }
}

function createDefaultFirstSourceDraft(type: KnowledgeStarterSource): FirstSourceDraft {
  return {
    type,
    provider: sourceProviderOptionsByType[type][0]?.value ?? '',
    name: '',
    endpoint: '',
    freshness: defaultSourceFreshness(type),
    permission: 'all_team_members',
    website: {
      crawlSubPages: true,
      useSitemap: true,
      limit: 10,
      maxDepth: 2,
      include: '',
      exclude: '',
      onlyMainContent: true,
    },
  }
}

function buildStagedDocumentNames(documentDrafts: string[], documentName: string) {
  const names = [...documentDrafts]
  const typedName = documentName.trim()
  if (typedName && !names.includes(typedName))
    names.push(typedName)
  return names
}

function buildInitialSource(id: string, draft: FirstSourceDraft): KnowledgeSourceRow {
  const selectedProvider = sourceProviderOptionsByType[draft.type].find(option => option.value === draft.provider)
  return {
    id: `${id}-src-initial`,
    name: draft.name.trim(),
    type: draft.type,
    status: 'Syncing',
    freshness: draft.freshness,
    permission: draft.permission,
    lastSync: 'Sync queued',
    endpoint: draft.endpoint.trim() || undefined,
    providerName: selectedProvider?.label,
    configSummary: draft.type === 'website-crawl' ? buildInitialWebsiteSourceSummary(draft) : undefined,
  }
}

function buildInitialWebsiteSourceSummary(draft: FirstSourceDraft): KnowledgeSourceRow['configSummary'] {
  return [
    { label: 'Provider', value: sourceProviderOptionsByType[draft.type].find(option => option.value === draft.provider)?.label ?? draft.provider },
    { label: 'Crawl sub-pages', value: draft.website.crawlSubPages ? 'Enabled' : 'Disabled' },
    { label: 'Use sitemap', value: draft.website.useSitemap ? 'Enabled' : 'Disabled' },
    { label: 'Page limit', value: `${draft.website.limit}` },
    { label: 'Max depth', value: `${draft.website.maxDepth}` },
    { label: 'Only main content', value: draft.website.onlyMainContent ? 'Enabled' : 'Disabled' },
    ...(draft.website.include ? [{ label: 'Include paths', value: draft.website.include }] : []),
    ...(draft.website.exclude ? [{ label: 'Exclude paths', value: draft.website.exclude }] : []),
  ]
}

function buildInitialDocuments(id: string, documentNames: string[]): KnowledgeDocumentRow[] {
  return documentNames.map((documentName, index) => ({
    id: `${id}-doc-initial-${index + 1}`,
    name: documentName,
    source: 'Manual upload',
    parserStatus: 'pending',
    version: 'v1',
    indexStatus: 'building',
    evidenceUse: 'Pending',
    updatedAt: 'Just now',
  }))
}

const createDescriptionByMode: Record<KnowledgeCreateMode, string> = {
  standard: 'A standard Knowledge base ready for synced sources and document review.',
  pipeline: 'A pipeline-managed Knowledge base ready for source setup and publish.',
  external: 'An external Knowledge base delegated to a provider-managed retrieval API.',
}

function buildCreatedListHints(
  mode: KnowledgeCreateMode,
  initialPath: KnowledgeCreateInitialPath,
  sourceType: KnowledgeStarterSource,
  documentCount: number,
) {
  if (mode === 'external')
    return undefined
  if (initialPath === 'source')
    return [`${sourceTypeLabels[sourceType]} source syncing`]
  if (initialPath === 'documents')
    return [`${documentCount} uploaded docs processing`]
  return ['No source or documents yet']
}

function buildCreatedStatusBlocks(
  mode: KnowledgeCreateMode,
  initialPath: KnowledgeCreateInitialPath,
  sourceCount: number,
  documentCount: number,
) {
  if (mode === 'external') {
    return [
      { label: 'External Knowledge API', value: 'Not configured', note: 'Add endpoint settings', tone: 'warn' as const },
      { label: 'Documents', value: 'External', note: 'Provider-managed', tone: 'neutral' as const },
      { label: 'Retrieval', value: 'Delegated', note: 'Awaiting provider', tone: 'info' as const },
      { label: 'Evidence', value: 'Unknown', note: 'Run first test', tone: 'neutral' as const },
      { label: 'Usage', value: '0 apps', note: 'Not connected', tone: 'neutral' as const },
    ]
  }

  if (initialPath === 'source') {
    return [
      { label: 'Sources', value: `${sourceCount} syncing`, note: 'First source queued', tone: 'info' as const },
      { label: 'Documents', value: '0 / 0', note: 'Awaiting synced files', tone: 'neutral' as const },
      { label: 'Index', value: 'Syncing', note: 'Source sync pending', tone: 'info' as const },
      { label: 'Evidence', value: 'Unknown', note: 'No indexed evidence', tone: 'neutral' as const },
      { label: 'Usage', value: '0 apps', note: 'Not connected', tone: 'neutral' as const },
    ]
  }

  if (initialPath === 'documents') {
    return [
      { label: 'Sources', value: '0 connected', note: 'Manual uploads only', tone: 'neutral' as const },
      { label: 'Documents', value: `0 / ${documentCount}`, note: 'Processing uploaded files', tone: 'info' as const },
      { label: 'Index', value: 'Building', note: 'Parser queued', tone: 'info' as const },
      { label: 'Evidence', value: 'Unknown', note: 'Waiting for index', tone: 'neutral' as const },
      { label: 'Usage', value: '0 apps', note: 'Not connected', tone: 'neutral' as const },
    ]
  }

  return [
    { label: 'Sources', value: '0 connected', note: 'No source yet', tone: 'neutral' as const },
    { label: 'Documents', value: '0 / 0', note: 'No documents yet', tone: 'neutral' as const },
    { label: 'Index', value: 'Empty', note: 'Waiting for documents', tone: 'neutral' as const },
    { label: 'Evidence', value: 'Unknown', note: 'No test result', tone: 'neutral' as const },
    { label: 'Usage', value: '0 apps', note: 'Not connected', tone: 'neutral' as const },
  ]
}

function buildCreatedTasks(
  mode: KnowledgeCreateMode,
  initialPath: KnowledgeCreateInitialPath,
  sourceType: KnowledgeStarterSource,
  documentCount: number,
) {
  if (mode === 'pipeline') {
    const setupTask = initialPath === 'source'
      ? { title: 'First source sync queued', detail: `${sourceTypeLabels[sourceType]} will populate Documents after sync.`, tone: 'info' as const }
      : initialPath === 'documents'
        ? { title: 'Uploaded documents processing', detail: `${documentCount} files are queued for parser and index.`, tone: 'info' as const }
        : { title: 'Add Source or Documents', detail: 'Pipeline Knowledge is empty until initial data is added.', tone: 'warn' as const }
    return [setupTask, { title: 'Publish pipeline', detail: 'Pipeline is created but not published.', tone: 'info' as const }]
  }
  if (mode === 'external')
    return [{ title: 'Configure endpoint', detail: 'Set external API name and Knowledge ID.', tone: 'warn' as const }]

  if (initialPath === 'source')
    return [{ title: 'First source sync queued', detail: `${sourceTypeLabels[sourceType]} will populate Documents after sync.`, tone: 'info' as const }]
  if (initialPath === 'documents')
    return [{ title: 'Uploaded documents processing', detail: `${documentCount} files are queued for parser and index.`, tone: 'info' as const }]
  return [{ title: 'Add Source or Documents', detail: 'Create a source connection or upload documents when ready.', tone: 'warn' as const }]
}

function buildCreatedBlockers(
  mode: KnowledgeCreateMode,
  initialPath: KnowledgeCreateInitialPath,
  sourceType: KnowledgeStarterSource,
  documentCount: number,
) {
  if (mode === 'external')
    return []
  if (initialPath === 'source') {
    return [
      { title: 'Waiting for first Source sync', detail: `${sourceTypeLabels[sourceType]} has not produced indexed Documents yet.`, tone: 'warn' as const },
    ]
  }
  if (initialPath === 'documents') {
    return [
      { title: 'Waiting for Document indexing', detail: `${documentCount} uploaded files are not answerable until parser and index finish.`, tone: 'warn' as const },
    ]
  }
  return [
    { title: 'No data added', detail: 'This Knowledge has no Sources and no Documents yet.', tone: 'warn' as const },
  ]
}

function buildCreatedMissingEvidence(mode: KnowledgeCreateMode, initialPath: KnowledgeCreateInitialPath, documentCount: number) {
  if (mode === 'external')
    return ['External retrieval has not been tested yet.']
  if (initialPath === 'source')
    return ['First Source sync has not produced indexed documents yet.']
  if (initialPath === 'documents')
    return [`${documentCount} uploaded documents are still waiting for parser and index.`]
  return ['No indexed documents are available yet.']
}

function buildCreatedEvidenceFreshness(mode: KnowledgeCreateMode, initialPath: KnowledgeCreateInitialPath) {
  if (mode === 'external')
    return 'External provider pending'
  if (initialPath === 'source')
    return 'Source sync queued'
  if (initialPath === 'documents')
    return 'Uploaded documents processing'
  return 'No sources connected'
}

function buildCreatedSettings(mode: KnowledgeCreateMode, id: string, initialPath: KnowledgeCreateInitialPath) {
  if (mode === 'external') {
    return {
      apiAccess: { serviceApiEnabled: false, externalApiEnabled: true },
      externalRetrieval: {
        externalApiName: '',
        externalKnowledgeId: id,
        topK: 4,
        scoreThreshold: 0.35,
        scoreThresholdEnabled: true,
        scoreHandling: 'Normalize before mixed rerank',
      },
      advanced: {
        healthCheckSummary: 'External endpoint not configured',
        cleanupSummary: 'Delegated retention managed by provider',
      },
    }
  }

  return {
    apiAccess: { serviceApiEnabled: true, externalApiEnabled: false },
    defaultRetrieval: {
      mode: mode === 'pipeline' ? 'Fast' as const : 'Fast' as const,
      topK: mode === 'pipeline' ? 6 : 8,
      rerankEnabled: true,
      scoreThreshold: 0.5,
      scoreThresholdEnabled: true,
    },
    processingAndIndex: {
      parserPolicy: mode === 'pipeline' ? 'Pipeline-managed parser' : 'General document parser',
      chunking: mode === 'pipeline' ? 'Parent-child' : 'General',
      embedding: 'text-embedding-3-large',
      indexStrategy: mode === 'pipeline' ? 'Pipeline vector projection' : 'Hybrid dense + FTS',
      pipelineNote: mode === 'pipeline' ? 'Draft pipeline' : undefined,
    },
    retention: {
      rawDocumentRetentionDays: null,
      parseArtifactVersions: 5,
      answerTraceRetentionDays: 30,
      evidenceCacheRetentionDays: 7,
      inactiveProjectionRetentionDays: 90,
      sessionInactivityMinutes: 1440,
    },
    advanced: {
      healthCheckSummary: initialPath === 'source'
        ? 'First source sync queued'
        : initialPath === 'documents'
          ? 'Initial uploaded documents queued'
          : 'No projection created yet',
      cleanupSummary: 'No inactive assets pending cleanup',
    },
  }
}

function slugifyKnowledgeName(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'knowledge'
}

function KnowledgeDetailPage({
  item,
  onUpdateKnowledge,
}: {
  item: Knowledge2Item
  onUpdateKnowledge: (id: string, updater: (item: Knowledge2Item) => Knowledge2Item) => void
}) {
  const [activeTab, setActiveTab] = useState<KnowledgeDetailTab>('overview')
  const navItems = detailNavItems.filter(entry => !entry.hidden?.(item))
  const meta = pageMeta[activeTab]

  return (
    <div className="flex h-0 min-h-0 shrink-0 grow overflow-hidden bg-background-body">
      <DatasetDetailSidebar item={item} navItems={navItems} activeTab={activeTab} onTabChange={setActiveTab} />
      <div className="relative min-w-0 flex-1 overflow-y-auto">
        <div className="flex min-h-full flex-col py-3 pl-6">
          <PageHeader title={meta.title} description={meta.description} />
          <div className="min-h-0 flex-1">
            {activeTab === 'overview' && <KnowledgeOverviewView item={item} onNavigate={setActiveTab} />}
            {activeTab === 'sources' && (
              <KnowledgeSourcesView
                item={item}
                onSourcesChange={sources => onUpdateKnowledge(item.id, current => ({ ...current, sources, sourceCount: sources.length }))}
              />
            )}
            {activeTab === 'documents' && (
              <KnowledgeDocumentsView
                item={item}
                onDocumentsChange={documents => onUpdateKnowledge(item.id, current => ({
                  ...current,
                  documents,
                  documentsLabel: `${documents.filter(doc => doc.indexStatus === 'ready').length} / ${documents.length}`,
                }))}
              />
            )}
            {activeTab === 'evidence' && <KnowledgeEvidenceView key={item.id} item={item} onOpenQuality={() => setActiveTab('quality')} />}
            {activeTab === 'quality' && <KnowledgeQualityView item={item} />}
            {activeTab === 'settings' && <KnowledgeSettingsView item={item} />}
            {activeTab === 'pipeline' && item.runtimeMode === 'rag_pipeline' && <KnowledgePipelineView item={item} />}
          </div>
        </div>
      </div>
    </div>
  )
}

function DatasetDetailSidebar({
  item,
  navItems,
  activeTab,
  onTabChange,
}: {
  item: Knowledge2Item
  navItems: NavItem[]
  activeTab: KnowledgeDetailTab
  onTabChange: (tab: KnowledgeDetailTab) => void
}) {
  return (
    <aside className="flex w-[216px] shrink-0 flex-col border-r border-divider-burn bg-background-default-subtle">
      <div className="p-2">
        <div className="relative flex flex-col gap-2 p-2">
          <div className="flex items-center gap-1">
            <span
              className="flex size-10 shrink-0 items-center justify-center rounded-[10px] border-[0.5px] border-divider-regular text-[24px] leading-none"
              style={{ background: item.iconBackground }}
            >
              {item.icon}
            </span>
          </div>
          <div className="flex flex-col gap-y-1 pb-0.5">
            <div className="truncate system-md-semibold text-text-secondary" title={item.name}>
              {item.name}
            </div>
            <div className="system-2xs-medium-uppercase text-text-tertiary">
              {item.provider === 'external'
                ? 'External Knowledge Base'
                : (
                    <div className="flex items-center gap-x-2">
                      <span>{item.docForm}</span>
                      {!!item.indexingText && <span>{item.indexingText}</span>}
                    </div>
                  )}
            </div>
          </div>
          {!!item.description && (
            <p className="line-clamp-3 system-xs-regular text-text-tertiary first-letter:capitalize">
              {item.description}
            </p>
          )}
        </div>
      </div>
      <div className="relative px-4 py-2">
        <div className="my-0 h-px bg-linear-to-r from-divider-subtle to-background-gradient-mask-transparent" />
      </div>
      <nav className="flex grow flex-col gap-y-0.5 px-3 py-2">
        {navItems.map(entry => (
          <DatasetNavLink
            key={entry.id}
            name={entry.label}
            active={activeTab === entry.id}
            icon={activeTab === entry.id ? entry.activeIcon : entry.icon}
            onClick={() => onTabChange(entry.id)}
          />
        ))}
      </nav>
      <DatasetSidebarExtra item={item} />
    </aside>
  )
}

function DatasetNavLink({
  name,
  active,
  icon: Icon,
  onClick,
}: {
  name: string
  active: boolean
  icon: React.ComponentType<{ className?: string }>
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex h-8 items-center rounded-lg pl-3 pr-1',
        active
          ? 'border-b-[0.25px] border-l-[0.75px] border-r-[0.25px] border-t-[0.75px] border-effects-highlight-lightmode-off bg-components-menu-item-bg-active text-text-accent-light-mode-only system-sm-semibold'
          : 'text-components-menu-item-text system-sm-medium hover:bg-components-menu-item-bg-hover hover:text-components-menu-item-text-hover',
      )}
    >
      <Icon className="size-4 shrink-0" />
      <span className="ml-2 truncate">{name}</span>
    </button>
  )
}

function DatasetSidebarExtra({ item }: { item: Knowledge2Item }) {
  return (
    <>
      <div className="flex items-center gap-x-0.5 p-2 pb-0">
        <div className="flex grow flex-col px-2 pt-1 pb-1.5">
          <div className="system-md-semibold-uppercase text-text-secondary">{item.documentsLabel}</div>
          <div className="system-2xs-medium-uppercase text-text-tertiary">Documents</div>
        </div>
        <div className="h-full w-px bg-divider-regular" />
        <div className="flex grow flex-col px-2 pt-1 pb-1.5">
          <div className="system-md-semibold-uppercase text-text-secondary">{item.appCount}</div>
          <div className="system-2xs-medium-uppercase text-text-tertiary">Related apps</div>
        </div>
      </div>
      <div className="p-3 pt-2">
        <div className="flex h-8 items-center gap-2 rounded-lg border border-components-panel-border px-3">
          <span className="i-custom-vender-solid-development-api-connection-mod size-4 shrink-0 text-text-secondary" />
          <div className="grow system-sm-medium text-text-secondary">API Access</div>
          <span className={cn('size-2 rounded-full', item.apiEnabled ? 'bg-util-colors-green-green-500' : 'bg-util-colors-warning-warning-500')} />
        </div>
      </div>
    </>
  )
}

function PageHeader({ title, description }: { title: string; description: string }) {
  return (
    <div className="mb-4 flex flex-col justify-center">
      <h1 className="text-base font-semibold text-text-primary">{title}</h1>
      <p className="mt-0.5 text-[13px] leading-4 font-normal text-text-tertiary">{description}</p>
    </div>
  )
}

function SearchInput({ value, onChange, className = 'w-52' }: { value: string; onChange: (value: string) => void; className?: string }) {
  return (
    <div className="relative">
      <RiSearchLine className="pointer-events-none absolute top-1/2 left-2 size-4 -translate-y-1/2 text-components-input-text-placeholder" />
      <Input
        size="medium"
        className={cn('pr-7 pl-7', className)}
        value={value}
        onChange={event => onChange(event.target.value)}
        placeholder="Search"
      />
      {!!value && (
        <button
          type="button"
          aria-label="Clear"
          className="absolute top-1/2 right-2 flex size-4 -translate-y-1/2 items-center justify-center text-components-input-text-placeholder hover:text-components-input-text-filled"
          onClick={() => onChange('')}
        >
          <RiCloseCircleFill className="size-4" />
        </button>
      )}
    </div>
  )
}

function FilterChip({ iconClassName, label }: { iconClassName: string; label: string }) {
  return (
    <button type="button" className="flex h-8 items-center rounded-lg border-[0.5px] border-transparent bg-components-input-bg-normal px-2 text-[13px] leading-4 text-text-tertiary transition-colors hover:bg-components-input-bg-hover">
      <span aria-hidden className={cn('h-4 w-4 shrink-0 text-text-tertiary', iconClassName)} />
      <span className="px-1 text-text-tertiary">{label}</span>
      <span aria-hidden className="i-ri-arrow-down-s-line h-4 w-4 shrink-0 text-text-tertiary" />
    </button>
  )
}

function NewKnowledgeCard({ onOpenCreate }: { onOpenCreate: (mode: KnowledgeCreateMode) => void }) {
  return (
    <div className="flex h-[190px] flex-col gap-y-0.5 rounded-xl bg-background-default-dimmed">
      <div className="flex grow flex-col items-center justify-center p-2">
        <KnowledgeCreateOption Icon={RiAddLine} text="Create Knowledge" onClick={() => onOpenCreate('standard')} />
        <KnowledgeCreateOption Icon={RiFunctionAddLine} text="Create from Knowledge Pipeline" onClick={() => onOpenCreate('pipeline')} />
      </div>
      <div className="border-t-[0.5px] border-divider-subtle p-2">
        <KnowledgeCreateOption
          Icon={() => <span className="i-custom-vender-solid-development-api-connection-mod size-4 shrink-0" />}
          text="Connect to an External Knowledge Base"
          onClick={() => onOpenCreate('external')}
        />
      </div>
    </div>
  )
}

function KnowledgeCreateOption({
  Icon,
  text,
  onClick,
}: {
  Icon: React.ComponentType<{ className?: string }>
  text: string
  onClick: () => void
}) {
  return (
    <button type="button" onClick={onClick} className="flex w-full items-center gap-x-2 rounded-lg bg-transparent px-4 py-2 text-text-tertiary shadow-shadow-shadow-3 hover:bg-background-default-dodge hover:text-text-secondary hover:shadow-xs">
      <Icon className="size-4 shrink-0" />
      <span className="grow text-left system-sm-medium">{text}</span>
    </button>
  )
}

function KnowledgeListCard({ item, onOpen }: { item: Knowledge2Item; onOpen: () => void }) {
  const attentionSignals = (item.listHints?.length
    ? [
        ...item.listHints,
        itemHasSourceError(item) && !item.listHints.some(hint => hint.includes('source')) ? 'source sync error' : null,
      ]
    : [
        itemHasSourceError(item) ? 'source sync error' : null,
        item.indexStatus === 'Stale' ? 'index rebuild needed' : null,
        item.indexStatus === 'Failed' ? 'index failed' : null,
        item.evidenceStatus === 'Conflict' ? 'conflicting evidence' : null,
        item.evidenceStatus === 'Partial' ? 'partial evidence' : null,
      ]).filter(Boolean) as string[]

  return (
    <button
      type="button"
      onClick={onOpen}
      className="group relative col-span-1 flex h-47.5 cursor-pointer flex-col rounded-xl border-[0.5px] border-solid border-components-card-border bg-components-card-bg text-left shadow-xs shadow-shadow-shadow-3 transition-all duration-200 ease-in-out hover:shadow-md hover:shadow-shadow-shadow-5"
    >
      {item.cornerLabel && (
        <div className="absolute top-0 right-0 z-5 rounded-tr-xl rounded-bl-lg bg-components-badge-bg-blue-solid px-2 py-0.5 system-2xs-medium-uppercase text-text-primary-on-surface">
          {item.cornerLabel}
        </div>
      )}
      <div className="flex items-center gap-x-3 px-4 pt-4 pb-2">
        <div className="relative shrink-0">
          <span
            className="relative flex size-10 shrink-0 grow-0 items-center justify-center overflow-hidden rounded-[10px] border-[0.5px] border-divider-regular text-[24px] leading-none"
            style={{ background: item.iconBackground }}
          >
            {item.icon}
          </span>
          <div className="absolute -right-1 -bottom-1 z-5 flex size-4 items-center justify-center rounded bg-components-avatar-shape-fill-stop-100 shadow-xs">
            <RiBookOpenLine className="size-3 text-components-icon-bg-orange-solid" />
          </div>
        </div>
        <div className="flex grow flex-col gap-y-1 overflow-hidden py-px pr-4">
          <div className="truncate system-md-semibold text-text-secondary" title={item.name}>
            {item.name}
          </div>
          <div className="flex items-center gap-1 text-[10px] leading-[18px] font-medium text-text-tertiary">
            <div className="truncate" title={item.authorName}>{item.authorName}</div>
            <div>·</div>
            <div className="truncate" title={item.editedAt}>{item.editedAt}</div>
          </div>
        </div>
      </div>
      <div className="line-clamp-2 h-10 px-4 py-1 system-xs-regular text-text-tertiary" title={item.description}>
        {item.description}
      </div>
      {attentionSignals.length > 0
        ? (
            <div className="flex flex-wrap gap-1 px-4 pb-1">
              {attentionSignals.map(signal => (
                <StatusBadge key={signal} label={signal} tone="warn" />
              ))}
            </div>
          )
        : (
            <div className="truncate px-4 pb-1 system-xs-regular text-text-tertiary" title={knowledgeListSummary(item)}>
              {knowledgeListSummary(item)}
            </div>
          )}
      <div className="w-full px-3">
        <div className="relative flex w-full gap-1 overflow-hidden py-1">
          {item.tags.map(tag => (
            <span key={tag} className="inline-flex h-6 max-w-[112px] shrink-0 items-center rounded-md border border-divider-subtle bg-components-badge-bg-gray-soft px-2 system-2xs-medium-uppercase text-text-tertiary">
              {tag}
            </span>
          ))}
          <div className="pointer-events-none absolute top-0 right-0 h-full w-20 bg-tag-selector-mask-bg" />
        </div>
      </div>
      <div className="flex items-center gap-x-3 px-4 pt-2 pb-3 text-text-tertiary">
        <div className="flex items-center gap-x-1">
          <RiFileTextFill className="size-3 text-text-quaternary" />
          <span className="system-xs-medium">{item.documentsLabel}</span>
        </div>
        {item.provider !== 'external' && (
          <div className="flex items-center gap-x-1">
            <RiRobot2Fill className="size-3 text-text-quaternary" />
            <span className="system-xs-medium">{item.appCount}</span>
          </div>
        )}
        <span className="system-xs-regular text-divider-deep">/</span>
        <span className="system-xs-regular">{item.updatedAt}</span>
      </div>
    </button>
  )
}

function knowledgeListSummary(item: Knowledge2Item) {
  if (item.provider === 'external') {
    return [
      'External Knowledge API',
      item.documentsLabel,
      item.indexStatus,
      item.evidenceStatus,
      item.usageLabel,
    ].join(' · ')
  }
  return [
    `${item.sourceCount} sources`,
    `${item.documentsLabel} docs`,
    item.indexStatus,
    item.evidenceStatus,
    item.usageLabel,
  ].join(' · ')
}
