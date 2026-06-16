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
import { RiStoreLine } from '@remixicon/react'
import { formatSourceFreshness, sourceTypeLabels } from '../../fixtures/items'
import {
  endpointLabels,
  permissionOptions,
  sourceProviderOptionsByType,
  sourceSyncPolicyOptions,
} from '../sources/SourcesView'
import type { DatasetStarterSource, FirstSourceDraft } from '../../types/create'
import {
  CreateProviderCard,
  CreateSourceTypeCard,
  WebsiteCrawlInlineOptions,
} from './create-cards'
import { CreateSummaryRow, Field, sourceNamePlaceholderByType } from './create-shared'

export function CreateSourceSection({
  sourceDraft,
  onSetSourceType,
  onSourceDraftChange,
}: {
  sourceDraft: FirstSourceDraft
  onSetSourceType: (sourceType: DatasetStarterSource) => void
  onSourceDraftChange: React.Dispatch<React.SetStateAction<FirstSourceDraft>>
}) {
  const syncPolicyOptions = sourceSyncPolicyOptions(sourceDraft.type)
  const selectedProvider = sourceProviderOptionsByType[sourceDraft.type].find(option => option.value === sourceDraft.provider)

  return (
                    <section className="space-y-6 rounded-xl border border-components-panel-border bg-components-panel-bg p-4 shadow-xs">
                      <div>
                        <div className="system-sm-semibold text-text-secondary">Source type</div>
                        <div className="mt-3 grid grid-cols-1 gap-2 md:grid-cols-3">
                          <CreateSourceTypeCard
                            sourceType="website-crawl"
                            selected={sourceDraft.type === 'website-crawl'}
                            iconClassName="i-ri-global-line"
                            title="Website crawl"
                            description="Crawl a website or sitemap on a schedule."
                            onSelect={onSetSourceType}
                          />
                          <CreateSourceTypeCard
                            sourceType="online-documents"
                            selected={sourceDraft.type === 'online-documents'}
                            iconClassName="i-ri-file-text-line"
                            title="Online documents"
                            description="Sync pages from Notion, Google Docs, or Confluence."
                            onSelect={onSetSourceType}
                          />
                          <CreateSourceTypeCard
                            sourceType="online-drive"
                            selected={sourceDraft.type === 'online-drive'}
                            iconClassName="i-ri-drive-line"
                            title="Online drive"
                            description="Sync files from Drive, OneDrive, or object storage."
                            onSelect={onSetSourceType}
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
                              <CreateProviderCard
                                key={option.value}
                                selected={sourceDraft.provider === option.value}
                                label={option.label}
                                description={option.description}
                                icon={Icon}
                                onClick={() => onSourceDraftChange(current => ({ ...current, provider: option.value }))}
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
                                onChange={event => onSourceDraftChange(current => ({ ...current, name: event.target.value }))}
                                placeholder={sourceNamePlaceholderByType[sourceDraft.type]}
                              />
                            </Field>
                            <Field label={endpointLabels[sourceDraft.type].label}>
                              <Input
                                value={sourceDraft.endpoint}
                                onChange={event => onSourceDraftChange(current => ({ ...current, endpoint: event.target.value }))}
                                placeholder={endpointLabels[sourceDraft.type].placeholder}
                              />
                            </Field>
                          </div>

                          {sourceDraft.type === 'website-crawl' && (
                            <WebsiteCrawlInlineOptions draft={sourceDraft} onDraftChange={onSourceDraftChange} />
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
                                    onSourceDraftChange(current => ({ ...current, freshness: { strategy: option.value, staleAfterSeconds: option.staleAfterSeconds } }))
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
                                    onSourceDraftChange(current => ({ ...current, permission: value }))
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
  )
}
