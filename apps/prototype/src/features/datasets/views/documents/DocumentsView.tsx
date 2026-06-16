import { Button } from '@langgenius/dify-ui/button'
import { Checkbox } from '@langgenius/dify-ui/checkbox'
import { cn } from '@langgenius/dify-ui/cn'
import { Dialog, DialogCloseButton, DialogContent, DialogTitle } from '@langgenius/dify-ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@langgenius/dify-ui/dropdown-menu'
import { Input } from '@langgenius/dify-ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectItemIndicator,
  SelectItemText,
  SelectTrigger,
  SelectValue,
} from '@langgenius/dify-ui/select'
import {
  RiAddLine,
  RiDraftLine,
  RiEqualizer2Line,
  RiMoreFill,
  RiSearchLine,
  RiUploadCloud2Line,
} from '@remixicon/react'
import { useMemo, useState } from 'react'
import { evidenceUseTone, indexTone, parserTone, StatusBadge } from '../../components/badges'
import {
  documentIndexStatusLabels,
  documentMatchesStatusFilter,
  documentParserStatusLabels,
  documentSortOptions,
  documentStatusFilterOptions,
  sourceTypeLabels,
  type DatasetItem,
  type DatasetDocumentRow,
  type DatasetSourceRow,
} from '../../fixtures/items'
import { ActionToast, DetailRow } from '../../components/panel'

import {
  AddDocumentModeCard,
  buildSourceAssetOptions,
  DocumentRowActions,
  Field,
  type AddDocumentMode,
  type BulkJob,
  type SourceAssetOption,
  bulkJobStageLabels,
  metadataFields,
} from './documents-helpers'
import { DocumentsTablePanel } from './documents-table'
import { DocumentsDialogs } from './documents-dialogs'

export function DocumentsView({
  item,
  onDocumentsChange,
}: {
  item: DatasetItem
  onDocumentsChange?: (documents: DatasetDocumentRow[]) => void
}) {
  const [documents, setDocuments] = useState<DatasetDocumentRow[]>(() => item.documents.map(doc => ({ ...doc })))
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<(typeof documentStatusFilterOptions)[number]['value']>('all')
  const [sortValue, setSortValue] = useState<(typeof documentSortOptions)[number]['value']>('updated_at')
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [addOpen, setAddOpen] = useState(false)
  const [metadataOpen, setMetadataOpen] = useState(false)
  const [renameDoc, setRenameDoc] = useState<DatasetDocumentRow | null>(null)
  const [detailDoc, setDetailDoc] = useState<DatasetDocumentRow | null>(null)
  const [renameValue, setRenameValue] = useState('')
  const [addMode, setAddMode] = useState<AddDocumentMode>('manual')
  const [addSourceId, setAddSourceId] = useState('')
  const [addSourceAsset, setAddSourceAsset] = useState('')
  const [addFileName, setAddFileName] = useState('')
  const [bulkJob, setBulkJob] = useState<BulkJob | null>(null)
  const [toast, setToast] = useState('')

  const availableSources = useMemo(() => item.sources.filter(source => source.status !== 'Disabled'), [item.sources])
  const sourceOptions = useMemo(() => availableSources.map(source => ({ value: source.id, label: source.name })), [availableSources])
  const selectedSource = availableSources.find(source => source.id === addSourceId)
  const sourceAssetOptions = useMemo(() => selectedSource ? buildSourceAssetOptions(selectedSource) : [], [selectedSource])

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

  const commitDocuments = (updater: (documents: DatasetDocumentRow[]) => DatasetDocumentRow[]) => {
    setDocuments((current) => {
      const next = updater(current)
      window.setTimeout(() => onDocumentsChange?.(next), 0)
      return next
    })
  }

  const updateDocument = (id: string, patch: Partial<DatasetDocumentRow>) => {
    commitDocuments(current => current.map(doc => doc.id === id ? { ...doc, ...patch } : doc))
  }

  const removeDocuments = (ids: string[]) => {
    commitDocuments(current => current.filter(doc => !ids.includes(doc.id)))
    setSelectedIds(current => current.filter(id => !ids.includes(id)))
  }

  const toggleSelectAll = () => {
    if (allVisibleSelected)
      setSelectedIds(current => current.filter(id => !filteredDocuments.some(doc => doc.id === id)))
    else
      setSelectedIds(current => [...new Set([...current, ...filteredDocuments.map(doc => doc.id)])])
  }

  const handleAddDocument = () => {
    const selectedAsset = sourceAssetOptions.find(option => option.value === addSourceAsset)
    const documentName = addMode === 'source' ? selectedAsset?.label : addFileName.trim()
    const documentSource = addMode === 'source' ? selectedSource?.name : 'Manual upload'
    if (!documentName || !documentSource)
      return
    const next: DatasetDocumentRow = {
      id: `${item.id}-doc-${Date.now()}`,
      name: documentName,
      source: documentSource,
      parserStatus: 'pending',
      version: 'v1',
      indexStatus: 'building',
      evidenceUse: 'Pending',
      updatedAt: 'Just now',
    }
    commitDocuments(current => [next, ...current])
    setAddOpen(false)
    setAddFileName('')
    setAddSourceAsset('')
    showToast('Document queued for processing.')
  }

  const handleRename = () => {
    if (!renameDoc || !renameValue.trim())
      return
    updateDocument(renameDoc.id, { name: renameValue.trim(), updatedAt: 'Just now' })
    setRenameDoc(null)
    showToast('Document renamed.')
  }

  const handleReindex = (ids: string[]) => {
    const nextJob: BulkJob = {
      id: `bulk-${Date.now().toString(36)}`,
      stage: 'queued',
      completed: 0,
      total: ids.length,
    }
    setBulkJob(nextJob)
    ids.forEach((id) => {
      updateDocument(id, { indexStatus: 'building', updatedAt: 'Just now' })
    })
    window.setTimeout(() => setBulkJob(current => current?.id === nextJob.id ? { ...current, stage: 'nodes_generated', completed: Math.max(1, Math.floor(ids.length / 2)) } : current), 650)
    window.setTimeout(() => setBulkJob(current => current?.id === nextJob.id ? { ...current, stage: 'projection_built', completed: ids.length } : current), 1200)
    window.setTimeout(() => {
      ids.forEach((id) => {
        updateDocument(id, { indexStatus: 'ready', updatedAt: 'Just now' })
      })
      setBulkJob(current => current?.id === nextJob.id ? { ...current, stage: 'published', completed: ids.length } : current)
    }, 1800)
    showToast(ids.length > 1 ? `Bulk re-index job queued for ${ids.length} documents.` : 'Bulk re-index job queued.')
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

  const selectAddMode = (mode: AddDocumentMode) => {
    setAddMode(mode)
    if (mode === 'source' && availableSources[0]) {
      const source = availableSources.find(entry => entry.id === addSourceId) ?? availableSources[0]
      const firstAsset = buildSourceAssetOptions(source)[0]
      setAddSourceId(source.id)
      setAddSourceAsset(firstAsset?.value ?? '')
    }
  }

  const selectSource = (sourceId: string) => {
    const source = availableSources.find(entry => entry.id === sourceId)
    setAddSourceId(sourceId)
    setAddSourceAsset(source ? buildSourceAssetOptions(source)[0]?.value ?? '' : '')
  }

  const canAddDocument = addMode === 'source'
    ? !!selectedSource && !!addSourceAsset
    : !!addFileName.trim()

  return (
    <div className="space-y-4 pr-6">
      <DocumentsTablePanel
        search={search}
        setSearch={setSearch}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        sortValue={sortValue}
        setSortValue={setSortValue}
        selectedIds={selectedIds}
        setSelectedIds={setSelectedIds}
        filteredDocuments={filteredDocuments}
        allVisibleSelected={allVisibleSelected}
        toggleSelectAll={toggleSelectAll}
        bulkJob={bulkJob}
        setAddOpen={setAddOpen}
        setMetadataOpen={setMetadataOpen}
        updateDocument={updateDocument}
        removeDocuments={removeDocuments}
        handleReindex={handleReindex}
        setRenameDoc={setRenameDoc}
        setRenameValue={setRenameValue}
        setDetailDoc={setDetailDoc}
        showToast={showToast}
      />
      <DocumentsDialogs
        addOpen={addOpen}
        setAddOpen={setAddOpen}
        metadataOpen={metadataOpen}
        setMetadataOpen={setMetadataOpen}
        renameDoc={renameDoc}
        setRenameDoc={setRenameDoc}
        detailDoc={detailDoc}
        setDetailDoc={setDetailDoc}
        renameValue={renameValue}
        setRenameValue={setRenameValue}
        addMode={addMode}
        selectAddMode={selectAddMode}
        addFileName={addFileName}
        setAddFileName={setAddFileName}
        addSourceId={addSourceId}
        selectSource={selectSource}
        addSourceAsset={addSourceAsset}
        setAddSourceAsset={setAddSourceAsset}
        availableSources={availableSources}
        sourceOptions={sourceOptions}
        sourceAssetOptions={sourceAssetOptions}
        selectedSource={selectedSource}
        canAddDocument={canAddDocument}
        handleAddDocument={handleAddDocument}
        handleRename={handleRename}
        handleReindex={handleReindex}
        metadataFields={metadataFields}
        showToast={showToast}
        exclusionReason={exclusionReason}
      />

      <ActionToast message={toast} visible={!!toast} />
    </div>
  )
}
