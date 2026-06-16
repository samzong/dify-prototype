import { RiArrowRightSLine } from '@remixicon/react'
import type { EvidenceRecordItem } from '../../mock-services'
import { StatusBadge } from '../../components/badges'
import { evidenceStateLabels, evidenceStateTones } from '../../fixtures/helpers'
import { EmptyPanel } from '../../components/panel'
import { formatResearchStage, researchStageTone } from './evidence-research-panels'

function formatRecordTime(createdAt: string) {
  const date = new Date(createdAt)
  if (Number.isNaN(date.getTime()))
    return createdAt
  return date.toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function recordStatusBadge(record: EvidenceRecordItem) {
  if (record.kind === 'research') {
    return (
      <StatusBadge
        label={formatResearchStage(record.statusLabel as Parameters<typeof formatResearchStage>[0])}
        tone={researchStageTone(record.statusLabel as Parameters<typeof researchStageTone>[0])}
      />
    )
  }

  const state = record.statusLabel as keyof typeof evidenceStateLabels
  if (state in evidenceStateLabels) {
    return (
      <StatusBadge
        label={evidenceStateLabels[state]}
        tone={evidenceStateTones[state]}
      />
    )
  }

  return <StatusBadge label={record.statusLabel} tone="neutral" />
}

export function EvidenceRecordsPanel({
  records,
  loading,
  selectedRecordId,
  onSelect,
}: {
  records: EvidenceRecordItem[]
  loading: boolean
  selectedRecordId: string | null
  onSelect: (record: EvidenceRecordItem) => void
}) {
  return (
    <div>
      <div className="mb-2 system-xs-semibold-uppercase text-text-tertiary">Records</div>
      {loading && <EmptyPanel text="Loading records…" />}
      {!loading && records.length === 0 && <EmptyPanel text="No retrieval records yet." />}
      {!loading && records.map(record => (
        <button
          key={`${record.kind}-${record.id}`}
          type="button"
          onClick={() => onSelect(record)}
          className={`mb-2 flex w-full items-center justify-between gap-3 rounded-lg border px-3 py-2 text-left last:mb-0 ${
            selectedRecordId === record.id
              ? 'border-components-panel-border bg-state-base-hover'
              : 'border-divider-subtle bg-background-default-subtle hover:bg-state-base-hover'
          }`}
        >
          <div className="min-w-0">
            <div className="truncate system-sm-semibold text-text-secondary">{record.query}</div>
            <div className="mt-1 system-xs-regular text-text-tertiary">{record.meta}</div>
            <div className="mt-1 system-xs-regular text-text-quaternary">{formatRecordTime(record.createdAt)}</div>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <StatusBadge label={record.mode} tone="neutral" />
            {recordStatusBadge(record)}
            <RiArrowRightSLine className="size-4 text-text-quaternary" />
          </div>
        </button>
      ))}
    </div>
  )
}
