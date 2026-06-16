import type { DataSourceIconId, ModelProviderIconId } from './dify-provider-icons'

export type { DataSourceIconId, ModelProviderIconId } from './dify-provider-icons'

export type MemberRole = 'owner' | 'admin' | 'editor' | 'normal' | 'dataset_operator'

export type WorkspaceMember = {
  id: string
  name: string
  email: string
  role: MemberRole
  avatarInitial: string
  lastActiveLabel: string
  isCurrentUser?: boolean
}

export type PlanUsageItem = {
  iconClassName: string
  name: string
  usage: number
  total: number | 'unlimited'
  unit?: string
  resetInDays?: number
  belowThreshold?: boolean
  isSandboxStorage?: boolean
}

export const prototypeWorkspace = {
  name: 'Samzong Workspace',
  plan: 'sandbox' as const,
  planLabel: 'Sandbox',
  planDescription: 'For individuals and small teams to get started',
}

export const prototypeMembers: WorkspaceMember[] = [
  {
    id: 'member-1',
    name: 'Dify Admin',
    email: 'admin@dify.ai',
    role: 'owner',
    avatarInitial: 'A',
    lastActiveLabel: 'Just now',
    isCurrentUser: true,
  },
  {
    id: 'member-2',
    name: 'Morgan Chen',
    email: 'morgan@example.com',
    role: 'editor',
    avatarInitial: 'M',
    lastActiveLabel: '2 days ago',
  },
  {
    id: 'member-3',
    name: 'Taylor Brooks',
    email: 'taylor@example.com',
    role: 'normal',
    avatarInitial: 'T',
    lastActiveLabel: 'Jun 6, 2026',
  },
]

export const sandboxPlanUsage: PlanUsageItem[] = [
  { iconClassName: 'i-ri-apps-2-line', name: 'Build Apps', usage: 3, total: 10 },
  { iconClassName: 'i-ri-group-line', name: 'Team members', usage: 1, total: 1 },
  { iconClassName: 'i-ri-book-2-line', name: 'Documents upload quota', usage: 12, total: 50 },
  {
    iconClassName: 'i-ri-database-2-line',
    name: 'Vector space',
    usage: 18,
    total: 50,
    unit: 'MB',
    belowThreshold: true,
    isSandboxStorage: true,
  },
  { iconClassName: 'i-ri-file-edit-line', name: 'Annotation quota', usage: 0, total: 10 },
  { iconClassName: 'i-ri-flashlight-line', name: 'Trigger events', usage: 42, total: 200, resetInDays: 14 },
  { iconClassName: 'i-ri-code-box-line', name: 'API rate limit', usage: 18, total: 50, resetInDays: 14 },
]

export const languageOptions = [
  { value: 'en-US', name: 'English (United States)' },
  { value: 'zh-Hans', name: '简体中文' },
  { value: 'zh-Hant', name: '繁體中文' },
  { value: 'ja-JP', name: '日本語' },
  { value: 'ko-KR', name: '한국어' },
  { value: 'de-DE', name: 'Deutsch' },
  { value: 'fr-FR', name: 'Français' },
]

export const timezoneOptions = [
  { value: 'America/Los_Angeles', name: 'UTC-08:00 Pacific Time' },
  { value: 'America/New_York', name: 'UTC-05:00 Eastern Time' },
  { value: 'Europe/London', name: 'UTC+00:00 London' },
  { value: 'Asia/Shanghai', name: 'UTC+08:00 Shanghai' },
  { value: 'Asia/Tokyo', name: 'UTC+09:00 Tokyo' },
]

export const memberRoleLabels: Record<MemberRole, string> = {
  owner: 'Owner',
  admin: 'Admin',
  editor: 'Editor',
  normal: 'Normal',
  dataset_operator: 'Dataset Operator',
}

export const prototypeUser = {
  name: 'Samzong',
  email: 'samzong@dify.ai',
  avatar: 'https://github.com/samzong.png',
}

export type ModelTypeBadge = 'LLM' | 'TEXT EMBEDDING' | 'RERANK' | 'SPEECH2TEXT' | 'MODERATION' | 'TTS'

export type CredentialVariant = 'credits-active' | 'api-required-add'

export type PrototypeModelItem = {
  name: string
  modelType: string
  enabled: boolean
}

export type PrototypeModelProvider = {
  id: ModelProviderIconId
  name: string
  version: string
  configured: boolean
  credentialVariant: CredentialVariant
  supportedTypes: ModelTypeBadge[]
  backgroundClass: string
  models: PrototypeModelItem[]
}

export const prototypeAiCredits = {
  credits: 200,
  resetDate: '2026-07-01',
  trialProviderIds: ['openai', 'gemini', 'xai'] as ModelProviderIconId[],
}

export const prototypeModelProviders: PrototypeModelProvider[] = [
  {
    id: 'openai',
    name: 'OpenAI',
    version: '0.4.2',
    configured: true,
    credentialVariant: 'credits-active',
    supportedTypes: ['LLM', 'TEXT EMBEDDING', 'SPEECH2TEXT', 'MODERATION', 'TTS'],
    backgroundClass: 'bg-third-party-model-bg-openai',
    models: [
      { name: 'gpt-4o', modelType: 'LLM', enabled: true },
      { name: 'gpt-4o-mini', modelType: 'LLM', enabled: true },
      { name: 'gpt-4.1', modelType: 'LLM', enabled: true },
      { name: 'text-embedding-3-large', modelType: 'TEXT EMBEDDING', enabled: true },
      { name: 'whisper-1', modelType: 'SPEECH2TEXT', enabled: true },
      { name: 'tts-1-hd', modelType: 'TTS', enabled: false },
    ],
  },
  {
    id: 'gemini',
    name: 'Gemini',
    version: '0.4.2',
    configured: true,
    credentialVariant: 'credits-active',
    supportedTypes: ['LLM', 'TEXT EMBEDDING', 'SPEECH2TEXT', 'MODERATION', 'TTS'],
    backgroundClass: 'bg-third-party-model-bg-default',
    models: [
      { name: 'gemini-2.5-pro', modelType: 'LLM', enabled: true },
      { name: 'gemini-2.0-flash', modelType: 'LLM', enabled: true },
      { name: 'text-embedding-004', modelType: 'TEXT EMBEDDING', enabled: true },
    ],
  },
  {
    id: 'xai',
    name: 'xAI',
    version: '0.4.2',
    configured: true,
    credentialVariant: 'credits-active',
    supportedTypes: ['LLM'],
    backgroundClass: 'bg-third-party-model-bg-default',
    models: [
      { name: 'grok-3', modelType: 'LLM', enabled: true },
      { name: 'grok-3-mini', modelType: 'LLM', enabled: true },
    ],
  },
  {
    id: 'deepseek',
    name: 'deepseek',
    version: '0.4.1',
    configured: false,
    credentialVariant: 'api-required-add',
    supportedTypes: ['LLM', 'TEXT EMBEDDING'],
    backgroundClass: 'bg-third-party-model-bg-default',
    models: [],
  },
  {
    id: 'tongyi',
    name: 'Tongyi',
    version: '0.4.0',
    configured: false,
    credentialVariant: 'api-required-add',
    supportedTypes: ['LLM', 'TEXT EMBEDDING', 'RERANK', 'SPEECH2TEXT', 'TTS'],
    backgroundClass: 'bg-third-party-model-bg-default',
    models: [],
  },
]

export type MarketplaceProvider = {
  id: string
  name: string
  org: string
  pluginName: string
  installCount: number
  description: string
  tags: string[]
  syncedIconId?: 'anthropic' | 'azure-openai' | 'cohere'
}

export const prototypeMarketplaceProviders: MarketplaceProvider[] = [
  {
    id: 'anthropic',
    name: 'Anthropic',
    org: 'langgenius',
    pluginName: 'anthropic',
    installCount: 155844,
    description: "Anthropic's powerful models.",
    tags: ['LLM'],
    syncedIconId: 'anthropic',
  },
  {
    id: 'bedrock',
    name: 'Amazon Bedrock',
    org: 'langgenius',
    pluginName: 'bedrock',
    installCount: 42108,
    description: 'The models of Amazon Bedrock.',
    tags: ['LLM', 'TEXT EMBEDDING'],
  },
  {
    id: 'azure',
    name: 'Azure OpenAI Service Model',
    org: 'langgenius',
    pluginName: 'azure_openai',
    installCount: 38902,
    description: 'Azure OpenAI Service models.',
    tags: ['LLM', 'TEXT EMBEDDING', 'SPEECH2TEXT', 'TTS'],
    syncedIconId: 'azure-openai',
  },
  {
    id: 'cohere',
    name: 'Cohere',
    org: 'langgenius',
    pluginName: 'cohere',
    installCount: 28441,
    description: 'Cohere models for generation and reranking.',
    tags: ['LLM', 'RERANK', 'TEXT EMBEDDING'],
    syncedIconId: 'cohere',
  },
  {
    id: 'mistral',
    name: 'Mistral',
    org: 'langgenius',
    pluginName: 'mistral',
    installCount: 19877,
    description: 'Mistral family models.',
    tags: ['LLM'],
  },
  {
    id: 'vertex',
    name: 'Google Cloud Vertex AI',
    org: 'langgenius',
    pluginName: 'vertex_ai',
    installCount: 17302,
    description: 'Vertex AI hosted models.',
    tags: ['LLM', 'TEXT EMBEDDING'],
  },
]

export type PrototypeDataSource = {
  id: DataSourceIconId
  name: string
  org: string
  pluginName: string
  version: string
  description: string
  configured: boolean
}

export const prototypeDataSources: PrototypeDataSource[] = [
  {
    id: 'notion',
    name: 'Notion',
    org: 'langgenius',
    pluginName: 'notion',
    version: '0.3.1',
    description: 'Import pages from Notion workspaces.',
    configured: true,
  },
  {
    id: 'firecrawl',
    name: 'Firecrawl',
    org: 'langgenius',
    pluginName: 'firecrawl',
    version: '0.2.4',
    description: 'Crawl websites into datasource documents.',
    configured: false,
  },
]

export type PrototypeApiExtension = {
  id: string
  name: string
  endpoint: string
}

export const prototypeApiExtensions: PrototypeApiExtension[] = [
  {
    id: 'ext-1',
    name: 'External moderation',
    endpoint: 'https://api.example.com/moderation',
  },
]

export type SystemModelType = 'reasoning' | 'embedding' | 'rerank' | 'speech2text' | 'tts'

export type SystemModelOption = {
  provider: string
  model: string
  label: string
}

export const prototypeSystemModelOptions: Record<SystemModelType, SystemModelOption[]> = {
  reasoning: [
    { provider: 'OpenAI', model: 'gpt-4o', label: 'gpt-4o' },
    { provider: 'Gemini', model: 'gemini-2.5-pro', label: 'gemini-2.5-pro' },
    { provider: 'xAI', model: 'grok-3', label: 'grok-3' },
  ],
  embedding: [
    { provider: 'OpenAI', model: 'text-embedding-3-large', label: 'text-embedding-3-large' },
    { provider: 'Gemini', model: 'text-embedding-004', label: 'text-embedding-004' },
  ],
  rerank: [
    { provider: 'Cohere', model: 'rerank-english-v3.0', label: 'rerank-english-v3.0' },
  ],
  speech2text: [
    { provider: 'OpenAI', model: 'whisper-1', label: 'whisper-1' },
  ],
  tts: [
    { provider: 'OpenAI', model: 'tts-1-hd', label: 'tts-1-hd' },
    { provider: 'OpenAI', model: 'tts-1', label: 'tts-1' },
  ],
}

export const prototypeDefaultSystemModels: Record<SystemModelType, SystemModelOption | null> = {
  reasoning: null,
  embedding: null,
  rerank: null,
  speech2text: null,
  tts: null,
}
