import { useCallback, useEffect, useState } from 'react'
import type {
  ResearchTaskDryRunPlan,
  ResearchTaskEvent,
  ResearchTaskJob,
  ResearchTaskPartialResult,
} from '../../api-types'
import { MockServiceError } from '../../api-types'
import type { DatasetItem } from '../../fixtures/items'
import { resolveKnowledgeSpaceId } from '../../fixtures/knowledge-space-bridge'
import {
  cancelResearchTask,
  createResearchTask,
  getResearchTask,
  listResearchEvents,
  listResearchPartials,
  listResearchTasksBySpace,
  planResearchTask,
  runResearchTask,
} from '../../mock-services'

function mockErrorMessage(error: unknown) {
  if (error instanceof MockServiceError)
    return `${error.status}: ${error.message}`
  if (error instanceof Error)
    return error.message
  return 'Unexpected mock service error'
}

export function useResearchController(item: DatasetItem, initialQuery?: string) {
  const spaceId = resolveKnowledgeSpaceId(item.id)
  const [tasks, setTasks] = useState<ResearchTaskJob[]>([])
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null)
  const [selectedTask, setSelectedTask] = useState<ResearchTaskJob | null>(null)
  const [events, setEvents] = useState<ResearchTaskEvent[]>([])
  const [partials, setPartials] = useState<ResearchTaskPartialResult[]>([])
  const [plan, setPlan] = useState<ResearchTaskDryRunPlan | null>(null)
  const [query, setQuery] = useState(initialQuery ?? item.defaultQuery)
  const [budgetUsd, setBudgetUsd] = useState('2')
  const [loading, setLoading] = useState(true)
  const [planning, setPlanning] = useState(false)
  const [starting, setStarting] = useState(false)
  const [canceling, setCanceling] = useState(false)
  const [runningTaskId, setRunningTaskId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [toast, setToast] = useState('')

  const showToast = (message: string) => {
    setToast(message)
    window.setTimeout(() => setToast(''), 2200)
  }

  useEffect(() => {
    if (initialQuery)
      setQuery(initialQuery)
  }, [initialQuery])

  const refreshTasks = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      setTasks(await listResearchTasksBySpace(spaceId))
    }
    catch (cause) {
      setError(mockErrorMessage(cause))
    }
    finally {
      setLoading(false)
    }
  }, [spaceId])

  useEffect(() => {
    void refreshTasks()
  }, [refreshTasks])

  useEffect(() => {
    if (tasks.length > 0 && !selectedTaskId)
      setSelectedTaskId(tasks[0]!.id)
  }, [selectedTaskId, tasks])

  const loadTaskDetail = useCallback(async (taskId: string) => {
    try {
      const [task, nextEvents, nextPartials] = await Promise.all([
        getResearchTask(taskId),
        listResearchEvents(taskId),
        listResearchPartials(taskId),
      ])
      setSelectedTask(task)
      setEvents(nextEvents.items)
      setPartials(nextPartials.items)
    }
    catch (cause) {
      showToast(mockErrorMessage(cause))
    }
  }, [])

  useEffect(() => {
    if (!selectedTaskId)
      return
    void loadTaskDetail(selectedTaskId)
  }, [loadTaskDetail, selectedTaskId])

  const handlePlan = async () => {
    const trimmed = query.trim()
    if (!trimmed) {
      setError('Enter a research query before planning.')
      return
    }

    setPlanning(true)
    setError(null)
    try {
      const parsedBudget = Number.parseFloat(budgetUsd)
      setPlan(await planResearchTask({
        knowledgeSpaceId: spaceId,
        query: trimmed,
        budgetUsd: Number.isFinite(parsedBudget) ? parsedBudget : undefined,
      }))
    }
    catch (cause) {
      setError(mockErrorMessage(cause))
    }
    finally {
      setPlanning(false)
    }
  }

  const handleStart = async () => {
    const trimmed = query.trim()
    if (!trimmed) {
      setError('Enter a research query before starting a task.')
      return
    }

    setStarting(true)
    setError(null)
    try {
      const parsedBudget = Number.parseFloat(budgetUsd)
      const created = await createResearchTask({
        knowledgeSpaceId: spaceId,
        query: trimmed,
        budgetUsd: Number.isFinite(parsedBudget) ? parsedBudget : undefined,
      })
      setSelectedTaskId(created.id)
      setRunningTaskId(created.id)
      setEvents([])
      setPartials([])
      await refreshTasks()
      await runResearchTask(created.id, (event) => {
        setEvents(current => [...current, event])
        if (event.type === 'partial')
          void listResearchPartials(created.id).then(result => setPartials(result.items))
      })
      await loadTaskDetail(created.id)
      await refreshTasks()
      showToast('Research task completed.')
    }
    catch (cause) {
      setError(mockErrorMessage(cause))
    }
    finally {
      setStarting(false)
      setRunningTaskId(null)
    }
  }

  const handleCancel = async () => {
    if (!selectedTaskId)
      return

    setCanceling(true)
    try {
      await cancelResearchTask(selectedTaskId)
      await loadTaskDetail(selectedTaskId)
      await refreshTasks()
      showToast('Research task canceled.')
    }
    catch (cause) {
      showToast(mockErrorMessage(cause))
    }
    finally {
      setCanceling(false)
    }
  }

  const canCancel = selectedTask
    && selectedTask.stage !== 'completed'
    && selectedTask.stage !== 'failed'
    && selectedTask.stage !== 'canceled'

  return {
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
    showToast,
  }
}

export type ResearchController = ReturnType<typeof useResearchController>
