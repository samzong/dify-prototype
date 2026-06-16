import { Button } from '@langgenius/dify-ui/button'
import { Dialog, DialogCloseButton, DialogContent, DialogTitle } from '@langgenius/dify-ui/dialog'
import { RiPlayLine } from '@remixicon/react'
import { useState } from 'react'
import { StatusBadge } from '../components/badges'
import type { DatasetItem, DatasetDetailTab } from '../fixtures/items'
import { ActionToast, EmptyPanel, Panel, TaskRow } from '../components/panel'

export function OverviewView({
  item,
  onNavigate,
}: {
  item: DatasetItem
  onNavigate: (tab: DatasetDetailTab) => void
}) {
  const [workflowOpen, setWorkflowOpen] = useState(false)
  const [rebuildOpen, setRebuildOpen] = useState(false)
  const [tasks, setTasks] = useState(() => item.tasks.map(task => ({ ...task })))
  const [toast, setToast] = useState('')

  const showToast = (message: string) => {
    setToast(message)
    window.setTimeout(() => setToast(''), 2200)
  }

  const handleRebuild = () => {
    setTasks(current => [{ title: 'Rebuild index', detail: 'Projection rebuild queued for latest source snapshot', tone: 'info' as const }, ...current])
    setRebuildOpen(false)
    showToast('Index rebuild started.')
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
      </div>

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

      <RuntimeRiskBanner item={item} onNavigate={onNavigate} />

      <Dialog open={rebuildOpen} onOpenChange={setRebuildOpen}>
        <DialogContent className="w-[480px] max-w-[calc(100vw-2rem)]">
          <DialogCloseButton />
          <DialogTitle className="system-md-semibold text-text-secondary">Rebuild index</DialogTitle>
          <p className="mt-2 system-sm-regular text-text-tertiary">
            Queue a new projection publish from the latest source snapshot. Apps and workflows may see stale answers until publish completes.
          </p>
          <div className="mt-6 flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setRebuildOpen(false)}>Cancel</Button>
            <Button variant="primary" onClick={handleRebuild}>Rebuild index</Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={workflowOpen} onOpenChange={setWorkflowOpen}>
        <DialogContent className="w-[520px] max-w-[calc(100vw-2rem)]">
          <DialogCloseButton />
          <DialogTitle className="system-md-semibold text-text-secondary">Connect to Workflow</DialogTitle>
          <p className="mt-2 system-sm-regular text-text-tertiary">Select a workflow to attach this knowledge base as a retrieval context.</p>
          <div className="mt-4 space-y-2">
            {item.connectedWorkflows.map(workflow => (
              <button
                key={workflow}
                type="button"
                className="flex w-full items-center justify-between rounded-lg border border-divider-subtle bg-background-default-subtle px-3 py-2 text-left hover:bg-state-base-hover"
                onClick={() => {
                  setWorkflowOpen(false)
                  showToast(`Connected to ${workflow}.`)
                }}
              >
                <span className="system-sm-medium text-text-secondary">{workflow}</span>
                <StatusBadge label="Connect" tone="info" />
              </button>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      <ActionToast message={toast} visible={!!toast} />
    </div>
  )
}

function RuntimeRiskBanner({
  item,
  onNavigate,
}: {
  item: DatasetItem
  onNavigate: (tab: DatasetDetailTab) => void
}) {
  const risks: { text: string; tab?: DatasetDetailTab }[] = [
    item.indexStatus === 'Stale' && { text: 'Stale index may return outdated answers.', tab: 'documents' },
    item.indexStatus === 'Building' && { text: 'Index is still building. Workflow retrieval may be incomplete.', tab: 'documents' },
    item.blockers.some(blocker => blocker.title.toLowerCase().includes('conflict')) && { text: 'Evidence conflict detected.', tab: 'evidence' },
    item.type === 'Multimodal' && { text: 'Attachment variable required for image retrieval.', tab: 'settings' },
    item.type === 'External' && { text: 'External score normalization or rerank recommended.', tab: 'settings' },
  ].filter(Boolean) as { text: string; tab?: DatasetDetailTab }[]

  if (!risks.length)
    return null

  return (
    <div className="rounded-xl border border-components-panel-border bg-background-default-subtle p-4">
      <div className="system-xs-semibold-uppercase text-text-tertiary">Workflow runtime risks</div>
      <ul className="mt-2 space-y-1">
        {risks.map(risk => (
          <li key={risk.text}>
            <button
              type="button"
              className="flex w-full items-start gap-2 text-left system-sm-regular text-text-secondary hover:text-text-accent"
              onClick={() => risk.tab && onNavigate(risk.tab)}
            >
              <span className="mt-1 size-1.5 shrink-0 rounded-full bg-util-colors-warning-warning-500" />
              {risk.text}
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}
