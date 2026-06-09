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
  RiAddLine,
  RiArrowDownSLine,
  RiBarChartFill,
  RiBarChartLine,
  RiBookOpenLine,
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
} from '@remixicon/react'
import { useMemo, useState } from 'react'
import { StatusBadge } from './knowledge-2-badges'
import {
  itemHasSourceError,
  knowledge2Items,
  type Knowledge2Item,
  type KnowledgeDetailTab,
} from './knowledge-2-data'
import { KnowledgeDocumentsView } from './KnowledgeDocumentsView'
import { KnowledgeEvidenceView } from './KnowledgeEvidenceView'
import { KnowledgeOverviewView } from './KnowledgeOverviewView'
import { KnowledgePipelineView } from './KnowledgePipelineView'
import { KnowledgeQualityView } from './KnowledgeQualityView'
import { KnowledgeSettingsView } from './KnowledgeSettingsView'
import { KnowledgeSourcesView } from './KnowledgeSourcesView'

type NavItem = {
  id: KnowledgeDetailTab
  label: string
  icon: React.ComponentType<{ className?: string }>
  activeIcon: React.ComponentType<{ className?: string }>
  hidden?: (item: Knowledge2Item) => boolean
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
  onOpenDetail,
}: {
  screen: 'list' | string
  onOpenDetail: (id: string) => void
}) {
  if (screen === 'list')
    return <KnowledgeListPage onOpenDetail={onOpenDetail} />

  const item = knowledge2Items.find(entry => entry.id === screen)
  if (!item)
    return <KnowledgeListPage onOpenDetail={onOpenDetail} />

  return <KnowledgeDetailPage key={item.id} item={item} />
}

export function KnowledgeTopNav({
  active,
  screen,
  onActivate,
  onGoToList,
  onSelectKnowledge,
}: {
  active: boolean
  screen: 'list' | string
  onActivate: () => void
  onGoToList: () => void
  onSelectKnowledge: (id: string) => void
}) {
  const [hovered, setHovered] = useState(false)
  const curNav = useMemo(() => {
    if (screen === 'list')
      return undefined
    return knowledge2Items.find(entry => entry.id === screen)
  }, [screen])

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
          <KnowledgeNavSelector curNav={curNav} onSelect={onSelectKnowledge} />
        </>
      )}
    </div>
  )
}

function KnowledgeNavSelector({
  curNav,
  onSelect,
}: {
  curNav: Knowledge2Item
  onSelect: (id: string) => void
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
          {knowledge2Items.map(item => (
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
          <DropdownMenuItem className="h-9 gap-2 px-3 py-[6px]">
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

function KnowledgeListPage({ onOpenDetail }: { onOpenDetail: (id: string) => void }) {
  const [keywords, setKeywords] = useState('')
  const [includeAll, setIncludeAll] = useState(false)

  const filteredItems = useMemo(() => {
    const query = keywords.trim().toLowerCase()
    return knowledge2Items.filter((item) => {
      if (!query)
        return true
      return `${item.name} ${item.description} ${item.tags.join(' ')}`.toLowerCase().includes(query)
    })
  }, [keywords])

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
        <NewKnowledgeCard />
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

function KnowledgeDetailPage({ item }: { item: Knowledge2Item }) {
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
            {activeTab === 'sources' && <KnowledgeSourcesView item={item} />}
            {activeTab === 'documents' && <KnowledgeDocumentsView item={item} />}
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

function NewKnowledgeCard() {
  return (
    <div className="flex h-[190px] flex-col gap-y-0.5 rounded-xl bg-background-default-dimmed">
      <div className="flex grow flex-col items-center justify-center p-2">
        <KnowledgeCreateOption Icon={RiAddLine} text="Create Knowledge" />
        <KnowledgeCreateOption Icon={RiFunctionAddLine} text="Create from Knowledge Pipeline" />
      </div>
      <div className="border-t-[0.5px] border-divider-subtle p-2">
        <KnowledgeCreateOption
          Icon={() => <span className="i-custom-vender-solid-development-api-connection-mod size-4 shrink-0" />}
          text="Connect to an External Knowledge Base"
        />
      </div>
    </div>
  )
}

function KnowledgeCreateOption({ Icon, text }: { Icon: React.ComponentType<{ className?: string }>; text: string }) {
  return (
    <button type="button" className="flex w-full items-center gap-x-2 rounded-lg bg-transparent px-4 py-2 text-text-tertiary shadow-shadow-shadow-3 hover:bg-background-default-dodge hover:text-text-secondary hover:shadow-xs">
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
