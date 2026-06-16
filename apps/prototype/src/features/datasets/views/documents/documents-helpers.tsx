import type { BulkOperationProgress, DocumentCompilationJobStage } from '../../api-types'
import { cn } from '@langgenius/dify-ui/cn'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@langgenius/dify-ui/dropdown-menu'
import { RiEqualizer2Line, RiMoreFill } from '@remixicon/react'
import type { DatasetSourceRow } from '../../fixtures/items'

export const metadataFields = [
  { key: 'department', label: 'Department', value: 'Product' },
  { key: 'audience', label: 'Audience', value: 'Internal' },
  { key: 'language', label: 'Language', value: 'English' },
]

export type BulkJobView = {
  id: string
  kind: 'bulk' | 'compilation'
  stage: DocumentCompilationJobStage | BulkOperationProgress['status']
  completed: number
  total: number
  failedItemIds?: string[]
}

export const compilationJobStageLabels: Record<DocumentCompilationJobStage, string> = {
  queued: 'Queued',
  parsed: 'Parsed',
  nodes_generated: 'Nodes generated',
  projection_built: 'Projection built',
  smoke_eval_passed: 'Smoke eval passed',
  published: 'Published',
  failed: 'Failed',
  canceled: 'Canceled',
}

export const bulkJobStageLabels: Record<BulkOperationProgress['status'], string> = {
  running: 'Running',
  completed: 'Completed',
  failed: 'Failed',
}

export type BulkJob = BulkJobView

export function bulkJobStatusLabel(job: BulkJob) {
  if (job.kind === 'bulk')
    return bulkJobStageLabels[job.stage as BulkOperationProgress['status']]
  return compilationJobStageLabels[job.stage as DocumentCompilationJobStage]
}

export function bulkJobStatusTone(job: BulkJob): 'good' | 'bad' | 'info' {
  if (job.kind === 'bulk') {
    if (job.stage === 'completed')
      return 'good'
    if (job.stage === 'failed')
      return 'bad'
    return 'info'
  }
  if (job.stage === 'published' || job.stage === 'smoke_eval_passed')
    return 'good'
  if (job.stage === 'failed' || job.stage === 'canceled')
    return 'bad'
  return 'info'
}

export type SourceAssetOption = {
  value: string
  label: string
  description: string
}

export type AddDocumentMode = 'manual' | 'source'

export function DocumentRowActions({
  onRename,
  onReindex,
  onDelete,
  onOpen,
  onSettings,
  onViewJob,
  onViewArtifact,
}: {
  onRename: () => void
  onReindex: () => void
  onDelete: () => void
  onOpen: () => void
  onSettings: () => void
  onViewJob?: () => void
  onViewArtifact?: () => void
}) {
  return (
    <div className="flex items-center gap-1">
      <button type="button" aria-label="Document settings" className="inline-flex size-8 items-center justify-center rounded-lg text-text-tertiary hover:bg-state-base-hover" onClick={onSettings}>
        <RiEqualizer2Line className="size-4" />
      </button>
      <DropdownMenu>
        <DropdownMenuTrigger aria-label="Document actions" className="inline-flex size-8 items-center justify-center rounded-lg text-text-tertiary hover:bg-state-base-hover">
          <RiMoreFill className="size-4" />
        </DropdownMenuTrigger>
        <DropdownMenuContent placement="bottom-end">
          <DropdownMenuItem onClick={onOpen}>Open document</DropdownMenuItem>
          {onViewArtifact && <DropdownMenuItem onClick={onViewArtifact}>View parse artifact</DropdownMenuItem>}
          {onViewJob && <DropdownMenuItem onClick={onViewJob}>View compilation job</DropdownMenuItem>}
          <DropdownMenuItem onClick={onRename}>Rename</DropdownMenuItem>
          <DropdownMenuItem onClick={onReindex}>Re-index</DropdownMenuItem>
          <DropdownMenuItem onClick={() => {}}>Download</DropdownMenuItem>
          <DropdownMenuItem onClick={onDelete}>Delete</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}

export function AddDocumentModeCard({
  mode,
  selected,
  title,
  description,
  onSelect,
}: {
  mode: AddDocumentMode
  selected: boolean
  title: string
  description: string
  onSelect: (mode: AddDocumentMode) => void
}) {
  return (
    <button
      type="button"
      onClick={() => onSelect(mode)}
      className={cn(
        'relative min-h-20 rounded-xl border p-3 text-left',
        selected
          ? 'border-components-option-card-option-selected-border bg-components-option-card-option-selected-bg ring-[0.5px] ring-components-option-card-option-selected-border'
          : 'border-divider-subtle bg-background-default-subtle hover:bg-state-base-hover',
      )}
    >
      <div className="system-sm-medium text-text-secondary">{title}</div>
      <div className="mt-1 system-xs-regular text-text-tertiary">{description}</div>
      {selected && <span className="i-ri-check-line absolute top-3 right-3 size-4 text-text-accent" />}
    </button>
  )
}

export function buildSourceAssetOptions(source: DatasetSourceRow): SourceAssetOption[] {
  if (source.type === 'website-crawl') {
    const host = source.endpoint ? readableHost(source.endpoint) : source.name
    return [
      { value: `${source.id}-home`, label: `${host} home page`, description: source.endpoint ?? source.name },
      { value: `${source.id}-docs`, label: `${host} docs index`, description: `${source.endpoint ?? source.name}/docs` },
      { value: `${source.id}-faq`, label: `${host} FAQ page`, description: `${source.endpoint ?? source.name}/faq` },
    ]
  }
  if (source.type === 'online-documents') {
    return [
      { value: `${source.id}-sop`, label: `${source.name} support SOP`, description: 'Selected page from document workspace' },
      { value: `${source.id}-handoff`, label: `${source.name} escalation handoff`, description: 'Selected page from document workspace' },
      { value: `${source.id}-faq`, label: `${source.name} customer FAQ`, description: 'Selected page from document workspace' },
    ]
  }
  return [
    { value: `${source.id}-refund`, label: `${source.name} refund-policy.pdf`, description: 'Selected file from drive or object storage' },
    { value: `${source.id}-onboarding`, label: `${source.name} onboarding-guide.docx`, description: 'Selected file from drive or object storage' },
    { value: `${source.id}-release`, label: `${source.name} release-notes.md`, description: 'Selected file from drive or object storage' },
  ]
}

export function readableHost(value: string) {
  try {
    return new URL(value).host
  }
  catch {
    return value.replace(/^https?:\/\//, '').replace(/\/.*$/, '') || value
  }
}

export function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <div className="mb-1 system-sm-medium text-text-secondary">{label}</div>
      {children}
    </label>
  )
}
