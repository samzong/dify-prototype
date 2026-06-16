import type {
  AnswerTrace,
  DocumentAsset,
  DocumentCompilationJob,
  BulkOperationProgress,
  EvidenceBundle,
  GoldenQuestion,
  KnowledgeFsLease,
  KnowledgeFsckReport,
  KnowledgeFsGcDryRunReport,
  KnowledgeSpace,
  KnowledgeSpaceManifest,
  KnowledgeSpaceStagedCommit,
  KnowledgeSpaceStats,
  KnowledgeSpaceStatus,
  ParseArtifact,
  ProductionBadCase,
  QueryEvidenceVirtualTree,
  ResearchTaskJob,
  RetentionPolicy,
} from '../../api-types'
import type { KnowledgeScenarioId } from '../../api-types'
import {
  isoAt,
  epochAt,
  PROTOTYPE_DOCUMENT_IDS,
  PROTOTYPE_JOB_IDS,
  PROTOTYPE_SPACE_IDS,
  PROTOTYPE_TENANT_ID,
  PROTOTYPE_TRACE_IDS,
} from './ids'

export type KnowledgeScenarioBundle = {
  id: KnowledgeScenarioId
  label: string
  spaces: KnowledgeSpace[]
  documentsBySpaceId: Record<string, DocumentAsset[]>
  manifestsBySpaceId: Record<string, KnowledgeSpaceManifest>
  statusBySpaceId: Record<string, KnowledgeSpaceStatus>
  statsBySpaceId: Record<string, KnowledgeSpaceStats>
  jobs: Record<string, DocumentCompilationJob>
  bulkJobs: Record<string, BulkOperationProgress>
  parseArtifacts: Record<string, ParseArtifact>
  traces: Record<string, AnswerTrace>
  evidenceBundles: Record<string, EvidenceBundle>
  evidenceTrees: Record<string, QueryEvidenceVirtualTree>
  conflictTrees: Record<string, QueryEvidenceVirtualTree>
  missingTrees: Record<string, QueryEvidenceVirtualTree>
  goldenQuestionsBySpaceId: Record<string, GoldenQuestion[]>
  badCasesBySpaceId: Record<string, ProductionBadCase[]>
  fsckBySpaceId: Record<string, KnowledgeFsckReport>
  gcDryRunBySpaceId: Record<string, KnowledgeFsGcDryRunReport>
  leasesBySpaceId: Record<string, KnowledgeFsLease[]>
  stagedCommitsBySpaceId: Record<string, KnowledgeSpaceStagedCommit[]>
  retentionPolicies: RetentionPolicy[]
  researchTasks: Record<string, ResearchTaskJob>
}

function projectionSummary(ready: number, building = 0, stale = 0, failed = 0) {
  const total = ready + building + stale + failed
  return { total, ready, building, stale, failed }
}

function baseManifest(spaceId: string, name: string): KnowledgeSpaceManifest {
  const slug = name.toLowerCase().replace(/\s+/g, '-')
  return {
    id: `${spaceId.slice(0, 8)}-manifest`,
    knowledgeSpaceId: spaceId,
    tenantId: PROTOTYPE_TENANT_ID,
    manifestVersion: 3,
    minClientVersion: '0.1.0',
    nodeSchemaVersion: 2,
    objectKeyPrefix: `tenants/${PROTOTYPE_TENANT_ID}/spaces/${slug}`,
    parserPolicyVersion: 'parser-v2',
    projectionSetVersion: 'proj-set-v1',
    metadataDialect: 'portable',
    storageProvider: 'memory-dev',
    consistencyPolicy: {
      defaultClass: 'path-consistent',
      snapshotTtlSeconds: 300,
    },
    encryptionPolicy: { strategy: 'provider-managed' },
    quotaPolicy: {
      maxNodeCount: 50000,
      maxRawDocumentBytes: 5368709120,
    },
    retentionPolicy: {
      artifactVersionsToKeep: 3,
      failedCommitRetentionDays: 7,
      traceRetentionDays: 30,
    },
    createdAt: isoAt(86400000 * 30),
    updatedAt: isoAt(3600000),
  }
}

function baseStatus(spaceId: string): KnowledgeSpaceStatus {
  return {
    knowledgeSpaceId: spaceId,
    tenantId: PROTOTYPE_TENANT_ID,
    generatedAt: isoAt(),
    manifest: {
      manifestVersion: 3,
      consistencyClass: 'path-consistent',
      metadataDialect: 'portable',
      objectKeyPrefix: `tenants/${PROTOTYPE_TENANT_ID}/spaces/${spaceId}`,
      storageProvider: 'memory-dev',
    },
    storage: {
      healthy: true,
      provider: 'memory-dev',
      objectStorageKind: 'memory',
    },
    parser: {
      kind: 'native-markdown',
      policyVersion: 'parser-v2',
    },
    index: {
      nodeSchemaVersion: 2,
      projectionSetVersion: 'proj-set-v1',
      projectionVersion: 4,
      summaries: {
        denseVector: projectionSummary(120, 2, 1, 1),
        fts: projectionSummary(118, 1, 2, 0),
        graph: projectionSummary(96, 0, 0, 0),
        metadata: projectionSummary(120, 0, 1, 0),
      },
    },
    activeLeases: { count: 1, truncated: false, items: [] },
    activeSessions: { count: 2, truncated: false, items: [] },
    failedCommits: { count: 0, truncated: false, items: [] },
  }
}

function baseStats(spaceId: string, documentCount: number): KnowledgeSpaceStats {
  return {
    knowledgeSpaceId: spaceId,
    tenantId: PROTOTYPE_TENANT_ID,
    generatedAt: isoAt(),
    window: {
      start: isoAt(3600000),
      end: isoAt(),
      minutes: 60,
    },
    storage: {
      documentCount,
      rawDocumentBytes: documentCount * 245760,
    },
    projections: {
      projectionVersion: 4,
      denseVector: projectionSummary(120, 2, 1, 1),
      fts: projectionSummary(118, 1, 2, 0),
      graph: projectionSummary(96, 0, 0, 0),
      metadata: projectionSummary(120, 0, 1, 0),
    },
    commits: {
      sampled: 12,
      failedRetryable: 1,
      failedTerminal: 0,
      truncated: false,
    },
    cache: { available: true, entries: 48, totalBytes: 1048576 },
    metrics: { available: true },
    runtime: {
      activeLeaseSampleCount: 1,
      activeSessionSampleCount: 2,
      truncated: false,
    },
  }
}

function supportHandbookDocuments(): DocumentAsset[] {
  const spaceId = PROTOTYPE_SPACE_IDS.supportHandbook
  return [
    {
      id: PROTOTYPE_DOCUMENT_IDS.refundPolicy,
      knowledgeSpaceId: spaceId,
      filename: 'refund-policy.md',
      mimeType: 'text/markdown',
      objectKey: `tenants/${PROTOTYPE_TENANT_ID}/raw/refund-policy.md`,
      sha256: 'a'.repeat(64),
      sizeBytes: 18432,
      parserStatus: 'parsed',
      version: 3,
      metadata: { department: 'Support' },
      createdAt: isoAt(86400000),
      updatedAt: isoAt(3600000 * 3),
    },
    {
      id: PROTOTYPE_DOCUMENT_IDS.ssoEnterprise,
      knowledgeSpaceId: spaceId,
      filename: 'sso-enterprise.pdf',
      mimeType: 'application/pdf',
      objectKey: `tenants/${PROTOTYPE_TENANT_ID}/raw/sso-enterprise.pdf`,
      sha256: 'b'.repeat(64),
      sizeBytes: 524288,
      parserStatus: 'parsed',
      version: 2,
      sourceId: 'c3000001-0001-4001-8001-000000000001',
      createdAt: isoAt(86400000 * 2),
      updatedAt: isoAt(720000),
    },
    {
      id: PROTOTYPE_DOCUMENT_IDS.pricingLegacy,
      knowledgeSpaceId: spaceId,
      filename: 'pricing-legacy.html',
      mimeType: 'text/html',
      objectKey: `tenants/${PROTOTYPE_TENANT_ID}/raw/pricing-legacy.html`,
      sha256: 'c'.repeat(64),
      sizeBytes: 65536,
      parserStatus: 'parsed',
      version: 1,
      createdAt: isoAt(86400000 * 5),
      updatedAt: isoAt(86400000 * 2),
    },
    {
      id: PROTOTYPE_DOCUMENT_IDS.escalationMatrix,
      knowledgeSpaceId: spaceId,
      filename: 'escalation-matrix.xlsx',
      mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      objectKey: `tenants/${PROTOTYPE_TENANT_ID}/raw/escalation-matrix.xlsx`,
      sha256: 'd'.repeat(64),
      sizeBytes: 98304,
      parserStatus: 'failed',
      version: 1,
      createdAt: isoAt(86400000 * 4),
      updatedAt: isoAt(86400000 * 2),
    },
  ]
}

function supportHandbookTracePartial(): AnswerTrace {
  return {
    id: PROTOTYPE_TRACE_IDS.partialRefund,
    knowledgeSpaceId: PROTOTYPE_SPACE_IDS.supportHandbook,
    query: 'What is the Enterprise SSO refund policy?',
    mode: 'fast',
    evidenceBundleId: 'e5000001-0001-4001-8001-000000000001',
    createdAt: isoAt(1800000),
    steps: [
      { name: 'retrieval', status: 'ok', startedAt: isoAt(1800500), endedAt: isoAt(1800400) },
      { name: 'rerank', status: 'ok', startedAt: isoAt(1800400), endedAt: isoAt(1800300) },
      { name: 'generation', status: 'ok', startedAt: isoAt(1800300), endedAt: isoAt(1800000) },
    ],
  }
}

function supportHandbookEvidenceBundlePartial(): EvidenceBundle {
  return {
    id: 'e5000001-0001-4001-8001-000000000001',
    query: 'What is the Enterprise SSO refund policy?',
    state: 'partial',
    traceId: PROTOTYPE_TRACE_IDS.partialRefund,
    createdAt: isoAt(1800000),
    items: [
      {
        nodeId: 'n6000001-0001-4001-8001-000000000001',
        text: 'Enterprise plans can request refunds within 14 days when no production workspace has been activated.',
        score: 0.82,
        scores: { retrieval: 0.79, rerank: 0.82, final: 0.82 },
        citations: [{
          documentAssetId: PROTOTYPE_DOCUMENT_IDS.refundPolicy,
          documentVersion: 3,
          startOffset: 120,
          endOffset: 220,
        }],
        freshness: { status: 'fresh', sourceUpdatedAt: isoAt(3600000 * 3) },
      },
      {
        nodeId: 'n6000002-0002-4002-8002-000000000002',
        text: 'SSO setup requires workspace owner approval and an active enterprise contract.',
        score: 0.76,
        scores: { retrieval: 0.74, rerank: 0.76, final: 0.76 },
        citations: [{
          documentAssetId: PROTOTYPE_DOCUMENT_IDS.ssoEnterprise,
          documentVersion: 2,
          pageNumber: 2,
        }],
        freshness: { status: 'fresh', sourceUpdatedAt: isoAt(720000) },
      },
    ],
    missingEvidence: [{
      text: 'Need explicit evidence for refund after SSO activation.',
      reason: 'not-retrieved',
    }],
  }
}

function supportHandbookEvidenceBundleConflict(): EvidenceBundle {
  return {
    id: 'e5000002-0002-4002-8002-000000000002',
    query: 'What is the current enterprise pricing?',
    state: 'conflict',
    traceId: PROTOTYPE_TRACE_IDS.conflictPricing,
    createdAt: isoAt(900000),
    items: [
      {
        nodeId: 'n6000003-0003-4003-8003-000000000003',
        text: 'Enterprise list price starts at $999 per month.',
        score: 0.71,
        scores: { retrieval: 0.68, rerank: 0.71, final: 0.71 },
        citations: [{ documentAssetId: PROTOTYPE_DOCUMENT_IDS.pricingLegacy, documentVersion: 1 }],
        freshness: { status: 'stale', sourceUpdatedAt: isoAt(86400000 * 2) },
        conflicts: [{
          reason: 'Conflicts with refund-policy.md enterprise tier description.',
          severity: 'blocking',
          withNodeId: 'n6000004-0004-4004-8004-000000000004',
        }],
      },
      {
        nodeId: 'n6000004-0004-4004-8004-000000000004',
        text: 'Enterprise pricing is custom and requires sales contact.',
        score: 0.69,
        scores: { retrieval: 0.66, rerank: 0.69, final: 0.69 },
        citations: [{ documentAssetId: PROTOTYPE_DOCUMENT_IDS.refundPolicy, documentVersion: 3 }],
        freshness: { status: 'fresh' },
      },
    ],
    missingEvidence: [],
  }
}

export function createDefaultScenario(): KnowledgeScenarioBundle {
  const handbookId = PROTOTYPE_SPACE_IDS.supportHandbook
  const handbookDocs = supportHandbookDocuments()

  return {
    id: 'default',
    label: 'Default happy path',
    spaces: [
      {
        id: handbookId,
        name: 'Customer Support Handbook',
        slug: 'customer-support-handbook',
        tenantId: PROTOTYPE_TENANT_ID,
        description: 'Policies, escalation playbooks, product support articles, and refund rules.',
        createdAt: isoAt(86400000 * 60),
        updatedAt: isoAt(3600000 * 3),
      },
      {
        id: PROTOTYPE_SPACE_IDS.releaseNotes,
        name: 'Release Notes Pipeline',
        slug: 'release-notes-pipeline',
        tenantId: PROTOTYPE_TENANT_ID,
        description: 'Pipeline knowledge base for changelogs and launch briefs.',
        createdAt: isoAt(86400000 * 45),
        updatedAt: isoAt(86400000),
      },
    ],
    documentsBySpaceId: {
      [handbookId]: handbookDocs,
      [PROTOTYPE_SPACE_IDS.releaseNotes]: [],
    },
    manifestsBySpaceId: {
      [handbookId]: baseManifest(handbookId, 'Customer Support Handbook'),
      [PROTOTYPE_SPACE_IDS.releaseNotes]: baseManifest(PROTOTYPE_SPACE_IDS.releaseNotes, 'Release Notes Pipeline'),
    },
    statusBySpaceId: {
      [handbookId]: baseStatus(handbookId),
      [PROTOTYPE_SPACE_IDS.releaseNotes]: baseStatus(PROTOTYPE_SPACE_IDS.releaseNotes),
    },
    statsBySpaceId: {
      [handbookId]: baseStats(handbookId, handbookDocs.length),
      [PROTOTYPE_SPACE_IDS.releaseNotes]: baseStats(PROTOTYPE_SPACE_IDS.releaseNotes, 0),
    },
    jobs: {
      [PROTOTYPE_JOB_IDS.refundReindex]: {
        id: PROTOTYPE_JOB_IDS.refundReindex,
        knowledgeSpaceId: handbookId,
        tenantId: PROTOTYPE_TENANT_ID,
        documentAssetId: PROTOTYPE_DOCUMENT_IDS.refundPolicy,
        queueJobId: 'queue-001',
        stage: 'published',
        version: 3,
        createdAt: epochAt(600000),
        updatedAt: epochAt(300000),
        completedAt: epochAt(300000),
      },
    },
    bulkJobs: {},
    parseArtifacts: {
      [`${PROTOTYPE_DOCUMENT_IDS.refundPolicy}:3`]: {
        id: 'p7000001-0001-4001-8001-000000000001',
        documentAssetId: PROTOTYPE_DOCUMENT_IDS.refundPolicy,
        version: 3,
        artifactHash: 'f'.repeat(64),
        contentType: 'text',
        parser: 'native-markdown',
        createdAt: isoAt(3600000 * 3),
        elements: [
          { id: 'el-1', type: 'heading', text: 'Refund policy', sectionPath: ['Refund policy'] },
          { id: 'el-2', type: 'paragraph', text: 'Enterprise plans can request refunds within 14 days when no production workspace has been activated.' },
        ],
      },
    },
    traces: {
      [PROTOTYPE_TRACE_IDS.partialRefund]: supportHandbookTracePartial(),
      [PROTOTYPE_TRACE_IDS.ssoRevoke]: {
        id: PROTOTYPE_TRACE_IDS.ssoRevoke,
        knowledgeSpaceId: handbookId,
        query: 'When can a workspace owner revoke SSO access?',
        mode: 'deep',
        createdAt: isoAt(3600000),
        steps: [
          { name: 'retrieval', status: 'ok', startedAt: isoAt(3600500), endedAt: isoAt(3600400) },
          { name: 'rerank', status: 'ok', startedAt: isoAt(3600400), endedAt: isoAt(3600200) },
          { name: 'generation', status: 'ok', startedAt: isoAt(3600200), endedAt: isoAt(3600000) },
        ],
      },
      [PROTOTYPE_TRACE_IDS.conflictPricing]: {
        id: PROTOTYPE_TRACE_IDS.conflictPricing,
        knowledgeSpaceId: handbookId,
        query: 'What is the current enterprise pricing?',
        mode: 'deep',
        evidenceBundleId: 'e5000002-0002-4002-8002-000000000002',
        createdAt: isoAt(900000),
        steps: [
          { name: 'retrieval', status: 'ok', startedAt: isoAt(900500), endedAt: isoAt(900400) },
          { name: 'rerank', status: 'error', startedAt: isoAt(900400), endedAt: isoAt(900300), metadata: { reason: 'conflict detected' } },
          { name: 'generation', status: 'skipped', startedAt: isoAt(900300) },
        ],
      },
    },
    evidenceBundles: {
      'e5000001-0001-4001-8001-000000000001': supportHandbookEvidenceBundlePartial(),
      'e5000002-0002-4002-8002-000000000002': supportHandbookEvidenceBundleConflict(),
    },
    evidenceTrees: {},
    conflictTrees: {},
    missingTrees: {},
    goldenQuestionsBySpaceId: {
      [handbookId]: [
        {
          id: 'g8000001-0001-4001-8001-000000000001',
          knowledgeSpaceId: handbookId,
          question: 'What is the Enterprise SSO refund policy?',
          createdAt: isoAt(86400000 * 7),
          updatedAt: isoAt(86400000),
        },
        {
          id: 'g8000002-0002-4002-8002-000000000002',
          knowledgeSpaceId: handbookId,
          question: 'When can a workspace owner revoke SSO access?',
          createdAt: isoAt(86400000 * 6),
          updatedAt: isoAt(86400000 * 2),
        },
      ],
    },
    badCasesBySpaceId: {
      [handbookId]: [
        {
          id: 'bc900001-0001-4001-8001-000000000001',
          knowledgeSpaceId: handbookId,
          question: 'Refund after SSO activation',
          traceIds: [PROTOTYPE_TRACE_IDS.partialRefund],
          tags: ['billing'],
          createdAt: isoAt(86400000 * 3),
          updatedAt: isoAt(86400000),
        },
      ],
    },
    fsckBySpaceId: {
      [handbookId]: {
        knowledgeSpaceId: handbookId,
        tenantId: PROTOTYPE_TENANT_ID,
        scannedAt: isoAt(600000),
        summary: { scanned: 132, info: 2, warning: 3, error: 1, critical: 0, repairable: 2 },
        issues: [
          {
            code: 'STALE_PROJECTION',
            type: 'stale-projection',
            message: 'Dense vector projection stale for pricing-legacy.html',
            severity: 'warning',
            repairability: 'auto-repairable',
            target: {
              type: 'index-projection',
              documentAssetId: PROTOTYPE_DOCUMENT_IDS.pricingLegacy,
              virtualPath: '/knowledge/documents/pricing-legacy.html',
            },
          },
          {
            code: 'PARSER_FAILED',
            type: 'missing-artifact-object',
            message: 'Parse artifact missing for escalation-matrix.xlsx',
            severity: 'error',
            repairability: 'manual',
            target: {
              type: 'artifact-object',
              documentAssetId: PROTOTYPE_DOCUMENT_IDS.escalationMatrix,
            },
          },
        ],
      },
    },
    gcDryRunBySpaceId: {
      [handbookId]: {
        dryRunId: 'gc-dry-run-001',
        knowledgeSpaceId: handbookId,
        tenantId: PROTOTYPE_TENANT_ID,
        generatedAt: isoAt(300000),
        summary: {
          candidateCount: 4,
          estimatedBytes: 524288,
          stagedObjectCount: 2,
          failedCommitCount: 1,
        },
        candidates: [
          {
            candidateType: 'staged-object',
            count: 2,
            estimatedBytes: 262144,
            idempotencyKey: 'gc-staged-001',
            reason: 'Orphaned staged upload older than retention window',
            target: { type: 'staged-commit', id: 'sc-001' },
          },
        ],
      },
    },
    leasesBySpaceId: {
      [handbookId]: [
        {
          id: 'l1000001-0001-4001-8001-000000000001',
          knowledgeSpaceId: handbookId,
          tenantId: PROTOTYPE_TENANT_ID,
          sessionId: 's2000001-0001-4001-8001-000000000001',
          leaseType: 'reindex',
          targetType: 'document-asset',
          targetId: PROTOTYPE_DOCUMENT_IDS.refundPolicy,
          targetVersion: 3,
          virtualPath: '/knowledge/documents/refund-policy.md',
          status: 'active',
          acquiredAt: isoAt(120000),
          heartbeatAt: isoAt(30000),
          expiresAt: isoAt(-300000),
          updatedAt: isoAt(30000),
        },
      ],
    },
    stagedCommitsBySpaceId: {
      [handbookId]: [
        {
          id: 'sc100001-0001-4001-8001-000000000001',
          knowledgeSpaceId: handbookId,
          tenantId: PROTOTYPE_TENANT_ID,
          idempotencyKey: 'upload-refund-v4',
          operationType: 'document-upload',
          status: 'projections-built',
          documentAssetId: PROTOTYPE_DOCUMENT_IDS.refundPolicy,
          rawObjectKey: `tenants/${PROTOTYPE_TENANT_ID}/raw/refund-policy-v4.md`,
          sizeBytes: 19456,
          createdAt: isoAt(600000),
          updatedAt: isoAt(120000),
        },
      ],
    },
    retentionPolicies: [
      {
        id: 'retention-tenant',
        tenantId: PROTOTYPE_TENANT_ID,
        knowledgeSpaceId: null,
        scope: 'tenant',
        parseArtifactVersions: 3,
        rawDocumentRetentionDays: 365,
        answerTraceRetentionDays: 30,
        evidenceCacheRetentionDays: 7,
        inactiveProjectionRetentionDays: 14,
        sessionInactivityMinutes: 30,
        createdAt: isoAt(86400000 * 90),
        updatedAt: isoAt(86400000),
      },
      {
        id: 'retention-handbook',
        tenantId: PROTOTYPE_TENANT_ID,
        knowledgeSpaceId: handbookId,
        scope: 'knowledge_space',
        parseArtifactVersions: 5,
        rawDocumentRetentionDays: null,
        answerTraceRetentionDays: 45,
        evidenceCacheRetentionDays: 14,
        inactiveProjectionRetentionDays: 21,
        sessionInactivityMinutes: 45,
        createdAt: isoAt(86400000 * 30),
        updatedAt: isoAt(86400000 * 2),
      },
    ],
    researchTasks: {},
  }
}

export function createEmptyScenario(): KnowledgeScenarioBundle {
  const base = createDefaultScenario()
  return {
    ...base,
    id: 'empty',
    label: 'Empty lists',
    spaces: [],
    documentsBySpaceId: {},
    goldenQuestionsBySpaceId: {},
    badCasesBySpaceId: {},
    jobs: {},
    traces: {},
    evidenceBundles: {},
  }
}

export function createJobFailedScenario(): KnowledgeScenarioBundle {
  const base = createDefaultScenario()
  const handbookId = PROTOTYPE_SPACE_IDS.supportHandbook
  return {
    ...base,
    id: 'job-failed',
    label: 'Failed compilation job',
    jobs: {
      ...base.jobs,
      [PROTOTYPE_JOB_IDS.failedCompile]: {
        id: PROTOTYPE_JOB_IDS.failedCompile,
        knowledgeSpaceId: handbookId,
        tenantId: PROTOTYPE_TENANT_ID,
        documentAssetId: PROTOTYPE_DOCUMENT_IDS.escalationMatrix,
        queueJobId: 'queue-failed-001',
        stage: 'failed',
        version: 1,
        error: 'Parser failed: unsupported spreadsheet layout',
        createdAt: epochAt(900000),
        updatedAt: epochAt(600000),
      },
    },
  }
}

export function createTraceWithConflictsScenario(): KnowledgeScenarioBundle {
  const base = createDefaultScenario()
  return {
    ...base,
    id: 'trace-with-conflicts',
    label: 'Trace with conflicts',
  }
}

export function createIngestSuccessScenario(): KnowledgeScenarioBundle {
  const base = createDefaultScenario()
  const handbookId = PROTOTYPE_SPACE_IDS.supportHandbook
  const bulkJobId = 'bulk-partial-failure-001'
  return {
    ...base,
    id: 'ingest-success',
    label: 'In-progress ingest job',
    jobs: {
      ...base.jobs,
      'job-ingest-active-001': {
        id: 'job-ingest-active-001',
        knowledgeSpaceId: handbookId,
        tenantId: PROTOTYPE_TENANT_ID,
        documentAssetId: PROTOTYPE_DOCUMENT_IDS.refundPolicy,
        queueJobId: 'queue-ingest-001',
        stage: 'nodes_generated',
        version: 4,
        createdAt: epochAt(120000),
        updatedAt: epochAt(30000),
      },
    },
    bulkJobs: {
      [bulkJobId]: {
        id: bulkJobId,
        knowledgeSpaceId: handbookId,
        type: 'document_reindex',
        status: 'completed',
        totalItems: 3,
        completedItems: 3,
        failedItems: 1,
        failedItemIds: [PROTOTYPE_DOCUMENT_IDS.escalationMatrix],
        createdAt: isoAt(180000),
        updatedAt: isoAt(60000),
      },
    },
  }
}

export function createUploadRejectedScenario(): KnowledgeScenarioBundle {
  return {
    ...createDefaultScenario(),
    id: 'upload-rejected',
    label: 'Upload rejected (simulated 413)',
  }
}

export function resolveScenario(id: KnowledgeScenarioId): KnowledgeScenarioBundle {
  switch (id) {
    case 'empty':
      return createEmptyScenario()
    case 'job-failed':
      return createJobFailedScenario()
    case 'trace-with-conflicts':
      return createTraceWithConflictsScenario()
    case 'ingest-success':
      return createIngestSuccessScenario()
    case 'upload-rejected':
      return createUploadRejectedScenario()
    default:
      return createDefaultScenario()
  }
}

export const KNOWLEDGE_SCENARIO_OPTIONS: { id: KnowledgeScenarioId; label: string }[] = [
  { id: 'default', label: 'Default happy path' },
  { id: 'empty', label: 'Empty lists' },
  { id: 'job-failed', label: 'Failed compilation job' },
  { id: 'trace-with-conflicts', label: 'Trace with conflicts' },
  { id: 'ingest-success', label: 'In-progress ingest job' },
  { id: 'upload-rejected', label: 'Upload rejected' },
]
