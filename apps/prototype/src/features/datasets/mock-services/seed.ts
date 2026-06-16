import type { KnowledgeScenarioBundle } from '../fixtures/scenarios'
import { datasetItems } from '../fixtures/dataset-items'
import {
  fixtureIdToSpaceId,
  spaceFromFixture,
} from '../fixtures/knowledge-space-bridge'
import type { KnowledgeSpaceManifest, KnowledgeSpaceStats, KnowledgeSpaceStatus } from '../api-types'
import { isoAt, PROTOTYPE_TENANT_ID } from '../fixtures/scenarios/ids'

function projectionSummary(ready: number, building = 0, stale = 0, failed = 0) {
  const total = ready + building + stale + failed
  return { total, ready, building, stale, failed }
}

export function manifestForSpace(spaceId: string, slug: string): KnowledgeSpaceManifest {
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
    quotaPolicy: {},
    retentionPolicy: {
      artifactVersionsToKeep: 3,
      failedCommitRetentionDays: 7,
      traceRetentionDays: 30,
    },
    createdAt: isoAt(86400000 * 30),
    updatedAt: isoAt(3600000),
  }
}

export function statusForSpace(spaceId: string): KnowledgeSpaceStatus {
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
        denseVector: projectionSummary(8, 0, 0, 0),
        fts: projectionSummary(8, 0, 0, 0),
        graph: projectionSummary(0, 0, 0, 0),
        metadata: projectionSummary(8, 0, 0, 0),
      },
    },
    activeLeases: { count: 0, truncated: false, items: [] },
    activeSessions: { count: 0, truncated: false, items: [] },
    failedCommits: { count: 0, truncated: false, items: [] },
  }
}

export function statsForSpace(spaceId: string, documentCount: number): KnowledgeSpaceStats {
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
      denseVector: projectionSummary(documentCount, 0, 0, 0),
      fts: projectionSummary(documentCount, 0, 0, 0),
      graph: projectionSummary(0, 0, 0, 0),
      metadata: projectionSummary(documentCount, 0, 0, 0),
    },
    commits: {
      sampled: 0,
      failedRetryable: 0,
      failedTerminal: 0,
      truncated: false,
    },
    cache: { available: true, entries: 0, totalBytes: 0 },
    metrics: { available: true },
    runtime: {
      activeLeaseSampleCount: 0,
      activeSessionSampleCount: 0,
      truncated: false,
    },
  }
}

export function seedScenarioFromFixtures(bundle: KnowledgeScenarioBundle): KnowledgeScenarioBundle {
  for (const fixture of datasetItems) {
    const spaceId = fixtureIdToSpaceId(fixture.id)
    if (!bundle.spaces.some(space => space.id === spaceId))
      bundle.spaces.push(spaceFromFixture(fixture, spaceId))

    if (!bundle.manifestsBySpaceId[spaceId]) {
      const space = bundle.spaces.find(entry => entry.id === spaceId)!
      bundle.manifestsBySpaceId[spaceId] = manifestForSpace(spaceId, space.slug)
    }

    if (!bundle.statusBySpaceId[spaceId])
      bundle.statusBySpaceId[spaceId] = statusForSpace(spaceId)

    if (!bundle.statsBySpaceId[spaceId]) {
      const docCount = fixture.documents.length
      bundle.statsBySpaceId[spaceId] = statsForSpace(spaceId, docCount)
    }
  }

  return bundle
}
