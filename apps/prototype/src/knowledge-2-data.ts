export type BadgeTone = 'good' | 'warn' | 'bad' | 'info' | 'neutral' | 'purple'

export type EvidenceState = 'answerable' | 'partial' | 'conflict' | 'not-enough-evidence' | 'permission-limited'

export type KnowledgeDetailTab = 'overview' | 'sources' | 'documents' | 'evidence' | 'quality' | 'settings' | 'pipeline'

export type KnowledgeTask = {
  title: string
  detail: string
  tone: BadgeTone
}

export type KnowledgeBlocker = {
  title: string
  detail: string
  tone: BadgeTone
}

export type KnowledgeSourceType = 'website-crawl' | 'online-documents' | 'online-drive'

export type SourceFreshnessStrategy = 'realtime' | 'ttl' | 'manual' | 'async'

export type SourceFreshness = {
  strategy: SourceFreshnessStrategy
  staleAfterSeconds?: number
}

export type DatasetPermission = 'only_me' | 'all_team_members' | 'partial_members'

export type KnowledgeSourceRow = {
  id: string
  name: string
  type: KnowledgeSourceType
  status: 'Active' | 'Syncing' | 'Error' | 'Disabled'
  freshness: SourceFreshness
  permission: DatasetPermission
  lastSync: string
  endpoint?: string
  providerName?: string
  configSummary?: { label: string; value: string }[]
}

export type KnowledgeDocumentParserStatus = 'pending' | 'parsed' | 'failed'

export type KnowledgeDocumentIndexStatus = 'building' | 'ready' | 'stale' | 'failed'

export type KnowledgeDocumentRow = {
  id: string
  name: string
  source: string
  parserStatus: KnowledgeDocumentParserStatus
  version: string
  indexStatus: KnowledgeDocumentIndexStatus
  evidenceUse: string
  updatedAt: string
}

export const knowledgeSourceTypeOptions: { value: KnowledgeSourceType; label: string; description: string }[] = [
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

export const sourceTypeLabels: Record<KnowledgeSourceType, string> = {
  'website-crawl': 'Website crawl',
  'online-documents': 'Online documents',
  'online-drive': 'Online drive',
}

export const datasetPermissionLabels: Record<DatasetPermission, string> = {
  only_me: 'Only me',
  all_team_members: 'All team members',
  partial_members: 'Partial team members',
}

export const documentParserStatusLabels: Record<KnowledgeDocumentParserStatus, string> = {
  pending: 'Pending',
  parsed: 'Parsed',
  failed: 'Failed',
}

export const documentIndexStatusLabels: Record<KnowledgeDocumentIndexStatus, string> = {
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

export type KnowledgeEvidenceItem = {
  source: string
  quote: string
  score: string
  retrievalScore: string
  rerankScore: string
  freshness: string
}

export type KnowledgeTrace = {
  id: string
  query: string
  state: EvidenceState
  mode: string
  meta: string
  failureSource?: string
}

export type RetrievalDepth = 'Fast' | 'Deep' | 'Research'

export type Knowledge2SettingsConfig = {
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

export type KnowledgeStatusBlock = {
  label: string
  value: string
  note: string
  tone: BadgeTone
}

export type Knowledge2Item = {
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
  statusBlocks: KnowledgeStatusBlock[]
  tasks: KnowledgeTask[]
  blockers: KnowledgeBlocker[]
  sources: KnowledgeSourceRow[]
  documents: KnowledgeDocumentRow[]
  evidenceState: EvidenceState
  evidenceItems: KnowledgeEvidenceItem[]
  missingEvidence: string[]
  conflictingEvidence: string[]
  traces: KnowledgeTrace[]
  goldenQuestions: string[]
  badCases: string[]
  qualityStats: { label: string; value: string; tone: BadgeTone }[]
  qualityMissingTrend: string
  commonFailureSources: string[]
  settingsConfig: Knowledge2SettingsConfig
  defaultQuery: string
  evidenceTraceId: string
  evidenceFreshness: string
  connectedWorkflows: string[]
}

export const knowledge2Items: Knowledge2Item[] = [
  {
    id: 'support-handbook',
    name: 'Customer Support Handbook',
    description: 'Policies, escalation playbooks, product support articles, and refund rules used by support workflows.',
    authorName: 'Dify Admin',
    editedAt: 'Edited 3 hours ago',
    tags: ['Support', 'Docs'],
    docForm: 'General',
    indexingText: 'HQ HYBRID',
    appCount: 7,
    listHints: ['3 failed docs'],
    icon: '📙',
    iconBackground: '#FFF4ED',
    type: 'Internal',
    permission: 'Workspace',
    apiEnabled: true,
    sourceCount: 3,
    documentsLabel: '128 / 132',
    indexStatus: 'Ready',
    evidenceStatus: 'Partial',
    usageLabel: '7 apps',
    updatedAt: '3 hours ago',
    statusBlocks: [
      { label: 'Sources', value: '3 connected', note: '1 syncing', tone: 'good' },
      { label: 'Documents', value: '128 / 132', note: '4 failed docs', tone: 'warn' },
      { label: 'Index', value: 'Ready', note: 'Dense + FTS ready', tone: 'good' },
      { label: 'Evidence', value: 'Partial', note: '2 unanswered golden questions', tone: 'warn' },
      { label: 'Usage', value: '7 apps', note: '3 workflows', tone: 'neutral' },
    ],
    tasks: [
      { title: 'Web crawl sync', detail: 'Synced 37 pages from docs.dify.ai', tone: 'good' },
      { title: 'Projection publish', detail: 'Dense + FTS projection ready', tone: 'good' },
    ],
    blockers: [
      { title: 'Missing evidence', detail: 'Refund policy has 2 unanswered golden questions.', tone: 'warn' },
    ],
    sources: [
      { id: 'support-handbook-src-2', name: 'docs.dify.ai', type: 'website-crawl', status: 'Active', freshness: { strategy: 'ttl', staleAfterSeconds: 86400 }, permission: 'all_team_members', lastSync: '6 hours ago', endpoint: 'https://docs.dify.ai', providerName: 'Firecrawl' },
      { id: 'support-handbook-src-3', name: 'Notion support SOP', type: 'online-documents', status: 'Syncing', freshness: { strategy: 'async' }, permission: 'partial_members', lastSync: '12 min ago', providerName: 'Notion' },
      { id: 'support-handbook-src-4', name: 'Escalation archive', type: 'online-drive', status: 'Active', freshness: { strategy: 'async' }, permission: 'all_team_members', lastSync: '2 days ago', endpoint: 's3://support/escalations', providerName: 'Amazon S3' },
    ],
    documents: [
      { id: 'support-handbook-doc-1', name: 'refund-policy.md', source: 'Manual upload', parserStatus: 'parsed', version: 'v3', indexStatus: 'ready', evidenceUse: 'Included', updatedAt: '3 hours ago' },
      { id: 'support-handbook-doc-2', name: 'sso-enterprise.pdf', source: 'Notion support SOP', parserStatus: 'parsed', version: 'v2', indexStatus: 'ready', evidenceUse: 'Included', updatedAt: '12 min ago' },
      { id: 'support-handbook-doc-3', name: 'pricing-legacy.html', source: 'docs.dify.ai', parserStatus: 'parsed', version: 'v1', indexStatus: 'stale', evidenceUse: 'Excluded from Deep', updatedAt: '2 days ago' },
      { id: 'support-handbook-doc-4', name: 'escalation-matrix.xlsx', source: 'Escalation archive', parserStatus: 'failed', version: 'v1', indexStatus: 'failed', evidenceUse: 'Excluded', updatedAt: '2 days ago' },
    ],
    evidenceState: 'partial',
    evidenceItems: [
      { source: 'refund-policy.md', quote: 'Enterprise plans can request refunds within 14 days when no production workspace has been activated.', score: '0.82', retrievalScore: '0.79', rerankScore: '0.82', freshness: 'Synced 3h ago' },
      { source: 'sso-enterprise.pdf', quote: 'SSO setup requires workspace owner approval and an active enterprise contract.', score: '0.76', retrievalScore: '0.74', rerankScore: '0.76', freshness: 'Synced 12m ago' },
    ],
    missingEvidence: ['Need explicit evidence for refund after SSO activation.'],
    conflictingEvidence: [],
    traces: [
      { id: '018f0d60-7a49-7cc2-9c1b-5b36f18f1024', query: 'What is the Enterprise SSO refund policy?', state: 'partial', mode: 'Fast', meta: '3 steps · 890 ms', failureSource: 'refund-policy.md' },
      { id: '018f0d60-7a49-7cc2-9c1b-5b36f18f1019', query: 'When can a workspace owner revoke SSO access?', state: 'answerable', mode: 'Deep', meta: '5 steps · 1.8 s' },
    ],
    goldenQuestions: ['What is the Enterprise SSO refund policy?', 'When can a workspace owner revoke SSO access?'],
    badCases: ['Refund after SSO activation', 'Escalation path for enterprise billing'],
    qualityStats: [
      { label: 'Answerable rate', value: '78%', tone: 'good' },
      { label: 'Conflict trend', value: 'Stable', tone: 'neutral' },
      { label: 'Missing evidence', value: '+2 this week', tone: 'warn' },
    ],
    qualityMissingTrend: '+2 this week',
    commonFailureSources: ['refund-policy.md', 'pricing-legacy.html'],
    settingsConfig: {
      apiAccess: { serviceApiEnabled: true, externalApiEnabled: false },
      defaultRetrieval: {
        mode: 'Fast',
        topK: 8,
        rerankEnabled: true,
        scoreThreshold: 0.5,
        scoreThresholdEnabled: true,
      },
      processingAndIndex: {
        parserPolicy: 'General document parser',
        chunking: 'General',
        embedding: 'text-embedding-3-large',
        indexStrategy: 'Hybrid dense + FTS',
      },
      retention: {
        rawDocumentRetentionDays: null,
        parseArtifactVersions: 5,
        answerTraceRetentionDays: 30,
        evidenceCacheRetentionDays: 7,
        inactiveProjectionRetentionDays: 90,
        sessionInactivityMinutes: 1440,
      },
      advanced: {
        healthCheckSummary: 'All projections healthy · last checked 3 hours ago',
        cleanupSummary: 'No inactive assets pending cleanup',
      },
    },
    defaultQuery: 'What is the Enterprise SSO refund policy?',
    evidenceTraceId: '018f0d60-7a49-7cc2-9c1b-5b36f18f1024',
    evidenceFreshness: 'Sources fresh · index ready',
    connectedWorkflows: ['Support Copilot', 'Refund Assistant', 'Enterprise Onboarding'],
  },
  {
    id: 'docs-crawl',
    name: 'Docs Website Crawl',
    description: 'Long-running website source for public docs, release notes, and reference pages.',
    authorName: 'Morgan Chen',
    editedAt: 'Edited yesterday',
    tags: ['Docs', 'Web'],
    docForm: 'General',
    indexingText: 'HQ VECTOR',
    appCount: 4,
    listHints: ['index rebuild needed', 'conflicting evidence'],
    icon: '🌐',
    iconBackground: '#EEF4FF',
    type: 'Web source',
    permission: 'Editors',
    apiEnabled: true,
    sourceCount: 2,
    documentsLabel: '285 / 340',
    indexStatus: 'Stale',
    evidenceStatus: 'Conflict',
    usageLabel: '4 apps',
    updatedAt: 'yesterday',
    statusBlocks: [
      { label: 'Sources', value: '2 connected', note: '1 sync error', tone: 'warn' },
      { label: 'Documents', value: '285 / 340', note: '55 publish failures', tone: 'bad' },
      { label: 'Index', value: 'Stale', note: 'Rebuild required', tone: 'bad' },
      { label: 'Evidence', value: 'Conflict', note: 'API key rotation mismatch', tone: 'warn' },
      { label: 'Usage', value: '4 apps', note: '2 workflows', tone: 'neutral' },
    ],
    tasks: [
      { title: 'Bulk reindex', detail: 'Projection publish failed on 55 pages', tone: 'bad' },
      { title: 'Web crawl sync', detail: 'Retry scheduled in 20 minutes', tone: 'warn' },
    ],
    blockers: [
      { title: 'Index stale', detail: 'Ready projection is older than the latest source snapshot.', tone: 'bad' },
      { title: 'Conflicting evidence', detail: 'Two docs disagree on API key rotation limits.', tone: 'warn' },
    ],
    sources: [
      { id: 'docs-crawl-src-1', name: 'docs.dify.ai', type: 'website-crawl', status: 'Error', freshness: { strategy: 'ttl', staleAfterSeconds: 86400 }, permission: 'all_team_members', lastSync: 'yesterday', endpoint: 'https://docs.dify.ai', providerName: 'Firecrawl' },
      { id: 'docs-crawl-src-2', name: 'Release notes workspace', type: 'online-documents', status: 'Active', freshness: { strategy: 'async' }, permission: 'partial_members', lastSync: '2 hours ago', providerName: 'Notion' },
    ],
    documents: [
      { id: 'docs-crawl-doc-1', name: 'api-keys.md', source: 'docs.dify.ai', parserStatus: 'parsed', version: 'v4', indexStatus: 'failed', evidenceUse: 'Excluded', updatedAt: 'yesterday' },
      { id: 'docs-crawl-doc-2', name: 'workflow-nodes.md', source: 'docs.dify.ai', parserStatus: 'parsed', version: 'v2', indexStatus: 'stale', evidenceUse: 'Included', updatedAt: 'yesterday' },
      { id: 'docs-crawl-doc-3', name: 'release-2026-06.md', source: 'Release notes workspace', parserStatus: 'parsed', version: 'v1', indexStatus: 'ready', evidenceUse: 'Included', updatedAt: '2 hours ago' },
    ],
    evidenceState: 'conflict',
    evidenceItems: [
      { source: 'api-keys.md', quote: 'API keys rotate every 30 days for enterprise tenants.', score: '0.71', retrievalScore: '0.69', rerankScore: '0.71', freshness: 'Stale · source error' },
      { source: 'security.md', quote: 'API key rotation is workspace-configured and has no fixed default.', score: '0.68', retrievalScore: '0.67', rerankScore: '0.68', freshness: 'Synced 2h ago' },
    ],
    missingEvidence: [],
    conflictingEvidence: ['Rotation policy conflicts across two source documents.'],
    traces: [
      { id: '018f0d60-7a49-7cc2-9c1b-5b36f18f2088', query: 'What is the API key rotation policy for enterprise tenants?', state: 'conflict', mode: 'Deep', meta: '6 steps · 2.4 s', failureSource: 'api-keys.md vs security.md' },
      { id: '018f0d60-7a49-7cc2-9c1b-5b36f18f2071', query: 'How do I rotate API keys?', state: 'not-enough-evidence', mode: 'Fast', meta: '2 steps · 730 ms', failureSource: 'docs.dify.ai sync error' },
    ],
    goldenQuestions: ['What is the default API key rotation policy?'],
    badCases: ['API key rotation limits'],
    qualityStats: [
      { label: 'Answerable rate', value: '61%', tone: 'warn' },
      { label: 'Conflict trend', value: 'Rising', tone: 'bad' },
      { label: 'Missing evidence', value: 'Stable', tone: 'neutral' },
    ],
    qualityMissingTrend: 'Stable',
    commonFailureSources: ['docs.dify.ai', 'api-keys.md'],
    settingsConfig: {
      apiAccess: { serviceApiEnabled: true, externalApiEnabled: false },
      defaultRetrieval: {
        mode: 'Deep',
        topK: 12,
        rerankEnabled: true,
        scoreThreshold: 0.4,
        scoreThresholdEnabled: true,
      },
      processingAndIndex: {
        parserPolicy: 'General document parser',
        chunking: 'General',
        embedding: 'text-embedding-3-large',
        indexStrategy: 'Vector projection',
      },
      retention: {
        rawDocumentRetentionDays: 180,
        parseArtifactVersions: 10,
        answerTraceRetentionDays: 30,
        evidenceCacheRetentionDays: 7,
        inactiveProjectionRetentionDays: 60,
        sessionInactivityMinutes: 1440,
      },
      advanced: {
        healthCheckSummary: '1 stale projection · rebuild recommended',
        cleanupSummary: '55 failed publish artifacts eligible for cleanup',
      },
    },
    defaultQuery: 'What is the API key rotation policy for enterprise tenants?',
    evidenceTraceId: '018f0d60-7a49-7cc2-9c1b-5b36f18f2088',
    evidenceFreshness: 'Source stale · index rebuild needed',
    connectedWorkflows: ['Docs QA Bot', 'Developer Assistant'],
  },
  {
    id: 'partner-api',
    name: 'Partner Knowledge API',
    description: 'External knowledge delegated to partner service, used in implementation assistant workflows.',
    authorName: 'Dify Admin',
    editedAt: 'Edited Jun 7, 2026',
    tags: ['External'],
    docForm: 'External Knowledge Base',
    indexingText: '',
    appCount: 2,
    provider: 'external',
    icon: '🔌',
    iconBackground: '#F0FDF9',
    type: 'External',
    permission: 'Workspace',
    apiEnabled: false,
    sourceCount: 0,
    documentsLabel: 'External',
    indexStatus: 'Delegated',
    evidenceStatus: 'Answerable',
    usageLabel: '2 flows',
    updatedAt: 'Jun 7',
    statusBlocks: [
      { label: 'External Knowledge API', value: 'Partner endpoint', note: 'Realtime', tone: 'good' },
      { label: 'Documents', value: 'External', note: 'Provider-managed', tone: 'neutral' },
      { label: 'Retrieval', value: 'Delegated', note: 'Partner-managed', tone: 'info' },
      { label: 'Evidence', value: 'Answerable', note: 'Score normalization required', tone: 'good' },
      { label: 'Usage', value: '2 flows', note: 'Mixed rerank recommended', tone: 'neutral' },
    ],
    tasks: [
      { title: 'Endpoint check', detail: 'Partner service returned healthy retrieval response', tone: 'good' },
    ],
    blockers: [],
    sources: [],
    documents: [],
    evidenceState: 'answerable',
    evidenceItems: [
      { source: 'Partner API', quote: 'Connector setup requires a tenant-scoped token and signed request header.', score: '0.88', retrievalScore: '0.81', rerankScore: '0.88', freshness: 'Realtime' },
    ],
    missingEvidence: [],
    conflictingEvidence: [],
    traces: [
      { id: '018f0d60-7a49-7cc2-9c1b-5b36f18f3002', query: 'How do I authenticate to the partner endpoint?', state: 'answerable', mode: 'Fast', meta: '2 steps · 540 ms' },
    ],
    goldenQuestions: ['How do I authenticate to the partner endpoint?'],
    badCases: [],
    qualityStats: [
      { label: 'Answerable rate', value: '92%', tone: 'good' },
      { label: 'Conflict trend', value: 'None', tone: 'neutral' },
      { label: 'Missing evidence', value: 'None', tone: 'good' },
    ],
    qualityMissingTrend: 'None',
    commonFailureSources: [],
    settingsConfig: {
      apiAccess: { serviceApiEnabled: false, externalApiEnabled: true },
      externalRetrieval: {
        externalApiName: 'Partner Knowledge Endpoint',
        externalKnowledgeId: 'partner-api',
        topK: 4,
        scoreThreshold: 0.35,
        scoreThresholdEnabled: true,
        scoreHandling: 'Normalize before mixed rerank',
      },
      advanced: {
        healthCheckSummary: 'Partner endpoint healthy · last checked 10 min ago',
        cleanupSummary: 'Delegated retention managed by partner service',
      },
    },
    defaultQuery: 'How do I authenticate to the partner endpoint?',
    evidenceTraceId: '018f0d60-7a49-7cc2-9c1b-5b36f18f3002',
    evidenceFreshness: 'Partner endpoint realtime',
    connectedWorkflows: ['Implementation Assistant', 'Partner Onboarding'],
  },
  {
    id: 'sales-deck',
    name: 'Sales Deck Multimodal',
    description: 'Slides, screenshots, and demo material for sales and solution engineering.',
    authorName: 'Morgan Chen',
    editedAt: 'Edited 20 min ago',
    tags: ['Sales', 'Multimodal'],
    docForm: 'General',
    indexingText: 'HQ MULTIMODAL',
    appCount: 3,
    listHints: ['index building'],
    icon: '📊',
    iconBackground: '#F4F3FF',
    type: 'Multimodal',
    permission: 'Sales',
    apiEnabled: true,
    sourceCount: 3,
    documentsLabel: '86 / 86',
    indexStatus: 'Building',
    evidenceStatus: 'Unknown',
    usageLabel: '3 apps',
    updatedAt: '20 min ago',
    statusBlocks: [
      { label: 'Sources', value: '3 connected', note: 'All active', tone: 'good' },
      { label: 'Documents', value: '86 / 86', note: 'Vision parsing complete', tone: 'good' },
      { label: 'Index', value: 'Building', note: 'Image projection in progress', tone: 'info' },
      { label: 'Evidence', value: 'Unknown', note: 'Awaiting projection', tone: 'neutral' },
      { label: 'Usage', value: '3 apps', note: 'Attachment variable required', tone: 'warn' },
    ],
    tasks: [
      { title: 'Image projection', detail: 'Vision projection building for 86 slide assets', tone: 'info' },
      { title: 'Topic view', detail: 'Materializing by-topic semantic view', tone: 'info' },
    ],
    blockers: [
      { title: 'Workflow caution', detail: 'Attachment variable required for image retrieval.', tone: 'warn' },
    ],
    sources: [
      { id: 'sales-deck-src-1', name: 'Sales drive', type: 'online-drive', status: 'Active', freshness: { strategy: 'async' }, permission: 'partial_members', lastSync: '20 min ago', providerName: 'Google Drive' },
      { id: 'sales-deck-src-2', name: 'Product screenshots', type: 'online-drive', status: 'Active', freshness: { strategy: 'async' }, permission: 'partial_members', lastSync: '1 day ago', providerName: 'Google Drive' },
      { id: 'sales-deck-src-3', name: 'Demo recordings', type: 'online-drive', status: 'Active', freshness: { strategy: 'manual' }, permission: 'partial_members', lastSync: '3 days ago', endpoint: 's3://sales/demo-recordings', providerName: 'Amazon S3' },
    ],
    documents: [
      { id: 'sales-deck-doc-1', name: 'enterprise-deck.pdf', source: 'Sales drive', parserStatus: 'parsed', version: 'v5', indexStatus: 'building', evidenceUse: 'Included', updatedAt: '20 min ago' },
      { id: 'sales-deck-doc-2', name: 'screenshots.zip', source: 'Product screenshots', parserStatus: 'parsed', version: 'v2', indexStatus: 'building', evidenceUse: 'Included', updatedAt: '1 day ago' },
    ],
    evidenceState: 'not-enough-evidence',
    evidenceItems: [
      { source: 'enterprise-deck.pdf', quote: 'The deck references deployment options, but image extraction is not ready yet.', score: '0.42', retrievalScore: '0.51', rerankScore: '0.42', freshness: 'Index building' },
    ],
    missingEvidence: ['Need image evidence from architecture slides.'],
    conflictingEvidence: [],
    traces: [
      { id: '018f0d60-7a49-7cc2-9c1b-5b36f18f4101', query: 'What deployment options are shown in the enterprise deck?', state: 'not-enough-evidence', mode: 'Research', meta: '4 steps · 2.1 s', failureSource: 'enterprise-deck.pdf image projection' },
    ],
    goldenQuestions: ['What deployment options are shown in the enterprise deck?'],
    badCases: ['Architecture slide retrieval'],
    qualityStats: [
      { label: 'Answerable rate', value: 'Pending', tone: 'neutral' },
      { label: 'Conflict trend', value: 'N/A', tone: 'neutral' },
      { label: 'Missing evidence', value: 'Building', tone: 'info' },
    ],
    qualityMissingTrend: 'Building',
    commonFailureSources: ['enterprise-deck.pdf', 'screenshots.zip'],
    settingsConfig: {
      apiAccess: { serviceApiEnabled: true, externalApiEnabled: false },
      defaultRetrieval: {
        mode: 'Research',
        topK: 16,
        rerankEnabled: true,
        scoreThreshold: 0.45,
        scoreThresholdEnabled: false,
        multimodalEnabled: true,
      },
      processingAndIndex: {
        parserPolicy: 'Vision + document parser',
        chunking: 'General',
        embedding: 'multimodal-embedding',
        indexStrategy: 'Hybrid dense + image projection',
      },
      retention: {
        rawDocumentRetentionDays: 365,
        parseArtifactVersions: 3,
        answerTraceRetentionDays: 30,
        evidenceCacheRetentionDays: 7,
        inactiveProjectionRetentionDays: 120,
        sessionInactivityMinutes: 1440,
      },
      advanced: {
        healthCheckSummary: 'Image projection building · health check pending',
        cleanupSummary: 'No cleanup actions until projection completes',
      },
    },
    defaultQuery: 'What deployment options are shown in the enterprise deck?',
    evidenceTraceId: '018f0d60-7a49-7cc2-9c1b-5b36f18f4101',
    evidenceFreshness: 'Awaiting image projection',
    connectedWorkflows: ['Sales Copilot', 'Solution Engineering', 'Demo Assistant'],
  },
  {
    id: 'release-notes',
    name: 'Release Notes Pipeline',
    description: 'A pipeline knowledge base that normalizes changelogs, upgrade notes, and launch briefs.',
    authorName: 'Morgan Chen',
    editedAt: 'Edited yesterday',
    tags: ['Product'],
    docForm: 'Parent-child',
    indexingText: 'HQ VECTOR',
    appCount: 2,
    cornerLabel: 'Pipeline',
    icon: '🧩',
    iconBackground: '#EEF4FF',
    type: 'RAG Pipeline',
    permission: 'Product team',
    apiEnabled: true,
    sourceCount: 2,
    documentsLabel: '39 / 42',
    indexStatus: 'Ready',
    evidenceStatus: 'Answerable',
    usageLabel: '2 apps',
    updatedAt: 'yesterday',
    runtimeMode: 'rag_pipeline',
    isPublished: true,
    statusBlocks: [
      { label: 'Sources', value: '2 connected', note: 'Pipeline-managed', tone: 'good' },
      { label: 'Documents', value: '39 / 42', note: '3 processing', tone: 'warn' },
      { label: 'Index', value: 'Ready', note: 'Pipeline projection', tone: 'good' },
      { label: 'Evidence', value: 'Answerable', note: 'Last test passed', tone: 'good' },
      { label: 'Usage', value: '2 apps', note: '1 workflow', tone: 'neutral' },
    ],
    tasks: [
      { title: 'Pipeline publish', detail: 'Latest pipeline run published successfully', tone: 'good' },
      { title: 'Document import', detail: '3 changelog files queued for processing', tone: 'info' },
    ],
    blockers: [],
    sources: [
      { id: 'release-notes-src-1', name: 'Changelog feed', type: 'online-documents', status: 'Active', freshness: { strategy: 'async' }, permission: 'partial_members', lastSync: '1 hour ago', providerName: 'Notion' },
      { id: 'release-notes-src-2', name: 'Launch briefs', type: 'online-drive', status: 'Active', freshness: { strategy: 'manual' }, permission: 'partial_members', lastSync: 'yesterday', providerName: 'Google Drive' },
    ],
    documents: [
      { id: 'release-notes-doc-1', name: 'changelog-2026-06.md', source: 'Changelog feed', parserStatus: 'parsed', version: 'v2', indexStatus: 'ready', evidenceUse: 'Included', updatedAt: '1 hour ago' },
      { id: 'release-notes-doc-2', name: 'upgrade-guide.md', source: 'Launch briefs', parserStatus: 'parsed', version: 'v1', indexStatus: 'ready', evidenceUse: 'Included', updatedAt: 'yesterday' },
      { id: 'release-notes-doc-3', name: 'beta-notes.md', source: 'Changelog feed', parserStatus: 'pending', version: 'v1', indexStatus: 'building', evidenceUse: 'Pending', updatedAt: '30 min ago' },
    ],
    evidenceState: 'answerable',
    evidenceItems: [
      { source: 'changelog-2026-06.md', quote: 'Workflow nodes now support multimodal retrieval with attachment variables.', score: '0.91', retrievalScore: '0.86', rerankScore: '0.91', freshness: 'Synced 1h ago' },
    ],
    missingEvidence: [],
    conflictingEvidence: [],
    traces: [
      { id: '018f0d60-7a49-7cc2-9c1b-5b36f18f5010', query: 'What changed in the June 2026 release?', state: 'answerable', mode: 'Fast', meta: '2 steps · 620 ms' },
    ],
    goldenQuestions: ['What changed in the June 2026 release?'],
    badCases: [],
    qualityStats: [
      { label: 'Answerable rate', value: '94%', tone: 'good' },
      { label: 'Conflict trend', value: 'None', tone: 'neutral' },
      { label: 'Missing evidence', value: 'None', tone: 'good' },
    ],
    qualityMissingTrend: 'None',
    commonFailureSources: ['beta-notes.md'],
    settingsConfig: {
      apiAccess: { serviceApiEnabled: true, externalApiEnabled: false },
      defaultRetrieval: {
        mode: 'Fast',
        topK: 6,
        rerankEnabled: true,
        scoreThreshold: 0.5,
        scoreThresholdEnabled: true,
      },
      processingAndIndex: {
        parserPolicy: 'Pipeline-managed parser',
        chunking: 'Parent-child',
        embedding: 'text-embedding-3-large',
        indexStrategy: 'Pipeline vector projection',
        pipelineNote: 'Published pipeline',
      },
      retention: {
        rawDocumentRetentionDays: null,
        parseArtifactVersions: 5,
        answerTraceRetentionDays: 30,
        evidenceCacheRetentionDays: 7,
        inactiveProjectionRetentionDays: 90,
        sessionInactivityMinutes: 1440,
      },
      advanced: {
        healthCheckSummary: 'Pipeline projection published · all checks passed',
        cleanupSummary: '3 processing artifacts will expire in 7 days',
      },
    },
    defaultQuery: 'What changed in the June 2026 release?',
    evidenceTraceId: '018f0d60-7a49-7cc2-9c1b-5b36f18f5010',
    evidenceFreshness: 'Pipeline projection published',
    connectedWorkflows: ['Release Digest', 'Product Copilot'],
  },
]

export function itemHasSourceError(item: Knowledge2Item) {
  return item.sources.some(source => source.status === 'Error')
}

export function documentMatchesStatusFilter(
  doc: KnowledgeDocumentRow,
  filter: typeof documentStatusFilterOptions[number]['value'],
) {
  if (filter === 'all')
    return true
  if (filter === 'processing')
    return doc.parserStatus === 'pending' || doc.indexStatus === 'building'
  if (filter === 'error')
    return doc.parserStatus === 'failed' || doc.indexStatus === 'failed'
  if (filter === 'stale')
    return doc.indexStatus === 'stale'
  if (filter === 'building')
    return doc.indexStatus === 'building'
  if (filter === 'available')
    return doc.parserStatus === 'parsed' && doc.indexStatus === 'ready'
  return true
}

export function formatSourceFreshness(freshness: SourceFreshness) {
  if (freshness.strategy === 'ttl') {
    const hours = Math.round((freshness.staleAfterSeconds ?? 0) / 3600)
    return hours > 0 ? `Scheduled · ${hours}h` : 'Scheduled'
  }
  return sourceFreshnessOptions.find(option => option.value === freshness.strategy)?.label ?? freshness.strategy
}

export const evidenceStateLabels: Record<EvidenceState, string> = {
  answerable: 'Answerable',
  partial: 'Partial',
  conflict: 'Conflict',
  'not-enough-evidence': 'Not enough evidence',
  'permission-limited': 'Permission limited',
}

export const evidenceStateTones: Record<EvidenceState, BadgeTone> = {
  answerable: 'good',
  partial: 'warn',
  conflict: 'bad',
  'not-enough-evidence': 'bad',
  'permission-limited': 'warn',
}

export const retrievalDepthOptions = ['Fast', 'Deep', 'Research'] as const

export type RetrievalDepthOption = typeof retrievalDepthOptions[number]
