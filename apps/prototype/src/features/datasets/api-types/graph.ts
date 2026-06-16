import type { Uuid } from './common'

export type GraphEntityType =
  | 'date'
  | 'metric'
  | 'organization'
  | 'person'
  | 'policy'
  | 'product'
  | 'term'

export type GraphRelationType =
  | 'contradicts'
  | 'defines'
  | 'depends_on'
  | 'mentions'
  | 'references'
  | 'supersedes'

export type GraphEntity = {
  id: Uuid
  knowledgeSpaceId: Uuid
  name: string
  type: GraphEntityType
  canonicalKey: string
  aliases: string[]
  confidence: number
  depth: number
  extractionVersion: number
  sourceNodeIds: string[]
  permissionScope: string[]
  metadata: Record<string, unknown>
  createdAt: string
  updatedAt: string
}

export type GraphRelation = {
  id: Uuid
  knowledgeSpaceId: Uuid
  type: GraphRelationType
  subjectEntityId: Uuid
  objectEntityId: Uuid
  confidence: number
  depth: number
  extractionVersion: number
  sourceNodeIds: string[]
  permissionScope: string[]
  metadata: Record<string, unknown>
  createdAt: string
  updatedAt: string
}

export type GraphTraverseResult = {
  entities: GraphEntity[]
  relations: GraphRelation[]
  metrics: {
    depthReached: number
    elapsedMs: number
    exploredRelations: number
    fanout: number
    maxDepth: number
    maxNodes: number
    timedOut: boolean
  }
  truncated: boolean
}

export type TopicMaterializeResult = {
  knowledgeSpaceId: Uuid
  topicName: string
  topicSlug: string
  generatedVersion: string
  documentCount: number
  pathCount: number
}

export type EntityExtractResult = {
  knowledgeSpaceId: Uuid
  extractionMode: 'provider'
  nodesScanned: number
  nodesUpdated: number
  entitiesExtracted: number
  graphEntitiesIndexed: number
  graphRelationsIndexed: number
}

export type CommunityMaterializeResult = {
  knowledgeSpaceId: Uuid
  generatedVersion: string
  communityCount: number
  entityCount: number
  documentCount: number
  pathCount: number
}
