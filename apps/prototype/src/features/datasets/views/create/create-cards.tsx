import { Checkbox } from '@langgenius/dify-ui/checkbox'
import { cn } from '@langgenius/dify-ui/cn'
import { Input } from '@langgenius/dify-ui/input'
import { RiCheckLine } from '@remixicon/react'
import type { DatasetCreateInitialPath, DatasetStarterSource, FirstSourceDraft } from '../../types/create'
import { Field } from './create-shared'

export function CreatePathCard({
  path,
  selected,
  iconClassName,
  title,
  description,
  onSelect,
}: {
  path: DatasetCreateInitialPath
  selected: boolean
  iconClassName: string
  title: string
  description: string
  onSelect: (path: DatasetCreateInitialPath) => void
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

export function CreateSourceTypeCard({
  sourceType,
  selected,
  iconClassName,
  title,
  description,
  onSelect,
}: {
  sourceType: DatasetStarterSource
  selected: boolean
  iconClassName: string
  title: string
  description: string
  onSelect: (sourceType: DatasetStarterSource) => void
}) {
  return (
    <CreatePathCard
      path="source"
      selected={selected}
      iconClassName={iconClassName}
      title={title}
      description={description}
      onSelect={() => onSelect(sourceType)}
    />
  )
}

export function CreateProviderCard({
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

export function WebsiteCrawlInlineOptions({
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
