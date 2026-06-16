import { Button } from '@langgenius/dify-ui/button'
import { Dialog, DialogCloseButton, DialogContent, DialogTitle } from '@langgenius/dify-ui/dialog'
import { RiArrowRightSLine } from '@remixicon/react'
import { useState } from 'react'
import { StatusBadge } from '../components/badges'
import {
  evidenceStateLabels,
  evidenceStateTones,
  type DatasetItem,
  type DatasetTrace,
} from '../fixtures/items'
import { ActionToast, EmptyPanel, Panel } from '../components/panel'

export function QualityView({ item }: { item: DatasetItem }) {
  const [traces] = useState(() => item.traces.map(trace => ({ ...trace })))
  const [badCases, setBadCases] = useState(() => [...item.badCases])
  const [goldenQuestions, setGoldenQuestions] = useState(() => [...item.goldenQuestions])
  const [selectedTrace, setSelectedTrace] = useState<DatasetTrace | null>(null)
  const [compareOpen, setCompareOpen] = useState(false)
  const [toast, setToast] = useState('')

  const showToast = (message: string) => {
    setToast(message)
    window.setTimeout(() => setToast(''), 2200)
  }

  const createBadCaseFromTrace = (trace: DatasetTrace) => {
    const label = `Trace ${trace.id}`
    if (!badCases.includes(label))
      setBadCases(current => [label, ...current])
    showToast('Bad case created from trace.')
  }

  const createGoldenFromBadCase = (badCase: string) => {
    if (!goldenQuestions.includes(badCase))
      setGoldenQuestions(current => [badCase, ...current])
    showToast('Golden question generated from bad case.')
  }

  return (
    <div className="space-y-4 pr-6">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-4">
        {item.qualityStats.map(stat => (
          <article key={stat.label} className="rounded-xl border border-components-panel-border bg-components-panel-bg p-4 shadow-xs">
            <div className="system-2xs-medium-uppercase text-text-tertiary">{stat.label}</div>
            <div className="mt-2 title-2xl-semi-bold text-text-secondary">{stat.value}</div>
            <div className="mt-2"><StatusBadge label={stat.label} tone={stat.tone} /></div>
          </article>
        ))}
        <article className="rounded-xl border border-components-panel-border bg-components-panel-bg p-4 shadow-xs">
          <div className="system-2xs-medium-uppercase text-text-tertiary">Missing evidence trend</div>
          <div className="mt-2 title-2xl-semi-bold text-text-secondary">{item.qualityMissingTrend}</div>
          <div className="mt-2"><StatusBadge label="Trend" tone="warn" /></div>
        </article>
      </div>

      <Panel title="Common failure sources" badge={String(item.commonFailureSources.length)}>
        {item.commonFailureSources.length
          ? (
              <div className="flex flex-wrap gap-2">
                {item.commonFailureSources.map(source => (
                  <StatusBadge key={source} label={source} tone="warn" />
                ))}
              </div>
            )
          : <EmptyPanel text="No recurring failure sources recorded." />}
      </Panel>

      <div className="grid grid-cols-1 gap-3 xl:grid-cols-[1.4fr_0.8fr]">
        <Panel title="Answer traces" badge="Recent">
          {traces.map(trace => (
            <button
              key={trace.id}
              type="button"
              onClick={() => setSelectedTrace(trace)}
              className="flex w-full items-center justify-between gap-3 rounded-lg border border-divider-subtle bg-background-default-subtle p-3 text-left hover:bg-state-base-hover"
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
          ))}
        </Panel>

        <Panel title="Quality set" badge="Golden">
          <div className="space-y-3">
            <div>
              <div className="mb-2 system-xs-semibold-uppercase text-text-tertiary">Golden questions</div>
              {goldenQuestions.map(question => (
                <div key={question} className="mb-2 rounded-lg border border-divider-subtle bg-background-default-subtle px-3 py-2 system-sm-regular text-text-secondary">
                  {question}
                </div>
              ))}
            </div>
            <div>
              <div className="mb-2 system-xs-semibold-uppercase text-text-tertiary">Production bad cases</div>
              {badCases.length
                ? badCases.map(badCase => (
                    <div key={badCase} className="mb-2 flex items-center justify-between gap-2 rounded-lg border border-divider-subtle bg-background-default-subtle px-3 py-2">
                      <span className="system-sm-regular text-text-secondary">{badCase}</span>
                      <Button variant="ghost" size="small" onClick={() => createGoldenFromBadCase(badCase)}>To golden</Button>
                    </div>
                  ))
                : <EmptyPanel text="No bad cases recorded." />}
            </div>
            <Button variant="ghost" size="small" className="w-full" onClick={() => setCompareOpen(true)}>Compare traces</Button>
          </div>
        </Panel>
      </div>

      <Dialog open={!!selectedTrace} onOpenChange={(open) => { if (!open) setSelectedTrace(null) }}>
        {selectedTrace && (
          <DialogContent className="w-[560px] max-w-[calc(100vw-2rem)]">
            <DialogCloseButton />
            <DialogTitle className="system-md-semibold text-text-secondary">{selectedTrace.id}</DialogTitle>
            <div className="mt-4 space-y-2">
              <div className="rounded-lg border border-divider-subtle bg-background-default-subtle px-3 py-2">
                <div className="system-xs-medium text-text-tertiary">Query</div>
                <div className="mt-1 system-sm-regular text-text-secondary">{selectedTrace.query}</div>
              </div>
              <div className="rounded-lg border border-divider-subtle bg-background-default-subtle px-3 py-2">
                <div className="system-xs-medium text-text-tertiary">State</div>
                <div className="mt-1"><StatusBadge label={evidenceStateLabels[selectedTrace.state]} tone={evidenceStateTones[selectedTrace.state]} /></div>
              </div>
              {selectedTrace.failureSource && (
                <div className="rounded-lg border border-divider-subtle bg-background-default-subtle px-3 py-2">
                  <div className="system-xs-medium text-text-tertiary">Failure source</div>
                  <div className="mt-1 system-sm-regular text-text-secondary">{selectedTrace.failureSource}</div>
                </div>
              )}
            </div>
            <div className="mt-6 flex flex-wrap gap-2">
              <Button variant="secondary" size="small" onClick={() => createBadCaseFromTrace(selectedTrace)}>Create bad case</Button>
              <Button variant="ghost" size="small" onClick={() => setCompareOpen(true)}>Compare before / after</Button>
            </div>
          </DialogContent>
        )}
      </Dialog>

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
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      <ActionToast message={toast} visible={!!toast} />
    </div>
  )
}
