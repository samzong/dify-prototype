import { Button } from '@langgenius/dify-ui/button'
import { Input } from '@langgenius/dify-ui/input'
import { Textarea } from '@langgenius/dify-ui/textarea'
import { RiPlayLine, RiSearchLine } from '@remixicon/react'
import type { ResearchTaskJob, ResearchTaskStage } from '../../api-types'
import { StatusBadge } from '../../components/badges'
import type { BadgeTone } from '../../fixtures/items'
import { ActionToast, EmptyPanel, Panel } from '../../components/panel'
import type { ResearchController } from './useResearchController'

function stageTone(stage: ResearchTaskStage): BadgeTone {
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

function formatStage(stage: ResearchTaskStage) {
  return stage.replace(/-/g, ' ')
}

function ResearchCreatePanel({
  query,
  setQuery,
  budgetUsd,
  setBudgetUsd,
  plan,
  planning,
  starting,
  error,
  onPlan,
  onStart,
}: {
  query: string
  setQuery: (value: string) => void
  budgetUsd: string
  setBudgetUsd: (value: string) => void
  plan: ResearchController['plan']
  planning: boolean
  starting: boolean
  error: string | null
  onPlan: () => void
  onStart: () => void
}) {
  return (
    <Panel title="New research task" badge="Research">
      <div className="space-y-3">
        <Textarea value={query} onValueChange={setQuery} className="min-h-24" aria-label="Research query" />
        <div>
          <div className="mb-1 system-xs-medium text-text-tertiary">Budget (USD)</div>
          <Input value={budgetUsd} onChange={event => setBudgetUsd(event.target.value)} aria-label="Research budget" />
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" size="small" loading={planning} onClick={() => void onPlan()}>
            <RiSearchLine className="size-4" />
            Plan
          </Button>
          <Button variant="primary" size="small" loading={starting} onClick={() => void onStart()}>
            <RiPlayLine className="size-4" />
            Start research
          </Button>
        </div>
        {error && <p className="system-xs-regular text-util-colors-red-red-500">{error}</p>}
        {plan && (
          <div className="rounded-lg border border-divider-subtle bg-background-default-subtle p-3">
            <div className="system-xs-semibold-uppercase text-text-tertiary">Dry-run plan</div>
            <p className="mt-2 system-sm-regular text-text-secondary">
              Estimated
              {' '}
              {plan.estimates.costUsd.estimated.toFixed(2)}
              {' '}
              USD ·
              {' '}
              {plan.estimates.retrievalSteps}
              {' '}
              retrieval steps ·
              {' '}
              {plan.estimates.toolCalls}
              {' '}
              tool calls
            </p>
            <p className="mt-1 system-xs-regular text-text-tertiary">
              Latency p50
              {' '}
              {plan.estimates.latencyMs.p50}
              ms · p95
              {' '}
              {plan.estimates.latencyMs.p95}
              ms
            </p>
          </div>
        )}
      </div>
    </Panel>
  )
}

function ResearchTaskList({
  tasks,
  selectedTaskId,
  loading,
  onSelect,
}: {
  tasks: ResearchTaskJob[]
  selectedTaskId: string | null
  loading: boolean
  onSelect: (taskId: string) => void
}) {
  return (
    <Panel title="Research tasks" badge={String(tasks.length)}>
      {loading && <EmptyPanel text="Loading research tasks…" />}
      {!loading && tasks.length === 0 && <EmptyPanel text="No research tasks yet." />}
      {!loading && tasks.map(task => (
        <button
          key={task.id}
          type="button"
          onClick={() => onSelect(task.id)}
          className={`mb-2 flex w-full items-start justify-between gap-3 rounded-lg border px-3 py-2 text-left last:mb-0 ${
            selectedTaskId === task.id
              ? 'border-components-panel-border bg-state-base-hover'
              : 'border-divider-subtle bg-background-default-subtle hover:bg-state-base-hover'
          }`}
        >
          <div className="min-w-0">
            <div className="truncate system-sm-semibold text-text-secondary">{task.query}</div>
            <div className="mt-1 system-xs-regular text-text-quaternary">{task.id}</div>
          </div>
          <StatusBadge label={formatStage(task.stage)} tone={stageTone(task.stage)} />
        </button>
      ))}
    </Panel>
  )
}

function ResearchTaskDetail({
  task,
  events,
  partials,
  runningTaskId,
  canCancel,
  canceling,
  onCancel,
}: {
  task: ResearchController['selectedTask']
  events: ResearchController['events']
  partials: ResearchController['partials']
  runningTaskId: string | null
  canCancel: boolean
  canceling: boolean
  onCancel: () => void
}) {
  if (!task)
    return <Panel title="Task detail"><EmptyPanel text="Select a research task to inspect events and partials." /></Panel>

  const running = runningTaskId === task.id

  return (
    <Panel
      title="Task detail"
      badge={formatStage(task.stage)}
      badgeTone={stageTone(task.stage)}
      action={canCancel
        ? (
            <Button variant="secondary" size="small" loading={canceling} onClick={() => void onCancel()}>
              Cancel
            </Button>
          )
        : undefined}
    >
      <div className="space-y-3">
        <p className="system-sm-regular text-text-secondary">{task.query}</p>
        <div className="flex flex-wrap gap-2">
          <StatusBadge label={`Budget ${task.budgetUsd ?? '—'} USD`} tone="neutral" />
          <StatusBadge label={`Cost ${task.cost.totalUsd.toFixed(2)} USD`} tone={task.cost.budgetExceeded ? 'bad' : 'info'} />
          {task.limits?.maxRetrievalSteps && (
            <StatusBadge label={`Max steps ${task.limits.maxRetrievalSteps}`} tone="neutral" />
          )}
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
                        {event.stage && <span className="system-xs-regular text-text-quaternary">{formatStage(event.stage)}</span>}
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
    </Panel>
  )
}

export function ResearchSections({ controller, embedded = false }: { controller: ResearchController; embedded?: boolean }) {
  const {
    tasks,
    selectedTaskId,
    setSelectedTaskId,
    selectedTask,
    events,
    partials,
    plan,
    query,
    setQuery,
    budgetUsd,
    setBudgetUsd,
    loading,
    planning,
    starting,
    canceling,
    runningTaskId,
    error,
    toast,
    canCancel,
    handlePlan,
    handleStart,
    handleCancel,
  } = controller

  return (
    <div className={embedded ? 'space-y-4' : 'space-y-4 pr-6'}>
      <ResearchCreatePanel
        query={query}
        setQuery={setQuery}
        budgetUsd={budgetUsd}
        setBudgetUsd={setBudgetUsd}
        plan={plan}
        planning={planning}
        starting={starting}
        error={error}
        onPlan={handlePlan}
        onStart={handleStart}
      />

      <div className="grid grid-cols-1 gap-3 xl:grid-cols-[0.85fr_1.15fr]">
        <ResearchTaskList
          tasks={tasks}
          selectedTaskId={selectedTaskId}
          loading={loading}
          onSelect={setSelectedTaskId}
        />
        <ResearchTaskDetail
          task={selectedTask}
          events={events}
          partials={partials}
          runningTaskId={runningTaskId}
          canCancel={!!canCancel}
          canceling={canceling}
          onCancel={handleCancel}
        />
      </div>

      <ActionToast message={toast} visible={!!toast} />
    </div>
  )
}
