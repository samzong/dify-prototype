import { Button } from '@langgenius/dify-ui/button'
import { Dialog, DialogCloseButton, DialogContent, DialogTitle } from '@langgenius/dify-ui/dialog'
import { RiDatabase2Line, RiExternalLinkLine, RiFileTextFill, RiRobot2Fill } from '@remixicon/react'
import { useState } from 'react'
import { StatusBadge } from './knowledge-2-badges'
import type { Knowledge2Item } from './knowledge-2-data'
import { ActionToast } from './knowledge-2-panel'

export function KnowledgePipelineView({ item }: { item: Knowledge2Item }) {
  const [published, setPublished] = useState(item.isPublished ?? false)
  const [editorOpen, setEditorOpen] = useState(false)
  const [runOpen, setRunOpen] = useState(false)
  const [toast, setToast] = useState('')

  const showToast = (message: string) => {
    setToast(message)
    window.setTimeout(() => setToast(''), 2200)
  }

  return (
    <div className="pr-6">
      <div className="rounded-xl border border-components-panel-border bg-components-panel-bg p-6 shadow-xs">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="title-xl-semi-bold text-text-secondary">Knowledge Pipeline</h3>
            <p className="mt-1 max-w-2xl system-sm-regular text-text-tertiary">
              Pipeline knowledge maintains its own generation flow. Edit pipeline steps, publish changes, and review document processing for
              {' '}
              {item.name}
              .
            </p>
          </div>
          <StatusBadge label={published ? 'Published' : 'Draft'} tone={published ? 'good' : 'warn'} />
        </div>
        <div className="mt-6 grid grid-cols-1 gap-3 md:grid-cols-3">
          <PipelineStat icon={RiDatabase2Line} label="Sources" value={String(item.sourceCount)} />
          <PipelineStat icon={RiFileTextFill} label="Documents" value={item.documentsLabel} />
          <PipelineStat icon={RiRobot2Fill} label="Usage" value={item.usageLabel} />
        </div>
        <div className="mt-6 flex flex-wrap gap-2">
          <Button variant="primary" size="small" onClick={() => setEditorOpen(true)}>Open pipeline editor</Button>
          <Button
            variant="secondary"
            size="small"
            onClick={() => {
              setPublished(true)
              showToast('Pipeline published.')
            }}
          >
            Publish pipeline
          </Button>
          <Button variant="ghost" size="small" onClick={() => setRunOpen(true)}>
            <RiExternalLinkLine className="size-4" />
            View last run
          </Button>
        </div>
      </div>

      <Dialog open={editorOpen} onOpenChange={setEditorOpen}>
        <DialogContent className="w-[640px] max-w-[calc(100vw-2rem)]">
          <DialogCloseButton />
          <DialogTitle className="system-md-semibold text-text-secondary">Pipeline editor</DialogTitle>
          <div className="mt-4 space-y-2">
            {['Source ingest', 'Normalize changelog', 'Parent-child chunking', 'Publish projection'].map((step, index) => (
              <div key={step} className="flex items-center gap-3 rounded-lg border border-divider-subtle bg-background-default-subtle px-3 py-2">
                <span className="flex size-6 items-center justify-center rounded-full bg-components-badge-bg-blue-soft system-xs-medium text-text-accent">{index + 1}</span>
                <span className="system-sm-medium text-text-secondary">{step}</span>
              </div>
            ))}
          </div>
          <div className="mt-6 flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setEditorOpen(false)}>Close</Button>
            <Button variant="primary" onClick={() => {
              setEditorOpen(false)
              showToast('Pipeline draft saved.')
            }}
            >
              Save draft
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={runOpen} onOpenChange={setRunOpen}>
        <DialogContent className="w-[520px] max-w-[calc(100vw-2rem)]">
          <DialogCloseButton />
          <DialogTitle className="system-md-semibold text-text-secondary">Last pipeline run</DialogTitle>
          <div className="mt-4 space-y-2">
            <div className="rounded-lg border border-divider-subtle bg-background-default-subtle px-3 py-2">
              <div className="system-xs-medium text-text-tertiary">Status</div>
              <div className="mt-1"><StatusBadge label="Published" tone="good" /></div>
            </div>
            <div className="rounded-lg border border-divider-subtle bg-background-default-subtle px-3 py-2">
              <div className="system-xs-medium text-text-tertiary">Documents processed</div>
              <div className="mt-1 system-sm-regular text-text-secondary">{item.documentsLabel}</div>
            </div>
            <div className="rounded-lg border border-divider-subtle bg-background-default-subtle px-3 py-2">
              <div className="system-xs-medium text-text-tertiary">Projection</div>
              <div className="mt-1 system-sm-regular text-text-secondary">{item.indexStatus}</div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <ActionToast message={toast} visible={!!toast} />
    </div>
  )
}

function PipelineStat({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  value: string
}) {
  return (
    <div className="rounded-lg border border-divider-subtle bg-background-default-subtle px-4 py-3">
      <div className="flex items-center gap-2 text-text-tertiary">
        <Icon className="size-4" />
        <span className="system-xs-semibold-uppercase">{label}</span>
      </div>
      <div className="mt-2 system-md-semibold text-text-secondary">{value}</div>
    </div>
  )
}
