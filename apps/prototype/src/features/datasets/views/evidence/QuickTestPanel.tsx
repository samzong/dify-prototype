import { Button } from '@langgenius/dify-ui/button'
import { Textarea } from '@langgenius/dify-ui/textarea'
import { RiPlayLine } from '@remixicon/react'
import { StatusBadge } from '../../components/badges'
import {
  evidenceStateLabels,
  evidenceStateTones,
  retrievalDepthOptions,
} from '../../fixtures/helpers'
import { ActionToast, EmptyPanel, Panel, SegmentedMode } from '../../components/panel'
import { EvidenceRecordsPanel } from './evidence-records-panel'
import {
  AnswerPreviewPanel,
  ConflictsPanel,
  EvidenceItemsPanel,
  MissingEvidencePanel,
  StreamStepsPanel,
} from './evidence-result-panels'
import { formatResearchStage, ResearchTaskDetailContent, researchStageTone } from './evidence-research-panels'
import { AnswerTraceDrawer } from './evidence-trace-drawer'
import { useEvidenceController } from './useEvidenceController'
import type { DatasetItem, RetrievalDepthOption } from '../../fixtures/items'

export function QuickTestPanel({
  item,
  initialMode,
  initialQuery,
  onOpenQuality,
  onViewGraph,
}: {
  item: DatasetItem
  initialMode?: RetrievalDepthOption
  initialQuery?: string
  onOpenQuality?: () => void
  onViewGraph?: () => void
}) {
  const controller = useEvidenceController(item, { initialMode, initialQuery })
  const {
    mode,
    setMode,
    query,
    setQuery,
    running,
    runError,
    bundleState,
    traceId,
    freshness,
    createGoldenQuestionFromQuery,
    streamSteps,
    answerText,
    traceDrawerOpen,
    setTraceDrawerOpen,
    toast,
    evidenceItems,
    missingItems,
    conflictItems,
    documents,
    records,
    recordsLoading,
    selectedRecordId,
    resultKind,
    researchTask,
    researchEvents,
    researchPartials,
    runningResearchId,
    canceling,
    canCancelResearch,
    run,
    selectRecord,
    openTraceDrawer,
    createBadCaseFromTrace,
    createBadCaseFromMissing,
    dismissMissingEvidence,
    dismissedMissingKeys,
    cancelResearch,
  } = controller

  const hasQueryResults = evidenceItems.length > 0 || missingItems.length > 0 || conflictItems.length > 0 || !!answerText || streamSteps.length > 0
  const resultBadge = resultKind === 'research' && researchTask
    ? formatResearchStage(researchTask.stage)
    : evidenceStateLabels[bundleState]
  const resultBadgeTone = resultKind === 'research' && researchTask
    ? researchStageTone(researchTask.stage)
    : evidenceStateTones[bundleState]

  return (
    <>
      <div className="grid grid-cols-1 gap-3 xl:grid-cols-[0.8fr_1.2fr]">
        <Panel title="Retrieval test" badge={mode}>
          <div className="space-y-3">
            <Textarea value={query} onValueChange={setQuery} className="min-h-24" aria-label="Retrieval query" />
            <div>
              <div className="mb-1 system-xs-medium text-text-tertiary">Retrieval depth</div>
              <SegmentedMode
                options={retrievalDepthOptions}
                value={mode}
                onChange={setMode}
              />
            </div>
            <Button variant="primary" size="small" className="w-full" loading={running} onClick={() => void run()}>
              <RiPlayLine className="size-4" />
              {mode === 'Research' ? 'Start research' : 'Run'}
            </Button>
            {runError && <p className="system-xs-regular text-util-colors-red-red-500">{runError}</p>}
            <EvidenceRecordsPanel
              records={records}
              loading={recordsLoading}
              selectedRecordId={selectedRecordId}
              onSelect={record => void selectRecord(record)}
            />
          </div>
        </Panel>

        <Panel title="Retrieval result" badge={resultBadge} badgeTone={resultBadgeTone}>
          {resultKind === 'research'
            ? (
                <ResearchTaskDetailContent
                  task={researchTask}
                  events={researchEvents}
                  partials={researchPartials}
                  running={runningResearchId !== null}
                  canCancel={canCancelResearch}
                  canceling={canceling}
                  onCancel={() => void cancelResearch()}
                />
              )
            : (
                <div className="space-y-3">
                  {!traceId && !hasQueryResults && (
                    <EmptyPanel text="Run a retrieval test or select a record to inspect results." />
                  )}

                  {(traceId || hasQueryResults) && (
                    <>
                      <div className="flex flex-wrap gap-2">
                        <StatusBadge label={evidenceStateLabels[bundleState]} tone={evidenceStateTones[bundleState]} />
                        <StatusBadge label={`Depth: ${mode}`} tone="neutral" />
                        <StatusBadge label={freshness} tone="info" />
                      </div>

                      {traceId && (
                        <div className="flex flex-wrap items-center gap-2 rounded-lg border border-divider-subtle bg-background-default-subtle px-3 py-2">
                          <span className="system-xs-medium text-text-tertiary">Trace ID</span>
                          <code className="min-w-0 truncate system-xs-regular text-text-secondary">{traceId}</code>
                          <Button variant="secondary" size="small" onClick={() => void createBadCaseFromTrace()}>Create bad case</Button>
                        </div>
                      )}

                      <StreamStepsPanel steps={streamSteps} running={running} />
                      <AnswerPreviewPanel text={answerText} />

                      {hasQueryResults && (
                        <>
                          <EvidenceItemsPanel items={evidenceItems} documents={documents} />
                          <ConflictsPanel conflicts={conflictItems} />
                          <MissingEvidencePanel
                            items={missingItems}
                            onDismiss={dismissMissingEvidence}
                            onCreateBadCase={createBadCaseFromMissing}
                          />
                        </>
                      )}

                      <div className="flex flex-wrap gap-2 pt-1">
                        <Button
                          variant="secondary"
                          size="small"
                          onClick={() => void createGoldenQuestionFromQuery(query)}
                        >
                          Create golden question
                        </Button>
                        <Button variant="ghost" size="small" onClick={() => void openTraceDrawer()}>Open answer trace</Button>
                        {onViewGraph && (
                          <Button variant="ghost" size="small" onClick={onViewGraph}>View in graph</Button>
                        )}
                        {onOpenQuality && (
                          <Button variant="ghost" size="small" onClick={onOpenQuality}>Open Quality</Button>
                        )}
                      </div>
                    </>
                  )}
                </div>
              )}
        </Panel>
      </div>

      <AnswerTraceDrawer
        open={traceDrawerOpen}
        traceId={traceId}
        documents={documents}
        onClose={() => setTraceDrawerOpen(false)}
        onCreateBadCase={createBadCaseFromTrace}
        onDismissMissing={dismissMissingEvidence}
        onCreateBadCaseFromMissing={createBadCaseFromMissing}
        dismissedMissingKeys={dismissedMissingKeys}
      />

      <ActionToast message={toast} visible={!!toast} />
    </>
  )
}
