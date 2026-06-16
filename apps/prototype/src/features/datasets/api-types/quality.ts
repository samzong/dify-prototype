import type { Uuid } from './common'

export type GoldenQuestion = {
  id: Uuid
  knowledgeSpaceId: Uuid
  question: string
  expectedEvidenceIds?: string[]
  tags?: string[]
  metadata?: Record<string, unknown>
  createdAt: string
  updatedAt: string
}

export type GoldenQuestionList = {
  items: GoldenQuestion[]
  nextCursor?: string
}

export type ProductionBadCase = GoldenQuestion & {
  traceIds: string[]
}

export type RetentionPolicyScope = 'tenant' | 'knowledge_space'

export type RetentionPolicy = {
  id: string
  tenantId: string
  knowledgeSpaceId: Uuid | null
  scope: RetentionPolicyScope
  parseArtifactVersions: number
  rawDocumentRetentionDays: number | null
  answerTraceRetentionDays: number
  evidenceCacheRetentionDays: number
  inactiveProjectionRetentionDays: number
  sessionInactivityMinutes: number
  createdAt: string
  updatedAt: string
}
