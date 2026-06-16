import type {
  KnowledgeFsGcDryRunReport,
  KnowledgeFsLease,
  KnowledgeFsStagedObjectGcExecuteResult,
  KnowledgeFsckReport,
  KnowledgeSpaceStagedCommit,
} from '../api-types'
import { MockServiceError } from '../api-types'
import { delay } from './helpers'
import { getKnowledgeMockStore, mutateKnowledgeMockStore } from './store'

export async function runFsck(spaceId: string) {
  await delay(320)
  const report = getKnowledgeMockStore().fsckBySpaceId[spaceId]
  if (!report)
    throw new MockServiceError(404, 'Knowledge space not found')

  return structuredClone(report) as KnowledgeFsckReport
}

export async function getGcDryRun(spaceId: string) {
  await delay(240)
  const report = getKnowledgeMockStore().gcDryRunBySpaceId[spaceId]
  if (!report)
    throw new MockServiceError(404, 'Knowledge space not found')

  return structuredClone(report) as KnowledgeFsGcDryRunReport
}

export async function executeGc(spaceId: string, dryRunId: string) {
  await delay(360)
  const dryRun = getKnowledgeMockStore().gcDryRunBySpaceId[spaceId]
  if (!dryRun || dryRun.dryRunId !== dryRunId)
    throw new MockServiceError(404, 'GC dry run not found')

  const result: KnowledgeFsStagedObjectGcExecuteResult = {
    tenantId: dryRun.tenantId,
    deleted: Math.max(dryRun.summary.stagedObjectCount - 1, 0),
    skipped: dryRun.summary.stagedObjectCount > 0 ? 1 : 0,
    items: dryRun.candidates.map(candidate => ({
      idempotencyKey: candidate.idempotencyKey,
      objectKey: candidate.target.objectKey ?? candidate.idempotencyKey,
      status: candidate.candidateType === 'staged-object' && dryRun.summary.stagedObjectCount > 0
        ? 'skipped-active-lease'
        : 'deleted',
    })),
  }

  return result
}

export async function listActiveLeases(spaceId: string) {
  await delay(140)
  return (getKnowledgeMockStore().leasesBySpaceId[spaceId] ?? []).map(cloneLease)
}

export async function releaseLease(spaceId: string, leaseId: string) {
  await delay(180)
  let released: KnowledgeFsLease | null = null

  mutateKnowledgeMockStore((draft) => {
    const leases = draft.leasesBySpaceId[spaceId] ?? []
    const lease = leases.find(entry => entry.id === leaseId)
    if (!lease)
      return

    lease.status = 'released'
    lease.updatedAt = new Date().toISOString()
    released = structuredClone(lease)
  })

  if (!released)
    throw new MockServiceError(404, 'Lease not found')

  return released
}

export async function listStagedCommits(spaceId: string) {
  await delay(140)
  return (getKnowledgeMockStore().stagedCommitsBySpaceId[spaceId] ?? []).map(cloneStagedCommit)
}

function cloneLease(lease: KnowledgeFsLease) {
  return structuredClone(lease)
}

function cloneStagedCommit(commit: KnowledgeSpaceStagedCommit) {
  return structuredClone(commit)
}
