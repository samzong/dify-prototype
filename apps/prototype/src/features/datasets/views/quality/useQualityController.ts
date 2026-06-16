import { useCallback, useEffect, useState } from 'react'
import type { GoldenQuestion, ProductionBadCase } from '../../api-types'
import { MockServiceError } from '../../api-types'
import type { DatasetItem } from '../../fixtures/items'
import { resolveKnowledgeSpaceId } from '../../fixtures/knowledge-space-bridge'
import {
  createGoldenQuestion,
  createProductionBadCase,
  deleteGoldenQuestion,
  listGoldenQuestions,
  listProductionBadCases,
  updateGoldenQuestion,
} from '../../mock-services'

function mockErrorMessage(error: unknown) {
  if (error instanceof MockServiceError)
    return `${error.status}: ${error.message}`
  if (error instanceof Error)
    return error.message
  return 'Unexpected mock service error'
}

export type GoldenQuestionDraft = {
  question: string
  tags: string
  annotation: string
  expectedEvidenceIds: string
}

export function useQualityController(item: DatasetItem) {
  const spaceId = resolveKnowledgeSpaceId(item.id)
  const [goldenQuestions, setGoldenQuestions] = useState<GoldenQuestion[]>([])
  const [badCases, setBadCases] = useState<ProductionBadCase[]>([])
  const [nextCursor, setNextCursor] = useState<string | undefined>()
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [toast, setToast] = useState('')

  const showToast = (message: string) => {
    setToast(message)
    window.setTimeout(() => setToast(''), 2200)
  }

  const refresh = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [goldenPage, nextBadCases] = await Promise.all([
        listGoldenQuestions(spaceId, { limit: 25 }),
        listProductionBadCases(spaceId),
      ])
      setGoldenQuestions(goldenPage.items)
      setNextCursor(goldenPage.nextCursor)
      setBadCases(nextBadCases)
    }
    catch (cause) {
      setError(mockErrorMessage(cause))
    }
    finally {
      setLoading(false)
    }
  }, [spaceId])

  useEffect(() => {
    void refresh()
  }, [refresh])

  const loadMoreGoldenQuestions = async () => {
    if (!nextCursor)
      return

    setLoadingMore(true)
    try {
      const page = await listGoldenQuestions(spaceId, { cursor: nextCursor, limit: 25 })
      setGoldenQuestions(current => [...current, ...page.items])
      setNextCursor(page.nextCursor)
    }
    catch (cause) {
      showToast(mockErrorMessage(cause))
    }
    finally {
      setLoadingMore(false)
    }
  }

  const saveGoldenQuestion = async (draft: GoldenQuestionDraft, editing?: GoldenQuestion | null) => {
    const tags = draft.tags.split(',').map(tag => tag.trim()).filter(Boolean)
    const expectedEvidenceIds = draft.expectedEvidenceIds
      .split(',')
      .map(id => id.trim())
      .filter(Boolean)
    const metadata = draft.annotation.trim()
      ? { annotation: draft.annotation.trim() }
      : undefined

    if (editing) {
      await updateGoldenQuestion(spaceId, editing.id, {
        question: draft.question.trim(),
        tags,
        expectedEvidenceIds,
        metadata,
      })
      showToast('Golden question updated.')
    }
    else {
      const created = await createGoldenQuestion(spaceId, {
        question: draft.question.trim(),
        tags,
      })
      if (metadata || expectedEvidenceIds.length > 0) {
        await updateGoldenQuestion(spaceId, created.id, { expectedEvidenceIds, metadata })
      }
      showToast('Golden question created.')
    }

    await refresh()
  }

  const removeGoldenQuestion = async (questionId: string) => {
    await deleteGoldenQuestion(spaceId, questionId)
    showToast('Golden question deleted.')
    await refresh()
  }

  const createBadCaseFromTrace = async (traceId: string, reason?: string) => {
    await createProductionBadCase(spaceId, { traceId, reason })
    showToast('Bad case created from trace.')
    await refresh()
  }

  const createGoldenFromBadCase = async (badCase: ProductionBadCase) => {
    await createGoldenQuestion(spaceId, {
      question: badCase.question,
      tags: badCase.tags,
    })
    showToast('Golden question created from bad case.')
    await refresh()
  }

  return {
    spaceId,
    goldenQuestions,
    badCases,
    nextCursor,
    loading,
    loadingMore,
    error,
    toast,
    traces: item.traces,
    documents: item.documents,
    refresh,
    loadMoreGoldenQuestions,
    saveGoldenQuestion,
    removeGoldenQuestion,
    createBadCaseFromTrace,
    createGoldenFromBadCase,
    showToast,
  }
}
