import type { ReactNode } from 'react'
import type {
  KnowledgeSpaceManifest,
  KnowledgeSpaceStats,
  KnowledgeSpaceStatus,
  ProjectionSummary,
} from '../../api-types'

export function OverviewTechnicalDetails({
  manifest,
  status,
  stats,
}: {
  manifest: KnowledgeSpaceManifest
  status: KnowledgeSpaceStatus
  stats: KnowledgeSpaceStats
}) {
  return (
    <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
      <TechnicalColumn title="Manifest">
        <TechnicalRow label="Storage" value={manifest.storageProvider} />
        <TechnicalRow label="Consistency" value={manifest.consistencyPolicy.defaultClass} />
        <TechnicalRow label="Object prefix" value={manifest.objectKeyPrefix} />
        <TechnicalRow label="Parser policy" value={manifest.parserPolicyVersion} />
        <TechnicalRow label="Projection set" value={manifest.projectionSetVersion} />
        <TechnicalRow label="Min client" value={manifest.minClientVersion} />
        <TechnicalRow label="Node schema" value={String(manifest.nodeSchemaVersion)} />
        <TechnicalRow label="Encryption" value={manifest.encryptionPolicy.strategy} />
      </TechnicalColumn>

      <TechnicalColumn title="Status">
        <TechnicalRow label="Storage health" value={status.storage.healthy ? 'healthy' : 'degraded'} />
        <TechnicalRow label="Parser" value={`${status.parser.kind} · ${status.parser.policyVersion}`} />
        <TechnicalRow label="Projection version" value={String(status.index.projectionVersion)} />
        <TechnicalRow label="Active leases" value={String(status.activeLeases.count)} />
        <TechnicalRow label="Active sessions" value={String(status.activeSessions.count)} />
        <TechnicalRow label="Failed commits" value={String(status.failedCommits.count)} />
        <ProjectionTechnical label="Dense" summary={status.index.summaries.denseVector} />
        <ProjectionTechnical label="FTS" summary={status.index.summaries.fts} />
        <ProjectionTechnical label="Graph" summary={status.index.summaries.graph} />
        <ProjectionTechnical label="Metadata" summary={status.index.summaries.metadata} />
      </TechnicalColumn>

      <TechnicalColumn title="Stats">
        <TechnicalRow label="Documents" value={String(stats.storage.documentCount)} />
        <TechnicalRow label="Raw bytes" value={String(stats.storage.rawDocumentBytes)} />
        <TechnicalRow label="Failed retryable" value={String(stats.commits.failedRetryable)} />
        <TechnicalRow label="Failed terminal" value={String(stats.commits.failedTerminal)} />
        <TechnicalRow label="Cache entries" value={String(stats.cache.entries)} />
        <TechnicalRow label="Cache bytes" value={String(stats.cache.totalBytes)} />
        <TechnicalRow label="Metrics" value={stats.metrics.available ? 'available' : (stats.metrics.reason ?? 'unavailable')} />
      </TechnicalColumn>
    </div>
  )
}

function TechnicalColumn({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div>
      <div className="mb-2 system-xs-semibold-uppercase text-text-tertiary">{title}</div>
      <dl className="space-y-1.5">{children}</dl>
    </div>
  )
}

function TechnicalRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <dt className="system-xs-medium text-text-tertiary">{label}</dt>
      <dd className="max-w-[58%] truncate text-right system-xs-regular text-text-secondary" title={value}>{value}</dd>
    </div>
  )
}

function ProjectionTechnical({ label, summary }: { label: string; summary: ProjectionSummary }) {
  return (
    <TechnicalRow
      label={label}
      value={`${summary.ready}/${summary.total} ready · ${summary.building}b · ${summary.stale}s · ${summary.failed}f`}
    />
  )
}
