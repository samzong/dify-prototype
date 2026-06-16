import type {
  ConflictSeverity,
  ConsistencyClass,
  EvidenceBundleState,
  MissingEvidenceReason,
  QueryMode,
  Uuid,
} from './common'

export type AnswerTraceStepStatus = 'ok' | 'error' | 'skipped'

export type AnswerTraceStep = {
  name: string
  status: AnswerTraceStepStatus
  startedAt: string
  endedAt?: string
  metadata?: Record<string, unknown>
}

export type AnswerTrace = {
  id: Uuid
  knowledgeSpaceId: Uuid
  query: string
  mode: QueryMode
  evidenceBundleId?: Uuid
  steps: AnswerTraceStep[]
  createdAt: string
}

export type EvidenceCitation = {
  documentAssetId: Uuid
  documentVersion: number
  artifactHash?: string
  startOffset?: number
  endOffset?: number
  pageNumber?: number
  sectionPath?: string[]
}

export type EvidenceItemConflict = {
  reason: string
  severity: ConflictSeverity
  withNodeId?: Uuid
}

export type EvidenceScores = {
  retrieval: number
  rerank?: number
  freshness?: number
  final: number
}

export type EvidenceFreshness = {
  status: 'fresh' | 'stale' | 'unknown'
  observedAt?: string
  sourceUpdatedAt?: string
}

export type EvidenceBundleItem = {
  nodeId: Uuid
  text: string
  score: number
  scores: EvidenceScores
  citations: EvidenceCitation[]
  freshness: EvidenceFreshness
  conflicts?: EvidenceItemConflict[]
  metadata?: Record<string, unknown>
}

export type MissingEvidenceItem = {
  text: string
  reason: MissingEvidenceReason
  expectedEvidenceId?: Uuid
  metadata?: Record<string, unknown>
}

export type EvidenceBundle = {
  id: Uuid
  query: string
  state: EvidenceBundleState
  traceId?: Uuid
  items: EvidenceBundleItem[]
  missingEvidence?: MissingEvidenceItem[]
  createdAt: string
}

export type QueryEvidenceVirtualEntryKind = 'directory' | 'resource'

export type QueryEvidenceVirtualEntry = {
  kind: QueryEvidenceVirtualEntryKind
  name: string
  path: string
  metadata: Record<string, unknown>
  resourceType?: 'source' | 'document' | 'node' | 'artifact' | 'evidence' | 'workspace'
  targetId?: string
  version?: number
}

export type QueryEvidenceVirtualTree = {
  path: string
  items: QueryEvidenceVirtualEntry[]
  nextCursor?: string
  truncated: boolean
  consistencyClass?: ConsistencyClass
  preview?: boolean
}

export type QueryRunRequest = {
  knowledgeSpaceId: Uuid
  query: string
  mode?: 'fast' | 'deep' | 'research'
  sessionId?: Uuid
  activeDocumentIds?: Uuid[]
  activeEntityIds?: string[]
}

export type QueryStreamEvent =
  | { type: 'trace-id'; traceId: Uuid }
  | { type: 'step'; step: AnswerTraceStep }
  | { type: 'answer-chunk'; text: string }
  | { type: 'done'; trace: AnswerTrace; bundle: EvidenceBundle }

export type QueryTrace = AnswerTrace
