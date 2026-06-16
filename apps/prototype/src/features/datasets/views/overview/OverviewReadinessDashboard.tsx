import { cn } from '@langgenius/dify-ui/cn'
import { Button } from '@langgenius/dify-ui/button'
import { useState } from 'react'
import type {
  KnowledgeSpaceManifest,
  KnowledgeSpaceStats,
  KnowledgeSpaceStatus,
} from '../../api-types'
import { StatusBadge } from '../../components/badges'
import { EmptyPanel, Panel } from '../../components/panel'
import type { BadgeTone, DatasetDetailTab } from '../../fixtures/items'
import { buildOverviewReadinessView } from './overview-api-summary'
import { OverviewTechnicalDetails } from './OverviewTechnicalDetails'

const kpiHintClasses: Record<BadgeTone, string> = {
  good: 'text-util-colors-green-green-600 dark:text-util-colors-green-green-500',
  warn: 'text-util-colors-warning-warning-700 dark:text-util-colors-warning-warning-500',
  bad: 'text-util-colors-red-red-600 dark:text-util-colors-red-red-500',
  info: 'text-text-accent',
  neutral: 'text-text-tertiary',
  purple: 'text-util-colors-violet-violet-600 dark:text-util-colors-violet-violet-500',
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
      {slug && <StatusBadge label={slug} tone="info" />}
      {tenantId && <StatusBadge label={tenantId} tone="neutral" />}
    </div>
  )
}

export function OverviewReadinessDashboard({
  manifest,
  status,
  stats,
  loading,
  error,
  onNavigate,
}: {
  manifest: KnowledgeSpaceManifest | null
  status: KnowledgeSpaceStatus | null
  stats: KnowledgeSpaceStats | null
  loading: boolean
  error: string | null
  onNavigate: (tab: DatasetDetailTab) => void
}) {
  const [technicalOpen, setTechnicalOpen] = useState(false)

  if (loading) {
    return (
      <Panel title="Retrieval readiness" badge="Loading">
        <EmptyPanel text="Checking manifest, status, and stats…" />
      </Panel>
    )
  }

  if (error) {
    return (
      <Panel title="Retrieval readiness" badge="Error">
        <EmptyPanel text={error} />
      </Panel>
    )
  }

  if (!manifest || !status || !stats)
    return null

  const view = buildOverviewReadinessView(manifest, status, stats)

  return (
    <div className="space-y-3">
      <Panel
        title="Retrieval readiness"
        badge={view.verdict.label}
        badgeTone={view.verdict.tone}
      >
        <p className="system-sm-regular text-text-secondary">{view.verdict.summary}</p>

        <div className="mt-4 grid grid-cols-2 gap-3 xl:grid-cols-4">
          {view.kpis.map(kpi => (
            <OverviewKpiTile key={kpi.label} {...kpi} />
          ))}
        </div>

        {view.attention.length > 0 && (
          <div className="mt-4 rounded-lg border border-divider-subtle bg-background-default-subtle px-3 py-3">
            <ul className="space-y-1.5">
              {view.attention.map(item => (
                <li key={item.text}>
                  <button
                    type="button"
                    className="flex w-full items-start justify-between gap-3 text-left system-sm-regular text-text-secondary hover:text-text-accent"
                    onClick={() => onNavigate(item.tab)}
                  >
                    <span className="flex items-start gap-2">
                      <StatusBadge label={item.tone === 'bad' ? 'Blocker' : item.tone === 'warn' ? 'Review' : 'Info'} tone={item.tone} />
                      <span>{item.text}</span>
                    </span>
                    <span className="shrink-0 system-xs-medium text-text-tertiary">{item.actionLabel}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </Panel>

      <div className="grid grid-cols-1 gap-3 xl:grid-cols-[1.2fr_0.8fr]">
        <Panel title="Policy snapshot" badge={`Manifest v${manifest.manifestVersion}`}>
          <ul className="space-y-2">
            {view.policySummary.map(line => (
              <li key={line} className="system-sm-regular text-text-secondary">{line}</li>
            ))}
          </ul>
        </Panel>

        <Panel title="Recent activity" badge={`${stats.window.minutes}m`}>
          <p className="system-sm-regular text-text-secondary">{view.activitySummary}</p>
          <p className="mt-3 system-xs-regular text-text-tertiary">
            Status snapshot
            {' '}
            {formatRelative(status.generatedAt)}
            {' · '}
            stats
            {' '}
            {formatRelative(stats.generatedAt)}
          </p>
        </Panel>
      </div>

      <Panel
        title="Technical API detail"
        badge={technicalOpen ? 'Expanded' : 'Collapsed'}
        action={(
          <Button variant="ghost" size="small" onClick={() => setTechnicalOpen(current => !current)}>
            {technicalOpen ? 'Hide' : 'Show'}
          </Button>
        )}
      >
        {technicalOpen
          ? (
              <OverviewTechnicalDetails manifest={manifest} status={status} stats={stats} />
            )
          : (
              <p className="system-sm-regular text-text-tertiary">
                Raw manifest, status, and stats fields for debugging. Most operators can stay in the summary above.
              </p>
            )}
      </Panel>
    </div>
  )
}

function OverviewKpiTile({
  label,
  value,
  hint,
  hintTone,
}: {
  label: string
  value: string
  hint: string
  hintTone: BadgeTone
}) {
  return (
    <div className="rounded-xl border border-divider-subtle bg-background-default-subtle px-4 py-3 shadow-xs">
      <div className="system-2xs-medium-uppercase text-text-tertiary">{label}</div>
      <div className="mt-1.5 title-2xl-semi-bold text-text-secondary">{value}</div>
      <p className={cn('mt-2 system-xs-medium', kpiHintClasses[hintTone])}>{hint}</p>
    </div>
  )
}

function formatRelative(iso: string) {
  const deltaMs = Date.now() - Date.parse(iso)
  if (Number.isNaN(deltaMs))
    return 'unknown'
  const minutes = Math.round(Math.abs(deltaMs) / 60000)
  if (minutes < 60)
    return `${minutes}m ago`
  const hours = Math.round(minutes / 60)
  if (hours < 48)
    return `${hours}h ago`
  return `${Math.round(hours / 24)}d ago`
}
