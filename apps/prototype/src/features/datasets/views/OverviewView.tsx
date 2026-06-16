import { useEffect, useState } from 'react'
import { MockServiceError } from '../api-types'
import {
  getKnowledgeSpace,
  getKnowledgeSpaceManifest,
  getKnowledgeSpaceStats,
  getKnowledgeSpaceStatus,
} from '../mock-services'
import { StatusBadge } from '../components/badges'
import type { DatasetDetailTab, DatasetItem } from '../fixtures/items'
import type {
  KnowledgeSpace,
  KnowledgeSpaceManifest,
  KnowledgeSpaceStats,
  KnowledgeSpaceStatus,
} from '../api-types'
import { formatKnowledgeSpaceUpdatedAt } from '../fixtures/knowledge-space-bridge'
import { OverviewReadinessDashboard, OverviewSpaceMeta } from './overview/OverviewReadinessDashboard'

export function OverviewView({
  item,
  onNavigate,
}: {
  item: DatasetItem
  onNavigate: (tab: DatasetDetailTab) => void
}) {
  const [space, setSpace] = useState<KnowledgeSpace | null>(null)
  const [manifest, setManifest] = useState<KnowledgeSpaceManifest | null>(null)
  const [status, setStatus] = useState<KnowledgeSpaceStatus | null>(null)
  const [stats, setStats] = useState<KnowledgeSpaceStats | null>(null)
  const [apiLoading, setApiLoading] = useState(true)
  const [apiError, setApiError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    async function loadApiSummary() {
      setApiLoading(true)
      setApiError(null)
      try {
        const [spaceResult, manifestResult, statusResult, statsResult] = await Promise.all([
          getKnowledgeSpace(item.id),
          getKnowledgeSpaceManifest(item.id),
          getKnowledgeSpaceStatus(item.id),
          getKnowledgeSpaceStats(item.id),
        ])
        if (cancelled)
          return
        setSpace(spaceResult)
        setManifest(manifestResult)
        setStatus(statusResult)
        setStats(statsResult)
      }
      catch (cause) {
        if (cancelled)
          return
        setApiError(cause instanceof MockServiceError ? cause.message : 'Failed to load knowledge space summary')
      }
      finally {
        if (!cancelled)
          setApiLoading(false)
      }
    }

    void loadApiSummary()
    return () => {
      cancelled = true
    }
  }, [item.id])

  const displayName = space?.name ?? item.name
  const displayUpdatedAt = space?.updatedAt
    ? formatKnowledgeSpaceUpdatedAt(space.updatedAt)
    : item.updatedAt

  return (
    <div className="space-y-4 pr-6">
      <div className="rounded-xl border border-components-panel-border bg-components-panel-bg p-4 shadow-xs">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="title-xl-semi-bold text-text-secondary">{displayName}</h2>
            {(space?.description ?? item.description) && (
              <p className="mt-2 max-w-2xl system-sm-regular text-text-secondary">{space?.description ?? item.description}</p>
            )}
            <div className="mt-2">
              <OverviewSpaceMeta spaceId={item.id} slug={space?.slug} tenantId={space?.tenantId} />
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <span className="system-2xs-medium-uppercase text-text-quaternary">Workspace</span>
              <StatusBadge label={item.type} tone="neutral" />
              <StatusBadge label={item.permission} tone="neutral" />
            </div>
          </div>
          <div className="text-right">
            <div className="system-2xs-medium-uppercase text-text-tertiary">Updated</div>
            <div className="mt-1 title-2xl-semi-bold text-text-secondary">{displayUpdatedAt}</div>
          </div>
        </div>
      </div>

      <OverviewReadinessDashboard
        manifest={manifest}
        status={status}
        stats={stats}
        loading={apiLoading}
        error={apiError}
        onNavigate={onNavigate}
      />
    </div>
  )
}
