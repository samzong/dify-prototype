import {
  RiCloudLine,
  RiDriveLine,
  RiFileTextLine,
  RiFolderCloudLine,
  RiGlobalLine,
  RiGoogleLine,
  RiNotionLine,
  RiPagesLine,
  RiPlugLine,
} from '@remixicon/react'
import {
  datasetSourceTypeOptions,
  sourceFreshnessOptions,
  type DatasetPermission,
  type DatasetSourceType,
  type SourceFreshness,
  type SourceFreshnessStrategy,
} from '../../fixtures/items'
import type { AddSourceDraft, WebsiteCrawlOptions } from './source-types'

export const sourceTypeIcons: Record<DatasetSourceType, React.ComponentType<{ className?: string }>> = {
  'website-crawl': RiGlobalLine,
  'online-documents': RiFileTextLine,
  'online-drive': RiDriveLine,
}

export const addSourceTypeOptions = datasetSourceTypeOptions

export const defaultSourceFreshnessByType: Record<DatasetSourceType, SourceFreshness> = {
  'website-crawl': { strategy: 'ttl', staleAfterSeconds: 86400 },
  'online-documents': { strategy: 'async' },
  'online-drive': { strategy: 'async' },
}

const sourceSyncPolicyStrategiesByType: Record<DatasetSourceType, SourceFreshnessStrategy[]> = {
  'website-crawl': ['ttl', 'manual'],
  'online-documents': ['async', 'manual'],
  'online-drive': ['async', 'ttl', 'manual'],
}

export const sourceSyncPolicyOptions = (type: DatasetSourceType) => sourceSyncPolicyStrategiesByType[type]
  .map(strategy => sourceFreshnessOptions.find(option => option.value === strategy))
  .filter((option): option is (typeof sourceFreshnessOptions)[number] => !!option)

export const defaultSourceFreshness = (type: DatasetSourceType): SourceFreshness => ({ ...defaultSourceFreshnessByType[type] })

export const sourceStatusFilterOptions = [
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

export const sourceProviderOptionsByType: Record<DatasetSourceType, SourceProviderOption[]> = {
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

export const endpointLabels: Record<DatasetSourceType, { label: string; placeholder: string }> = {
  'website-crawl': { label: 'Root URL', placeholder: 'https://docs.example.com' },
  'online-documents': { label: 'Workspace or space', placeholder: 'Support workspace' },
  'online-drive': { label: 'Folder or bucket', placeholder: 'Drive folder or s3://bucket/path' },
}

export const defaultWebsiteCrawlOptions = (): WebsiteCrawlOptions => ({
  crawl_sub_pages: true,
  use_sitemap: true,
  limit: 10,
  max_depth: 2,
  excludes: '',
  includes: '',
  only_main_content: true,
})

export const websiteCrawlProviderDetails: Record<string, {
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

export const defaultDraft = (type: DatasetSourceType): AddSourceDraft => ({
  type,
  name: '',
  endpoint: '',
  provider: sourceProviderOptionsByType[type][0]?.value ?? '',
  freshness: defaultSourceFreshness(type),
  permission: 'all_team_members',
})
