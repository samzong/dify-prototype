import { useCallback, useEffect, useRef, useState } from 'react'
import type {
  AnswerTrace,
  AnswerTraceStep,
  EvidenceBundle,
  EvidenceBundleItem,
  MissingEvidenceItem,
  ResearchTaskEvent,
  ResearchTaskJob,
  ResearchTaskPartialResult,
} from '../../api-types'
import { MockServiceError } from '../../api-types'
import type { DatasetItem, EvidenceState, RetrievalDepthOption } from '../../fixtures/items'
import { resolveKnowledgeSpaceId } from '../../fixtures/knowledge-space-bridge'
import type { EvidenceRecordItem } from '../../mock-services'
import {
  cancelResearchTask,
  createGoldenQuestion,
  createProductionBadCase,
  createResearchTask,
  getQueryTrace,
  getResearchTask,
  listEvidenceRecords,
  listResearchEvents,
  listResearchPartials,
  runQuery,
  runResearchTask,
} from '../../mock-services'
import { getKnowledgeMockStore } from '../../mock-services/store'
import {
  bundleStateToEvidenceState,
  missingEvidenceKey,
  queryModeFromRetrievalDepth,
} from './evidence-bridge'

export type EvidenceResultKind = 'query' | 'research'

function mockErrorMessage(error: unknown) {
  if (error instanceof MockServiceError)
    return `${error.status}: ${error.message}`
  if (error instanceof Error)
    return error.message
  return 'Unexpected mock service error'
}

function resolveBundleFromTrace(trace: AnswerTrace) {
  const bundleId = trace.evidenceBundleId
  if (!bundleId)
    return null
  const bundle = getKnowledgeMockStore().evidenceBundles[bundleId]
  return bundle ? structuredClone(bundle) as EvidenceBundle : null
}

function resolveBundleByTraceId(traceId: string) {
  const store = getKnowledgeMockStore()
  const trace = store.traces[traceId]
  if (!trace)
    return null

  if (trace.evidenceBundleId)
    return store.evidenceBundles[trace.evidenceBundleId] ?? null

  return Object.values(store.evidenceBundles).find(entry => entry.traceId === traceId) ?? null
}

export function useEvidenceController(
  item: DatasetItem,
  options?: {
    initialMode?: RetrievalDepthOption
    initialQuery?: string
  },
) {
  const spaceId = resolveKnowledgeSpaceId(item.id)
  const [mode, setMode] = useState<RetrievalDepthOption>(options?.initialMode ?? item.settingsConfig.defaultRetrieval?.mode ?? 'Fast')
  const [query, setQuery] = useState(options?.initialQuery ?? item.defaultQuery)
  const [running, setRunning] = useState(false)
  const [runError, setRunError] = useState<string | null>(null)
  const [bundleState, setBundleState] = useState<EvidenceState>(item.evidenceState)
  const [traceId, setTraceId] = useState(item.evidenceTraceId)
  const [freshness, setFreshness] = useState(item.evidenceFreshness)
  const [trace, setTrace] = useState<AnswerTrace | null>(null)
  const [bundle, setBundle] = useState<EvidenceBundle | null>(null)
  const [streamSteps, setStreamSteps] = useState<AnswerTraceStep[]>([])
  const [answerText, setAnswerText] = useState('')
  const [traceDrawerOpen, setTraceDrawerOpen] = useState(false)
  const [dismissedMissingKeys, setDismissedMissingKeys] = useState<string[]>([])
  const [toast, setToast] = useState('')

  const [records, setRecords] = useState<EvidenceRecordItem[]>([])
  const [recordsLoading, setRecordsLoading] = useState(true)
  const [selectedRecordId, setSelectedRecordId] = useState<string | null>(null)
  const [resultKind, setResultKind] = useState<EvidenceResultKind>('query')
  const selectedOnMount = useRef(false)

  const [researchTask, setResearchTask] = useState<ResearchTaskJob | null>(null)
  const [researchEvents, setResearchEvents] = useState<ResearchTaskEvent[]>([])
  const [researchPartials, setResearchPartials] = useState<ResearchTaskPartialResult[]>([])
  const [runningResearchId, setRunningResearchId] = useState<string | null>(null)
  const [researchStarting, setResearchStarting] = useState(false)
  const [canceling, setCanceling] = useState(false)

  const showToast = (message: string) => {
    setToast(message)
    window.setTimeout(() => setToast(''), 2200)
  }

  useEffect(() => {
    if (options?.initialMode)
      setMode(options.initialMode)
  }, [options?.initialMode])

  useEffect(() => {
    if (options?.initialQuery)
      setQuery(options.initialQuery)
  }, [options?.initialQuery])

  const refreshRecords = useCallback(async () => {
    setRecordsLoading(true)
    try {
      setRecords(await listEvidenceRecords(spaceId))
    }
    catch (error) {
      showToast(mockErrorMessage(error))
    }
    finally {
      setRecordsLoading(false)
    }
  }, [spaceId])

  useEffect(() => {
    void refreshRecords()
  }, [refreshRecords])

  const loadTraceDetails = useCallback(async (nextTraceId: string) => {
    const nextTrace = await getQueryTrace(nextTraceId)
    setTrace(nextTrace)
    const storeBundle = resolveBundleFromTrace(nextTrace)
      ?? resolveBundleByTraceId(nextTraceId)

    if (storeBundle) {
      const cloned = structuredClone(storeBundle) as EvidenceBundle
      setBundle(cloned)
      setBundleState(bundleStateToEvidenceState(cloned.state))
      setFreshness(cloned.items[0]?.freshness.status ?? item.evidenceFreshness)
    }
    else {
      setBundle(null)
      setBundleState(item.evidenceState)
      setAnswerText('')
    }
  }, [item.evidenceFreshness])

  const loadResearchDetail = useCallback(async (taskId: string) => {
    const [task, nextEvents, nextPartials] = await Promise.all([
      getResearchTask(taskId),
      listResearchEvents(taskId),
      listResearchPartials(taskId),
    ])
    setResearchTask(task)
    setResearchEvents(nextEvents.items)
    setResearchPartials(nextPartials.items)
  }, [])

  const selectRecord = useCallback(async (record: EvidenceRecordItem) => {
    setSelectedRecordId(record.id)
    setQuery(record.query)
    setRunError(null)

    if (record.kind === 'query') {
      setResultKind('query')
      setResearchTask(null)
      setResearchEvents([])
      setResearchPartials([])
      setTraceId(record.id)
      setStreamSteps([])
      setAnswerText('')
      try {
        await loadTraceDetails(record.id)
      }
      catch (error) {
        showToast(mockErrorMessage(error))
      }
      return
    }

    setResultKind('research')
    setTrace(null)
    setBundle(null)
    setStreamSteps([])
    setAnswerText('')
    try {
      await loadResearchDetail(record.id)
    }
    catch (error) {
      showToast(mockErrorMessage(error))
    }
  }, [loadResearchDetail, loadTraceDetails])

  useEffect(() => {
    if (recordsLoading || selectedOnMount.current || records.length === 0)
      return

    selectedOnMount.current = true
    void selectRecord(records[0]!)
  }, [records, recordsLoading, selectRecord])

  const runEvidence = async () => {
    setRunning(true)
    setRunError(null)
    setResultKind('query')
    setStreamSteps([])
    setAnswerText('')
    setBundle(null)
    setResearchTask(null)
    setResearchEvents([])
    setResearchPartials([])

    try {
      let resolvedTraceId = traceId
      const result = await runQuery({
        knowledgeSpaceId: spaceId,
        query: query.trim() || item.defaultQuery,
        mode: queryModeFromRetrievalDepth(mode),
      }, (event) => {
        if (event.type === 'trace-id')
          resolvedTraceId = event.traceId
        if (event.type === 'step')
          setStreamSteps(current => [...current, event.step])
        if (event.type === 'answer-chunk')
          setAnswerText(current => current + event.text)
        if (event.type === 'done') {
          setTrace(event.trace)
          setBundle(event.bundle)
          setBundleState(bundleStateToEvidenceState(event.bundle.state))
          setFreshness(event.bundle.items[0]?.freshness.status ?? item.evidenceFreshness)
        }
      })

      setTraceId(resolvedTraceId)
      setTrace(result.trace)
      setBundle(result.bundle)
      setBundleState(bundleStateToEvidenceState(result.bundle.state))
      setSelectedRecordId(resolvedTraceId)
      await refreshRecords()
      showToast(`Evidence test completed with ${mode} retrieval depth.`)
    }
    catch (error) {
      setRunError(mockErrorMessage(error))
      showToast(mockErrorMessage(error))
    }
    finally {
      setRunning(false)
    }
  }

  const startResearch = async () => {
    const trimmed = query.trim()
    if (!trimmed) {
      setRunError('Enter a query before starting research.')
      return
    }

    setResearchStarting(true)
    setRunError(null)
    setResultKind('research')
    setResearchEvents([])
    setResearchPartials([])

    try {
      const created = await createResearchTask({
        knowledgeSpaceId: spaceId,
        query: trimmed,
      })
      setSelectedRecordId(created.id)
      setResearchTask(created)
      setRunningResearchId(created.id)
      await runResearchTask(created.id, (event) => {
        setResearchEvents(current => [...current, event])
        if (event.type === 'partial')
          void listResearchPartials(created.id).then(result => setResearchPartials(result.items))
      })
      await loadResearchDetail(created.id)
      await refreshRecords()
      showToast('Research task completed.')
    }
    catch (error) {
      setRunError(mockErrorMessage(error))
      showToast(mockErrorMessage(error))
    }
    finally {
      setResearchStarting(false)
      setRunningResearchId(null)
    }
  }

  const run = async () => {
    if (mode === 'Research')
      await startResearch()
    else
      await runEvidence()
  }

  const cancelResearch = async () => {
    if (!researchTask)
      return

    setCanceling(true)
    try {
      await cancelResearchTask(researchTask.id)
      await loadResearchDetail(researchTask.id)
      await refreshRecords()
      showToast('Research task canceled.')
    }
    catch (error) {
      showToast(mockErrorMessage(error))
    }
    finally {
      setCanceling(false)
    }
  }

  const openTraceDrawer = async (nextTraceId?: string) => {
    const targetTraceId = nextTraceId ?? traceId
    if (!targetTraceId)
      return

    setTraceId(targetTraceId)
    setTraceDrawerOpen(true)
    try {
      await loadTraceDetails(targetTraceId)
    }
    catch (error) {
      showToast(mockErrorMessage(error))
    }
  }

  const createBadCaseFromTrace = async (labelTraceId = traceId) => {
    if (!labelTraceId) {
      showToast('Run an evidence test before creating a bad case.')
      return
    }

    try {
      await createProductionBadCase(spaceId, { traceId: labelTraceId })
      showToast('Bad case created from trace.')
    }
    catch (error) {
      showToast(mockErrorMessage(error))
    }
  }

  const createBadCaseFromMissing = async (entry: MissingEvidenceItem) => {
    if (!traceId) {
      showToast('Run an evidence test before creating a bad case.')
      return
    }

    try {
      await createProductionBadCase(spaceId, {
        traceId,
        reason: `${entry.reason}: ${entry.text}`,
      })
      showToast('Bad case created from missing evidence.')
    }
    catch (error) {
      showToast(mockErrorMessage(error))
    }
  }

  const createGoldenQuestionFromQuery = async (question: string) => {
    const trimmed = question.trim()
    if (!trimmed) {
      showToast('Enter a query before creating a golden question.')
      return
    }

    try {
      await createGoldenQuestion(spaceId, { question: trimmed })
      showToast('Golden question created.')
    }
    catch (error) {
      showToast(mockErrorMessage(error))
    }
  }

  const dismissMissingEvidence = (entry: MissingEvidenceItem) => {
    const key = missingEvidenceKey(entry.text, entry.reason)
    setDismissedMissingKeys(current => current.includes(key) ? current : [...current, key])
    showToast('Missing evidence dismissed.')
  }

  const visibleMissingEvidence = (entries: MissingEvidenceItem[] | undefined) => {
    return (entries ?? []).filter(entry => !dismissedMissingKeys.includes(missingEvidenceKey(entry.text, entry.reason)))
  }

  const evidenceItems: EvidenceBundleItem[] = bundle?.items ?? []
  const missingItems = visibleMissingEvidence(bundle?.missingEvidence)
  const conflictItems = bundle?.items.flatMap(entry => entry.conflicts ?? []) ?? []

  const canCancelResearch = !!researchTask
    && researchTask.stage !== 'completed'
    && researchTask.stage !== 'failed'
    && researchTask.stage !== 'canceled'

  const isRunning = mode === 'Research'
    ? researchStarting || runningResearchId !== null
    : running

  return {
    mode,
    setMode,
    query,
    setQuery,
    running: isRunning,
    runError,
    bundleState,
    traceId,
    freshness,
    trace,
    bundle,
    streamSteps,
    answerText,
    traceDrawerOpen,
    setTraceDrawerOpen,
    dismissedMissingKeys,
    toast,
    evidenceItems,
    missingItems,
    conflictItems,
    documents: item.documents,
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
    showToast,
    run,
    runEvidence,
    startResearch,
    selectRecord,
    refreshRecords,
    cancelResearch,
    openTraceDrawer,
    createBadCaseFromTrace,
    createBadCaseFromMissing,
    createGoldenQuestionFromQuery,
    dismissMissingEvidence,
    loadTraceDetails,
  }
}
