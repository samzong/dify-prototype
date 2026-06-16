import type {
  ResearchTaskDryRunPlan,
  ResearchTaskEvent,
  ResearchTaskJob,
  ResearchTaskPartialResult,
  ResearchTaskPartialResultList,
  ResearchTaskStage,
} from '../api-types'
import { RESEARCH_TASK_STAGES } from '../api-types'
import { delay, emitStream, pollStages } from './helpers'
import { getKnowledgeMockStore, mutateKnowledgeMockStore } from './store'
import { MockServiceError } from '../api-types'

const PARTIALS_KEY = '_prototypePartials'
const EVENTS_KEY = '_prototypeEvents'

function readPartials(task: ResearchTaskJob) {
  return (task.metadata[PARTIALS_KEY] as ResearchTaskPartialResult[] | undefined) ?? []
}

function readEvents(task: ResearchTaskJob) {
  return (task.metadata[EVENTS_KEY] as ResearchTaskEvent[] | undefined) ?? []
}

function appendEvent(taskId: string, event: ResearchTaskEvent) {
  mutateKnowledgeMockStore((draft) => {
    const task = draft.researchTasks[taskId]
    if (!task)
      return
    const events = readEvents(task)
    events.push(event)
    task.metadata[EVENTS_KEY] = events
  })
}

function appendPartial(taskId: string, partial: ResearchTaskPartialResult) {
  mutateKnowledgeMockStore((draft) => {
    const task = draft.researchTasks[taskId]
    if (!task)
      return
    const partials = readPartials(task)
    partials.push(partial)
    task.metadata[PARTIALS_KEY] = partials
  })
}

export async function planResearchTask(input: { knowledgeSpaceId: string; query: string; budgetUsd?: number }) {
  await delay(220)

  const plan: ResearchTaskDryRunPlan = {
    knowledgeSpaceId: input.knowledgeSpaceId,
    query: input.query,
    strategyVersion: 'research-dry-run-planner-v1',
    retrievalPlan: {
      requestedMode: 'research',
      resolvedMode: 'research',
      strategyVersion: 'research-v1',
      queryLanguage: 'latin',
      topK: 12,
      denseTopK: 24,
      ftsTopK: 24,
      fusionLimit: 16,
      rerankCandidateLimit: 8,
    },
    budget: {
      budgetUsd: input.budgetUsd ?? 2,
      exceedsBudget: false,
      remainingBudgetUsd: input.budgetUsd ?? 2,
    },
    estimates: {
      totalTokens: 4800,
      inputTokens: 3200,
      outputTokens: 1600,
      retrievalSteps: 4,
      scannedResources: 18,
      toolCalls: 3,
      cacheHitProbability: 0.2,
      latencyMs: { p50: 4200, p95: 9800 },
      costUsd: { currency: 'USD', min: 0.4, max: 1.8, estimated: 0.9 },
    },
    steps: [
      { name: 'plan', estimatedLatencyMs: 600, estimatedInputTokens: 400, estimatedOutputTokens: 200, estimatedToolCalls: 0, estimatedCostUsd: 0.05 },
      { name: 'retrieve', estimatedLatencyMs: 1800, estimatedInputTokens: 1200, estimatedOutputTokens: 0, estimatedToolCalls: 2, estimatedCostUsd: 0.25 },
      { name: 'analyze', estimatedLatencyMs: 1200, estimatedInputTokens: 900, estimatedOutputTokens: 300, estimatedToolCalls: 1, estimatedCostUsd: 0.35 },
      { name: 'generate', estimatedLatencyMs: 900, estimatedInputTokens: 700, estimatedOutputTokens: 1100, estimatedToolCalls: 0, estimatedCostUsd: 0.25 },
    ],
  }

  return plan
}

export async function createResearchTask(input: {
  knowledgeSpaceId: string
  query: string
  budgetUsd?: number
}) {
  await delay(200)
  const now = Date.now()
  const task: ResearchTaskJob = {
    id: `research-${crypto.randomUUID()}`,
    knowledgeSpaceId: input.knowledgeSpaceId,
    tenantId: 'tenant-prototype',
    subjectId: 'subject-prototype',
    queueJobId: `queue-research-${now}`,
    query: input.query,
    stage: 'queued',
    budgetUsd: input.budgetUsd,
    metadata: {},
    permissionScope: {},
    limits: {
      maxRetrievalSteps: 8,
      maxScannedResources: 40,
      maxToolCalls: 6,
      timeoutMs: 120000,
    },
    cost: {
      totalUsd: 0,
      budgetUsd: input.budgetUsd,
      budgetExceeded: false,
      entries: [],
    },
    createdAt: now,
    updatedAt: now,
  }

  mutateKnowledgeMockStore((draft) => {
    draft.researchTasks[task.id] = task
  })

  return structuredClone(task)
}

export async function listResearchTasksBySpace(spaceId: string) {
  await delay(140)
  const items = Object.values(getKnowledgeMockStore().researchTasks)
    .filter(task => task.knowledgeSpaceId === spaceId)
    .sort((left, right) => right.createdAt - left.createdAt)
  return items.map(task => structuredClone(task) as ResearchTaskJob)
}

export async function getResearchTask(taskId: string) {
  await delay(100)
  const task = getKnowledgeMockStore().researchTasks[taskId]
  if (!task)
    throw new MockServiceError(404, 'Research task not found')

  return structuredClone(task) as ResearchTaskJob
}

export async function cancelResearchTask(taskId: string) {
  await delay(160)
  let canceled: ResearchTaskJob | null = null

  mutateKnowledgeMockStore((draft) => {
    const task = draft.researchTasks[taskId]
    if (!task)
      return

    if (task.stage === 'completed' || task.stage === 'failed')
      return

    task.stage = 'canceled'
    task.updatedAt = Date.now()
    task.completedAt = Date.now()
    appendEvent(taskId, {
      id: crypto.randomUUID(),
      type: 'log',
      at: new Date().toISOString(),
      message: 'Research task canceled',
      stage: 'canceled',
    })
    canceled = structuredClone(task)
  })

  if (!canceled)
    throw new MockServiceError(404, 'Research task not found')

  return canceled
}

export async function listResearchPartials(taskId: string): Promise<ResearchTaskPartialResultList> {
  await delay(120)
  const task = getKnowledgeMockStore().researchTasks[taskId]
  if (!task)
    throw new MockServiceError(404, 'Research task not found')

  return { items: readPartials(task).map(entry => structuredClone(entry)) }
}

export async function listResearchEvents(taskId: string) {
  await delay(100)
  const task = getKnowledgeMockStore().researchTasks[taskId]
  if (!task)
    throw new MockServiceError(404, 'Research task not found')

  return { items: readEvents(task).map(entry => structuredClone(entry)) }
}

export async function streamResearchEvents(
  taskId: string,
  onEvent: (event: ResearchTaskEvent) => void,
) {
  await getResearchTask(taskId)
  const stages = RESEARCH_TASK_STAGES.filter(stage => stage !== 'completed')
  let partialSequence = readPartials(getKnowledgeMockStore().researchTasks[taskId]!).length

  await emitStream(stages, async (stage) => {
    mutateKnowledgeMockStore((draft) => {
      const current = draft.researchTasks[taskId]
      if (!current)
        return

      current.stage = stage
      current.updatedAt = Date.now()
    })

    const event: ResearchTaskEvent = {
      id: crypto.randomUUID(),
      type: 'stage',
      at: new Date().toISOString(),
      message: `Research task entered ${stage}`,
      stage,
    }
    appendEvent(taskId, event)
    onEvent(event)

    if (stage === 'retrieving') {
      partialSequence += 1
      const task = getKnowledgeMockStore().researchTasks[taskId]!
      const bundle = Object.values(getKnowledgeMockStore().evidenceBundles)[0]
      if (bundle) {
        const partial: ResearchTaskPartialResult = {
          researchTaskJobId: taskId,
          knowledgeSpaceId: task.knowledgeSpaceId,
          tenantId: task.tenantId,
          sequence: partialSequence,
          evidenceBundle: {
            ...structuredClone(bundle),
            query: task.query,
            state: 'partial',
          },
        }
        appendPartial(taskId, partial)
        const partialEvent: ResearchTaskEvent = {
          id: crypto.randomUUID(),
          type: 'partial',
          at: new Date().toISOString(),
          message: `Partial result ${partialSequence} ready`,
          stage,
          sequence: partialSequence,
        }
        appendEvent(taskId, partialEvent)
        onEvent(partialEvent)
      }
    }
  })

  mutateKnowledgeMockStore((draft) => {
    const current = draft.researchTasks[taskId]
    if (!current)
      return

    current.stage = 'completed'
    current.updatedAt = Date.now()
    current.completedAt = Date.now()
    current.cost.totalUsd = 0.92
  })

  const completedEvent: ResearchTaskEvent = {
    id: crypto.randomUUID(),
    type: 'stage',
    at: new Date().toISOString(),
    message: 'Research task completed',
    stage: 'completed',
  }
  appendEvent(taskId, completedEvent)
  onEvent(completedEvent)

  return getResearchTask(taskId)
}

export async function runResearchTask(taskId: string, onEvent?: (event: ResearchTaskEvent) => void) {
  return streamResearchEvents(taskId, onEvent ?? (() => {}))
}

export async function simulateResearchTaskStages(
  taskId: string,
  onStage?: (stage: ResearchTaskStage) => void,
) {
  await pollStages(RESEARCH_TASK_STAGES, async (stage) => {
    mutateKnowledgeMockStore((draft) => {
      const task = draft.researchTasks[taskId]
      if (!task)
        return

      task.stage = stage
      task.updatedAt = Date.now()
      if (stage === 'completed')
        task.completedAt = Date.now()
    })
    onStage?.(stage)
  })
}
