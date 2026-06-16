import { StatusBadge } from '../../components/badges'
import { EmptyPanel, Panel } from '../../components/panel'
import type {
  KnowledgeSpaceManifest,
  KnowledgeSpaceStats,
  KnowledgeSpaceStatus,
} from '../../api-types'

export function OverviewApiPanels({
  manifest,
  status,
  stats,
  loading,
  error,
}: {
  manifest: KnowledgeSpaceManifest | null
  status: KnowledgeSpaceStatus | null
  stats: KnowledgeSpaceStats | null
  loading: boolean
  error: string | null
}) {
  if (loading) {
    return (
      <Panel title="Knowledge space API" badge="Loading">
        <EmptyPanel text="Loading manifest, status, and stats…" />
      </Panel>
    )
  }

  if (error) {
    return (
      <Panel title="Knowledge space API" badge="Error">
        <EmptyPanel text={error} />
      </Panel>
    )
  }

  if (!manifest || !status || !stats) {
    return (
      <Panel title="Knowledge space API" badge="Empty">
        <EmptyPanel text="No API summary available for this knowledge space." />
      </Panel>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-3 xl:grid-cols-3">
      <Panel title="Manifest" badge={`v${manifest.manifestVersion}`}>
        <dl className="space-y-2">
          <OverviewField label="Storage" value={manifest.storageProvider} />
          <OverviewField label="Consistency" value={manifest.consistencyPolicy.defaultClass} />
          <OverviewField label="Parser policy" value={manifest.parserPolicyVersion} />
          <OverviewField label="Projection set" value={manifest.projectionSetVersion} />
          <OverviewField label="Object prefix" value={manifest.objectKeyPrefix} />
          <OverviewField label="Min client" value={manifest.minClientVersion} />
        </dl>
      </Panel>

      <Panel title="Status" badge={status.storage.healthy ? 'Healthy' : 'Degraded'} badgeTone={status.storage.healthy ? 'good' : 'warn'}>
        <dl className="space-y-2">
          <OverviewField label="Parser" value={`${status.parser.kind} · ${status.parser.policyVersion}`} />
          <OverviewField label="Storage" value={`${status.storage.provider} / ${status.storage.objectStorageKind}`} />
          <OverviewField label="Projection version" value={String(status.index.projectionVersion)} />
          <OverviewField label="Dense ready" value={String(status.index.summaries.denseVector.ready)} />
          <OverviewField label="FTS ready" value={String(status.index.summaries.fts.ready)} />
          <OverviewField label="Active leases" value={String(status.activeLeases.count)} />
          <OverviewField label="Failed commits" value={String(status.failedCommits.count)} />
        </dl>
      </Panel>

      <Panel title="Stats" badge={`${stats.window.minutes}m window`}>
        <dl className="space-y-2">
          <OverviewField label="Documents" value={String(stats.storage.documentCount)} />
          <OverviewField label="Raw bytes" value={formatBytes(stats.storage.rawDocumentBytes)} />
          <OverviewField label="Dense total" value={String(stats.projections.denseVector.total)} />
          <OverviewField label="Graph total" value={String(stats.projections.graph.total)} />
          <OverviewField label="Failed retryable" value={String(stats.commits.failedRetryable)} />
          <OverviewField label="Cache entries" value={String(stats.cache.entries)} />
          <OverviewField label="Generated" value={formatTimestamp(stats.generatedAt)} />
        </dl>
      </Panel>
    </div>
  )
}

function OverviewField({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <dt className="system-xs-medium text-text-tertiary">{label}</dt>
      <dd className="max-w-[60%] truncate text-right system-xs-regular text-text-secondary" title={value}>{value}</dd>
    </div>
  )
}

function formatBytes(bytes: number) {
  if (bytes < 1024)
    return `${bytes} B`
  if (bytes < 1024 * 1024)
    return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function formatTimestamp(iso: string) {
  return new Date(iso).toLocaleString()
}

export function OverviewSpaceMeta({
  spaceId,
  slug,
  tenantId,
}: {
  spaceId: string
  slug?: string
  tenantId?: string
}) {
  return (
    <div className="flex flex-wrap gap-2">
      <StatusBadge label={`ID ${spaceId.slice(0, 8)}…`} tone="neutral" />
      {slug && <StatusBadge label={`slug ${slug}`} tone="info" />}
      {tenantId && <StatusBadge label={tenantId} tone="neutral" />}
    </div>
  )
}
