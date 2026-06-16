import { Button } from '@langgenius/dify-ui/button'
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
import { RiAddLine, RiArrowLeftLine, RiStoreLine } from '@remixicon/react'
import { useState } from 'react'
import {
  datasetPermissionLabels,
  formatSourceFreshness,
  sourceTypeLabels,
} from '../../fixtures/items'
import {
  addSourceTypeOptions,
  defaultSourceFreshness,
  defaultWebsiteCrawlOptions,
  endpointLabels,
  permissionOptions,
  sourceProviderOptionsByType,
  sourceTypeIcons,
  sourceSyncPolicyOptions,
} from './source-options'
import { buildWebsiteConfigSummary, buildWebsiteCrawlResults, Field, parseWebsiteUrl } from './source-shared'
import { InstallDataSourceCard, SourceSetupCard } from './source-setup-cards'
import type { AddSourceDraft, SourceAddMeta, WebsiteCrawlOptions, WebsiteCrawlResult, WebsiteCrawlStatus } from './source-types'
import { WebsiteCrawlSetup } from './WebsiteCrawlSetup'

export function SourceSetupView({
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
