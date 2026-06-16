import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { BulkOperationProgress, DocumentCompilationJob, KnowledgeFsFindResponse, ParseArtifact } from '../../api-types'
import { MockServiceError } from '../../api-types'
import {
  documentIndexStatusLabels,
  documentMatchesStatusFilter,
  documentParserStatusLabels,
  documentSortOptions,
  documentStatusFilterOptions,
  type DatasetDocumentRow,
  type DatasetItem,
} from '../../fixtures/items'
import {
  documentAssetToRow,
  enrichFixtureDocumentRow,
  guessMimeTypeFromFilename,
} from '../../fixtures/document-bridge'
import { resolveKnowledgeSpaceId } from '../../fixtures/knowledge-space-bridge'
import {
  cancelJob,
  findFs,
  getBulkJob,
  getJob,
  getParseArtifact,
  listDocuments,
  pollJobUntilDone,
  simulateBulkReindexJob,
  simulateReindexJob,
  uploadDocument,
} from '../../mock-services'
import { getKnowledgeMockStore } from '../../mock-services/store'
import type { BulkJob } from './documents-helpers'

function mergeRowWithFixture(row: DatasetDocumentRow, fixtures: DatasetDocumentRow[]) {
  const fixture = fixtures.find(entry => entry.name === row.name)
  if (!fixture)
    return row

  return {
    ...row,
    source: fixture.source,
    indexStatus: fixture.indexStatus,
    evidenceUse: fixture.evidenceUse,
    updatedAt: fixture.updatedAt,
  }
}

function mockErrorMessage(error: unknown) {
  if (error instanceof MockServiceError)
    return `${error.status}: ${error.message}`
  if (error instanceof Error)
    return error.message
  return 'Unexpected mock service error'
}

export function useDocumentsController(
  item: DatasetItem,
  onDocumentsChange?: (documents: DatasetDocumentRow[]) => void,
) {
  const spaceId = resolveKnowledgeSpaceId(item.id)
  const fixtureDocuments = useMemo(
    () => item.documents.map(doc => enrichFixtureDocumentRow({ ...doc })),
    [item.documents],
  )

  const [documents, setDocuments] = useState<DatasetDocumentRow[]>(fixtureDocuments)
  const [loadingDocuments, setLoadingDocuments] = useState(true)
  const [documentsError, setDocumentsError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<(typeof documentStatusFilterOptions)[number]['value']>('all')
  const [sortValue, setSortValue] = useState<(typeof documentSortOptions)[number]['value']>('updated_at')
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [addOpen, setAddOpen] = useState(false)
  const [metadataOpen, setMetadataOpen] = useState(false)
  const [renameDoc, setRenameDoc] = useState<DatasetDocumentRow | null>(null)
  const [detailDoc, setDetailDoc] = useState<DatasetDocumentRow | null>(null)
  const [renameValue, setRenameValue] = useState('')
  const [addMode, setAddMode] = useState<'manual' | 'source'>('manual')
  const [addSourceId, setAddSourceId] = useState('')
  const [addSourceAsset, setAddSourceAsset] = useState('')
  const [addFileName, setAddFileName] = useState('')
  const [uploading, setUploading] = useState(false)
  const [bulkJob, setBulkJob] = useState<BulkJob | null>(null)
  const [bulkJobDetail, setBulkJobDetail] = useState<BulkOperationProgress | null>(null)
  const [bulkDrawerOpen, setBulkDrawerOpen] = useState(false)
  const [jobDrawerOpen, setJobDrawerOpen] = useState(false)
  const [artifactDrawerOpen, setArtifactDrawerOpen] = useState(false)
  const [activeJob, setActiveJob] = useState<DocumentCompilationJob | null>(null)
  const [activeJobDocument, setActiveJobDocument] = useState<DatasetDocumentRow | null>(null)
  const [activeArtifactDocument, setActiveArtifactDocument] = useState<DatasetDocumentRow | null>(null)
  const [artifact, setArtifact] = useState<ParseArtifact | null>(null)
  const [jobLoading, setJobLoading] = useState(false)
  const [artifactLoading, setArtifactLoading] = useState(false)
  const [jobError, setJobError] = useState<string | null>(null)
  const [artifactError, setArtifactError] = useState<string | null>(null)
  const [cancelingJob, setCancelingJob] = useState(false)
  const [toast, setToast] = useState('')
  const [knowledgeSearch, setKnowledgeSearch] = useState('')
  const [knowledgeSearchResults, setKnowledgeSearchResults] = useState<KnowledgeFsFindResponse | null>(null)
  const [knowledgeSearchLoading, setKnowledgeSearchLoading] = useState(false)
  const pollRef = useRef(0)

  const commitDocuments = useCallback((next: DatasetDocumentRow[]) => {
    setDocuments(next)
    window.setTimeout(() => onDocumentsChange?.(next), 0)
  }, [onDocumentsChange])

  const refreshDocuments = useCallback(async () => {
    setLoadingDocuments(true)
    setDocumentsError(null)
    try {
      const { items } = await listDocuments(spaceId)
      if (items.length === 0) {
        commitDocuments(fixtureDocuments)
        return
      }

      const rows = items
        .map(documentAssetToRow)
        .map(row => mergeRowWithFixture(row, fixtureDocuments))
      commitDocuments(rows)
    }
    catch (error) {
      setDocumentsError(mockErrorMessage(error))
      commitDocuments(fixtureDocuments)
    }
    finally {
      setLoadingDocuments(false)
    }
  }, [commitDocuments, fixtureDocuments, spaceId])

  useEffect(() => {
    void refreshDocuments()
  }, [refreshDocuments])

  const filteredDocuments = useMemo(() => {
    const keyword = search.trim().toLowerCase()
    const rows = documents.filter((doc) => {
      if (!documentMatchesStatusFilter(doc, statusFilter))
        return false
      if (!keyword)
        return true
      return [
        doc.name,
        doc.source,
        documentParserStatusLabels[doc.parserStatus],
        documentIndexStatusLabels[doc.indexStatus],
        doc.evidenceUse,
      ].join(' ').toLowerCase().includes(keyword)
    })
    return [...rows].sort((a, b) => {
      if (sortValue === 'name')
        return a.name.localeCompare(b.name)
      return a.updatedAt.localeCompare(b.updatedAt)
    })
  }, [documents, search, sortValue, statusFilter])

  const allVisibleSelected = filteredDocuments.length > 0 && filteredDocuments.every(doc => selectedIds.includes(doc.id))

  const showToast = (message: string) => {
    setToast(message)
    window.setTimeout(() => setToast(''), 2200)
  }

  const updateDocument = (id: string, patch: Partial<DatasetDocumentRow>) => {
    commitDocuments(documents.map(doc => doc.id === id ? { ...doc, ...patch } : doc))
  }

  const removeDocuments = (ids: string[]) => {
    commitDocuments(documents.filter(doc => !ids.includes(doc.id)))
    setSelectedIds(current => current.filter(id => !ids.includes(id)))
  }

  const toggleSelectAll = () => {
    if (allVisibleSelected)
      setSelectedIds(current => current.filter(id => !filteredDocuments.some(doc => doc.id === id)))
    else
      setSelectedIds(current => [...new Set([...current, ...filteredDocuments.map(doc => doc.id)])])
  }

  const openJobDrawer = async (doc: DatasetDocumentRow, jobId?: string) => {
    const resolvedJobId = jobId ?? doc.compilationJobId ?? findLatestJobId(doc.id)
    if (!resolvedJobId) {
      setActiveJobDocument(doc)
      setJobDrawerOpen(true)
      setJobLoading(false)
      setJobError('No compilation job is linked to this document yet.')
      setActiveJob(null)
      return
    }
    setActiveJobDocument(doc)
    setJobDrawerOpen(true)
    setJobLoading(true)
    setJobError(null)
    setActiveJob(null)

    const pollToken = pollRef.current + 1
    pollRef.current = pollToken

    try {
      let job = await getJob(resolvedJobId)
      setActiveJob(job)

      if (!['published', 'failed', 'canceled'].includes(job.stage)) {
        job = await pollJobUntilDone(resolvedJobId, (tick) => {
          if (pollRef.current === pollToken)
            setActiveJob(tick)
        })
        if (pollRef.current === pollToken)
          setActiveJob(job)
        await refreshDocuments()
      }
    }
    catch (error) {
      setJobError(mockErrorMessage(error))
    }
    finally {
      setJobLoading(false)
    }
  }

  const openArtifactDrawer = async (doc: DatasetDocumentRow) => {
    setActiveArtifactDocument(doc)
    setArtifactDrawerOpen(true)
    setArtifactLoading(true)
    setArtifactError(null)
    setArtifact(null)

    try {
      const version = doc.versionNumber ?? (Number.parseInt(doc.version.replace(/^v/i, ''), 10) || 1)
      const nextArtifact = await getParseArtifact(spaceId, doc.id, version)
      setArtifact(nextArtifact)
    }
    catch (error) {
      setArtifactError(mockErrorMessage(error))
    }
    finally {
      setArtifactLoading(false)
    }
  }

  const handleCancelJob = async () => {
    if (!activeJob)
      return

    setCancelingJob(true)
    try {
      const canceled = await cancelJob(activeJob.id)
      setActiveJob(canceled)
      showToast('Compilation job canceled.')
    }
    catch (error) {
      showToast(mockErrorMessage(error))
    }
    finally {
      setCancelingJob(false)
    }
  }

  const handleRetryJob = async () => {
    if (!activeJobDocument)
      return

    try {
      setJobLoading(true)
      const job = await simulateReindexJob(spaceId, activeJobDocument.id)
      setActiveJob(job)
      setJobDrawerOpen(true)
      const pollToken = pollRef.current + 1
      pollRef.current = pollToken
      const finished = await pollJobUntilDone(job.id, (tick) => {
        if (pollRef.current === pollToken)
          setActiveJob(tick)
      })
      if (pollRef.current === pollToken)
        setActiveJob(finished)
      await refreshDocuments()
      showToast('Re-index job queued.')
    }
    catch (error) {
      showToast(mockErrorMessage(error))
    }
    finally {
      setJobLoading(false)
    }
  }

  const handleAddDocument = async (input?: { filename?: string; sourceId?: string }) => {
    if (addMode === 'source') {
      showToast('Source-backed ingest uses the same upload mock in this prototype.')
    }

    const filename = input?.filename?.trim() || addFileName.trim()
    if (!filename)
      return

    const sizeBytes = filename.toLowerCase().includes('large')
      ? 15_728_640
      : 1_048_576

    setUploading(true)
    try {
      const accepted = await uploadDocument(spaceId, {
        filename,
        mimeType: guessMimeTypeFromFilename(filename),
        sizeBytes,
      })
      const row = documentAssetToRow(accepted.asset)
      row.compilationJobId = accepted.compilationJob.id
      commitDocuments([row, ...documents])
      setAddOpen(false)
      setAddFileName('')
      setAddSourceAsset('')
      showToast('Document accepted; compilation job started.')
      await openJobDrawer(row, accepted.compilationJob.id)
    }
    catch (error) {
      showToast(mockErrorMessage(error))
    }
    finally {
      setUploading(false)
    }
  }

  const handleRename = () => {
    if (!renameDoc || !renameValue.trim())
      return
    updateDocument(renameDoc.id, { name: renameValue.trim(), updatedAt: 'Just now' })
    setRenameDoc(null)
    showToast('Document renamed.')
  }

  const pollBulkJob = async (bulkJobId: string) => {
    let latest = await getBulkJob(bulkJobId)
    setBulkJobDetail(latest)
    while (latest.status === 'running') {
      await new Promise(resolve => window.setTimeout(resolve, 400))
      latest = await getBulkJob(bulkJobId)
      setBulkJobDetail(latest)
      setBulkJob(current => current?.id === bulkJobId
        ? {
            ...current,
            stage: latest.status,
            completed: latest.completedItems,
            total: latest.totalItems,
            failedItemIds: latest.failedItemIds,
          }
        : current)
    }
    await refreshDocuments()
  }

  const openBulkDrawer = async () => {
    if (bulkJob && !bulkJobDetail) {
      try {
        setBulkJobDetail(await getBulkJob(bulkJob.id))
      }
      catch {
        setBulkJobDetail(null)
      }
    }
    setBulkDrawerOpen(true)
  }

  const handleReindex = async (ids: string[]) => {
    ids.forEach((id) => {
      updateDocument(id, { indexStatus: 'building', updatedAt: 'Just now' })
    })

    if (ids.length === 1) {
      try {
        const doc = documents.find(entry => entry.id === ids[0])
        if (!doc)
          return
        const job = await simulateReindexJob(spaceId, doc.id)
        setBulkJob({
          id: job.id,
          kind: 'compilation',
          stage: job.stage,
          completed: 1,
          total: 1,
        })
        await openJobDrawer(doc, job.id)
      }
      catch (error) {
        showToast(mockErrorMessage(error))
      }
      return
    }

    try {
      const bulkJobId = await simulateBulkReindexJob(spaceId, ids)
      setBulkJob({
        id: bulkJobId,
        kind: 'bulk',
        stage: 'running',
        completed: 0,
        total: ids.length,
      })
      showToast(`Bulk re-index job queued for ${ids.length} documents.`)
      void pollBulkJob(bulkJobId)
    }
    catch (error) {
      showToast(mockErrorMessage(error))
    }
  }

  const exclusionReason = (doc: DatasetDocumentRow) => {
    if (doc.evidenceUse.startsWith('Excluded from'))
      return 'Excluded from selected retrieval modes due to stale index.'
    if (doc.evidenceUse === 'Excluded')
      return doc.parserStatus === 'failed' ? 'Parser failed before projection build.' : 'Excluded from ready projection.'
    if (doc.evidenceUse === 'Pending')
      return 'Waiting for parser or projection to complete.'
    return 'Included in published projection and evidence tests.'
  }

  const runKnowledgeSearch = async () => {
    const query = knowledgeSearch.trim()
    if (!query)
      return

    setKnowledgeSearchLoading(true)
    try {
      setKnowledgeSearchResults(await findFs(spaceId, '/knowledge', { nameContains: query }))
    }
    catch (error) {
      showToast(mockErrorMessage(error))
      setKnowledgeSearchResults(null)
    }
    finally {
      setKnowledgeSearchLoading(false)
    }
  }

  return {
    documents,
    loadingDocuments,
    documentsError,
    search,
    setSearch,
    statusFilter,
    setStatusFilter,
    sortValue,
    setSortValue,
    selectedIds,
    setSelectedIds,
    addOpen,
    setAddOpen,
    metadataOpen,
    setMetadataOpen,
    renameDoc,
    setRenameDoc,
    detailDoc,
    setDetailDoc,
    renameValue,
    setRenameValue,
    addMode,
    setAddMode,
    addSourceId,
    setAddSourceId,
    addSourceAsset,
    setAddSourceAsset,
    addFileName,
    setAddFileName,
    uploading,
    bulkJob,
    bulkJobDetail,
    bulkDrawerOpen,
    setBulkDrawerOpen,
    jobDrawerOpen,
    setJobDrawerOpen,
    artifactDrawerOpen,
    setArtifactDrawerOpen,
    activeJob,
    activeJobDocument,
    activeArtifactDocument,
    artifact,
    jobLoading,
    artifactLoading,
    jobError,
    artifactError,
    cancelingJob,
    toast,
    filteredDocuments,
    allVisibleSelected,
    showToast,
    updateDocument,
    removeDocuments,
    toggleSelectAll,
    handleAddDocument,
    handleRename,
    handleReindex,
    handleCancelJob,
    handleRetryJob,
    openJobDrawer,
    openArtifactDrawer,
    openBulkDrawer,
    exclusionReason,
    refreshDocuments,
    knowledgeSearch,
    setKnowledgeSearch,
    knowledgeSearchResults,
    knowledgeSearchLoading,
    runKnowledgeSearch,
  }
}

function findLatestJobId(documentAssetId: string) {
  const jobs = Object.values(getKnowledgeMockStore().jobs)
    .filter(job => job.documentAssetId === documentAssetId)
    .sort((left, right) => right.updatedAt - left.updatedAt)
  return jobs[0]?.id
}
