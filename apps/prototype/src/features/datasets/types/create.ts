import type { DatasetPermission, DatasetSourceType, SourceFreshness } from '../fixtures/items'

export type DatasetCreateMode = 'standard' | 'pipeline' | 'external'

export type DatasetStarterSource = Extract<DatasetSourceType, 'website-crawl' | 'online-documents' | 'online-drive'>

export type DatasetCreateInitialPath = 'empty' | 'source' | 'documents'

export type FirstSourceDraft = {
  type: DatasetStarterSource
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
