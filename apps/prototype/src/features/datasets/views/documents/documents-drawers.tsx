import type { DocumentCompilationJob, DocumentCompilationJobStage } from '../../api-types'
import type { BulkOperationProgress } from '../../api-types'
import { Button } from '@langgenius/dify-ui/button'
import type { ParseArtifact } from '../../api-types'
import { StatusBadge } from '../../components/badges'
import { SideDrawer } from '../../components/side-drawer'
import type { BadgeTone } from '../../fixtures/types'
import { DetailRow, EmptyPanel } from '../../components/panel'
import { formatDocumentBytes } from '../../fixtures/document-bridge'
import type { DatasetDocumentRow } from '../../fixtures/items'
import { compilationJobStageLabels } from './documents-helpers'

export { SideDrawer as DocumentsSideDrawer }

function jobStageTone(stage: DocumentCompilationJobStage): BadgeTone {
  if (stage === 'published' || stage === 'smoke_eval_passed')
    return 'good'
  if (stage === 'failed' || stage === 'canceled')
    return 'bad'
  return 'info'
}

export function DocumentJobDrawer({
  open,
  job,
  loading,
  error,
  onClose,
  onCancel,
  onRetry,
  canceling,
}: {
  open: boolean
  job: DocumentCompilationJob | null
  loading: boolean
  error: string | null
  onClose: () => void
  onCancel: () => void
  onRetry: () => void
  canceling: boolean
}) {
  const terminal = job && ['published', 'failed', 'canceled'].includes(job.stage)

  return (
    <SideDrawer
      open={open}
      title="Compilation job"
      description={job ? `Job ${job.id}` : 'Document ingest / index pipeline'}
      onClose={onClose}
    >
      {loading && <EmptyPanel text="Loading job status…" />}
      {!loading && error && <EmptyPanel text={error} />}
      {!loading && !error && job && (
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <StatusBadge label={compilationJobStageLabels[job.stage]} tone={jobStageTone(job.stage)} />
            <StatusBadge label={`Version ${job.version}`} tone="neutral" />
          </div>
          <DetailRow label="Document asset" value={job.documentAssetId} />
          <DetailRow label="Queue job" value={job.queueJobId} />
          <DetailRow label="Knowledge space" value={job.knowledgeSpaceId} />
          {job.error && <DetailRow label="Error" value={job.error} />}
          <div>
            <div className="mb-2 system-xs-medium text-text-tertiary">Stages</div>
            <ol className="space-y-2">
              {Object.entries(compilationJobStageLabels).map(([stage, label]) => {
                const active = job.stage === stage
                const passed = stageOrder(job.stage) > stageOrder(stage as DocumentCompilationJobStage)
                return (
                  <li
                    key={stage}
                    className={`rounded-lg border px-3 py-2 system-xs-regular ${active ? 'border-components-option-card-option-selected-border bg-components-option-card-option-selected-bg text-text-secondary' : passed ? 'border-divider-subtle text-text-secondary' : 'border-divider-subtle text-text-quaternary'}`}
                  >
                    {label}
                  </li>
                )
              })}
            </ol>
          </div>
          <div className="flex flex-wrap gap-2 pt-2">
            {!terminal && (
              <Button variant="secondary" size="small" loading={canceling} onClick={onCancel}>
                Cancel job
              </Button>
            )}
            {(job.stage === 'failed' || job.stage === 'canceled') && (
              <Button variant="primary" size="small" onClick={onRetry}>
                Retry
              </Button>
            )}
          </div>
        </div>
      )}
    </SideDrawer>
  )
}

export function DocumentArtifactDrawer({
  open,
  document,
  artifact,
  loading,
  error,
  onClose,
}: {
  open: boolean
  document: DatasetDocumentRow | null
  artifact: ParseArtifact | null
  loading: boolean
  error: string | null
  onClose: () => void
}) {
  return (
    <SideDrawer
      open={open}
      title="Parse artifact"
      description={document ? `${document.name} · ${document.version}` : undefined}
      onClose={onClose}
    >
      {loading && <EmptyPanel text="Loading parse artifact…" />}
      {!loading && error && <EmptyPanel text={error} />}
      {!loading && !error && document?.parserStatus === 'failed' && (
        <div className="mb-4 rounded-lg border border-util-colors-warning-warning-500/30 bg-util-colors-warning-warning-50 px-3 py-2 system-sm-regular text-text-secondary dark:bg-util-colors-warning-warning-500/10">
          Parser failed before a parse artifact could be published for this document version.
        </div>
      )}
      {!loading && !error && artifact && (
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <StatusBadge label={artifact.parser} tone="info" />
            <StatusBadge label={artifact.contentType} tone="neutral" />
            <StatusBadge label={`v${artifact.version}`} tone="neutral" />
          </div>
          <DetailRow label="Artifact hash" value={artifact.artifactHash.slice(0, 16) + '…'} />
          <div>
            <div className="mb-2 system-xs-medium text-text-tertiary">Elements ({artifact.elements.length})</div>
            <div className="space-y-2">
              {artifact.elements.map(element => (
                <div key={element.id} className="rounded-lg border border-divider-subtle bg-background-default-subtle px-3 py-2">
                  <div className="flex items-center gap-2">
                    <StatusBadge label={element.type} tone="neutral" />
                    {element.pageNumber !== undefined && (
                      <span className="system-xs-regular text-text-quaternary">p.{element.pageNumber}</span>
                    )}
                  </div>
                  {element.text && (
                    <p className="mt-2 whitespace-pre-wrap system-xs-regular text-text-secondary">{element.text}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
          {artifact.metadata && Object.keys(artifact.metadata).length > 0 && (
            <DetailRow label="Metadata" value={JSON.stringify(artifact.metadata)} />
          )}
        </div>
      )}
      {!loading && !error && !artifact && document && (
        <EmptyPanel text="No parse artifact is available for this document version." />
      )}
    </SideDrawer>
  )
}

export function BulkJobDrawer({
  open,
  bulkJob,
  onClose,
}: {
  open: boolean
  bulkJob: BulkOperationProgress | null
  onClose: () => void
}) {
  return (
    <SideDrawer
      open={open}
      title="Bulk operation"
      description={bulkJob ? `${bulkJob.type.replaceAll('_', ' ')} · ${bulkJob.id}` : undefined}
      onClose={onClose}
    >
      {!bulkJob && <EmptyPanel text="No bulk job selected." />}
      {bulkJob && (
        <div className="space-y-4">
          <StatusBadge
            label={bulkJob.status}
            tone={bulkJob.status === 'completed' ? 'good' : bulkJob.status === 'failed' ? 'bad' : 'info'}
          />
          <DetailRow label="Progress" value={`${bulkJob.completedItems} / ${bulkJob.totalItems}`} />
          <DetailRow label="Failed items" value={String(bulkJob.failedItems)} />
          {bulkJob.failedItemIds.length > 0 && (
            <div>
              <div className="mb-2 system-xs-medium text-text-tertiary">Failed document IDs</div>
              <ul className="space-y-1">
                {bulkJob.failedItemIds.map(id => (
                  <li key={id} className="truncate system-xs-regular text-text-secondary">{id}</li>
                ))}
              </ul>
            </div>
          )}
          <div className="h-1.5 overflow-hidden rounded-full bg-background-default-dimmed">
            <div
              className="h-full rounded-full bg-util-colors-blue-blue-500 transition-all"
              style={{ width: `${Math.min(100, Math.round((bulkJob.completedItems / Math.max(1, bulkJob.totalItems)) * 100))}%` }}
            />
          </div>
        </div>
      )}
    </SideDrawer>
  )
}

export function DocumentApiDetails({ document }: { document: DatasetDocumentRow }) {
  return (
    <div className="space-y-2 border-t border-divider-subtle pt-3">
      <div className="system-xs-semibold-uppercase text-text-tertiary">API fields</div>
      <DetailRow label="MIME type" value={document.mimeType ?? '—'} />
      <DetailRow label="Size" value={formatDocumentBytes(document.sizeBytes)} />
      <DetailRow label="Object key" value={document.objectKey ?? '—'} />
      <DetailRow label="SHA-256" value={document.sha256 ? `${document.sha256.slice(0, 12)}…` : '—'} />
      <DetailRow label="Source ID" value={document.sourceId ?? '—'} />
      <DetailRow label="Numeric version" value={document.versionNumber !== undefined ? String(document.versionNumber) : '—'} />
    </div>
  )
}

function stageOrder(stage: DocumentCompilationJobStage) {
  const order: DocumentCompilationJobStage[] = [
    'queued',
    'parsed',
    'nodes_generated',
    'projection_built',
    'smoke_eval_passed',
    'published',
    'failed',
    'canceled',
  ]
  return order.indexOf(stage)
}
