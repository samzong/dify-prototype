import type {
  CommunityMaterializeResult,
  EntityExtractResult,
  GraphTraverseResult,
  TopicMaterializeResult,
} from '../api-types'
import { MockServiceError } from '../api-types'
import { isoAt, PROTOTYPE_ENTITY_IDS, PROTOTYPE_SPACE_IDS } from '../fixtures/scenarios'
import { delay } from './helpers'
import { getKnowledgeMockStore } from './store'

export async function traverseGraph(
  spaceId: string,
  entityId: string,
  options?: { depth?: number; fanout?: number; maxNodes?: number },
) {
  await delay(180)
  assertSpace(spaceId)

  const depth = options?.depth ?? 2
  const now = isoAt(0)
  const entities = handbookGraphEntities(spaceId, entityId, depth, now)
  const relations = handbookGraphRelations(spaceId, now)

  const result: GraphTraverseResult = {
    entities,
    relations,
    metrics: {
      depthReached: Math.min(depth, 2),
      elapsedMs: 42,
      exploredRelations: relations.length,
      fanout: options?.fanout ?? 20,
      maxDepth: depth,
      maxNodes: options?.maxNodes ?? 50,
      timedOut: false,
    },
    truncated: entities.length >= (options?.maxNodes ?? 50),
  }

  return structuredClone(result)
}

export async function materializeTopicView(
  spaceId: string,
  input?: { topicName?: string; topicSlug?: string; limit?: number },
): Promise<TopicMaterializeResult> {
  await delay(220)
  assertSpace(spaceId)

  return {
    knowledgeSpaceId: spaceId,
    topicName: input?.topicName ?? 'Enterprise billing',
    topicSlug: input?.topicSlug ?? 'enterprise-billing',
    generatedVersion: 'topic-v2026-06',
    documentCount: input?.limit ?? 6,
    pathCount: 14,
  }
}

export async function extractEntities(
  spaceId: string,
  input?: { limit?: number },
): Promise<EntityExtractResult> {
  await delay(260)
  assertSpace(spaceId)

  return {
    knowledgeSpaceId: spaceId,
    extractionMode: 'provider',
    nodesScanned: 132,
    nodesUpdated: input?.limit ?? 18,
    entitiesExtracted: input?.limit ?? 18,
    graphEntitiesIndexed: input?.limit ?? 18,
    graphRelationsIndexed: 7,
  }
}

export async function materializeCommunities(
  spaceId: string,
  input?: { generatedVersion?: string },
): Promise<CommunityMaterializeResult> {
  await delay(240)
  assertSpace(spaceId)

  return {
    knowledgeSpaceId: spaceId,
    generatedVersion: input?.generatedVersion ?? 'community-v2026-06',
    communityCount: 3,
    entityCount: 24,
    documentCount: 48,
    pathCount: 61,
  }
}

function handbookGraphEntities(spaceId: string, rootEntityId: string, depth: number, now: string) {
  const all = [
    entity(PROTOTYPE_ENTITY_IDS.enterpriseRefundPolicy, spaceId, 'Enterprise refund policy', 'policy', 0, now),
    entity(PROTOTYPE_ENTITY_IDS.enterpriseSso, spaceId, 'Enterprise SSO', 'product', depth >= 2 ? 1 : 0, now),
    entity(PROTOTYPE_ENTITY_IDS.enterprisePricing, spaceId, 'Enterprise pricing', 'metric', depth >= 2 ? 1 : 0, now),
  ]

  if (rootEntityId === PROTOTYPE_ENTITY_IDS.enterpriseRefundPolicy)
    return all
  if (rootEntityId === PROTOTYPE_ENTITY_IDS.enterpriseSso)
    return all.filter(entry => entry.id !== PROTOTYPE_ENTITY_IDS.enterprisePricing)
  if (rootEntityId === PROTOTYPE_ENTITY_IDS.enterprisePricing)
    return all.filter(entry => entry.id !== PROTOTYPE_ENTITY_IDS.enterpriseSso)
  return all.filter(entry => entry.id === rootEntityId)
}

function handbookGraphRelations(spaceId: string, now: string) {
  return [
    relation(
      'rel-001',
      spaceId,
      'references',
      PROTOTYPE_ENTITY_IDS.enterpriseRefundPolicy,
      PROTOTYPE_ENTITY_IDS.enterpriseSso,
      now,
    ),
    relation(
      'rel-002',
      spaceId,
      'contradicts',
      PROTOTYPE_ENTITY_IDS.enterprisePricing,
      PROTOTYPE_ENTITY_IDS.enterpriseRefundPolicy,
      now,
    ),
  ]
}

function entity(
  id: string,
  knowledgeSpaceId: string,
  name: string,
  type: GraphTraverseResult['entities'][number]['type'],
  depth: number,
  now: string,
) {
  return {
    id,
    knowledgeSpaceId,
    name,
    type,
    canonicalKey: name.toLowerCase().replace(/\s+/g, '-'),
    aliases: [],
    confidence: 0.91,
    depth,
    extractionVersion: 3,
    sourceNodeIds: ['n6000001-0001-4001-8001-000000000001'],
    permissionScope: [],
    metadata: {},
    createdAt: now,
    updatedAt: now,
  }
}

function relation(
  id: string,
  knowledgeSpaceId: string,
  type: GraphTraverseResult['relations'][number]['type'],
  subjectEntityId: string,
  objectEntityId: string,
  now: string,
) {
  return {
    id,
    knowledgeSpaceId,
    type,
    subjectEntityId,
    objectEntityId,
    confidence: type === 'contradicts' ? 0.88 : 0.76,
    depth: 1,
    extractionVersion: 3,
    sourceNodeIds: ['n6000003-0003-4003-8003-000000000003'],
    permissionScope: [],
    metadata: {},
    createdAt: now,
    updatedAt: now,
  }
}

function assertSpace(spaceId: string) {
  const exists = getKnowledgeMockStore().spaces.some(space => space.id === spaceId)
    || spaceId === PROTOTYPE_SPACE_IDS.supportHandbook
  if (!exists)
    throw new MockServiceError(404, 'Knowledge space not found')
}
