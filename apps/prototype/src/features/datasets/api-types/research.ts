import type { EvidenceBundle } from './queries'
import type { Uuid } from './common'

export type ResearchTaskStage =
  | 'queued'
  | 'planning'
  | 'retrieving'
  | 'analyzing'
  | 'generating'
  | 'completed'
  | 'failed'
  | 'canceled'

export type ResearchTaskJob = {
  id: string
  knowledgeSpaceId: string
  tenantId: string
  subjectId: string
  queueJobId: string
  query: string
  stage: ResearchTaskStage
  budgetUsd?: number
  error?: string
  metadata: Record<string, unknown>
  permissionScope: Record<string, unknown>
  limits?: {
    maxRetrievalSteps?: number
    maxScannedResources?: number
    maxToolCalls?: number
    timeoutMs?: number
  }
  cost: {
    totalUsd: number
    budgetUsd?: number
    budgetExceeded?: boolean
    entries: {
      step: string
      provider: string
      costUsd: number
      recordedAt: number
      usage: Record<string, unknown>
    }[]
  }
  createdAt: number
  updatedAt: number
  completedAt?: number
}

export type ResearchTaskPartialResult = {
  researchTaskJobId: string
  knowledgeSpaceId: string
  tenantId: string
  sequence: number
  evidenceBundle: EvidenceBundle
}

export type ResearchTaskPartialResultList = {
  items: ResearchTaskPartialResult[]
  nextCursor?: string
}

export type ResearchTaskEvent = {
  id: string
  type: 'stage' | 'partial' | 'log' | 'error'
  at: string
  message: string
  stage?: ResearchTaskStage
  sequence?: number
}

export type ResearchTaskDryRunPlan = {
  knowledgeSpaceId: Uuid
  query: string
  strategyVersion: 'research-dry-run-planner-v1'
  retrievalPlan: {
    requestedMode: 'auto' | 'deep' | 'fast' | 'research'
    resolvedMode: 'deep' | 'fast' | 'research'
    strategyVersion: string
    queryLanguage: 'cjk' | 'latin' | 'mixed-cjk-latin' | 'other'
    topK: number
    denseTopK: number
    ftsTopK: number
    fusionLimit: number
    rerankCandidateLimit: number
  }
  budget: {
    budgetUsd?: number
    exceedsBudget: boolean
    remainingBudgetUsd?: number
  }
  estimates: {
    totalTokens: number
    inputTokens: number
    outputTokens: number
    retrievalSteps: number
    scannedResources: number
    toolCalls: number
    cacheHitProbability: number
    latencyMs: { p50: number; p95: number }
    costUsd: { currency: 'USD'; min: number; max: number; estimated: number }
  }
  steps: {
    name: 'analyze' | 'generate' | 'plan' | 'retrieve'
    estimatedLatencyMs: number
    estimatedInputTokens: number
    estimatedOutputTokens: number
    estimatedToolCalls: number
    estimatedCostUsd: number
  }[]
}

export type ResearchTask = ResearchTaskJob

export const RESEARCH_TASK_STAGES: readonly ResearchTaskStage[] = [
  'queued',
  'planning',
  'retrieving',
  'analyzing',
  'generating',
  'completed',
]
