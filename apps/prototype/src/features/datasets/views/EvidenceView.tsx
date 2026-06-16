import { Button } from '@langgenius/dify-ui/button'
import { Dialog, DialogCloseButton, DialogContent, DialogTitle } from '@langgenius/dify-ui/dialog'
import { Textarea } from '@langgenius/dify-ui/textarea'
import { RiPlayLine } from '@remixicon/react'
import { useState } from 'react'
import { StatusBadge } from '../components/badges'
import {
  evidenceStateLabels,
  evidenceStateTones,
  type EvidenceState,
  type DatasetItem,
  retrievalDepthOptions,
  type RetrievalDepthOption,
} from '../fixtures/items'
import { ActionToast, Panel, SegmentedMode } from '../components/panel'

export function EvidenceView({
  item,
  onOpenQuality,
}: {
  item: DatasetItem
  onOpenQuality?: () => void
}) {
  const [mode, setMode] = useState<RetrievalDepthOption>(item.settingsConfig.defaultRetrieval?.mode ?? 'Fast')
  const [query, setQuery] = useState(item.defaultQuery)
  const [running, setRunning] = useState(false)
  const [bundleState, setBundleState] = useState<EvidenceState>(item.evidenceState)
  const [traceId, setTraceId] = useState(item.evidenceTraceId)
  const [freshness, setFreshness] = useState(item.evidenceFreshness)
  const [badCases, setBadCases] = useState(item.badCases)
  const [goldenQuestions, setGoldenQuestions] = useState(item.goldenQuestions)
  const [copiedTraceId, setCopiedTraceId] = useState(false)
  const [traceHovered, setTraceHovered] = useState(false)
  const [traceOpen, setTraceOpen] = useState(false)
  const [toast, setToast] = useState('')

  const showToast = (message: string) => {
    setToast(message)
    window.setTimeout(() => setToast(''), 2200)
  }

  const runEvidence = (nextMode?: RetrievalDepthOption) => {
    const activeMode = nextMode ?? mode
    if (nextMode)
      setMode(nextMode)
    setRunning(true)
    window.setTimeout(() => {
      setRunning(false)
      setBundleState(item.evidenceState)
      setTraceId(item.evidenceTraceId)
      setFreshness(item.evidenceFreshness)
      showToast(`Evidence test completed with ${activeMode} retrieval depth.`)
    }, 900)
  }

  const copyTraceId = async () => {
    await navigator.clipboard?.writeText(traceId)
    setCopiedTraceId(true)
    window.setTimeout(() => setCopiedTraceId(false), 1400)
    showToast('Trace ID copied.')
  }

  const createBadCaseFromTrace = () => {
    const label = `Trace ${traceId}`
    if (!badCases.includes(label))
      setBadCases(current => [label, ...current])
    showToast('Bad case created from trace.')
  }

  return (
    <div className="grid grid-cols-1 gap-3 pr-6 xl:grid-cols-[0.8fr_1.2fr]">
      <Panel title="Evidence test" badge={mode}>
        <div className="space-y-3">
          <Textarea value={query} onValueChange={setQuery} className="min-h-24" aria-label="Evidence query" />
          <div>
            <div className="mb-1 system-xs-medium text-text-tertiary">Retrieval depth</div>
            <SegmentedMode options={retrievalDepthOptions} value={mode} onChange={setMode} />
          </div>
          <Button variant="primary" size="small" className="w-full" loading={running} onClick={() => runEvidence()}>
            <RiPlayLine className="size-4" />
            Run
          </Button>
        </div>
      </Panel>

      <Panel title="Evidence result" badge={evidenceStateLabels[bundleState]} badgeTone={evidenceStateTones[bundleState]}>
        <div className="space-y-3">
          <div className="flex flex-wrap gap-2">
            <StatusBadge label={evidenceStateLabels[bundleState]} tone={evidenceStateTones[bundleState]} />
            <StatusBadge label={`Depth: ${mode}`} tone="neutral" />
            <StatusBadge label={freshness} tone="info" />
          </div>
          <div
            className="flex flex-wrap items-center gap-2 rounded-lg border border-divider-subtle bg-background-default-subtle px-3 py-2"
            onMouseEnter={() => setTraceHovered(true)}
            onMouseLeave={() => setTraceHovered(false)}
          >
            <span className="system-xs-medium text-text-tertiary">Trace ID</span>
            <code className="min-w-0 truncate system-xs-regular text-text-secondary">{traceId}</code>
            <button
              type="button"
              aria-label="Copy trace ID"
              title={copiedTraceId ? 'Copied' : 'Copy trace ID'}
              className={`inline-flex size-6 items-center justify-center rounded-md text-text-tertiary transition-opacity hover:bg-state-base-hover hover:text-text-secondary ${traceHovered || copiedTraceId ? 'opacity-100' : 'pointer-events-none opacity-0'}`}
              onClick={() => void copyTraceId()}
            >
              <span className={copiedTraceId ? 'i-ri-check-line size-3.5' : 'i-ri-file-copy-line size-3.5'} />
            </button>
            <Button variant="secondary" size="small" onClick={createBadCaseFromTrace}>Create bad case</Button>
          </div>

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

          {!!item.missingEvidence.length && <EvidenceList title="Missing evidence" items={item.missingEvidence} tone="warn" />}
          {!!item.conflictingEvidence.length && <EvidenceList title="Conflicting evidence" items={item.conflictingEvidence} tone="bad" />}

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
            <Button variant="ghost" size="small" onClick={() => setTraceOpen(true)}>Open answer trace</Button>
            <Button variant="ghost" size="small" onClick={() => runEvidence('Deep')}>Re-run with Deep</Button>
            <Button variant="ghost" size="small" onClick={() => runEvidence('Research')}>Re-run with Research</Button>
            {onOpenQuality && (
              <Button variant="ghost" size="small" onClick={onOpenQuality}>Open Quality</Button>
            )}
          </div>
        </div>
      </Panel>

      <Dialog open={traceOpen} onOpenChange={setTraceOpen}>
        <DialogContent className="w-[520px] max-w-[calc(100vw-2rem)]">
          <DialogCloseButton />
          <DialogTitle className="system-md-semibold text-text-secondary">Answer trace {traceId}</DialogTitle>
          <div className="mt-4 space-y-2">
            <div className="rounded-lg border border-divider-subtle bg-background-default-subtle px-3 py-2">
              <div className="system-xs-medium text-text-tertiary">Query</div>
              <div className="mt-1 system-sm-regular text-text-secondary">{query}</div>
            </div>
            <div className="rounded-lg border border-divider-subtle bg-background-default-subtle px-3 py-2">
              <div className="system-xs-medium text-text-tertiary">Bundle state</div>
              <div className="mt-1"><StatusBadge label={evidenceStateLabels[bundleState]} tone={evidenceStateTones[bundleState]} /></div>
            </div>
            <div className="rounded-lg border border-divider-subtle bg-background-default-subtle px-3 py-2">
              <div className="system-xs-medium text-text-tertiary">Trace ID</div>
              <div className="mt-1 system-sm-regular text-text-secondary">{traceId}</div>
            </div>
            <div className="rounded-lg border border-divider-subtle bg-background-default-subtle px-3 py-2">
              <div className="system-xs-medium text-text-tertiary">Retrieval path</div>
              <div className="mt-1 system-sm-regular text-text-secondary">{mode} depth · rerank on · topK {item.settingsConfig.defaultRetrieval?.topK ?? item.settingsConfig.externalRetrieval?.topK ?? 4}</div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <ActionToast message={toast} visible={!!toast} />
    </div>
  )
}

function EvidenceList({ title, items, tone }: { title: string; items: string[]; tone: 'warn' | 'bad' }) {
  return (
    <div className="rounded-lg border border-divider-subtle bg-background-default-subtle p-3">
      <div className="system-xs-semibold-uppercase text-text-tertiary">{title}</div>
      <ul className="mt-2 space-y-1">
        {items.map(entry => (
          <li key={entry} className="flex items-start gap-2 system-sm-regular text-text-secondary">
            <StatusBadge label="!" tone={tone} />
            {entry}
          </li>
        ))}
      </ul>
    </div>
  )
}
