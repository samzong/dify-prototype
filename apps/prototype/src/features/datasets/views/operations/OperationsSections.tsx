import { Button } from '@langgenius/dify-ui/button'
import { useCallback, useEffect, useState } from 'react'
import { MockServiceError } from '../../api-types'
import type {
  KnowledgeFsGcDryRunReport,
  KnowledgeFsLease,
  KnowledgeFsStagedObjectGcExecuteResult,
  KnowledgeFsckReport,
  KnowledgeSpaceStagedCommit,
} from '../../api-types'
import {
  executeGc,
  getGcDryRun,
  listActiveLeases,
  listStagedCommits,
  releaseLease,
  runFsck,
  triggerProjectionRebuild,
} from '../../mock-services'
import { ActionToast, DetailRow, EmptyPanel, Panel } from '../../components/panel'
import { StatusBadge } from '../../components/badges'

function mockErrorMessage(error: unknown) {
  if (error instanceof MockServiceError)
    return error.message
  if (error instanceof Error)
    return error.message
  return 'Operation failed'
}

export function OperationsSections({ spaceId }: { spaceId: string }) {
  const [fsckReport, setFsckReport] = useState<KnowledgeFsckReport | null>(null)
  const [gcDryRun, setGcDryRun] = useState<KnowledgeFsGcDryRunReport | null>(null)
  const [gcResult, setGcResult] = useState<KnowledgeFsStagedObjectGcExecuteResult | null>(null)
  const [leases, setLeases] = useState<KnowledgeFsLease[]>([])
  const [commits, setStagedCommits] = useState<KnowledgeSpaceStagedCommit[]>([])
  const [loading, setLoading] = useState(true)
  const [runningFsck, setRunningFsck] = useState(false)
  const [runningGc, setRunningGc] = useState(false)
  const [rebuilding, setRebuilding] = useState(false)
  const [toast, setToast] = useState('')

  const showToast = (message: string) => {
    setToast(message)
    window.setTimeout(() => setToast(''), 2200)
  }

  const refresh = useCallback(async () => {
    setLoading(true)
    try {
      const [nextFsck, nextGc, nextLeases, nextCommits] = await Promise.all([
        runFsck(spaceId),
        getGcDryRun(spaceId),
        listActiveLeases(spaceId),
        listStagedCommits(spaceId),
      ])
      setFsckReport(nextFsck)
      setGcDryRun(nextGc)
      setLeases(nextLeases.filter(lease => lease.status === 'active'))
      setStagedCommits(nextCommits)
    }
    catch (error) {
      showToast(mockErrorMessage(error))
    }
    finally {
      setLoading(false)
    }
  }, [spaceId])

  useEffect(() => {
    void refresh()
  }, [refresh])

  const handleFsck = async () => {
    setRunningFsck(true)
    try {
      setFsckReport(await runFsck(spaceId))
      showToast('Fsck scan completed.')
    }
    catch (error) {
      showToast(mockErrorMessage(error))
    }
    finally {
      setRunningFsck(false)
    }
  }

  const handleGcExecute = async () => {
    if (!gcDryRun)
      return
    setRunningGc(true)
    try {
      const result = await executeGc(spaceId, gcDryRun.dryRunId)
      setGcResult(result)
      showToast(`GC executed · ${result.deleted} deleted, ${result.skipped} skipped.`)
      await refresh()
    }
    catch (error) {
      showToast(mockErrorMessage(error))
    }
    finally {
      setRunningGc(false)
    }
  }

  const handleReleaseLease = async (leaseId: string) => {
    try {
      await releaseLease(spaceId, leaseId)
      showToast('Lease released.')
      await refresh()
    }
    catch (error) {
      showToast(mockErrorMessage(error))
    }
  }

  const handleRebuild = async () => {
    setRebuilding(true)
    try {
      const result = await triggerProjectionRebuild(spaceId)
      showToast(`Projection rebuild queued (${result.commitId}).`)
      await refresh()
    }
    catch (error) {
      showToast(mockErrorMessage(error))
    }
    finally {
      setRebuilding(false)
    }
  }

  if (loading && !fsckReport) {
    return <EmptyPanel text="Loading operations data…" />
  }

  return (
    <div className="space-y-4 pr-6">
      <Panel title="Projection rebuild" badge="Maintenance">
        <p className="system-sm-regular text-text-secondary">
          Queue a projection publish from the latest verified staged commits. Moved here from Overview and Settings.
        </p>
        <Button variant="primary" size="small" className="mt-3" loading={rebuilding} onClick={() => void handleRebuild()}>
          Queue projection rebuild
        </Button>
      </Panel>

      <Panel title="Fsck" badge={fsckReport ? `${fsckReport.summary.error} errors` : '—'}>
        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" size="small" loading={runningFsck} onClick={() => void handleFsck()}>Run fsck</Button>
        </div>
        {!fsckReport && <EmptyPanel text="No fsck report loaded." />}
        {fsckReport && (
          <div className="mt-3 space-y-2">
            <DetailRow label="Scanned" value={String(fsckReport.summary.scanned)} />
            <DetailRow label="Warnings" value={String(fsckReport.summary.warning)} />
            <DetailRow label="Errors" value={String(fsckReport.summary.error)} />
            <DetailRow label="Repairable" value={String(fsckReport.summary.repairable)} />
            <ul className="mt-2 space-y-2">
              {fsckReport.issues.map(issue => (
                <li key={`${issue.code}-${issue.message}`} className="rounded-lg border border-divider-subtle bg-background-default-subtle px-3 py-2">
                  <div className="flex flex-wrap gap-2">
                    <StatusBadge label={issue.severity} tone={issue.severity === 'error' || issue.severity === 'critical' ? 'bad' : 'warn'} />
                    <StatusBadge label={issue.repairability} tone="neutral" />
                  </div>
                  <p className="mt-2 system-sm-regular text-text-secondary">{issue.message}</p>
                  <p className="mt-1 system-xs-regular text-text-tertiary">{issue.target.type}{issue.target.virtualPath ? ` · ${issue.target.virtualPath}` : ''}</p>
                </li>
              ))}
            </ul>
          </div>
        )}
      </Panel>

      <Panel title="Staged object GC" badge={gcDryRun?.summary.candidateCount ? `${gcDryRun.summary.candidateCount} candidates` : '0'}>
        {!gcDryRun && <EmptyPanel text="No GC dry-run report." />}
        {gcDryRun && (
          <div className="space-y-2">
            <DetailRow label="Dry run ID" value={gcDryRun.dryRunId} />
            <DetailRow label="Estimated bytes" value={String(gcDryRun.summary.estimatedBytes)} />
            <DetailRow label="Staged objects" value={String(gcDryRun.summary.stagedObjectCount)} />
            <DetailRow label="Failed commits" value={String(gcDryRun.summary.failedCommitCount)} />
            <Button variant="secondary" size="small" className="mt-2" loading={runningGc} onClick={() => void handleGcExecute()}>
              Execute GC
            </Button>
            {gcResult && (
              <div className="mt-2 rounded-lg border border-divider-subtle bg-background-default-subtle px-3 py-2 system-xs-regular text-text-secondary">
                Last run: {gcResult.deleted} deleted · {gcResult.skipped} skipped
              </div>
            )}
          </div>
        )}
      </Panel>

      <div className="grid grid-cols-1 gap-3 xl:grid-cols-2">
        <Panel title="Active leases" badge={String(leases.length)}>
          {!leases.length && <EmptyPanel text="No active leases." />}
          {leases.map(lease => (
            <div key={lease.id} className="mb-2 rounded-lg border border-divider-subtle bg-background-default-subtle px-3 py-2">
              <DetailRow label="Type" value={lease.leaseType} />
              <DetailRow label="Target" value={lease.virtualPath} />
              <DetailRow label="Expires" value={new Date(lease.expiresAt).toLocaleString()} />
              <Button variant="ghost" size="small" className="mt-2" onClick={() => void handleReleaseLease(lease.id)}>Release</Button>
            </div>
          ))}
        </Panel>

        <Panel title="Staged commits" badge={String(commits.length)}>
          {!commits.length && <EmptyPanel text="No staged commits." />}
          {commits.map(commit => (
            <div key={commit.id} className="mb-2 rounded-lg border border-divider-subtle bg-background-default-subtle px-3 py-2">
              <div className="flex flex-wrap gap-2">
                <StatusBadge label={commit.status} tone={commit.status.startsWith('failed') ? 'bad' : 'info'} />
                <StatusBadge label={commit.operationType} tone="neutral" />
              </div>
              <DetailRow label="Idempotency" value={commit.idempotencyKey} />
              {commit.errorMessage && <DetailRow label="Error" value={commit.errorMessage} />}
            </div>
          ))}
        </Panel>
      </div>

      <ActionToast message={toast} visible={!!toast} />
    </div>
  )
}
