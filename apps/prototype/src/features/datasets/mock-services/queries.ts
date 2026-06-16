import type {
  AnswerTrace,
  ConflictSeverity,
  EvidenceBundle,
  QueryEvidenceVirtualTree,
  QueryRunRequest,
  QueryStreamEvent,
  Uuid,
} from '../api-types'

export type SpaceConflictListItem = {
  traceId: Uuid
  query: string
  reason: string
  severity: ConflictSeverity
  withNodeId?: Uuid
}
import { MockServiceError } from '../api-types'
import { PROTOTYPE_TRACE_IDS } from '../fixtures/scenarios'
import { delay, emitStream } from './helpers'
import { getActiveKnowledgeScenario } from './scenario'
import { getKnowledgeMockStore, mutateKnowledgeMockStore } from './store'

export async function getQueryTrace(traceId: string) {
  await delay(120)
  const trace = getKnowledgeMockStore().traces[traceId]
  if (!trace)
    throw new MockServiceError(404, 'Answer trace not found')

  return structuredClone(trace) as AnswerTrace
}

export async function getQueryEvidence(traceId: string) {
  await delay(120)
  return getVirtualTree(traceId, 'evidence')
}

export async function getQueryConflicts(traceId: string) {
  await delay(120)
  return getVirtualTree(traceId, 'conflicts')
}

export async function getQueryMissing(traceId: string) {
  await delay(120)
  return getVirtualTree(traceId, 'missing')
}

export async function listSpaceConflicts(spaceId: string) {
  await delay(140)
  const store = getKnowledgeMockStore()
  const items: SpaceConflictListItem[] = []

  for (const trace of Object.values(store.traces)) {
    if (trace.knowledgeSpaceId !== spaceId)
      continue

    const bundle = trace.evidenceBundleId
      ? store.evidenceBundles[trace.evidenceBundleId]
      : Object.values(store.evidenceBundles).find(entry => entry.traceId === trace.id)

    if (!bundle)
      continue

    for (const evidenceItem of bundle.items) {
      for (const conflict of evidenceItem.conflicts ?? []) {
        items.push({
          traceId: trace.id,
          query: trace.query,
          reason: conflict.reason,
          severity: conflict.severity,
          withNodeId: conflict.withNodeId,
        })
      }
    }
  }

  return items.map(entry => structuredClone(entry))
}

export async function runQuery(
  request: QueryRunRequest,
  onEvent?: (event: QueryStreamEvent) => void,
) {
  await delay(200)

  if (getActiveKnowledgeScenario() === 'upload-rejected')
    throw new MockServiceError(503, 'Query generation unavailable')

  const scenario = getActiveKnowledgeScenario()
  const traceId = pickTraceId(scenario, request)

  const store = getKnowledgeMockStore()
  const template = store.traces[traceId]
  if (!template)
    throw new MockServiceError(404, 'Knowledge space not found')

  const trace: AnswerTrace = {
    ...structuredClone(template),
    id: traceId,
    knowledgeSpaceId: request.knowledgeSpaceId,
    query: request.query,
    mode: request.mode ?? 'fast',
    createdAt: new Date().toISOString(),
  }

  const bundleTemplate = trace.evidenceBundleId
    ? store.evidenceBundles[trace.evidenceBundleId]
    : Object.values(store.evidenceBundles)[0]

  const bundle: EvidenceBundle = bundleTemplate
    ? {
        ...structuredClone(bundleTemplate),
        query: request.query,
        traceId,
        createdAt: new Date().toISOString(),
      }
    : {
        id: crypto.randomUUID(),
        query: request.query,
        state: 'answerable',
        traceId,
        items: [],
        createdAt: new Date().toISOString(),
      }

  const answerText = bundle.items.map(item => item.text).join('\n\n') || 'No answer generated in mock mode.'
  const answerChunks = chunkAnswerText(answerText)

  const events: QueryStreamEvent[] = [
    { type: 'trace-id', traceId },
    ...trace.steps.map(step => ({ type: 'step' as const, step })),
    ...answerChunks.map(text => ({ type: 'answer-chunk' as const, text })),
    { type: 'done', trace, bundle },
  ]

  await emitStream(events, (event) => {
    onEvent?.(event)
  }, 180)

  mutateKnowledgeMockStore((draft) => {
    draft.traces[traceId] = trace
    draft.evidenceBundles[bundle.id] = bundle
  })

  return { trace, bundle }
}

function pickTraceId(scenario: ReturnType<typeof getActiveKnowledgeScenario>, request: QueryRunRequest) {
  if (scenario === 'trace-with-conflicts' || /pricing|enterprise price/i.test(request.query))
    return PROTOTYPE_TRACE_IDS.conflictPricing
  return PROTOTYPE_TRACE_IDS.partialRefund
}

function chunkAnswerText(text: string) {
  const chunks: string[] = []
  for (let index = 0; index < text.length; index += 36)
    chunks.push(text.slice(index, index + 36))
  return chunks.length ? chunks : [text]
}

function getVirtualTree(traceId: string, kind: 'evidence' | 'conflicts' | 'missing') {
  const store = getKnowledgeMockStore()
  const cacheKey = `${traceId}:${kind}`
  const cached = kind === 'evidence'
    ? store.evidenceTrees[cacheKey]
    : kind === 'conflicts'
      ? store.conflictTrees[cacheKey]
      : store.missingTrees[cacheKey]

  if (cached)
    return structuredClone(cached) as QueryEvidenceVirtualTree

  const trace = store.traces[traceId]
  if (!trace)
    throw new MockServiceError(404, 'Answer trace not found')

  const bundle = trace.evidenceBundleId
    ? store.evidenceBundles[trace.evidenceBundleId]
    : undefined

  const tree = buildVirtualTree(traceId, kind, bundle)
  mutateKnowledgeMockStore((draft) => {
    if (kind === 'evidence')
      draft.evidenceTrees[cacheKey] = tree
    if (kind === 'conflicts')
      draft.conflictTrees[cacheKey] = tree
    if (kind === 'missing')
      draft.missingTrees[cacheKey] = tree
  })

  return structuredClone(tree) as QueryEvidenceVirtualTree
}

function buildVirtualTree(traceId: string, kind: 'evidence' | 'conflicts' | 'missing', bundle?: EvidenceBundle): QueryEvidenceVirtualTree {
  const basePath = `/evidence/traces/${traceId}/${kind}`

  if (kind === 'missing') {
    return {
      path: basePath,
      truncated: false,
      items: (bundle?.missingEvidence ?? []).map((entry, index) => ({
        kind: 'resource',
        name: `missing-${index + 1}`,
        path: `${basePath}/missing-${index + 1}`,
        metadata: { reason: entry.reason, text: entry.text },
        resourceType: 'evidence',
      })),
    }
  }

  if (kind === 'conflicts') {
    const conflicts = bundle?.items.flatMap(item => item.conflicts ?? []) ?? []
    return {
      path: basePath,
      truncated: false,
      items: conflicts.map((entry, index) => ({
        kind: 'resource',
        name: `conflict-${index + 1}`,
        path: `${basePath}/conflict-${index + 1}`,
        metadata: { severity: entry.severity, reason: entry.reason },
        resourceType: 'evidence',
      })),
    }
  }

  return {
    path: basePath,
    truncated: false,
    items: (bundle?.items ?? []).map((item, index) => ({
      kind: 'resource',
      name: `item-${index + 1}`,
      path: `${basePath}/item-${index + 1}`,
      metadata: {
        score: item.score,
        text: item.text,
      },
      resourceType: 'evidence',
      targetId: item.nodeId,
    })),
  }
}
