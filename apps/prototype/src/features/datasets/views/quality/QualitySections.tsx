import { Button } from '@langgenius/dify-ui/button'
import { cn } from '@langgenius/dify-ui/cn'
import { Dialog, DialogCloseButton, DialogContent, DialogTitle } from '@langgenius/dify-ui/dialog'
import { RiArrowRightSLine } from '@remixicon/react'
import { useState } from 'react'
import type { GoldenQuestion, ProductionBadCase } from '../../api-types'
import { StatusBadge } from '../../components/badges'
import { transitionToSideDrawer } from '../../components/side-drawer'
import {
  evidenceStateLabels,
  evidenceStateTones,
} from '../../fixtures/items'
import { ActionToast, EmptyPanel, Panel } from '../../components/panel'
import { AnswerTraceDrawer } from '../evidence/evidence-trace-drawer'
import { GoldenQuestionDialog } from './quality-dialogs'
import { GoldenQuestionsPanel } from './GoldenQuestionsPanel'
import type { useQualityController } from './useQualityController'

type QualityController = ReturnType<typeof useQualityController>

type QualityTab = 'golden' | 'bad-cases' | 'traces'

function badCaseStatus(badCase: ProductionBadCase): string {
  const status = badCase.metadata?.status
  return typeof status === 'string' ? status : 'open'
}

function badCaseAttribution(badCase: ProductionBadCase): string {
  const reason = badCase.metadata?.reason
  return typeof reason === 'string' ? reason : 'No attribution recorded'
}

function badCaseStatusTone(status: string) {
  if (status === 'resolved')
    return 'good' as const
  if (status === 'investigating')
    return 'info' as const
  if (status === 'blocked')
    return 'bad' as const
  return 'warn' as const
}

function QualityTabBar({
  value,
  onChange,
  goldenCount,
  badCaseCount,
}: {
  value: QualityTab
  onChange: (tab: QualityTab) => void
  goldenCount: number
  badCaseCount: number
}) {
  const tabs: { id: QualityTab; label: string }[] = [
    { id: 'golden', label: `Golden questions (${goldenCount})` },
    { id: 'bad-cases', label: `Bad cases (${badCaseCount})` },
    { id: 'traces', label: 'Answer traces' },
  ]

  return (
    <div className="inline-flex gap-0.5 rounded-lg bg-components-main-nav-nav-button-bg-hover p-0.5">
      {tabs.map(tab => (
        <button
          key={tab.id}
          type="button"
          onClick={() => onChange(tab.id)}
          className={cn(
            'h-7 rounded-[10px] px-3 system-sm-medium',
            value === tab.id
              ? 'bg-components-main-nav-nav-button-bg-active font-semibold text-components-main-nav-nav-button-text-active shadow-md'
              : 'text-components-main-nav-nav-button-text hover:bg-components-main-nav-nav-button-bg-hover',
          )}
        >
          {tab.label}
        </button>
      ))}
    </div>
  )
}

function QualityBadCasesTab({
  badCases,
  onCreateGoldenFromBadCase,
  onOpenTrace,
  showToast,
}: {
  badCases: ProductionBadCase[]
  onCreateGoldenFromBadCase: (badCase: ProductionBadCase) => void
  onOpenTrace: (traceId: string) => void
  showToast: (message: string) => void
}) {
  return (
    <Panel title="Production bad cases">
      {badCases.length
        ? badCases.map(badCase => (
            <div key={badCase.id} className="mb-2 rounded-lg border border-divider-subtle bg-background-default-subtle px-3 py-2 last:mb-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className="system-sm-semibold text-text-secondary">{badCase.question}</span>
                <StatusBadge label={badCaseStatus(badCase)} tone={badCaseStatusTone(badCaseStatus(badCase))} />
              </div>
              <p className="mt-1 system-xs-regular text-text-tertiary">{badCaseAttribution(badCase)}</p>
              <p className="mt-1 system-xs-regular text-text-quaternary">
                Trace
                {' '}
                {badCase.traceIds.join(', ')}
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                <Button variant="ghost" size="small" onClick={() => void onCreateGoldenFromBadCase(badCase)}>To golden</Button>
                <Button variant="ghost" size="small" onClick={() => onOpenTrace(badCase.traceIds[0] ?? '')}>Open trace</Button>
                <Button variant="ghost" size="small" onClick={() => showToast('Replay is not wired in the prototype yet.')}>Replay</Button>
              </div>
            </div>
          ))
        : <EmptyPanel text="No bad cases recorded." />}
    </Panel>
  )
}

function QualityTracesTab({
  traces,
  onOpenTrace,
  onCompare,
}: {
  traces: QualityController['traces']
  onOpenTrace: (traceId: string) => void
  onCompare: () => void
}) {
  return (
    <Panel
      title="Answer traces"
      action={(
        <Button variant="secondary" size="small" onClick={onCompare}>Compare traces</Button>
      )}
    >
      {traces.length
        ? traces.map(trace => (
            <button
              key={trace.id}
              type="button"
              onClick={() => onOpenTrace(trace.id)}
              className="mb-2 flex w-full items-center justify-between gap-3 rounded-lg border border-divider-subtle bg-background-default-subtle p-3 text-left hover:bg-state-base-hover last:mb-0"
            >
              <div className="min-w-0">
                <div className="system-sm-semibold text-text-secondary">{trace.id}</div>
                <div className="mt-1 truncate system-xs-regular text-text-tertiary">{trace.query}</div>
                <div className="mt-1 system-xs-regular text-text-tertiary">{trace.meta}</div>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <StatusBadge label={evidenceStateLabels[trace.state]} tone={evidenceStateTones[trace.state]} />
                <StatusBadge label={trace.mode} tone="neutral" />
                <RiArrowRightSLine className="size-4 text-text-quaternary" />
              </div>
            </button>
          ))
        : <EmptyPanel text="No answer traces recorded." />}
    </Panel>
  )
}

export function QualitySections({ controller }: { controller: QualityController }) {
  const {
    goldenQuestions,
    badCases,
    nextCursor,
    loading,
    loadingMore,
    error,
    toast,
    traces,
    documents,
    loadMoreGoldenQuestions,
    saveGoldenQuestion,
    removeGoldenQuestion,
    createBadCaseFromTrace,
    createGoldenFromBadCase,
    showToast,
  } = controller

  const [qualityTab, setQualityTab] = useState<QualityTab>('golden')
  const [goldenDialogOpen, setGoldenDialogOpen] = useState(false)
  const [editingGolden, setEditingGolden] = useState<GoldenQuestion | null>(null)
  const [traceDrawerId, setTraceDrawerId] = useState<string | null>(null)
  const [compareOpen, setCompareOpen] = useState(false)

  const openCreateGolden = () => {
    setEditingGolden(null)
    setGoldenDialogOpen(true)
  }

  const openEditGolden = (question: GoldenQuestion) => {
    setEditingGolden(question)
    setGoldenDialogOpen(true)
  }

  const openTrace = (traceId: string) => {
    if (traceId)
      setTraceDrawerId(traceId)
  }

  return (
    <div className="space-y-4 pr-6">
      <QualityTabBar
        value={qualityTab}
        onChange={setQualityTab}
        goldenCount={goldenQuestions.length}
        badCaseCount={badCases.length}
      />

      {qualityTab === 'golden' && (
        <GoldenQuestionsPanel
          goldenQuestions={goldenQuestions}
          loading={loading}
          loadingMore={loadingMore}
          error={error}
          nextCursor={nextCursor}
          onAdd={openCreateGolden}
          onEdit={openEditGolden}
          onDelete={removeGoldenQuestion}
          onLoadMore={loadMoreGoldenQuestions}
        />
      )}

      {qualityTab === 'bad-cases' && (
        <QualityBadCasesTab
          badCases={badCases}
          onCreateGoldenFromBadCase={createGoldenFromBadCase}
          onOpenTrace={openTrace}
          showToast={showToast}
        />
      )}

      {qualityTab === 'traces' && (
        <QualityTracesTab
          traces={traces}
          onOpenTrace={openTrace}
          onCompare={() => setCompareOpen(true)}
        />
      )}

      <Dialog open={compareOpen} onOpenChange={setCompareOpen}>
        <DialogContent className="w-[640px] max-w-[calc(100vw-2rem)]">
          <DialogCloseButton />
          <DialogTitle className="system-md-semibold text-text-secondary">Trace comparison</DialogTitle>
          <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
            {traces.slice(0, 2).map(trace => (
              <div key={trace.id} className="rounded-lg border border-divider-subtle bg-background-default-subtle p-3">
                <div className="system-sm-semibold text-text-secondary">{trace.id}</div>
                <div className="mt-2"><StatusBadge label={evidenceStateLabels[trace.state]} tone={evidenceStateTones[trace.state]} /></div>
                <div className="mt-2 system-xs-regular text-text-tertiary">{trace.meta}</div>
                <Button variant="ghost" size="small" className="mt-3" onClick={() => transitionToSideDrawer(() => setCompareOpen(false), () => setTraceDrawerId(trace.id))}>
                  Open answer trace
                </Button>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      <GoldenQuestionDialog
        open={goldenDialogOpen}
        editing={editingGolden}
        onOpenChange={setGoldenDialogOpen}
        onSave={saveGoldenQuestion}
      />

      <AnswerTraceDrawer
        open={!!traceDrawerId}
        traceId={traceDrawerId}
        documents={documents}
        onClose={() => setTraceDrawerId(null)}
        onCreateBadCase={traceId => void createBadCaseFromTrace(traceId)}
      />

      <ActionToast message={toast} visible={!!toast} />
    </div>
  )
}
