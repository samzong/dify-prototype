export type BadgeTone = 'good' | 'warn' | 'bad' | 'info' | 'neutral' | 'purple'

export type EvidenceState = 'answerable' | 'partial' | 'conflict' | 'not-enough-evidence' | 'permission-limited'

export type DatasetDetailTab = 'overview' | 'sources' | 'documents' | 'evidence' | 'quality' | 'settings' | 'pipeline' | 'develop'

export type DatasetTask = {
  title: string
  detail: string
  tone: BadgeTone
}

export type DatasetBlocker = {
  title: string
  detail: string
  tone: BadgeTone
}

export type DatasetSourceType = 'website-crawl' | 'online-documents' | 'online-drive'

export type SourceFreshnessStrategy = 'realtime' | 'ttl' | 'manual' | 'async'

export type SourceFreshness = {
  strategy: SourceFreshnessStrategy
  staleAfterSeconds?: number
}

export type DatasetPermission = 'only_me' | 'all_team_members' | 'partial_members'

export type DatasetSourceRow = {
  id: string
  name: string
  type: DatasetSourceType
  status: 'Active' | 'Syncing' | 'Error' | 'Disabled'
  freshness: SourceFreshness
  permission: DatasetPermission
  lastSync: string
  endpoint?: string
  providerName?: string
  configSummary?: { label: string; value: string }[]
}

export type DatasetDocumentParserStatus = 'pending' | 'parsed' | 'failed'

export type DatasetDocumentIndexStatus = 'building' | 'ready' | 'stale' | 'failed'

export type DatasetDocumentRow = {
  id: string
  name: string
  source: string
  parserStatus: DatasetDocumentParserStatus
  version: string
  versionNumber?: number
  mimeType?: string
  objectKey?: string
  sha256?: string
  sizeBytes?: number
  sourceId?: string
  metadata?: Record<string, unknown>
  compilationJobId?: string
  indexStatus: DatasetDocumentIndexStatus
  evidenceUse: string
  updatedAt: string
}

export const datasetSourceTypeOptions: { value: DatasetSourceType; label: string; description: string }[] = [
  { value: 'website-crawl', label: 'Website crawl', description: 'Crawl a website or sitemap on a sync schedule.' },
  { value: 'online-documents', label: 'Online documents', description: 'Sync selected pages from document providers.' },
  { value: 'online-drive', label: 'Online drive', description: 'Sync selected files from drive or bucket providers.' },
]

export const sourceFreshnessOptions: { value: SourceFreshnessStrategy; label: string; staleAfterSeconds?: number }[] = [
  { value: 'realtime', label: 'Watch changes' },
  { value: 'ttl', label: 'Scheduled · 24h', staleAfterSeconds: 86400 },
  { value: 'manual', label: 'Manual sync' },
  { value: 'async', label: 'Provider sync' },
]

export const sourceTypeLabels: Record<DatasetSourceType, string> = {
  'website-crawl': 'Website crawl',
  'online-documents': 'Online documents',
  'online-drive': 'Online drive',
}

export const datasetPermissionLabels: Record<DatasetPermission, string> = {
  only_me: 'Only me',
  all_team_members: 'All team members',
  partial_members: 'Partial team members',
}

export const documentParserStatusLabels: Record<DatasetDocumentParserStatus, string> = {
  pending: 'Pending',
  parsed: 'Parsed',
  failed: 'Failed',
}

export const documentIndexStatusLabels: Record<DatasetDocumentIndexStatus, string> = {
  building: 'Building',
  ready: 'Ready',
  stale: 'Stale',
  failed: 'Failed',
}

export const documentStatusFilterOptions = [
  { value: 'all', label: 'All status' },
  { value: 'available', label: 'Available' },
  { value: 'processing', label: 'Processing' },
  { value: 'error', label: 'Error' },
  { value: 'stale', label: 'Stale' },
  { value: 'building', label: 'Building' },
] as const

export const documentSortOptions = [
  { value: 'updated_at', label: 'Updated time' },
  { value: 'name', label: 'Name' },
] as const

export type DatasetEvidenceItem = {
  source: string
  quote: string
  score: string
  retrievalScore: string
  rerankScore: string
  freshness: string
}

export type DatasetTrace = {
  id: string
  query: string
  state: EvidenceState
  mode: string
  meta: string
  failureSource?: string
}

export type RetrievalDepth = 'Fast' | 'Deep' | 'Research'

export type DatasetSettingsConfig = {
  apiAccess: {
    serviceApiEnabled: boolean
    externalApiEnabled: boolean
  }
  defaultRetrieval?: {
    mode: RetrievalDepth
    topK: number
    rerankEnabled: boolean
    scoreThreshold: number
    scoreThresholdEnabled: boolean
    multimodalEnabled?: boolean
  }
  externalRetrieval?: {
    externalApiName: string
    externalKnowledgeId: string
    topK: number
    scoreThreshold: number
    scoreThresholdEnabled: boolean
    scoreHandling: string
  }
  processingAndIndex?: {
    parserPolicy: string
    chunking: string
    embedding: string
    indexStrategy: string
    pipelineNote?: string
  }
  retention?: {
    rawDocumentRetentionDays: number | null
    parseArtifactVersions: number
    answerTraceRetentionDays: number
    evidenceCacheRetentionDays: number
    inactiveProjectionRetentionDays: number
    sessionInactivityMinutes: number
  }
  advanced?: {
    healthCheckSummary: string
    cleanupSummary: string
  }
}

export type DatasetStatusBlock = {
  label: string
  value: string
  note: string
  tone: BadgeTone
}

export type DatasetItem = {
  id: string
  name: string
  description: string
  authorName: string
  editedAt: string
  tags: string[]
  icon: string
  iconBackground: string
  docForm: string
  indexingText: string
  appCount: number
  cornerLabel?: string
  provider?: 'external'
  listHints?: string[]
  type: string
  permission: string
  apiEnabled: boolean
  sourceCount: number
  documentsLabel: string
  indexStatus: string
  evidenceStatus: string
  usageLabel: string
  updatedAt: string
  runtimeMode?: 'rag_pipeline'
  isPublished?: boolean
  statusBlocks: DatasetStatusBlock[]
  tasks: DatasetTask[]
  blockers: DatasetBlocker[]
  sources: DatasetSourceRow[]
  documents: DatasetDocumentRow[]
  evidenceState: EvidenceState
  evidenceItems: DatasetEvidenceItem[]
  missingEvidence: string[]
  conflictingEvidence: string[]
  traces: DatasetTrace[]
  goldenQuestions: string[]
  badCases: string[]
  qualityStats: { label: string; value: string; tone: BadgeTone }[]
  qualityMissingTrend: string
  settingsConfig: DatasetSettingsConfig
  defaultQuery: string
  evidenceTraceId: string
  evidenceFreshness: string
  connectedWorkflows: string[]
}
