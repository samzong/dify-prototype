import type {
  KnowledgeSpaceManifest,
  KnowledgeSpaceStats,
  KnowledgeSpaceStatus,
  ProjectionSummary,
} from '../../api-types'
import type { BadgeTone, DatasetDetailTab } from '../../fixtures/types'

export type OverviewAttentionItem = {
  text: string
  tone: BadgeTone
  tab: DatasetDetailTab
  actionLabel: string
}

export type OverviewReadinessView = {
  verdict: { label: string; tone: BadgeTone; summary: string }
  kpis: { label: string; value: string; hint: string; hintTone: BadgeTone }[]
  policySummary: string[]
  activitySummary: string
  attention: OverviewAttentionItem[]
}

export function buildOverviewReadinessView(
  manifest: KnowledgeSpaceManifest,
  status: KnowledgeSpaceStatus,
  stats: KnowledgeSpaceStats,
): OverviewReadinessView {
  const stale = sumProjectionField(status.index.summaries, 'stale')
  const building = sumProjectionField(status.index.summaries, 'building')
  const failed = sumProjectionField(status.index.summaries, 'failed')
  const ready = sumProjectionField(status.index.summaries, 'ready')
  const total = sumProjectionField(status.index.summaries, 'total')

  const verdict = buildVerdict(status, stats, { stale, building, failed })

  const attention = buildAttentionItems(status, stats, { stale, building })

  const policySummary = [
    `${humanParserLabel(status.parser.kind)} with ${manifest.parserPolicyVersion}.`,
    `${humanConsistency(manifest.consistencyPolicy.defaultClass)} reads; snapshots expire after ${formatDurationSeconds(manifest.consistencyPolicy.snapshotTtlSeconds)}.`,
    `Traces kept ${manifest.retentionPolicy.traceRetentionDays} days; ${manifest.retentionPolicy.artifactVersionsToKeep} parse artifact versions retained.`,
    `Stored on ${humanStorage(manifest.storageProvider)} with ${manifest.encryptionPolicy.strategy} encryption.`,
  ]

  const activitySummary = stats.metrics.available
    ? `${stats.window.minutes}-minute window · ${stats.commits.sampled} commits sampled · cache ${stats.cache.entries} entries (${formatBytes(stats.cache.totalBytes)}).`
    : `${stats.window.minutes}-minute window · metrics unavailable${stats.metrics.reason ? `: ${stats.metrics.reason}` : ''}.`

  return {
    verdict,
    kpis: [
      {
        label: 'Documents',
        value: String(stats.storage.documentCount),
        hint: formatBytes(stats.storage.rawDocumentBytes),
        hintTone: stats.storage.documentCount === 0 ? 'warn' : 'neutral',
      },
      {
        label: 'Index slices ready',
        value: `${ready}/${total}`,
        hint: buildIndexHint({ failed, building, stale }),
        hintTone: indexHintTone({ failed, building, stale, total }),
      },
      {
        label: 'Commit queue',
        value: String(status.failedCommits.count),
        hint: status.failedCommits.count > 0
          ? `${stats.commits.failedRetryable} retryable in window`
          : 'No failed staged commits',
        hintTone: status.failedCommits.count > 0 || stats.commits.failedTerminal > 0 ? 'bad' : 'good',
      },
      {
        label: 'Active leases',
        value: String(status.activeLeases.count),
        hint: status.activeLeases.count > 0 ? 'Review before GC or rebuild' : 'No blocking leases',
        hintTone: status.activeLeases.count > 0 ? 'warn' : 'good',
      },
    ],
    policySummary,
    activitySummary,
    attention,
  }
}

function buildIndexHint(counts: { failed: number; building: number; stale: number }) {
  const parts = [
    counts.failed > 0 ? `${counts.failed} failed` : null,
    counts.building > 0 ? `${counts.building} building` : null,
    counts.stale > 0 ? `${counts.stale} stale` : null,
  ].filter(Boolean)

  if (parts.length === 0)
    return 'All projection kinds reporting'

  return parts.join(' · ')
}

function indexHintTone(counts: { failed: number; building: number; stale: number; total: number }): BadgeTone {
  if (counts.failed === 0 && counts.building === 0 && counts.stale === 0)
    return 'good'

  if (counts.failed > 0) {
    const ratio = counts.total > 0 ? counts.failed / counts.total : 1
    if (ratio >= 0.05 || counts.failed >= 5)
      return 'bad'
    return 'warn'
  }

  if (counts.building > 0)
    return 'info'

  return 'warn'
}

function buildVerdict(
  status: KnowledgeSpaceStatus,
  stats: KnowledgeSpaceStats,
  counts: { stale: number; building: number; failed: number },
) {
  if (!status.storage.healthy || counts.failed > 0 || stats.commits.failedTerminal > 0) {
    return {
      label: 'Needs attention',
      tone: 'bad' as const,
      summary: 'Storage or projection failures may block reliable retrieval. Use the links below to fix each issue.',
    }
  }

  if (counts.stale > 0 || counts.building > 0 || status.failedCommits.count > 0) {
    return {
      label: 'Catching up',
      tone: 'warn' as const,
      summary: counts.building > 0
        ? 'Index projections are still publishing. Answers may be incomplete until build finishes.'
        : 'Some projections are stale or commits need review. Use the links below if you need to intervene.',
    }
  }

  return {
    label: 'Ready for retrieval',
    tone: 'good' as const,
    summary: 'Storage is healthy and published projections are ready. Run an evidence test to validate answer quality.',
  }
}

function buildAttentionItems(
  status: KnowledgeSpaceStatus,
  stats: KnowledgeSpaceStats,
  counts: { stale: number; building: number },
): OverviewAttentionItem[] {
  const items: OverviewAttentionItem[] = []

  if (!status.storage.healthy)
    items.push({ text: 'Storage provider is degraded.', tone: 'bad', tab: 'operations', actionLabel: 'Operations' })

  if (counts.stale > 0 || counts.building > 0) {
    const parts = [
      counts.stale > 0 ? `${counts.stale} stale` : null,
      counts.building > 0 ? `${counts.building} building` : null,
    ].filter(Boolean).join(', ')
    const tab = counts.building > 0 ? 'documents' : 'operations'
    items.push({
      text: `Projection index: ${parts} slice${counts.stale + counts.building === 1 ? '' : 's'}.`,
      tone: counts.stale > 0 ? 'warn' : 'info',
      tab,
      actionLabel: tab === 'documents' ? 'Documents' : 'Operations',
    })
  }

  if (status.activeLeases.count > 0) {
    items.push({
      text: `${status.activeLeases.count} active lease${status.activeLeases.count === 1 ? '' : 's'} — review before GC or rebuild.`,
      tone: 'warn',
      tab: 'operations',
      actionLabel: 'Operations',
    })
  }

  if (status.failedCommits.count > 0) {
    items.push({
      text: `${status.failedCommits.count} failed staged commit${status.failedCommits.count === 1 ? '' : 's'} waiting in queue.`,
      tone: 'warn',
      tab: 'operations',
      actionLabel: 'Operations',
    })
  }

  if (stats.commits.failedTerminal > 0) {
    items.push({
      text: `${stats.commits.failedTerminal} terminal commit failure${stats.commits.failedTerminal === 1 ? '' : 's'} in the recent window.`,
      tone: 'bad',
      tab: 'operations',
      actionLabel: 'Operations',
    })
  }

  if (!stats.cache.available) {
    items.push({
      text: stats.metrics.reason ?? 'Evidence cache is unavailable.',
      tone: 'warn',
      tab: 'operations',
      actionLabel: 'Operations',
    })
  }

  return items
}

function sumProjectionField(
  summaries: KnowledgeSpaceStatus['index']['summaries'],
  field: keyof ProjectionSummary,
) {
  return summaries.denseVector[field]
    + summaries.fts[field]
    + summaries.graph[field]
    + summaries.metadata[field]
}

function formatBytes(bytes: number) {
  if (bytes < 1024)
    return `${bytes} B`
  if (bytes < 1024 * 1024)
    return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function formatDurationSeconds(seconds: number) {
  if (seconds < 3600)
    return `${Math.round(seconds / 60)} min`
  return `${Math.round(seconds / 3600)} h`
}

function humanParserLabel(kind: KnowledgeSpaceStatus['parser']['kind']) {
  if (kind === 'native-markdown')
    return 'Markdown parser'
  if (kind === 'native-html')
    return 'HTML parser'
  if (kind === 'native-structured')
    return 'Structured parser'
  return 'Unstructured parser'
}

function humanConsistency(value: string) {
  return value.replace(/-/g, ' ')
}

function humanStorage(provider: string) {
  if (provider === 'memory-dev')
    return 'dev memory storage'
  if (provider === 'r2')
    return 'Cloudflare R2'
  return provider
}
