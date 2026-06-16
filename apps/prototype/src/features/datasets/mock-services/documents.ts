import type { DocumentAsset, DocumentAssetList, DocumentUploadAccepted, ParseArtifact } from '../api-types'
import { MockServiceError } from '../api-types'
import { delay } from './helpers'
import { getActiveKnowledgeScenario } from './scenario'
import { getKnowledgeMockStore, mutateKnowledgeMockStore } from './store'

export async function listDocuments(spaceId: string, options?: { cursor?: string; limit?: number }) {
  await delay(160)
  const store = getKnowledgeMockStore()
  const items = store.documentsBySpaceId[spaceId] ?? []
  const limit = options?.limit ?? 50
  const start = options?.cursor
    ? items.findIndex(doc => doc.id === options.cursor) + 1
    : 0
  const slice = items.slice(start, start + limit)
  const next = items[start + limit]

  return {
    items: slice.map(cloneDocument),
    nextCursor: next?.id,
  } satisfies DocumentAssetList
}

export async function getDocument(spaceId: string, documentId: string) {
  await delay(120)
  const doc = findDocument(spaceId, documentId)
  if (!doc)
    throw new MockServiceError(404, 'Document asset not found')

  return cloneDocument(doc)
}

export async function uploadDocument(spaceId: string, input: { filename: string; mimeType: string; sizeBytes: number }) {
  await delay(280)

  if (getActiveKnowledgeScenario() === 'upload-rejected') {
    if (input.filename.toLowerCase().includes('unavailable'))
      throw new MockServiceError(503, 'Service temporarily unavailable')
    if (input.sizeBytes > 10_485_760)
      throw new MockServiceError(413, 'Payload too large')
    throw new MockServiceError(429, 'Upload rate limit exceeded')
  }

  const now = new Date().toISOString()
  const asset: DocumentAsset = {
    id: crypto.randomUUID(),
    knowledgeSpaceId: spaceId,
    filename: input.filename,
    mimeType: input.mimeType,
    objectKey: `tenants/mock/raw/${input.filename}`,
    sha256: '0'.repeat(64),
    sizeBytes: input.sizeBytes,
    parserStatus: 'pending',
    version: 1,
    createdAt: now,
  }

  const accepted: DocumentUploadAccepted = {
    asset,
    compilationJob: {
      id: `job-${asset.id}`,
      stage: 'queued',
    },
    statusUrl: `/jobs/job-${asset.id}`,
  }

  mutateKnowledgeMockStore((draft) => {
    const list = draft.documentsBySpaceId[spaceId] ?? []
    draft.documentsBySpaceId[spaceId] = [asset, ...list]
    draft.jobs[`job-${asset.id}`] = {
      id: `job-${asset.id}`,
      knowledgeSpaceId: spaceId,
      tenantId: draft.spaces.find(space => space.id === spaceId)?.tenantId ?? 'tenant-prototype',
      documentAssetId: asset.id,
      queueJobId: `queue-${asset.id}`,
      stage: 'queued',
      version: asset.version,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    }
  })

  return accepted
}

export async function getParseArtifact(spaceId: string, documentId: string, version: number) {
  await delay(140)
  void spaceId
  const key = `${documentId}:${version}`
  const artifact = getKnowledgeMockStore().parseArtifacts[key]
  if (!artifact)
    throw new MockServiceError(404, 'Parse artifact not found')

  return structuredClone(artifact) as ParseArtifact
}

function findDocument(spaceId: string, documentId: string) {
  return getKnowledgeMockStore().documentsBySpaceId[spaceId]?.find(doc => doc.id === documentId)
}

function cloneDocument(document: DocumentAsset) {
  return structuredClone(document)
}
