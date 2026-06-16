import type {
  AnswerTraceStep,
  ConflictSeverity,
  EvidenceBundleItem,
  EvidenceBundleState,
  MissingEvidenceReason,
} from '../../api-types'
import type { DatasetDocumentRow, EvidenceState, RetrievalDepthOption } from '../../fixtures/items'

export function queryModeFromRetrievalDepth(mode: RetrievalDepthOption): 'fast' | 'deep' | 'research' {
  if (mode === 'Deep')
    return 'deep'
  if (mode === 'Research')
    return 'research'
  return 'fast'
}

export function bundleStateToEvidenceState(state: EvidenceBundleState): EvidenceState {
  return state
}

export function stepLatencyMs(step: AnswerTraceStep) {
  if (!step.endedAt)
    return null
  const start = Date.parse(step.startedAt)
  const end = Date.parse(step.endedAt)
  if (Number.isNaN(start) || Number.isNaN(end))
    return null
  return Math.abs(start - end)
}

export function formatStepLatency(step: AnswerTraceStep) {
  const latency = stepLatencyMs(step)
  if (latency === null)
    return '—'
  if (latency < 1000)
    return `${latency} ms`
  return `${(latency / 1000).toFixed(1)} s`
}

export function stepStatusTone(status: AnswerTraceStep['status']) {
  if (status === 'ok')
    return 'good' as const
  if (status === 'error')
    return 'bad' as const
  return 'neutral' as const
}

export function conflictSeverityTone(severity: ConflictSeverity) {
  if (severity === 'blocking')
    return 'bad' as const
  if (severity === 'warning')
    return 'warn' as const
  return 'info' as const
}

export const missingReasonLabels: Record<MissingEvidenceReason, string> = {
  'not-retrieved': 'Not retrieved',
  'permission-filtered': 'Permission filtered',
  stale: 'Stale projection',
  conflict: 'Blocked by conflict',
  unknown: 'Unknown',
}

export function missingPriority(reason: MissingEvidenceReason) {
  if (reason === 'permission-filtered' || reason === 'conflict')
    return 'High'
  if (reason === 'not-retrieved')
    return 'Medium'
  return 'Low'
}

export function missingPriorityTone(priority: string) {
  if (priority === 'High')
    return 'bad' as const
  if (priority === 'Medium')
    return 'warn' as const
  return 'info' as const
}

export function resolveDocumentLabel(documents: DatasetDocumentRow[], documentAssetId: string) {
  const match = documents.find(doc => doc.id === documentAssetId)
  if (match)
    return match.name
  return `${documentAssetId.slice(0, 8)}…`
}

export function formatCitationRange(item: EvidenceBundleItem) {
  const citation = item.citations[0]
  if (!citation)
    return '—'
  if (citation.startOffset !== undefined && citation.endOffset !== undefined)
    return `${citation.startOffset}–${citation.endOffset}`
  if (citation.pageNumber !== undefined)
    return `p.${citation.pageNumber}`
  return '—'
}

export function missingEvidenceKey(text: string, reason: string) {
  return `${reason}:${text}`
}

export function estimateTraceCostPlaceholder(stepCount: number) {
  const inputTokens = 820 + stepCount * 180
  const outputTokens = 240 + stepCount * 40
  return {
    inputTokens,
    outputTokens,
    costUsd: ((inputTokens * 0.000002) + (outputTokens * 0.000006)).toFixed(4),
  }
}
