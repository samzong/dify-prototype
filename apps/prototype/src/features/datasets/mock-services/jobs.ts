import type { BulkOperationProgress, DocumentCompilationJob, DocumentCompilationJobStage } from '../api-types'
import { DOCUMENT_COMPILATION_JOB_STAGES, MockServiceError } from '../api-types'
import { delay, pollStages } from './helpers'
import { getKnowledgeMockStore, mutateKnowledgeMockStore } from './store'

export async function getJob(jobId: string) {
  await delay(100)
  const job = getKnowledgeMockStore().jobs[jobId]
  if (!job)
    throw new MockServiceError(404, 'Document compilation job not found')

  return structuredClone(job) as DocumentCompilationJob
}

export async function cancelJob(jobId: string) {
  await delay(160)
  const existing = getKnowledgeMockStore().jobs[jobId]
  if (!existing)
    throw new MockServiceError(404, 'Document compilation job not found')

  if (existing.stage === 'published' || existing.stage === 'failed')
    throw new MockServiceError(409, 'Document compilation job cannot be canceled')

  let canceled: DocumentCompilationJob | null = null

  mutateKnowledgeMockStore((draft) => {
    const job = draft.jobs[jobId]
    if (!job)
      return

    job.stage = 'canceled'
    job.updatedAt = Date.now()
    job.completedAt = Date.now()
    canceled = structuredClone(job)
  })

  return canceled!
}

export async function pollJobUntilDone(
  jobId: string,
  onTick?: (job: DocumentCompilationJob) => void,
  intervalMs = 400,
) {
  const terminal: DocumentCompilationJobStage[] = ['published', 'failed', 'canceled']
  let latest = await getJob(jobId)

  if (terminal.includes(latest.stage)) {
    onTick?.(latest)
    return latest
  }

  const startIndex = Math.max(DOCUMENT_COMPILATION_JOB_STAGES.indexOf(latest.stage as typeof DOCUMENT_COMPILATION_JOB_STAGES[number]), 0)
  const remaining = DOCUMENT_COMPILATION_JOB_STAGES.slice(startIndex + 1)

  await pollStages(remaining, async (stage) => {
    mutateKnowledgeMockStore((draft) => {
      const job = draft.jobs[jobId]
      if (!job)
        return

      job.stage = stage
      job.updatedAt = Date.now()
      if (stage === 'published')
        job.completedAt = Date.now()
    })
    latest = await getJob(jobId)
    onTick?.(latest)
  }, intervalMs)

  return latest
}

export async function getBulkJob(bulkJobId: string) {
  await delay(100)
  const progress = buildBulkJobProgress(bulkJobId)
  if (!progress)
    throw new MockServiceError(404, 'Bulk job not found')

  return progress
}

function buildBulkJobProgress(bulkJobId: string): BulkOperationProgress | null {
  const store = getKnowledgeMockStore()
  const space = store.spaces[0]
  if (!space)
    return null

  const relatedJobs = Object.values(store.jobs).filter(job => job.knowledgeSpaceId === space.id)
  const failed = relatedJobs.filter(job => job.stage === 'failed').length
  const completed = relatedJobs.filter(job => job.stage === 'published').length
  const total = Math.max(relatedJobs.length, 1)

  return {
    id: bulkJobId,
    knowledgeSpaceId: space.id,
    type: 'document_upload',
    status: failed > 0 && completed === 0 ? 'failed' : completed >= total ? 'completed' : 'running',
    totalItems: total,
    completedItems: completed,
    failedItems: failed,
    failedItemIds: relatedJobs.filter(job => job.stage === 'failed').map(job => job.documentAssetId),
    createdAt: new Date(Date.now() - 120000).toISOString(),
    updatedAt: new Date().toISOString(),
  }
}

export async function simulateReindexJob(spaceId: string, documentAssetId: string) {
  const jobId = `job-reindex-${documentAssetId}`
  mutateKnowledgeMockStore((draft) => {
    draft.jobs[jobId] = {
      id: jobId,
      knowledgeSpaceId: spaceId,
      tenantId: draft.spaces.find(space => space.id === spaceId)?.tenantId ?? 'tenant-prototype',
      documentAssetId,
      queueJobId: `queue-${jobId}`,
      stage: 'queued',
      version: 1,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    }
  })

  return pollJobUntilDone(jobId)
}
