import { Button } from '@langgenius/dify-ui/button'
import { Dialog, DialogCloseButton, DialogContent, DialogTitle } from '@langgenius/dify-ui/dialog'
import { StatusBadge } from '../../components/badges'
import type { DatasetItem } from '../../fixtures/items'

export function OverviewDialogs({
  item,
  rebuildOpen,
  workflowOpen,
  deleteOpen,
  deleting,
  onRebuildOpenChange,
  onWorkflowOpenChange,
  onDeleteOpenChange,
  onRebuild,
  onDelete,
  onWorkflowConnect,
}: {
  item: DatasetItem
  rebuildOpen: boolean
  workflowOpen: boolean
  deleteOpen: boolean
  deleting: boolean
  onRebuildOpenChange: (open: boolean) => void
  onWorkflowOpenChange: (open: boolean) => void
  onDeleteOpenChange: (open: boolean) => void
  onRebuild: () => void
  onDelete: () => void
  onWorkflowConnect: (workflow: string) => void
}) {
  return (
    <>
      <Dialog open={rebuildOpen} onOpenChange={onRebuildOpenChange}>
        <DialogContent className="w-[480px] max-w-[calc(100vw-2rem)]">
          <DialogCloseButton />
          <DialogTitle className="system-md-semibold text-text-secondary">Rebuild index</DialogTitle>
          <p className="mt-2 system-sm-regular text-text-tertiary">
            Queue a new projection publish from the latest source snapshot. Apps and workflows may see stale answers until publish completes.
          </p>
          <div className="mt-6 flex justify-end gap-2">
            <Button variant="secondary" onClick={() => onRebuildOpenChange(false)}>Cancel</Button>
            <Button variant="primary" onClick={onRebuild}>Rebuild index</Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={workflowOpen} onOpenChange={onWorkflowOpenChange}>
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
                onClick={() => onWorkflowConnect(workflow)}
              >
                <span className="system-sm-medium text-text-secondary">{workflow}</span>
                <StatusBadge label="Connect" tone="info" />
              </button>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteOpen} onOpenChange={onDeleteOpenChange}>
        <DialogContent className="w-[480px] max-w-[calc(100vw-2rem)]">
          <DialogCloseButton />
          <DialogTitle className="system-md-semibold text-text-secondary">Delete knowledge space</DialogTitle>
          <p className="mt-2 system-sm-regular text-text-tertiary">
            Permanently delete
            {' '}
            {item.name}
            . This removes the knowledge space record from the mock API store.
          </p>
          <div className="mt-6 flex justify-end gap-2">
            <Button variant="secondary" onClick={() => onDeleteOpenChange(false)}>Cancel</Button>
            <Button variant="primary" loading={deleting} onClick={onDelete}>Delete</Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
