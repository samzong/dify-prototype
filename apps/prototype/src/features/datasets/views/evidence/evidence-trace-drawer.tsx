import { Button } from '@langgenius/dify-ui/button'
import { useEffect, useState } from 'react'
import type {
  AnswerTrace,
  EvidenceBundle,
  EvidenceBundleItem,
  MissingEvidenceItem,
} from '../../api-types'
import { MockServiceError } from '../../api-types'
import { StatusBadge } from '../../components/badges'
import { DetailRow, EmptyPanel } from '../../components/panel'
import type { DatasetDocumentRow } from '../../fixtures/items'
import { SideDrawer } from '../../components/side-drawer'
import {
  estimateTraceCostPlaceholder,
  formatStepLatency,
  stepStatusTone,
} from './evidence-bridge'
import {
  ConflictsPanel,
  EvidenceItemsPanel,
  MissingEvidencePanel,
} from './evidence-result-panels'
import { getQueryTrace } from '../../mock-services'
import { getKnowledgeMockStore } from '../../mock-services/store'

function mockErrorMessage(error: unknown) {
  if (error instanceof MockServiceError)
    return `${error.status}: ${error.message}`
  if (error instanceof Error)
    return error.message
  return 'Unexpected mock service error'
}

function resolveBundle(trace: AnswerTrace) {
  const bundleId = trace.evidenceBundleId
  if (!bundleId)
    return null
  const bundle = getKnowledgeMockStore().evidenceBundles[bundleId]
  return bundle ? structuredClone(bundle) as EvidenceBundle : null
}

export function AnswerTraceDrawer({
  open,
  traceId,
  documents,
  onClose,
  onCreateBadCase,
  onDismissMissing,
  onCreateBadCaseFromMissing,
  dismissedMissingKeys,
}: {
  open: boolean
  traceId: string | null
  documents: DatasetDocumentRow[]
  onClose: () => void
  onCreateBadCase?: (traceId: string) => void
  onDismissMissing?: (entry: MissingEvidenceItem) => void
  onCreateBadCaseFromMissing?: (entry: MissingEvidenceItem) => void
  dismissedMissingKeys?: string[]
}) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [trace, setTrace] = useState<AnswerTrace | null>(null)
  const [bundle, setBundle] = useState<EvidenceBundle | null>(null)

  useEffect(() => {
    if (!open || !traceId) {
      setTrace(null)
      setBundle(null)
      setError(null)
      return
    }

    let canceled = false
    setLoading(true)
    setError(null)

    void getQueryTrace(traceId)
      .then((nextTrace) => {
        if (canceled)
          return
        setTrace(nextTrace)
        setBundle(resolveBundle(nextTrace))
      })
      .catch((loadError) => {
        if (!canceled)
          setError(mockErrorMessage(loadError))
      })
      .finally(() => {
        if (!canceled)
          setLoading(false)
      })

    return () => {
      canceled = true
    }
  }, [open, traceId])

  const cost = estimateTraceCostPlaceholder(trace?.steps.length ?? 0)
  const conflicts = bundle?.items.flatMap(item => item.conflicts ?? []) ?? []
  const missing = (bundle?.missingEvidence ?? []).filter((entry) => {
    const key = `${entry.reason}:${entry.text}`
    return !dismissedMissingKeys?.includes(key)
  })

  return (
    <SideDrawer
      open={open}
      title="Answer trace"
      description={traceId ?? undefined}
      onClose={onClose}
      panelClassName="max-w-xl"
    >
      {loading && <EmptyPanel text="Loading answer trace…" />}
      {!loading && error && <EmptyPanel text={error} />}
      {!loading && !error && trace && (
        <div className="space-y-4">
          <DetailRow label="Query" value={trace.query} />
          <DetailRow label="Mode" value={trace.mode} />
          {bundle && (
            <div className="flex flex-wrap gap-2">
              <StatusBadge label={bundle.state} tone={bundle.state === 'conflict' ? 'bad' : bundle.state === 'partial' ? 'warn' : 'good'} />
            </div>
          )}

          <div>
            <div className="mb-2 system-xs-medium text-text-tertiary">Step tree</div>
            <ol className="space-y-2">
              {trace.steps.map(step => (
                <li key={`${step.name}-${step.startedAt}`} className="rounded-lg border border-divider-subtle px-3 py-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="system-sm-medium text-text-secondary">{step.name}</span>
                    <StatusBadge label={step.status} tone={stepStatusTone(step.status)} />
                  </div>
                  <div className="mt-1 flex flex-wrap gap-3 system-xs-regular text-text-tertiary">
                    <span>Latency {formatStepLatency(step)}</span>
                    {step.metadata?.reason !== undefined && <span>{String(step.metadata.reason)}</span>}
                  </div>
                </li>
              ))}
            </ol>
          </div>

          <div className="rounded-lg border border-divider-subtle bg-background-default-subtle p-3">
            <div className="system-xs-semibold-uppercase text-text-tertiary">Usage (placeholder)</div>
            <div className="mt-2 space-y-1">
              <DetailRow label="Input tokens" value={String(cost.inputTokens)} />
              <DetailRow label="Output tokens" value={String(cost.outputTokens)} />
              <DetailRow label="Estimated cost" value={`$${cost.costUsd}`} />
            </div>
          </div>

          <div>
            <div className="mb-2 system-xs-medium text-text-tertiary">Evidence</div>
            <EvidenceItemsPanel items={bundle?.items ?? []} documents={documents} />
          </div>

          <ConflictsPanel conflicts={conflicts} />

          {missing.length > 0 && onDismissMissing && onCreateBadCaseFromMissing && (
            <MissingEvidencePanel
              items={missing}
              onDismiss={onDismissMissing}
              onCreateBadCase={onCreateBadCaseFromMissing}
            />
          )}

          {onCreateBadCase && traceId && (
            <Button variant="secondary" size="small" onClick={() => onCreateBadCase(traceId)}>
              Create bad case from trace
            </Button>
          )}
        </div>
      )}
    </SideDrawer>
  )
}

export type { EvidenceBundleItem }
