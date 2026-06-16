import type { ConsistencyClass, Uuid } from './common'

export type KnowledgeSpace = {
  id: Uuid
  name: string
  slug: string
  tenantId: string
  description?: string
  createdAt: string
  updatedAt: string
}

export type KnowledgeSpaceList = {
  items: KnowledgeSpace[]
  nextCursor?: string
}

export type KnowledgeSpaceManifest = {
  id: Uuid
  knowledgeSpaceId: Uuid
  tenantId: string
  manifestVersion: number
  minClientVersion: string
  nodeSchemaVersion: number
  objectKeyPrefix: string
  parserPolicyVersion: string
  projectionSetVersion: string
  metadataDialect: 'portable' | 'postgres' | 'tidb'
  storageProvider: 'memory-dev' | 'r2' | 's3-compatible'
  consistencyPolicy: {
    defaultClass: ConsistencyClass
    snapshotTtlSeconds: number
    cacheTtlSeconds?: number
  }
  encryptionPolicy: {
    strategy: 'provider-managed' | 'customer-managed' | 'none'
    keyRef?: string
  }
  quotaPolicy: {
    maxNodeCount?: number | null
    maxRawDocumentBytes?: number | null
    maxArtifactBytes?: number | null
    providerBudgets?: Record<string, unknown>
  }
  retentionPolicy: {
    artifactVersionsToKeep: number
    failedCommitRetentionDays: number
    traceRetentionDays: number
  }
  metadata?: Record<string, unknown>
  createdAt: string
  updatedAt: string
}

export type ProjectionSummary = {
  total: number
  ready: number
  building: number
  stale: number
  failed: number
}

export type KnowledgeSpaceStats = {
  knowledgeSpaceId: Uuid
  tenantId: string
  generatedAt: string
  window: {
    start: string
    end: string
    minutes: number
  }
  storage: {
    documentCount: number
    rawDocumentBytes: number
  }
  projections: {
    projectionVersion: number
    denseVector: ProjectionSummary
    fts: ProjectionSummary
    graph: ProjectionSummary
    metadata: ProjectionSummary
  }
  commits: {
    sampled: number
    failedRetryable: number
    failedTerminal: number
    truncated: boolean
  }
  cache: {
    available: boolean
    entries: number
    totalBytes: number
  }
  metrics: {
    available: boolean
    reason?: string
  }
  runtime: {
    activeLeaseSampleCount: number
    activeSessionSampleCount: number
    truncated: boolean
  }
}

export type KnowledgeSpaceStatus = {
  knowledgeSpaceId: Uuid
  tenantId: string
  generatedAt: string
  manifest: {
    manifestVersion: number
    consistencyClass: ConsistencyClass
    metadataDialect: 'portable' | 'postgres' | 'tidb'
    objectKeyPrefix: string
    storageProvider: 'memory-dev' | 'r2' | 's3-compatible'
  }
  storage: {
    healthy: boolean
    provider: 'memory-dev' | 'r2' | 's3-compatible'
    objectStorageKind: 'r2' | 's3-compatible' | 'local' | 'memory'
  }
  parser: {
    kind: 'native-html' | 'native-markdown' | 'native-structured' | 'unstructured'
    policyVersion: string
  }
  index: {
    nodeSchemaVersion: number
    projectionSetVersion: string
    projectionVersion: number
    summaries: {
      denseVector: ProjectionSummary
      fts: ProjectionSummary
      graph: ProjectionSummary
      metadata: ProjectionSummary
    }
  }
  activeLeases: {
    count: number
    truncated: boolean
    items: {
      id: Uuid
      leaseType: 'read' | 'publish' | 'delete' | 'reindex'
      targetType: 'knowledge-space' | 'document-asset' | 'parse-artifact' | 'knowledge-path' | 'projection' | 'staged-commit'
      virtualPath: string
      expiresAt: string
    }[]
  }
  activeSessions: {
    count: number
    truncated: boolean
    items: {
      id: Uuid
      subjectId: string
      clientKind: 'api' | 'mcp' | 'worker' | 'admin'
      consistencyClass: ConsistencyClass
      heartbeatAt: string
      expiresAt: string
    }[]
  }
  failedCommits: {
    count: number
    truncated: boolean
    items: {
      id: Uuid
      status: 'failed-retryable' | 'failed-terminal'
      errorCode?: string
      updatedAt: string
      expiresAt?: string
    }[]
  }
}
