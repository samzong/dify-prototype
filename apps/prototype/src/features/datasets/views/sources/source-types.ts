import type {
  DatasetPermission,
  DatasetSourceRow,
  DatasetSourceType,
  SourceFreshness,
} from '../../fixtures/items'

export type WebsiteCrawlOptions = {
  crawl_sub_pages: boolean
  use_sitemap: boolean
  limit: number | ''
  max_depth: number | ''
  excludes: string
  includes: string
  only_main_content: boolean
}

export type WebsiteCrawlResult = {
  title: string
  source_url: string
  content: string
}

export type WebsiteCrawlStatus = 'idle' | 'running' | 'finished'

export type SourceAddMeta = {
  configSummary?: DatasetSourceRow['configSummary']
}

export type AddSourceDraft = {
  type: DatasetSourceType
  name: string
  endpoint: string
  provider: string
  freshness: SourceFreshness
  permission: DatasetPermission
}
