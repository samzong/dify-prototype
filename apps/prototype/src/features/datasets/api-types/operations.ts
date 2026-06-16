import type { Uuid } from './common'

export type FsckIssueSeverity = 'info' | 'warning' | 'error' | 'critical'

export type FsckRepairability = 'auto-repairable' | 'manual' | 'not-repairable'

export type FsckTargetType =
  | 'raw-object'
  | 'artifact-object'
  | 'artifact-segment'
  | 'knowledge-path'
  | 'knowledge-node'
  | 'index-projection'
  | 'staged-commit'

export type FsckIssue = {
  code: string
  type: string
  message: string
  severity: FsckIssueSeverity
  repairability: FsckRepairability
  target: {
    type: FsckTargetType
    id?: string
    objectKey?: string
    documentAssetId?: Uuid
    parseArtifactId?: Uuid
    virtualPath?: string
  }
}

export type KnowledgeFsckReport = {
  knowledgeSpaceId: Uuid
  tenantId: string
  scannedAt: string
  cursor?: string
  summary: {
    scanned: number
    info: number
    warning: number
    error: number
    critical: number
    repairable: number
  }
  issues: FsckIssue[]
}

export type FsckResult = KnowledgeFsckReport

export type GcCandidateType =
  | 'staged-object'
  | 'failed-commit'
  | 'artifact-segment'
  | 'parse-artifact'
  | 'index-projection'
  | 'answer-trace'

export type KnowledgeFsGcDryRunReport = {
  dryRunId: string
  knowledgeSpaceId: Uuid
  tenantId: string
  generatedAt: string
  cursor?: string
  summary: {
    candidateCount: number
    estimatedBytes: number
    stagedObjectCount: number
    failedCommitCount: number
  }
  candidates: {
    candidateType: GcCandidateType
    count: number
    estimatedBytes: number
    idempotencyKey: string
    reason: string
    target: FsckIssue['target']
  }[]
}

export type KnowledgeFsStagedObjectGcExecuteResult = {
  tenantId: string
  deleted: number
  skipped: number
  items: {
    idempotencyKey: string
    objectKey: string
    status: 'deleted' | 'skipped-active-lease'
  }[]
}

export type KnowledgeFsLease = {
  id: Uuid
  knowledgeSpaceId: Uuid
  tenantId: string
  sessionId: Uuid
  leaseType: 'read' | 'publish' | 'delete' | 'reindex'
  targetType: 'knowledge-space' | 'document-asset' | 'parse-artifact' | 'knowledge-path' | 'projection' | 'staged-commit'
  targetId: string
  targetVersion?: number
  virtualPath: string
  status: 'active' | 'released' | 'expired' | 'failed'
  acquiredAt: string
  heartbeatAt: string
  expiresAt: string
  updatedAt: string
  metadata?: Record<string, unknown>
}

export type StagedCommitStatus =
  | 'received'
  | 'object-staged'
  | 'object-verified'
  | 'metadata-prepared'
  | 'artifacts-built'
  | 'nodes-built'
  | 'projections-built'
  | 'published'
  | 'failed-retryable'
  | 'failed-terminal'
  | 'canceled'
  | 'gc-pending'
  | 'gc-complete'

export type KnowledgeSpaceStagedCommit = {
  id: Uuid
  knowledgeSpaceId: Uuid
  tenantId: string
  idempotencyKey: string
  operationType: 'document-upload' | 'artifact-segment-write' | 'bulk-reindex' | 'projection-publish'
  status: StagedCommitStatus
  documentAssetId?: Uuid
  parseArtifactId?: Uuid
  rawObjectKey?: string
  publishedObjectKey?: string
  projectionFingerprint?: string
  checksum?: string
  sizeBytes?: number
  errorCode?: string
  errorMessage?: string
  expiresAt?: string
  createdAt: string
  updatedAt: string
}

export type Lease = KnowledgeFsLease

export type StagedCommit = KnowledgeSpaceStagedCommit
