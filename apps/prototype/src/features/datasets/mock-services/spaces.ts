import type { KnowledgeSpace, KnowledgeSpaceList, KnowledgeSpaceManifest, KnowledgeSpaceStats, KnowledgeSpaceStatus } from '../api-types'
import { MockServiceError } from '../api-types'
import { PROTOTYPE_TENANT_ID } from '../fixtures/scenarios'
import { delay } from './helpers'
import { getKnowledgeMockStore, mutateKnowledgeMockStore } from './store'

export async function listKnowledgeSpaces(options?: { cursor?: string; limit?: number }) {
  await delay(180)
  const store = getKnowledgeMockStore()
  const limit = options?.limit ?? 20
  const start = options?.cursor
    ? store.spaces.findIndex(space => space.id === options.cursor) + 1
    : 0
  const slice = store.spaces.slice(start, start + limit)
  const next = store.spaces[start + limit]

  return {
    items: slice.map(cloneSpace),
    nextCursor: next?.id,
  } satisfies KnowledgeSpaceList
}

export async function getKnowledgeSpace(id: string) {
  await delay(120)
  const space = getKnowledgeMockStore().spaces.find(entry => entry.id === id)
  if (!space)
    throw new MockServiceError(404, 'Knowledge space not found')

  return cloneSpace(space)
}

export async function createKnowledgeSpace(input: { name: string; slug: string; description?: string }) {
  await delay(240)
  const duplicate = getKnowledgeMockStore().spaces.some(space => space.slug === input.slug)
  if (duplicate)
    throw new MockServiceError(409, 'Slug already exists')

  const now = new Date().toISOString()
  const space: KnowledgeSpace = {
    id: crypto.randomUUID(),
    name: input.name,
    slug: input.slug,
    description: input.description,
    tenantId: PROTOTYPE_TENANT_ID,
    createdAt: now,
    updatedAt: now,
  }

  mutateKnowledgeMockStore(draft => {
    draft.spaces.unshift(space)
  })

  return cloneSpace(space)
}

export async function patchKnowledgeSpace(id: string, input: Partial<Pick<KnowledgeSpace, 'name' | 'description'>>) {
  await delay(200)
  let updated: KnowledgeSpace | null = null

  mutateKnowledgeMockStore((draft) => {
    const space = draft.spaces.find(entry => entry.id === id)
    if (!space)
      return

    if (input.name !== undefined)
      space.name = input.name
    if (input.description !== undefined)
      space.description = input.description
    space.updatedAt = new Date().toISOString()
    updated = { ...space }
  })

  if (!updated)
    throw new MockServiceError(404, 'Knowledge space not found')

  return cloneSpace(updated)
}

export async function deleteKnowledgeSpace(id: string) {
  await delay(200)
  let removed = false

  mutateKnowledgeMockStore((draft) => {
    const index = draft.spaces.findIndex(entry => entry.id === id)
    if (index === -1)
      return

    draft.spaces.splice(index, 1)
    delete draft.documentsBySpaceId[id]
    delete draft.manifestsBySpaceId[id]
    delete draft.statusBySpaceId[id]
    delete draft.statsBySpaceId[id]
    removed = true
  })

  if (!removed)
    throw new MockServiceError(404, 'Knowledge space not found')
}

export async function getKnowledgeSpaceManifest(spaceId: string) {
  await delay(120)
  const manifest = getKnowledgeMockStore().manifestsBySpaceId[spaceId]
  if (!manifest)
    throw new MockServiceError(404, 'Knowledge space manifest not found')

  return structuredClone(manifest) as KnowledgeSpaceManifest
}

export async function getKnowledgeSpaceStatus(spaceId: string) {
  await delay(120)
  const status = getKnowledgeMockStore().statusBySpaceId[spaceId]
  if (!status)
    throw new MockServiceError(404, 'Knowledge space status not found')

  return structuredClone(status) as KnowledgeSpaceStatus
}

export async function getKnowledgeSpaceStats(spaceId: string) {
  await delay(120)
  const stats = getKnowledgeMockStore().statsBySpaceId[spaceId]
  if (!stats)
    throw new MockServiceError(404, 'Knowledge space stats not found')

  return structuredClone(stats) as KnowledgeSpaceStats
}

function cloneSpace(space: KnowledgeSpace) {
  return structuredClone(space)
}
