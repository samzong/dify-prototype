import type { GoldenQuestion, GoldenQuestionList, ProductionBadCase, RetentionPolicy } from '../api-types'
import { MockServiceError } from '../api-types'
import { delay } from './helpers'
import { getKnowledgeMockStore, mutateKnowledgeMockStore } from './store'

export async function listGoldenQuestions(spaceId: string, options?: { cursor?: string; limit?: number }) {
  await delay(140)
  const items = getKnowledgeMockStore().goldenQuestionsBySpaceId[spaceId] ?? []
  const limit = options?.limit ?? 25
  const start = options?.cursor
    ? items.findIndex(item => item.id === options.cursor) + 1
    : 0
  const slice = items.slice(start, start + limit)
  const next = items[start + limit]

  return {
    items: slice.map(cloneGoldenQuestion),
    nextCursor: next?.id,
  } satisfies GoldenQuestionList
}

export async function createGoldenQuestion(spaceId: string, input: { question: string; tags?: string[] }) {
  await delay(200)
  const now = new Date().toISOString()
  const question: GoldenQuestion = {
    id: crypto.randomUUID(),
    knowledgeSpaceId: spaceId,
    question: input.question,
    tags: input.tags ?? [],
    createdAt: now,
    updatedAt: now,
  }

  mutateKnowledgeMockStore((draft) => {
    const list = draft.goldenQuestionsBySpaceId[spaceId] ?? []
    draft.goldenQuestionsBySpaceId[spaceId] = [question, ...list]
  })

  return cloneGoldenQuestion(question)
}

export async function deleteGoldenQuestion(spaceId: string, questionId: string) {
  await delay(160)
  let removed = false

  mutateKnowledgeMockStore((draft) => {
    const list = draft.goldenQuestionsBySpaceId[spaceId] ?? []
    const index = list.findIndex(item => item.id === questionId)
    if (index === -1)
      return

    list.splice(index, 1)
    draft.goldenQuestionsBySpaceId[spaceId] = list
    removed = true
  })

  if (!removed)
    throw new MockServiceError(404, 'Golden question not found')
}

export async function listProductionBadCases(spaceId: string) {
  await delay(140)
  return (getKnowledgeMockStore().badCasesBySpaceId[spaceId] ?? []).map(cloneBadCase)
}

export async function createProductionBadCase(spaceId: string, input: { traceId: string; reason?: string; tags?: string[] }) {
  await delay(220)
  const trace = getKnowledgeMockStore().traces[input.traceId]
  if (!trace)
    throw new MockServiceError(404, 'Knowledge space or answer trace not found')

  const now = new Date().toISOString()
  const badCase: ProductionBadCase = {
    id: crypto.randomUUID(),
    knowledgeSpaceId: spaceId,
    question: trace.query,
    traceIds: [input.traceId],
    tags: input.tags ?? [],
    metadata: input.reason ? { reason: input.reason } : {},
    createdAt: now,
    updatedAt: now,
  }

  mutateKnowledgeMockStore((draft) => {
    const list = draft.badCasesBySpaceId[spaceId] ?? []
    draft.badCasesBySpaceId[spaceId] = [badCase, ...list]
  })

  return cloneBadCase(badCase)
}

export async function getRetentionPolicy(scope: 'tenant' | 'knowledge_space', spaceId?: string) {
  await delay(120)
  const policies = getKnowledgeMockStore().retentionPolicies
  const policy = scope === 'tenant'
    ? policies.find(entry => entry.scope === 'tenant')
    : policies.find(entry => entry.scope === 'knowledge_space' && entry.knowledgeSpaceId === spaceId)

  if (!policy)
    throw new MockServiceError(404, 'Retention policy not found')

  return structuredClone(policy) as RetentionPolicy
}

export async function patchRetentionPolicy(
  scope: 'tenant' | 'knowledge_space',
  patch: Partial<RetentionPolicy>,
  spaceId?: string,
) {
  await delay(200)

  if (patch.parseArtifactVersions !== undefined && patch.parseArtifactVersions < 1)
    throw new MockServiceError(400, 'parseArtifactVersions must be greater than 0')

  let updated: RetentionPolicy | null = null

  mutateKnowledgeMockStore((draft) => {
    const policy = scope === 'tenant'
      ? draft.retentionPolicies.find(entry => entry.scope === 'tenant')
      : draft.retentionPolicies.find(entry => entry.scope === 'knowledge_space' && entry.knowledgeSpaceId === spaceId)

    if (!policy)
      return

    Object.assign(policy, patch, { updatedAt: new Date().toISOString() })
    updated = structuredClone(policy)
  })

  if (!updated)
    throw new MockServiceError(404, 'Retention policy not found')

  return updated
}

function cloneGoldenQuestion(question: GoldenQuestion) {
  return structuredClone(question)
}

function cloneBadCase(badCase: ProductionBadCase) {
  return structuredClone(badCase)
}
