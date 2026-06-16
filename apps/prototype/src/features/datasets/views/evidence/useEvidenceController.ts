import { useState } from 'react'
import type {
  AnswerTrace,
  AnswerTraceStep,
  EvidenceBundle,
  EvidenceBundleItem,
  MissingEvidenceItem,
} from '../../api-types'
import { MockServiceError } from '../../api-types'
import type { DatasetItem, EvidenceState, RetrievalDepthOption } from '../../fixtures/items'
import { resolveKnowledgeSpaceId } from '../../fixtures/knowledge-space-bridge'
import {
  getQueryTrace,
  runQuery,
} from '../../mock-services'
import { getKnowledgeMockStore } from '../../mock-services/store'
import {
  bundleStateToEvidenceState,
  missingEvidenceKey,
  queryModeFromRetrievalDepth,
} from './evidence-bridge'

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

export function useEvidenceController(item: DatasetItem) {
  const spaceId = resolveKnowledgeSpaceId(item.id)
  const [mode, setMode] = useState<RetrievalDepthOption>(item.settingsConfig.defaultRetrieval?.mode ?? 'Fast')
  const [query, setQuery] = useState(item.defaultQuery)
  const [running, setRunning] = useState(false)
  const [runError, setRunError] = useState<string | null>(null)
  const [bundleState, setBundleState] = useState<EvidenceState>(item.evidenceState)
  const [traceId, setTraceId] = useState(item.evidenceTraceId)
  const [freshness, setFreshness] = useState(item.evidenceFreshness)
  const [badCases, setBadCases] = useState(item.badCases)
  const [goldenQuestions, setGoldenQuestions] = useState(item.goldenQuestions)
  const [trace, setTrace] = useState<AnswerTrace | null>(null)
  const [bundle, setBundle] = useState<EvidenceBundle | null>(null)
  const [streamSteps, setStreamSteps] = useState<AnswerTraceStep[]>([])
  const [answerText, setAnswerText] = useState('')
  const [traceDrawerOpen, setTraceDrawerOpen] = useState(false)
  const [dismissedMissingKeys, setDismissedMissingKeys] = useState<string[]>([])
  const [toast, setToast] = useState('')

  const showToast = (message: string) => {
    setToast(message)
    window.setTimeout(() => setToast(''), 2200)
  }

  const loadTraceDetails = async (nextTraceId: string) => {
    const nextTrace = await getQueryTrace(nextTraceId)
    setTrace(nextTrace)
    const storeBundle = resolveBundleFromTrace(nextTrace)
    if (storeBundle) {
      setBundle(storeBundle)
      setBundleState(bundleStateToEvidenceState(storeBundle.state))
      setFreshness(storeBundle.items[0]?.freshness.status ?? item.evidenceFreshness)
    }
  }

  const runEvidence = async (nextMode?: RetrievalDepthOption) => {
    const activeMode = nextMode ?? mode
    if (nextMode)
      setMode(nextMode)

    setRunning(true)
    setRunError(null)
    setStreamSteps([])
    setAnswerText('')
    setBundle(null)

    try {
      let resolvedTraceId = traceId
      const result = await runQuery({
        knowledgeSpaceId: spaceId,
        query: query.trim() || item.defaultQuery,
        mode: queryModeFromRetrievalDepth(activeMode),
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
      showToast(`Evidence test completed with ${activeMode} retrieval depth.`)
    }
    catch (error) {
      setRunError(mockErrorMessage(error))
      showToast(mockErrorMessage(error))
    }
    finally {
      setRunning(false)
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

  const createBadCaseFromTrace = (labelTraceId = traceId) => {
    const label = `Trace ${labelTraceId}`
    if (!badCases.includes(label))
      setBadCases(current => [label, ...current])
    showToast('Bad case created from trace.')
  }

  const createBadCaseFromMissing = (entry: MissingEvidenceItem) => {
    const label = entry.text
    if (!badCases.includes(label))
      setBadCases(current => [label, ...current])
    showToast('Bad case created from missing evidence.')
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

  return {
    mode,
    setMode,
    query,
    setQuery,
    running,
    runError,
    bundleState,
    traceId,
    freshness,
    badCases,
    goldenQuestions,
    setGoldenQuestions,
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
    showToast,
    runEvidence,
    openTraceDrawer,
    createBadCaseFromTrace,
    createBadCaseFromMissing,
    dismissMissingEvidence,
    loadTraceDetails,
  }
}
