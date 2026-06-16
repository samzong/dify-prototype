import { Button } from '@langgenius/dify-ui/button'
import type {
  AnswerTrace,
  AnswerTraceStep,
  EvidenceBundle,
  EvidenceBundleItem,
  EvidenceItemConflict,
  MissingEvidenceItem,
} from '../../api-types'
import { StatusBadge } from '../../components/badges'
import { DetailRow, EmptyPanel } from '../../components/panel'
import type { DatasetDocumentRow } from '../../fixtures/items'
import {
  conflictSeverityTone,
  formatCitationRange,
  missingPriority,
  missingPriorityTone,
  missingReasonLabels,
  resolveDocumentLabel,
} from './evidence-bridge'

export function EvidenceItemsPanel({
  items,
  documents,
}: {
  items: EvidenceBundleItem[]
  documents: DatasetDocumentRow[]
}) {
  if (!items.length)
    return <EmptyPanel text="Run a query to load evidence items from the mock API." />

  return (
    <div className="space-y-3">
      {items.map(item => (
        <article key={item.nodeId} className="rounded-lg border border-divider-subtle bg-background-default-subtle p-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="system-sm-semibold text-text-secondary">
              {resolveDocumentLabel(documents, item.citations[0]?.documentAssetId ?? item.nodeId)}
            </span>
            <div className="flex flex-wrap gap-1">
              <StatusBadge label={`score ${item.score.toFixed(2)}`} tone="info" />
              <StatusBadge label={`retrieval ${item.scores.retrieval.toFixed(2)}`} tone="neutral" />
              {item.scores.rerank !== undefined && (
                <StatusBadge label={`rerank ${item.scores.rerank.toFixed(2)}`} tone="neutral" />
              )}
            </div>
          </div>
          <p className="mt-2 system-sm-regular text-text-secondary">{item.text}</p>
          <div className="mt-2 flex flex-wrap gap-2">
            <StatusBadge label={`freshness ${item.freshness.status}`} tone={item.freshness.status === 'stale' ? 'warn' : 'good'} />
            <StatusBadge label={`offset ${formatCitationRange(item)}`} tone="neutral" />
          </div>
          {item.citations.length > 0 && (
            <div className="mt-2 space-y-1">
              {item.citations.map(citation => (
                <div key={`${citation.documentAssetId}-${citation.documentVersion}`} className="system-xs-regular text-text-tertiary">
                  {resolveDocumentLabel(documents, citation.documentAssetId)}
                  {' · v'}
                  {citation.documentVersion}
                  {citation.sectionPath?.length ? ` · ${citation.sectionPath.join(' / ')}` : ''}
                </div>
              ))}
            </div>
          )}
        </article>
      ))}
    </div>
  )
}

export function ConflictsPanel({ conflicts }: { conflicts: EvidenceItemConflict[] }) {
  if (!conflicts.length)
    return null

  return (
    <div className="rounded-lg border border-divider-subtle bg-background-default-subtle p-3">
      <div className="system-xs-semibold-uppercase text-text-tertiary">Conflicts</div>
      <ul className="mt-2 space-y-2">
        {conflicts.map((conflict, index) => (
          <li key={`${conflict.reason}-${index}`} className="rounded-lg border border-divider-subtle bg-components-panel-bg px-3 py-2">
            <div className="flex flex-wrap items-center gap-2">
              <StatusBadge label={conflict.severity} tone={conflictSeverityTone(conflict.severity)} />
              {conflict.withNodeId && (
                <span className="system-xs-regular text-text-quaternary">
                  vs
                  {' '}
                  {conflict.withNodeId.slice(0, 8)}
                  …
                </span>
              )}
            </div>
            <p className="mt-2 system-sm-regular text-text-secondary">{conflict.reason}</p>
          </li>
        ))}
      </ul>
    </div>
  )
}

export function MissingEvidencePanel({
  items,
  onDismiss,
  onCreateBadCase,
}: {
  items: MissingEvidenceItem[]
  onDismiss: (entry: MissingEvidenceItem) => void
  onCreateBadCase: (entry: MissingEvidenceItem) => void
}) {
  if (!items.length)
    return null

  return (
    <div className="rounded-lg border border-divider-subtle bg-background-default-subtle p-3">
      <div className="system-xs-semibold-uppercase text-text-tertiary">Missing evidence</div>
      <ul className="mt-2 space-y-2">
        {items.map(entry => {
          const priority = missingPriority(entry.reason)
          return (
            <li key={`${entry.reason}-${entry.text}`} className="rounded-lg border border-divider-subtle bg-components-panel-bg px-3 py-2">
              <div className="flex flex-wrap items-center gap-2">
                <StatusBadge label={missingReasonLabels[entry.reason]} tone="warn" />
                <StatusBadge label={`priority ${priority}`} tone={missingPriorityTone(priority)} />
              </div>
              <p className="mt-2 system-sm-regular text-text-secondary">{entry.text}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <Button variant="ghost" size="small" onClick={() => onDismiss(entry)}>Dismiss</Button>
                <Button variant="secondary" size="small" onClick={() => onCreateBadCase(entry)}>Create bad case</Button>
              </div>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

export function StreamStepsPanel({ steps, running }: { steps: AnswerTraceStep[]; running: boolean }) {
  if (!steps.length && !running)
    return null

  return (
    <div className="rounded-lg border border-divider-subtle bg-background-default-subtle p-3">
      <div className="system-xs-semibold-uppercase text-text-tertiary">Pipeline steps</div>
      {!steps.length && running && (
        <p className="mt-2 system-xs-regular text-text-tertiary">Waiting for trace events…</p>
      )}
      <ol className="mt-2 space-y-1">
        {steps.map(step => (
          <li key={`${step.name}-${step.startedAt}`} className="flex items-center justify-between gap-2 system-xs-regular text-text-secondary">
            <span>{step.name}</span>
            <StatusBadge label={step.status} tone={step.status === 'ok' ? 'good' : step.status === 'error' ? 'bad' : 'neutral'} />
          </li>
        ))}
      </ol>
    </div>
  )
}

export function AnswerPreviewPanel({ text }: { text: string }) {
  if (!text)
    return null

  return (
    <div className="rounded-lg border border-divider-subtle bg-background-default-subtle p-3">
      <div className="system-xs-semibold-uppercase text-text-tertiary">Answer preview</div>
      <p className="mt-2 whitespace-pre-wrap system-sm-regular text-text-secondary">{text}</p>
    </div>
  )
}

export function TraceSummaryRows({
  trace,
  bundle,
}: {
  trace: AnswerTrace | null
  bundle: EvidenceBundle | null
}) {
  if (!trace)
    return null

  return (
    <div className="space-y-2">
      <DetailRow label="Query" value={trace.query} />
      <DetailRow label="Mode" value={trace.mode} />
      {bundle && <DetailRow label="Bundle state" value={bundle.state} />}
    </div>
  )
}
