import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@langgenius/dify-ui/dropdown-menu'
import { RiMoreFill } from '@remixicon/react'
import type { DatasetSourceRow } from '../../fixtures/items'
import { sourceProviderOptionsByType } from './source-options'
import type { WebsiteCrawlOptions, WebsiteCrawlResult } from './source-types'

export function parseWebsiteUrl(value: string) {
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

export function buildWebsiteCrawlResults(url: URL, limit: number, provider: string): WebsiteCrawlResult[] {
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

export function buildWebsiteConfigSummary({
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

export function SourceRowActions({
  source,
  onSync,
  onRetry,
  onToggleDisabled,
  onOpen,
}: {
  source: DatasetSourceRow
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

export function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <div className="mb-1 system-sm-medium text-text-secondary">{label}</div>
      {children}
    </label>
  )
}

export function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-lg border border-divider-subtle bg-background-default-subtle px-3 py-2">
      <span className="system-xs-medium text-text-tertiary">{label}</span>
      <span className="system-sm-regular text-text-secondary">{value}</span>
    </div>
  )
}
