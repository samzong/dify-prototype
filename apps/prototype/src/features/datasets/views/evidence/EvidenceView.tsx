import { Button } from '@langgenius/dify-ui/button'
import { Textarea } from '@langgenius/dify-ui/textarea'
import { RiPlayLine } from '@remixicon/react'
import { StatusBadge } from '../../components/badges'
import {
  evidenceStateLabels,
  evidenceStateTones,
  retrievalDepthOptions,
} from '../../fixtures/items'
import { ActionToast, Panel, SegmentedMode } from '../../components/panel'
import {
  AnswerPreviewPanel,
  ConflictsPanel,
  EvidenceItemsPanel,
  MissingEvidencePanel,
  StreamStepsPanel,
} from './evidence-result-panels'
import { AnswerTraceDrawer } from './evidence-trace-drawer'
import { useEvidenceController } from './useEvidenceController'
import type { DatasetItem } from '../../fixtures/items'

export function EvidenceView({
  item,
  onOpenQuality,
}: {
  item: DatasetItem
  onOpenQuality?: () => void
}) {
  const controller = useEvidenceController(item)
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
    goldenQuestions,
    setGoldenQuestions,
    streamSteps,
    answerText,
    traceDrawerOpen,
    setTraceDrawerOpen,
    toast,
    evidenceItems,
    missingItems,
    conflictItems,
    documents,
    showToast,
    runEvidence,
    openTraceDrawer,
    createBadCaseFromTrace,
    createBadCaseFromMissing,
    dismissMissingEvidence,
    dismissedMissingKeys,
  } = controller

  const hasApiResults = evidenceItems.length > 0 || missingItems.length > 0 || conflictItems.length > 0

  return (
    <div className="grid grid-cols-1 gap-3 pr-6 xl:grid-cols-[0.8fr_1.2fr]">
      <Panel title="Evidence test" badge={mode}>
        <div className="space-y-3">
          <Textarea value={query} onValueChange={setQuery} className="min-h-24" aria-label="Evidence query" />
          <div>
            <div className="mb-1 system-xs-medium text-text-tertiary">Retrieval depth</div>
            <SegmentedMode options={retrievalDepthOptions} value={mode} onChange={setMode} />
          </div>
          <Button variant="primary" size="small" className="w-full" loading={running} onClick={() => void runEvidence()}>
            <RiPlayLine className="size-4" />
            Run
          </Button>
          {runError && <p className="system-xs-regular text-util-colors-red-red-500">{runError}</p>}
        </div>
      </Panel>

      <Panel title="Evidence result" badge={evidenceStateLabels[bundleState]} badgeTone={evidenceStateTones[bundleState]}>
        <div className="space-y-3">
          <div className="flex flex-wrap gap-2">
            <StatusBadge label={evidenceStateLabels[bundleState]} tone={evidenceStateTones[bundleState]} />
            <StatusBadge label={`Depth: ${mode}`} tone="neutral" />
            <StatusBadge label={freshness} tone="info" />
          </div>

          <div className="flex flex-wrap items-center gap-2 rounded-lg border border-divider-subtle bg-background-default-subtle px-3 py-2">
            <span className="system-xs-medium text-text-tertiary">Trace ID</span>
            <code className="min-w-0 truncate system-xs-regular text-text-secondary">{traceId}</code>
            <Button variant="secondary" size="small" onClick={() => createBadCaseFromTrace()}>Create bad case</Button>
          </div>

          <StreamStepsPanel steps={streamSteps} running={running} />
          <AnswerPreviewPanel text={answerText} />

          {hasApiResults
            ? (
                <>
                  <EvidenceItemsPanel items={evidenceItems} documents={documents} />
                  <ConflictsPanel conflicts={conflictItems} />
                  <MissingEvidencePanel
                    items={missingItems}
                    onDismiss={dismissMissingEvidence}
                    onCreateBadCase={createBadCaseFromMissing}
                  />
                </>
              )
            : (
                <>
                  {item.evidenceItems.map(itemRow => (
                    <article key={`${itemRow.source}-${itemRow.quote}`} className="rounded-lg border border-divider-subtle bg-background-default-subtle p-3">
                      <div className="flex items-center justify-between gap-2">
                        <span className="system-sm-semibold text-text-secondary">{itemRow.source}</span>
                        <div className="flex flex-wrap gap-1">
                          <StatusBadge label={`score ${itemRow.score}`} tone="info" />
                          <StatusBadge label={`retrieval ${itemRow.retrievalScore}`} tone="neutral" />
                          <StatusBadge label={`rerank ${itemRow.rerankScore}`} tone="neutral" />
                        </div>
                      </div>
                      <p className="mt-2 system-sm-regular text-text-secondary">{itemRow.quote}</p>
                      <p className="mt-2 system-xs-regular text-text-tertiary">Freshness: {itemRow.freshness}</p>
                    </article>
                  ))}
                  {!!item.missingEvidence.length && (
                    <div className="rounded-lg border border-divider-subtle bg-background-default-subtle p-3">
                      <div className="system-xs-semibold-uppercase text-text-tertiary">Missing evidence</div>
                      <ul className="mt-2 space-y-1">
                        {item.missingEvidence.map(entry => (
                          <li key={entry} className="system-sm-regular text-text-secondary">{entry}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </>
              )}

          <div className="flex flex-wrap gap-2 pt-1">
            <Button
              variant="secondary"
              size="small"
              onClick={() => {
                const label = query.trim()
                if (label && !goldenQuestions.includes(label))
                  setGoldenQuestions(current => [label, ...current])
                showToast('Golden question created.')
              }}
            >
              Create golden question
            </Button>
            <Button variant="ghost" size="small" onClick={() => void openTraceDrawer()}>Open answer trace</Button>
            <Button variant="ghost" size="small" onClick={() => void runEvidence('Deep')}>Re-run with Deep</Button>
            <Button variant="ghost" size="small" onClick={() => void runEvidence('Research')}>Re-run with Research</Button>
            {onOpenQuality && (
              <Button variant="ghost" size="small" onClick={onOpenQuality}>Open Quality</Button>
            )}
          </div>
        </div>
      </Panel>

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
    </div>
  )
}
