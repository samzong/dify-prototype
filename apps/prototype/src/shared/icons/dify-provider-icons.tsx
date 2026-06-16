import type { ComponentType } from 'react'
import { cn } from '@langgenius/dify-ui/cn'
import Anthropic from '@/app/components/base/icons/src/public/llm/Anthropic'
import AzureOpenaiService from '@/app/components/base/icons/src/public/llm/AzureOpenaiService'
import Cohere from '@/app/components/base/icons/src/public/llm/Cohere'
import {
  Deepseek,
  Gemini,
  Grok,
  OpenaiSmall,
  Tongyi,
} from '@/app/components/base/icons/src/public/llm'
import { Openai } from '@/app/components/base/icons/src/vender/other'
import Notion from '@/app/components/base/icons/src/public/common/Notion'

export const MARKETPLACE_PLUGIN_ICON_BASE = 'https://marketplace.dify.ai/api/v1/plugins'

export type ModelProviderIconId = 'openai' | 'gemini' | 'xai' | 'deepseek' | 'tongyi'

export type SyncedMarketplaceIconId = 'anthropic' | 'azure-openai' | 'cohere'

type IconComponent = ComponentType<{ className?: string }>

const creditsIconMap: Record<ModelProviderIconId, IconComponent> = {
  openai: OpenaiSmall,
  gemini: Gemini,
  xai: Grok,
  deepseek: Deepseek,
  tongyi: Tongyi,
}

const inlineIconMap: Record<ModelProviderIconId, IconComponent> = {
  openai: OpenaiSmall,
  gemini: Gemini,
  xai: Grok,
  deepseek: Deepseek,
  tongyi: Tongyi,
}

const marketplaceSyncedIconMap: Record<SyncedMarketplaceIconId, IconComponent> = {
  anthropic: Anthropic,
  'azure-openai': AzureOpenaiService,
  cohere: Cohere,
}

export function getMarketplacePluginIconUrl(org: string, pluginName: string) {
  return `${MARKETPLACE_PLUGIN_ICON_BASE}/${org}/${pluginName}/icon`
}

type ModelProviderIconProps = {
  providerId: ModelProviderIconId
  variant: 'card-header' | 'credits' | 'inline'
  className?: string
  title?: string
}

export function ModelProviderIcon({
  providerId,
  variant,
  className,
  title,
}: ModelProviderIconProps) {
  if (variant === 'card-header' && providerId === 'openai') {
    return (
      <div className={className} title={title}>
        <Openai className="h-6 w-auto text-text-inverted-dimmed" />
      </div>
    )
  }

  const Icon = variant === 'credits'
    ? creditsIconMap[providerId]
    : inlineIconMap[providerId]

  return (
    <div className={className} title={title}>
      <Icon
        className={cn(
          variant === 'credits' && 'size-6 rounded-lg',
          variant === 'inline' && 'size-6 shrink-0 rounded-lg',
        )}
      />
    </div>
  )
}

type MarketplaceProviderIconProps = {
  name: string
  syncedIconId?: SyncedMarketplaceIconId
  org?: string
  pluginName?: string
  className?: string
}

export type DataSourceIconId = 'notion' | 'firecrawl'

type DataSourceIconProps = {
  id: DataSourceIconId
  name: string
  org?: string
  pluginName: string
}

const dataSourceIconContainerClass = cn(
  'flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-lg',
  'border-[0.5px] border-divider-regular bg-text-primary-on-surface p-1 shadow-xs backdrop-blur-sm',
)

export function DataSourceIcon({
  id,
  name,
  org = 'langgenius',
  pluginName,
}: DataSourceIconProps) {
  if (id === 'notion') {
    return (
      <div className={dataSourceIconContainerClass} title={name}>
        <Notion className="h-5 w-5 object-contain" />
      </div>
    )
  }

  const iconUrl = getMarketplacePluginIconUrl(org, pluginName)

  return (
    <div className={dataSourceIconContainerClass} title={name}>
      <img
        src={iconUrl}
        alt={name}
        width={20}
        height={20}
        className="h-5 w-5 object-contain"
      />
    </div>
  )
}

export function MarketplaceProviderIcon({
  name,
  syncedIconId,
  org = 'langgenius',
  pluginName,
  className,
}: MarketplaceProviderIconProps) {
  if (syncedIconId) {
    const Icon = marketplaceSyncedIconMap[syncedIconId]
    return (
      <div
        className={cn(
          'relative shrink-0 rounded-md bg-contain bg-center bg-no-repeat',
          'size-10',
          className,
        )}
        title={name}
      >
        <Icon className="size-10 rounded-md" />
      </div>
    )
  }

  const iconUrl = getMarketplacePluginIconUrl(org, pluginName ?? name.toLowerCase().replace(/\s+/g, '_'))

  return (
    <div
      className={cn(
        'relative shrink-0 rounded-md bg-contain bg-center bg-no-repeat',
        'size-10',
        className,
      )}
      style={{ backgroundImage: `url(${iconUrl})` }}
      title={name}
      role="img"
      aria-label={name}
    />
  )
}
