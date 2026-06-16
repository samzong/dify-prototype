import { Button } from '@langgenius/dify-ui/button'
import { RiPlayLine } from '@remixicon/react'
import { useEffect, useState } from 'react'
import { MockServiceError } from '../api-types'
import {
  getKnowledgeSpace,
  getKnowledgeSpaceManifest,
  getKnowledgeSpaceStats,
  getKnowledgeSpaceStatus,
} from '../mock-services'
import { StatusBadge } from '../components/badges'
import type { DatasetItem, DatasetDetailTab } from '../fixtures/items'
import type {
  KnowledgeSpace,
  KnowledgeSpaceManifest,
  KnowledgeSpaceStats,
  KnowledgeSpaceStatus,
} from '../api-types'
import { ActionToast, EmptyPanel, Panel, TaskRow } from '../components/panel'
import { OverviewApiPanels, OverviewSpaceMeta } from './overview/OverviewApiPanels'
import { OverviewDialogs } from './overview/OverviewDialogs'
import { OverviewRuntimeRiskBanner } from './overview/OverviewRuntimeRiskBanner'

export function OverviewView({
  item,
  onNavigate,
  onDelete,
}: {
  item: DatasetItem
  onNavigate: (tab: DatasetDetailTab) => void
  onDelete?: (spaceId: string) => Promise<void>
}) {
  const [workflowOpen, setWorkflowOpen] = useState(false)
  const [rebuildOpen, setRebuildOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [tasks, setTasks] = useState(() => item.tasks.map(task => ({ ...task })))
  const [toast, setToast] = useState('')
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

  const showToast = (message: string) => {
    setToast(message)
    window.setTimeout(() => setToast(''), 2200)
  }

  const handleRebuild = () => {
    setTasks(current => [{ title: 'Rebuild index', detail: 'Projection rebuild queued for latest source snapshot', tone: 'info' as const }, ...current])
    setRebuildOpen(false)
    showToast('Index rebuild started.')
  }

  const handleDelete = async () => {
    if (!onDelete)
      return
    setDeleting(true)
    try {
      await onDelete(item.id)
      setDeleteOpen(false)
    }
    catch (cause) {
      showToast(cause instanceof MockServiceError ? cause.message : 'Delete failed.')
    }
    finally {
      setDeleting(false)
    }
  }

  const taskDestination = (title: string): DatasetDetailTab | undefined => {
    const lower = title.toLowerCase()
    if (lower.includes('sync') || lower.includes('crawl') || lower.includes('source'))
      return 'sources'
    if (lower.includes('import') || lower.includes('document'))
      return 'documents'
    if (lower.includes('pipeline'))
      return 'pipeline'
    if (lower.includes('projection') || lower.includes('reindex') || lower.includes('index'))
      return 'documents'
    return undefined
  }

  const blockerDestination = (title: string): DatasetDetailTab => {
    const lower = title.toLowerCase()
    if (lower.includes('source') || lower.includes('sync'))
      return 'sources'
    if (lower.includes('document') || lower.includes('parse'))
      return 'documents'
    if (lower.includes('evidence') || lower.includes('conflict'))
      return 'evidence'
    if (lower.includes('permission'))
      return 'settings'
    return 'quality'
  }

  return (
    <div className="space-y-4 pr-6">
      <div className="rounded-xl border border-components-panel-border bg-components-panel-bg p-4 shadow-xs">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="title-xl-semi-bold text-text-secondary">{item.name}</h2>
            </div>
            <div className="mt-2 flex flex-wrap gap-2">
              <StatusBadge label={item.type} tone="neutral" />
              <StatusBadge label={item.permission} tone="neutral" />
              <StatusBadge label={item.apiEnabled ? 'Service API on' : 'Service API off'} tone={item.apiEnabled ? 'good' : 'warn'} />
              <StatusBadge label={item.usageLabel} tone="info" />
            </div>
            <div className="mt-3">
              <OverviewSpaceMeta spaceId={item.id} slug={space?.slug} tenantId={space?.tenantId} />
            </div>
          </div>
          <div className="text-right">
            <div className="system-2xs-medium-uppercase text-text-tertiary">Updated</div>
            <div className="mt-1 title-2xl-semi-bold text-text-secondary">{item.updatedAt}</div>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {item.provider !== 'external' && (
          <Button variant="secondary" size="small" onClick={() => onNavigate('sources')}>Add source</Button>
        )}
        {item.provider !== 'external' && (
          <Button variant="secondary" size="small" onClick={() => setRebuildOpen(true)}>Rebuild index</Button>
        )}
        <Button variant="primary" size="small" onClick={() => onNavigate('evidence')}>
          <RiPlayLine className="size-4" />
          Run evidence test
        </Button>
        <Button variant="secondary" size="small" onClick={() => setWorkflowOpen(true)}>Connect to Workflow</Button>
        {onDelete && (
          <Button variant="secondary" size="small" onClick={() => setDeleteOpen(true)}>Delete</Button>
        )}
      </div>

      <OverviewApiPanels
        manifest={manifest}
        status={status}
        stats={stats}
        loading={apiLoading}
        error={apiError}
      />

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-5">
        {item.statusBlocks.map(block => (
          <button
            key={block.label}
            type="button"
            onClick={() => {
              if (block.label === 'External Knowledge API' || block.label === 'Retrieval')
                onNavigate('settings')
              if (block.label === 'Sources')
                onNavigate('sources')
              if (block.label === 'Documents' || block.label === 'Index')
                onNavigate(item.provider === 'external' ? 'evidence' : 'documents')
              if (block.label === 'Evidence')
                onNavigate('evidence')
              if (block.label === 'Usage')
                onNavigate('quality')
            }}
            className="rounded-xl border border-components-panel-border bg-components-panel-bg p-3 text-left shadow-xs hover:bg-state-base-hover"
          >
            <h3 className="system-2xs-medium-uppercase text-text-tertiary">{block.label}</h3>
            <div className="mt-2 title-xl-semi-bold text-text-secondary">{block.value}</div>
            <div className="mt-1 flex items-center gap-1.5">
              <StatusBadge label={block.note} tone={block.tone} />
            </div>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-3 xl:grid-cols-[1.4fr_0.8fr]">
        <Panel title="Active tasks" badge={String(tasks.length)}>
          {tasks.length
            ? tasks.map(task => (
                <TaskRow
                  key={task.title}
                  title={task.title}
                  detail={task.detail}
                  tone={task.tone}
                  onClick={() => {
                    const destination = taskDestination(task.title)
                    if (destination)
                      onNavigate(destination)
                  }}
                />
              ))
            : <EmptyPanel text="No active tasks." />}
        </Panel>
        <Panel title="Blockers" badge={String(item.blockers.length)}>
          {item.blockers.length
            ? item.blockers.map(blocker => (
                <TaskRow
                  key={blocker.title}
                  title={blocker.title}
                  detail={blocker.detail}
                  tone={blocker.tone}
                  onClick={() => onNavigate(blockerDestination(blocker.title))}
                />
              ))
            : <EmptyPanel text="No blockers recorded." />}
        </Panel>
      </div>

      <OverviewRuntimeRiskBanner item={item} onNavigate={onNavigate} />

      <OverviewDialogs
        item={item}
        rebuildOpen={rebuildOpen}
        workflowOpen={workflowOpen}
        deleteOpen={deleteOpen}
        deleting={deleting}
        onRebuildOpenChange={setRebuildOpen}
        onWorkflowOpenChange={setWorkflowOpen}
        onDeleteOpenChange={setDeleteOpen}
        onRebuild={handleRebuild}
        onDelete={() => void handleDelete()}
        onWorkflowConnect={(workflow) => {
          setWorkflowOpen(false)
          showToast(`Connected to ${workflow}.`)
        }}
      />

      <ActionToast message={toast} visible={!!toast} />
    </div>
  )
}
