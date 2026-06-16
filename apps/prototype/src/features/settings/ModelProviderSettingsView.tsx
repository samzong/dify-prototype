import { Button } from '@langgenius/dify-ui/button'
import { cn } from '@langgenius/dify-ui/cn'
import { Dialog, DialogCloseButton, DialogContent, DialogTitle } from '@langgenius/dify-ui/dialog'
import { Input } from '@langgenius/dify-ui/input'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@langgenius/dify-ui/popover'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectItemIndicator,
  SelectItemText,
  SelectTrigger,
} from '@langgenius/dify-ui/select'
import { Switch } from '@langgenius/dify-ui/switch'
import { toast } from '@langgenius/dify-ui/toast'
import { RiArrowRightUpLine, RiCloseCircleFill, RiSearchLine } from '@remixicon/react'
import { useEffect, useMemo, useState } from 'react'
import {
  prototypeAiCredits,
  prototypeDefaultSystemModels,
  prototypeMarketplaceProviders,
  prototypeModelProviders,
  prototypeSystemModelOptions,
  type CredentialVariant,
  type MarketplaceProvider,
  type PrototypeModelItem,
  type PrototypeModelProvider,
  type SystemModelOption,
  type SystemModelType,
} from './fixtures/settings-data'
import {
  MarketplaceProviderIcon,
  ModelProviderIcon,
} from '../../shared/icons/dify-provider-icons'

const gridBgStyle = {
  backgroundSize: '4px 4px',
  backgroundImage: 'linear-gradient(to right, var(--color-divider-subtle) 0.5px, transparent 0.5px), linear-gradient(to bottom, var(--color-divider-subtle) 0.5px, transparent 0.5px)',
  WebkitMaskImage: 'radial-gradient(ellipse at center, rgba(0, 0, 0, 0.6), transparent 70%)',
  maskImage: 'radial-gradient(ellipse at center, rgba(0, 0, 0, 0.6), transparent 70%)',
} as const

const systemModelLabels: Record<SystemModelType, { label: string; tip: string }> = {
  reasoning: {
    label: 'System reasoning model',
    tip: 'Used for app orchestration, conversation naming, and other default generation tasks.',
  },
  embedding: {
    label: 'Embedding model',
    tip: 'Used for knowledge base document embedding and retrieval.',
  },
  rerank: {
    label: 'Rerank model',
    tip: 'Used to rerank retrieved knowledge chunks for better relevance.',
  },
  speech2text: {
    label: 'Speech-to-text model',
    tip: 'Used to convert speech input into text in supported apps.',
  },
  tts: {
    label: 'Text-to-speech model',
    tip: 'Used to convert model responses into spoken audio.',
  },
}

function useDebouncedValue<T>(value: T, delayMs: number) {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const timer = window.setTimeout(() => setDebounced(value), delayMs)
    return () => window.clearTimeout(timer)
  }, [value, delayMs])
  return debounced
}

function ModelBadge({ children }: { children: string }) {
  return (
    <div className="inline-flex h-[18px] shrink-0 items-center justify-center rounded-[5px] border border-divider-deep bg-components-badge-bg-dimm px-[5px] system-2xs-medium-uppercase whitespace-nowrap text-text-tertiary">
      {children}
    </div>
  )
}

function AiCreditsPanel() {
  const trialProviders = prototypeModelProviders.filter(p => prototypeAiCredits.trialProviderIds.includes(p.id))

  return (
    <div className="relative h-16 min-w-[72px] shrink-0 overflow-hidden rounded-xl border-[0.5px] border-components-panel-border bg-third-party-model-bg-default pt-3 pr-2.5 pb-2.5 pl-4 shadow-xs">
      <div className="pointer-events-none absolute inset-0" style={gridBgStyle} />
      <div className="relative">
        <div className="mb-0.5 flex h-4 items-center system-xs-medium-uppercase text-text-tertiary">
          AI Credits
          <Popover>
            <PopoverTrigger
              openOnHover
              delay={300}
              closeDelay={200}
              aria-label="AI credits info"
              className="ml-0.5 inline-flex size-3 shrink-0 cursor-pointer items-center justify-center border-0 bg-transparent p-0"
            >
              <span aria-hidden className="i-ri-information-2-line size-3 text-text-tertiary hover:text-text-secondary" />
            </PopoverTrigger>
            <PopoverContent placement="top" popupClassName="max-w-[300px] rounded-md px-3 py-2 system-xs-regular text-text-tertiary">
              Trial credits can be used with OpenAI, Gemini, and xAI models without adding your own API key.
            </PopoverContent>
          </Popover>
        </div>
        <div className="flex h-6 items-center justify-between">
          <div className="flex items-center gap-1">
            <span className="mr-0.5 system-xl-semibold text-text-secondary">{prototypeAiCredits.credits}</span>
            <div className="flex h-[18px] items-start gap-1 pt-0.5 system-xs-regular text-text-tertiary">
              <span>credits</span>
              <span className="text-text-quaternary">·</span>
              <span>{`Reset on ${prototypeAiCredits.resetDate}`}</span>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-1">
            {trialProviders.map(provider => (
              <ModelProviderIcon
                key={provider.id}
                providerId={provider.id}
                variant="credits"
                title={provider.name}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function CredentialPanel({
  variant,
  onAddApiKey,
}: {
  variant: CredentialVariant
  onAddApiKey: () => void
}) {
  const isRequired = variant === 'api-required-add'
  const label = isRequired ? 'API key required' : 'AI credits in use'

  return (
    <div className={cn(
      'relative isolate ml-1 flex w-[128px] shrink-0 flex-col justify-between rounded-lg border-[0.5px] p-1 shadow-xs',
      isRequired ? 'border-state-destructive-border bg-state-destructive-hover' : 'border-components-panel-border bg-white/18',
    )}
    >
      <div className="pointer-events-none absolute inset-0 rounded-[7px]" style={gridBgStyle} />
      <div className="relative z-1 flex min-w-0 items-center gap-1 overflow-hidden px-1.5 pt-1 system-xs-medium text-text-secondary">
        <span className={isRequired ? 'text-text-destructive' : undefined}>{label}</span>
      </div>
      <div className="relative z-1 flex w-full min-w-0 items-center gap-0.5">
        <Popover>
          <PopoverTrigger
            render={(
              <Button
                className="flex w-full min-w-0 justify-center px-2"
                size="small"
                variant={isRequired ? 'primary' : 'secondary'}
                onClick={onAddApiKey}
              >
                <span className="mr-1 i-ri-equalizer-2-line size-3.5 shrink-0" />
                <span className="min-w-0 truncate">Add API Key</span>
              </Button>
            )}
          />
          <PopoverContent placement="bottom-end" popupClassName="w-56 p-2 system-sm-regular text-text-secondary">
            Configure API key or switch to custom credentials.
          </PopoverContent>
        </Popover>
      </div>
    </div>
  )
}

function ProviderCardActions({
  version,
  onUpdate,
}: {
  version: string
  onUpdate: () => void
}) {
  return (
    <>
      <button
        type="button"
        className="inline-flex h-[18px] items-center rounded-[5px] border border-divider-deep bg-components-badge-bg-dimm px-[5px] system-2xs-medium-uppercase text-text-tertiary hover:bg-state-base-hover"
      >
        <span>{version}</span>
        <span className="ml-1 i-ri-arrow-left-right-line size-3" />
      </button>
      <Popover>
        <PopoverTrigger
          render={(
            <button type="button" aria-label="More actions" className="ml-0.5 flex size-6 items-center justify-center rounded-md hover:bg-state-base-hover">
              <span className="i-ri-more-fill size-4 text-text-tertiary" />
            </button>
          )}
        />
        <PopoverContent popupClassName="w-44 p-1">
          <button type="button" className="flex w-full rounded-lg px-3 py-2 text-left system-sm-regular text-text-secondary hover:bg-state-base-hover" onClick={onUpdate}>
            Update
          </button>
          <button type="button" className="flex w-full rounded-lg px-3 py-2 text-left system-sm-regular text-text-secondary hover:bg-state-base-hover" onClick={() => toast.info('Uninstall would run in production')}>
            Uninstall
          </button>
        </PopoverContent>
      </Popover>
    </>
  )
}

function ModelList({
  provider,
  models,
  onCollapse,
  onToggleModel,
}: {
  provider: PrototypeModelProvider
  models: PrototypeModelItem[]
  onCollapse: () => void
  onToggleModel: (modelName: string, enabled: boolean) => void
}) {
  return (
    <div className="rounded-b-xl px-2 pb-2">
      <div className="rounded-lg bg-components-panel-bg py-1">
        <div className="flex items-center pr-[3px] pl-1">
          <span className="group mr-2 flex shrink-0 items-center">
            <button
              type="button"
              className="inline-flex h-6 cursor-pointer items-center rounded-lg bg-state-base-hover pr-1.5 pl-1 system-xs-medium text-text-tertiary"
              onClick={onCollapse}
            >
              {`${models.length} models`}
              <span aria-hidden className="i-ri-arrow-right-s-line mr-0.5 size-4 rotate-90" />
            </button>
          </span>
          <div className="flex grow justify-end">
            <Button variant="ghost" size="small" className="h-6 px-2" onClick={() => toast.info('Manage credentials')}>
              <span className="i-ri-key-2-line mr-1 size-3.5" />
            </Button>
            <Button variant="ghost" size="small" className="h-6 px-2" onClick={() => toast.info('Add model')}>
              <span className="i-ri-add-line mr-1 size-3.5" />
              Add Model
            </Button>
          </div>
        </div>
        {models.map(model => (
          <div
            key={model.name}
            className="group flex h-8 items-center rounded-lg pr-2.5 pl-2 hover:bg-components-panel-on-panel-item-bg-hover"
          >
            <ModelProviderIcon providerId={provider.id} variant="inline" title={provider.name} />
            <div className="mx-2 grow truncate system-md-regular text-text-secondary">
              {model.name}
              <span className="ml-2 system-xs-regular text-text-tertiary">{model.modelType}</span>
            </div>
            <Switch
              className="ml-2"
              size="md"
              checked={model.enabled}
              onCheckedChange={checked => onToggleModel(model.name, checked)}
            />
          </div>
        ))}
      </div>
    </div>
  )
}

function ProviderAddedCard({
  provider,
  expanded,
  onToggleExpand,
  onToggleModel,
}: {
  provider: PrototypeModelProvider
  expanded: boolean
  onToggleExpand: () => void
  onToggleModel: (modelName: string, enabled: boolean) => void
}) {
  const showCredential = provider.configured || provider.credentialVariant === 'api-required-add'

  return (
    <div
      className={cn(
        'rounded-xl border-[0.5px] border-divider-regular shadow-xs',
        provider.backgroundClass,
      )}
    >
      <div className="flex rounded-t-xl py-2 pr-2 pl-3">
        <div className="grow px-1 pt-1 pb-0.5">
          <div className="mb-2 flex items-center gap-1">
            <ModelProviderIcon providerId={provider.id} variant="card-header" title={provider.name} />
            <ProviderCardActions version={provider.version} onUpdate={() => toast.info('Checking for updates…')} />
          </div>
          <div className="flex flex-wrap gap-0.5">
            {provider.supportedTypes.map(type => (
              <ModelBadge key={type}>{type}</ModelBadge>
            ))}
          </div>
        </div>
        {showCredential && (
          <CredentialPanel
            variant={provider.credentialVariant}
            onAddApiKey={() => toast.info('Add API Key dialog would open')}
          />
        )}
      </div>
      {!expanded
        ? (
            <div className="group flex items-center justify-between border-t border-t-divider-subtle py-1.5 pr-[11px] pl-2 system-xs-medium text-text-tertiary">
              {provider.configured
                ? (
                    <button
                      type="button"
                      className="flex h-6 items-center rounded-lg border-none bg-transparent pr-1.5 pl-1 text-left hover:bg-components-button-ghost-bg-hover"
                      onClick={onToggleExpand}
                    >
                      Show Models
                      <span aria-hidden className="i-ri-arrow-right-s-line size-4" />
                    </button>
                  )
                : (
                    <div className="flex h-6 items-center pr-1.5 pl-1">
                      <span aria-hidden className="i-ri-information-2-fill mr-1 size-4 text-text-accent" />
                      <span className="system-xs-medium text-text-secondary">Set up api-key or add model to use</span>
                    </div>
                  )}
            </div>
          )
        : (
            <ModelList
              provider={provider}
              models={provider.models}
              onCollapse={onToggleExpand}
              onToggleModel={onToggleModel}
            />
          )}
    </div>
  )
}

function MarketplaceProviderCard({ provider }: { provider: MarketplaceProvider }) {
  return (
    <div className="group relative h-[146px] rounded-xl border-[0.5px] border-components-panel-border bg-components-panel-on-panel-item-bg p-4 pb-3 shadow-xs hover:bg-components-panel-on-panel-item-bg">
      <div className="flex">
        <MarketplaceProviderIcon
          name={provider.name}
          org={provider.org}
          pluginName={provider.pluginName}
          syncedIconId={provider.syncedIconId}
        />
        <div className="ml-3 w-0 grow">
          <div className="flex h-5 items-center system-sm-semibold text-text-secondary">{provider.name}</div>
          <div className="mb-1 flex h-4 items-center">
            <div className="system-xs-regular text-text-tertiary">{provider.org}</div>
            <div className="mx-2 system-xs-regular text-text-quaternary">·</div>
            <div className="flex items-center gap-1 system-xs-regular text-text-tertiary">
              <span className="i-ri-file-copy-line size-3.5" />
              {provider.installCount.toLocaleString()}
            </div>
          </div>
        </div>
      </div>
      <div className="mt-3 line-clamp-2 system-xs-regular text-text-tertiary">{provider.description}</div>
      <div className="mt-3 flex space-x-0.5">
        {provider.tags.map(tag => (
          <span key={tag} className="inline-flex h-[18px] items-center rounded-[5px] border border-divider-deep bg-components-badge-bg-dimm px-[5px] system-2xs-medium-uppercase text-text-tertiary">
            {tag}
          </span>
        ))}
      </div>
      <div className="absolute inset-x-0 bottom-0 hidden items-center gap-2 rounded-xl bg-linear-to-tr from-components-panel-on-panel-item-bg to-background-gradient-mask-transparent p-4 pt-4 group-hover:flex">
        <Button className="grow" variant="primary" onClick={() => toast.success(`Installing ${provider.name}…`)}>
          Install
        </Button>
        <Button className="grow" variant="secondary" onClick={() => toast.info('Opening marketplace detail')}>
          <span className="flex items-center gap-0.5">
            Detail
            <RiArrowRightUpLine className="size-4" />
          </span>
        </Button>
      </div>
    </div>
  )
}

function InstallFromMarketplaceSection({
  searchText,
}: {
  searchText: string
}) {
  const [collapsed, setCollapsed] = useState(false)
  const filtered = useMemo(() => {
    const query = searchText.trim().toLowerCase()
    if (!query)
      return prototypeMarketplaceProviders
    return prototypeMarketplaceProviders.filter(item =>
      item.name.toLowerCase().includes(query)
      || item.description.toLowerCase().includes(query),
    )
  }, [searchText])

  return (
    <div id="model-provider-marketplace" className="flex scroll-mt-4 flex-col gap-2">
      <div className="my-2 h-px bg-divider-subtle" />
      <div className="flex h-5 items-center justify-between">
        <button
          type="button"
          className="flex cursor-pointer items-center gap-1 border-0 bg-transparent p-0 text-left system-md-semibold text-text-primary"
          onClick={() => setCollapsed(current => !current)}
          aria-expanded={!collapsed}
        >
          <span className={cn('i-ri-arrow-down-s-line size-4', collapsed && '-rotate-90')} />
          Install model providers
        </button>
        <div className="flex items-center gap-1">
          <span className="system-sm-regular text-text-tertiary">Discover more in</span>
          <a
            href="https://marketplace.dify.ai"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center system-sm-medium text-text-accent"
          >
            Dify Marketplace
            <span className="i-ri-arrow-right-up-line size-4" />
          </a>
        </div>
      </div>
      {!collapsed && (
        <div className="grid grid-cols-3 gap-2">
          {filtered.map(provider => (
            <MarketplaceProviderCard key={provider.id} provider={provider} />
          ))}
        </div>
      )}
    </div>
  )
}

function UpdateSettingDialogButton() {
  const [open, setOpen] = useState(false)
  const [strategy, setStrategy] = useState('fix-only')

  return (
    <>
      <Button variant="secondary" size="small" className="size-8 px-2" aria-label="Plugin update settings" onClick={() => setOpen(true)}>
        <span className="i-ri-settings-3-line size-4" />
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="w-[480px] max-w-[480px] rounded-2xl p-0">
          <DialogCloseButton className="top-5 right-5" />
          <div className="px-6 pt-6 pr-14 pb-3">
            <DialogTitle className="title-2xl-semi-bold text-text-primary">Plugin auto-update</DialogTitle>
            <p className="mt-1 system-xs-regular text-text-tertiary">Configure automatic updates for model provider plugins.</p>
          </div>
          <div className="px-6 pb-6">
            <Select value={strategy} onValueChange={(value) => { if (value) setStrategy(value) }}>
              <SelectTrigger size="medium">Fix only</SelectTrigger>
              <SelectContent>
                <SelectItem value="disabled"><SelectItemText>Disabled</SelectItemText><SelectItemIndicator /></SelectItem>
                <SelectItem value="fix-only"><SelectItemText>Fix only</SelectItemText><SelectItemIndicator /></SelectItem>
                <SelectItem value="latest"><SelectItemText>Latest</SelectItemText><SelectItemIndicator /></SelectItem>
              </SelectContent>
            </Select>
            <div className="mt-4 flex justify-end gap-2">
              <Button variant="secondary" onClick={() => setOpen(false)}>Cancel</Button>
              <Button variant="primary" onClick={() => { setOpen(false); toast.success('Update settings saved') }}>Save</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

function SystemModelSettingsDialog({
  open,
  onOpenChange,
  values,
  onChange,
  onSave,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  values: Record<SystemModelType, SystemModelOption | null>
  onChange: (type: SystemModelType, option: SystemModelOption | null) => void
  onSave: () => void
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[calc(100dvh-2rem)] w-[480px] max-w-[480px] flex-col overflow-hidden rounded-2xl p-0">
        <DialogCloseButton className="top-5 right-5" />
        <div className="shrink-0 px-6 pt-6 pr-14 pb-3">
          <DialogTitle className="title-2xl-semi-bold text-text-primary">System model settings</DialogTitle>
          <p className="mt-1 system-xs-regular text-text-tertiary">
            Models used for system-level capabilities such as generating conversation titles and knowledge retrieval.
          </p>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-3">
          <div className="flex flex-col gap-4">
            {(Object.keys(systemModelLabels) as SystemModelType[]).map((type) => {
              const { label, tip } = systemModelLabels[type]
              const options = prototypeSystemModelOptions[type]
              const selected = values[type]
              const selectValue = selected ? `${selected.provider}::${selected.model}` : ''

              return (
                <div key={type} className="flex flex-col gap-1">
                  <div className="flex min-h-6 items-center text-[13px] font-medium text-text-secondary">
                    {label}
                    <Popover>
                      <PopoverTrigger
                        openOnHover
                        delay={200}
                        aria-label={tip}
                        className="ml-0.5 inline-flex size-3.5 items-center justify-center border-0 bg-transparent p-0"
                      >
                        <span aria-hidden className="i-ri-question-line size-3.5 text-text-tertiary" />
                      </PopoverTrigger>
                      <PopoverContent popupClassName="w-[261px] px-3 py-2 system-xs-regular text-text-tertiary">{tip}</PopoverContent>
                    </Popover>
                  </div>
                  <Select
                    value={selectValue || null}
                    onValueChange={(nextValue) => {
                      if (!nextValue) {
                        onChange(type, null)
                        return
                      }
                      const option = options.find(item => `${item.provider}::${item.model}` === nextValue)
                      onChange(type, option ?? null)
                    }}
                  >
                    <SelectTrigger size="medium">
                      {selected?.label ?? 'Select model'}
                    </SelectTrigger>
                    <SelectContent>
                      {options.map(option => (
                        <SelectItem key={`${option.provider}::${option.model}`} value={`${option.provider}::${option.model}`}>
                          <SelectItemText>{option.label}</SelectItemText>
                          <SelectItemIndicator />
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )
            })}
          </div>
        </div>
        <div className="flex shrink-0 justify-end gap-2 border-t border-divider-subtle px-6 py-4">
          <Button variant="primary" onClick={onSave}>Save</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export function ModelProviderSettingsView() {
  const [searchText, setSearchText] = useState('')
  const debouncedSearch = useDebouncedValue(searchText, 500)
  const [providers, setProviders] = useState(prototypeModelProviders)
  const [expandedProviderId, setExpandedProviderId] = useState<string | null>(null)
  const [systemModelsOpen, setSystemModelsOpen] = useState(false)
  const [systemModels, setSystemModels] = useState(prototypeDefaultSystemModels)
  const [draftSystemModels, setDraftSystemModels] = useState(prototypeDefaultSystemModels)

  const filteredProviders = useMemo(() => {
    const query = debouncedSearch.trim().toLowerCase()
    if (!query)
      return providers
    return providers.filter(provider =>
      provider.name.toLowerCase().includes(query)
      || provider.supportedTypes.some(type => type.toLowerCase().includes(query)),
    )
  }, [providers, debouncedSearch])

  const configuredProviders = filteredProviders.filter(provider => provider.configured)
  const notConfiguredProviders = filteredProviders.filter(provider => !provider.configured)
  const showSystemModelWarning = Object.values(systemModels).every(value => !value)

  const openSystemModels = () => {
    setDraftSystemModels(systemModels)
    setSystemModelsOpen(true)
  }

  const handleToggleModel = (providerId: string, modelName: string, enabled: boolean) => {
    setProviders(current => current.map((provider) => {
      if (provider.id !== providerId)
        return provider
      return {
        ...provider,
        models: provider.models.map(model => model.name === modelName ? { ...model, enabled } : model),
      }
    }))
  }

  return (
    <div className="relative">
      <div className="sticky top-0 z-10 -mx-6 mb-2 flex items-center justify-between gap-3 bg-components-panel-bg px-6 pb-2">
        <div className="relative w-50 shrink-0">
          <RiSearchLine className="pointer-events-none absolute top-1/2 left-2 size-4 -translate-y-1/2 text-components-input-text-placeholder" />
          <Input
            size="medium"
            className="pr-7 pl-7"
            value={searchText}
            onChange={event => setSearchText(event.target.value)}
            placeholder="Search"
          />
          {!!searchText && (
            <button
              type="button"
              aria-label="Clear"
              className="absolute top-1/2 right-2 flex size-4 -translate-y-1/2 items-center justify-center text-components-input-text-placeholder hover:text-components-input-text-filled"
              onClick={() => setSearchText('')}
            >
              <RiCloseCircleFill className="size-4" />
            </button>
          )}
        </div>
        <div className="flex shrink-0 items-center justify-end gap-2">
          {showSystemModelWarning
            ? (
                <div className="relative inline-flex shrink-0 items-center gap-2 overflow-hidden rounded-lg border-[0.5px] border-components-panel-border bg-components-panel-bg-blur py-1 pr-1 pl-2.5 shadow-xs backdrop-blur-[5px]">
                  <div className="pointer-events-none absolute inset-[-1px] bg-[linear-gradient(119deg,rgba(247,144,9,0.25)_0%,rgba(255,255,255,0)_100%)] opacity-40" />
                  <div className="relative flex shrink-0 items-center gap-1">
                    <span aria-hidden className="i-ri-alert-fill size-4 shrink-0 text-text-warning-secondary" />
                    <span className="shrink-0 system-sm-medium whitespace-nowrap text-text-primary">The system model has not yet been fully configured</span>
                  </div>
                  <Button variant="primary" size="small" className="relative h-6 px-1.5 text-xs font-medium" onClick={openSystemModels}>
                    <span className="mr-0.5 i-ri-brain-2-line size-3.5" />
                    Default Model Settings
                  </Button>
                </div>
              )
            : (
                <Button variant="secondary" size="small" className="h-8 px-3 system-sm-medium" onClick={openSystemModels}>
                  <span className="mr-0.5 i-ri-brain-2-line size-3.5" />
                  Default Model Settings
                </Button>
              )}
          <UpdateSettingDialogButton />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <AiCreditsPanel />
        {configuredProviders.length > 0 && (
          <div className="relative flex flex-col gap-2">
            {configuredProviders.map(provider => (
              <ProviderAddedCard
                key={provider.id}
                provider={provider}
                expanded={expandedProviderId === provider.id}
                onToggleExpand={() => setExpandedProviderId(current => current === provider.id ? null : provider.id)}
                onToggleModel={(modelName, enabled) => handleToggleModel(provider.id, modelName, enabled)}
              />
            ))}
          </div>
        )}
        {notConfiguredProviders.length > 0 && (
          <div className="flex flex-col gap-2 pt-2">
            <div className="flex h-5 items-center system-md-semibold text-text-primary">To be configured</div>
            <div className="relative flex flex-col gap-2">
              {notConfiguredProviders.map(provider => (
                <ProviderAddedCard
                  key={provider.id}
                  provider={provider}
                  expanded={expandedProviderId === provider.id}
                  onToggleExpand={() => setExpandedProviderId(current => current === provider.id ? null : provider.id)}
                  onToggleModel={(modelName, enabled) => handleToggleModel(provider.id, modelName, enabled)}
                />
              ))}
            </div>
          </div>
        )}
        <InstallFromMarketplaceSection searchText={debouncedSearch} />
      </div>

      <SystemModelSettingsDialog
        open={systemModelsOpen}
        onOpenChange={setSystemModelsOpen}
        values={draftSystemModels}
        onChange={(type, option) => setDraftSystemModels(current => ({ ...current, [type]: option }))}
        onSave={() => {
          setSystemModels(draftSystemModels)
          setSystemModelsOpen(false)
          toast.success('System models updated')
        }}
      />
    </div>
  )
}
