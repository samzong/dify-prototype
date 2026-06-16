import { Button } from '@langgenius/dify-ui/button'
import type { ResearchTaskEvent, ResearchTaskJob, ResearchTaskPartialResult, ResearchTaskStage } from '../../api-types'
import { StatusBadge } from '../../components/badges'
import type { BadgeTone } from '../../fixtures/items'
import { EmptyPanel } from '../../components/panel'

export function researchStageTone(stage: ResearchTaskStage): BadgeTone {
  if (stage === 'completed')
    return 'good'
  if (stage === 'failed')
    return 'bad'
  if (stage === 'canceled')
    return 'warn'
  if (stage === 'queued')
    return 'neutral'
  return 'info'
}

export function formatResearchStage(stage: ResearchTaskStage) {
  return stage.replace(/-/g, ' ')
}

export function ResearchTaskDetailContent({
  task,
  events,
  partials,
  running,
  canCancel,
  canceling,
  onCancel,
}: {
  task: ResearchTaskJob | null
  events: ResearchTaskEvent[]
  partials: ResearchTaskPartialResult[]
  running: boolean
  canCancel: boolean
  canceling: boolean
  onCancel: () => void
}) {
  if (!task)
    return <EmptyPanel text="Run a research task or select a record to inspect events and partials." />

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="system-sm-regular text-text-secondary">{task.query}</p>
        {canCancel && (
          <Button variant="secondary" size="small" loading={canceling} onClick={() => void onCancel()}>
            Cancel
          </Button>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        <StatusBadge label={formatResearchStage(task.stage)} tone={researchStageTone(task.stage)} />
      </div>

      {task.error && <p className="system-xs-regular text-util-colors-red-red-500">{task.error}</p>}
      {running && <p className="system-xs-regular text-text-accent">Streaming research events…</p>}

      <div>
        <div className="mb-2 system-xs-semibold-uppercase text-text-tertiary">Events</div>
        {events.length
          ? (
              <ul className="max-h-48 space-y-2 overflow-y-auto">
                {events.map(event => (
                  <li key={event.id} className="rounded-lg border border-divider-subtle bg-background-default-subtle px-3 py-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <StatusBadge label={event.type} tone={event.type === 'error' ? 'bad' : 'info'} />
                      {event.stage && <span className="system-xs-regular text-text-quaternary">{formatResearchStage(event.stage)}</span>}
                    </div>
                    <p className="mt-1 system-xs-regular text-text-secondary">{event.message}</p>
                  </li>
                ))}
              </ul>
            )
          : <EmptyPanel text="No events recorded yet." />}
      </div>

      <div>
        <div className="mb-2 system-xs-semibold-uppercase text-text-tertiary">Partials</div>
        {partials.length
          ? partials.map(partial => (
              <article key={`${partial.researchTaskJobId}-${partial.sequence}`} className="mb-2 rounded-lg border border-divider-subtle bg-background-default-subtle p-3 last:mb-0">
                <div className="flex flex-wrap items-center gap-2">
                  <StatusBadge label={`Sequence ${partial.sequence}`} tone="neutral" />
                  <StatusBadge label={partial.evidenceBundle.state} tone={partial.evidenceBundle.state === 'partial' ? 'warn' : 'good'} />
                </div>
                <p className="mt-2 system-sm-regular text-text-secondary">
                  {partial.evidenceBundle.items[0]?.text ?? 'Partial evidence bundle'}
                </p>
              </article>
            ))
          : <EmptyPanel text="No partial results yet." />}
      </div>
    </div>
  )
}
