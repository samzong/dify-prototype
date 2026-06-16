import type {
  BadgeTone,
  DatasetDocumentRow,
  DatasetItem,
  EvidenceState,
  SourceFreshness,
} from './types'
import {
  documentStatusFilterOptions,
  sourceFreshnessOptions,
} from './types'

export function itemHasSourceError(item: DatasetItem) {
  return item.sources.some(source => source.status === 'Error')
}

export function documentMatchesStatusFilter(
  doc: DatasetDocumentRow,
  filter: typeof documentStatusFilterOptions[number]['value'],
) {
  if (filter === 'all')
    return true
  if (filter === 'processing')
    return doc.parserStatus === 'pending' || doc.indexStatus === 'building'
  if (filter === 'error')
    return doc.parserStatus === 'failed' || doc.indexStatus === 'failed'
  if (filter === 'stale')
    return doc.indexStatus === 'stale'
  if (filter === 'building')
    return doc.indexStatus === 'building'
  if (filter === 'available')
    return doc.parserStatus === 'parsed' && doc.indexStatus === 'ready'
  return true
}

export function formatSourceFreshness(freshness: SourceFreshness) {
  if (freshness.strategy === 'ttl') {
    const hours = Math.round((freshness.staleAfterSeconds ?? 0) / 3600)
    return hours > 0 ? `Scheduled · ${hours}h` : 'Scheduled'
  }
  return sourceFreshnessOptions.find(option => option.value === freshness.strategy)?.label ?? freshness.strategy
}

export const evidenceStateLabels: Record<EvidenceState, string> = {
  answerable: 'Answerable',
  partial: 'Partial',
  conflict: 'Conflict',
  'not-enough-evidence': 'Not enough evidence',
  'permission-limited': 'Permission limited',
}

export const evidenceStateTones: Record<EvidenceState, BadgeTone> = {
  answerable: 'good',
  partial: 'warn',
  conflict: 'bad',
  'not-enough-evidence': 'bad',
  'permission-limited': 'warn',
}

export const retrievalDepthOptions = ['Fast', 'Deep', 'Research'] as const

export type RetrievalDepthOption = typeof retrievalDepthOptions[number]

export const quickTestDepthOptions = ['Fast', 'Deep'] as const

export type QuickTestDepthOption = typeof quickTestDepthOptions[number]
