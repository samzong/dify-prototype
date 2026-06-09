import { Button } from '@langgenius/dify-ui/button'
import { Checkbox } from '@langgenius/dify-ui/checkbox'
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
import { evidenceUseTone, indexTone, parserTone, StatusBadge } from './knowledge-2-badges'
import {
  documentIndexStatusLabels,
  documentMatchesStatusFilter,
  documentParserStatusLabels,
  documentSortOptions,
  documentStatusFilterOptions,
  type Knowledge2Item,
  type KnowledgeDocumentRow,
} from './knowledge-2-data'
import { ActionToast, DetailRow } from './knowledge-2-panel'

const metadataFields = [
  { key: 'department', label: 'Department', value: 'Product' },
  { key: 'audience', label: 'Audience', value: 'Internal' },
  { key: 'language', label: 'Language', value: 'English' },
]

type BulkJob = {
  id: string
  stage: 'queued' | 'parsed' | 'nodes_generated' | 'projection_built' | 'published'
  completed: number
  total: number
}

const bulkJobStageLabels: Record<BulkJob['stage'], string> = {
  queued: 'Queued',
  parsed: 'Parsed',
  nodes_generated: 'Nodes generated',
  projection_built: 'Projection built',
  published: 'Published',
}

export function KnowledgeDocumentsView({ item }: { item: Knowledge2Item }) {
  const [documents, setDocuments] = useState<KnowledgeDocumentRow[]>(() => item.documents.map(doc => ({ ...doc })))
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<(typeof documentStatusFilterOptions)[number]['value']>('all')
  const [sortValue, setSortValue] = useState<(typeof documentSortOptions)[number]['value']>('updated_at')
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [addOpen, setAddOpen] = useState(false)
  const [metadataOpen, setMetadataOpen] = useState(false)
  const [renameDoc, setRenameDoc] = useState<KnowledgeDocumentRow | null>(null)
  const [detailDoc, setDetailDoc] = useState<KnowledgeDocumentRow | null>(null)
  const [renameValue, setRenameValue] = useState('')
  const [addSource, setAddSource] = useState(item.sources[0]?.name ?? '')
  const [addFileName, setAddFileName] = useState('')
  const [bulkJob, setBulkJob] = useState<BulkJob | null>(null)
  const [toast, setToast] = useState('')

  const sourceOptions = useMemo(
    () => item.sources.filter(source => source.status !== 'Disabled').map(source => ({ value: source.name, label: source.name })),
    [item.sources],
  )

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

  const updateDocument = (id: string, patch: Partial<KnowledgeDocumentRow>) => {
    setDocuments(current => current.map(doc => doc.id === id ? { ...doc, ...patch } : doc))
  }

  const removeDocuments = (ids: string[]) => {
    setDocuments(current => current.filter(doc => !ids.includes(doc.id)))
    setSelectedIds(current => current.filter(id => !ids.includes(id)))
  }

  const toggleSelectAll = () => {
    if (allVisibleSelected)
      setSelectedIds(current => current.filter(id => !filteredDocuments.some(doc => doc.id === id)))
    else
      setSelectedIds(current => [...new Set([...current, ...filteredDocuments.map(doc => doc.id)])])
  }

  const handleAddDocument = () => {
    if (!addFileName.trim() || !addSource)
      return
    const next: KnowledgeDocumentRow = {
      id: `${item.id}-doc-${Date.now()}`,
      name: addFileName.trim(),
      source: addSource,
      parserStatus: 'pending',
      version: 'v1',
      indexStatus: 'building',
      evidenceUse: 'Pending',
      updatedAt: 'Just now',
    }
    setDocuments(current => [next, ...current])
    setAddOpen(false)
    setAddFileName('')
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

  const exclusionReason = (doc: KnowledgeDocumentRow) => {
    if (doc.evidenceUse.startsWith('Excluded from'))
      return 'Excluded from selected retrieval modes due to stale index.'
    if (doc.evidenceUse === 'Excluded')
      return doc.parserStatus === 'failed' ? 'Parser failed before projection build.' : 'Excluded from ready projection.'
    if (doc.evidenceUse === 'Pending')
      return 'Waiting for parser or projection to complete.'
    return 'Included in published projection and evidence tests.'
  }

  return (
    <div className="space-y-4 pr-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <Select
            items={documentStatusFilterOptions.map(option => ({ value: option.value, label: option.label }))}
            value={statusFilter}
            onValueChange={(value) => {
              if (value !== null)
                setStatusFilter(value as typeof statusFilter)
            }}
          >
            <SelectTrigger size="large" aria-label="Document status" className="w-[160px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {documentStatusFilterOptions.map(option => (
                <SelectItem key={option.value} value={option.value}>
                  <SelectItemText>{option.label}</SelectItemText>
                  <SelectItemIndicator />
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="relative w-[200px]">
            <RiSearchLine className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-text-quaternary" />
            <Input value={search} onChange={event => setSearch(event.target.value)} placeholder="Search documents" className="pl-8" aria-label="Search documents" />
          </div>
          <div className="h-3.5 w-px bg-divider-regular" />
          <Select
            items={documentSortOptions.map(option => ({ value: option.value, label: option.label }))}
            value={sortValue}
            onValueChange={(value) => {
              if (value !== null)
                setSortValue(value as typeof sortValue)
            }}
          >
            <SelectTrigger size="large" aria-label="Sort documents" className="w-[160px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {documentSortOptions.map(option => (
                <SelectItem key={option.value} value={option.value}>
                  <SelectItemText>{option.label}</SelectItemText>
                  <SelectItemIndicator />
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" onClick={() => setMetadataOpen(true)}>
            <RiDraftLine className="size-4" />
            Metadata
          </Button>
          <Button variant="primary" onClick={() => setAddOpen(true)}>
            <RiAddLine className="size-4" />
            Add file
          </Button>
        </div>
      </div>

      {selectedIds.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 rounded-xl border border-components-panel-border bg-components-panel-bg px-4 py-2 shadow-xs">
          <span className="system-sm-medium text-text-secondary">{selectedIds.length} selected</span>
          <Button variant="secondary" size="small" onClick={() => handleReindex(selectedIds)}>Re-index</Button>
          <Button variant="secondary" size="small" onClick={() => showToast(`Downloading ${selectedIds.length} documents.`)}>Download</Button>
          <Button variant="ghost" size="small" onClick={() => {
            removeDocuments(selectedIds)
            showToast('Selected documents removed.')
          }}
          >
            Delete
          </Button>
          <Button variant="ghost" size="small" onClick={() => setSelectedIds([])}>Clear</Button>
        </div>
      )}

      {bulkJob && (
        <div className="rounded-xl border border-components-panel-border bg-components-panel-bg px-4 py-3 shadow-xs">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="min-w-0">
              <div className="system-sm-semibold text-text-secondary">Bulk re-index job {bulkJob.id}</div>
              <div className="mt-1 system-xs-regular text-text-tertiary">
                {bulkJob.completed}
                {' / '}
                {bulkJob.total}
                {' documents'}
              </div>
            </div>
            <StatusBadge label={bulkJobStageLabels[bulkJob.stage]} tone={bulkJob.stage === 'published' ? 'good' : 'info'} />
          </div>
          <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-background-default-dimmed">
            <div
              className="h-full rounded-full bg-util-colors-blue-blue-500 transition-all"
              style={{ width: `${Math.min(100, Math.round((bulkJob.completed / Math.max(1, bulkJob.total)) * 100))}%` }}
            />
          </div>
        </div>
      )}

      <div className="overflow-hidden rounded-xl border border-components-panel-border bg-components-panel-bg shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1000px] border-collapse text-sm">
            <thead>
              <tr className="border-b border-divider-subtle">
                <th className="w-10 px-4 py-3">
                  <Checkbox checked={allVisibleSelected} onCheckedChange={toggleSelectAll} aria-label="Select all documents" />
                </th>
                {['Document asset', 'Source', 'Parser', 'Version', 'Index', 'Evidence use', 'Updated at', ''].map(column => (
                  <th key={column} className="px-4 py-3 text-left system-2xs-medium-uppercase text-text-tertiary">{column}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredDocuments.length
                ? filteredDocuments.map(doc => (
                    <tr key={doc.id} className="border-b border-divider-subtle last:border-b-0 hover:bg-state-base-hover">
                      <td className="px-4 py-3">
                        <Checkbox
                          checked={selectedIds.includes(doc.id)}
                          onCheckedChange={(checked) => {
                            setSelectedIds((current) => {
                              if (checked)
                                return [...current, doc.id]
                              return current.filter(id => id !== doc.id)
                            })
                          }}
                          aria-label={`Select ${doc.name}`}
                        />
                      </td>
                      <td className="px-4 py-3">
                        <button type="button" className="system-sm-semibold text-text-secondary hover:text-text-accent" onClick={() => setDetailDoc(doc)}>
                          {doc.name}
                        </button>
                      </td>
                      <td className="px-4 py-3 system-sm-regular text-text-secondary">{doc.source}</td>
                      <td className="px-4 py-3"><StatusBadge label={documentParserStatusLabels[doc.parserStatus]} tone={parserTone(doc.parserStatus)} /></td>
                      <td className="px-4 py-3 system-sm-regular text-text-secondary">{doc.version}</td>
                      <td className="px-4 py-3"><StatusBadge label={documentIndexStatusLabels[doc.indexStatus]} tone={indexTone(doc.indexStatus)} /></td>
                      <td className="px-4 py-3"><StatusBadge label={doc.evidenceUse} tone={evidenceUseTone(doc.evidenceUse)} /></td>
                      <td className="px-4 py-3 system-sm-regular text-text-tertiary">{doc.updatedAt}</td>
                      <td className="px-4 py-3">
                        <DocumentRowActions
                          onRename={() => {
                            setRenameDoc(doc)
                            setRenameValue(doc.name)
                          }}
                          onReindex={() => handleReindex([doc.id])}
                          onDelete={() => {
                            removeDocuments([doc.id])
                            showToast('Document removed.')
                          }}
                          onOpen={() => setDetailDoc(doc)}
                          onSettings={() => setDetailDoc(doc)}
                        />
                      </td>
                    </tr>
                  ))
                : (
                    <tr>
                      <td colSpan={9} className="px-4 py-12 text-center">
                        <p className="system-sm-regular text-text-tertiary">No document assets match the current filters.</p>
                        <Button variant="secondary" className="mt-3" onClick={() => setAddOpen(true)}>
                          <RiAddLine className="size-4" />
                          Add file
                        </Button>
                      </td>
                    </tr>
                  )}
            </tbody>
          </table>
        </div>
      </div>

      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="w-[520px] max-w-[calc(100vw-2rem)]">
          <DialogCloseButton />
          <DialogTitle className="system-md-semibold text-text-secondary">Add document asset</DialogTitle>
          <p className="mt-1 system-sm-regular text-text-tertiary">Upload a file to a connected source. The asset will enter parser and index processing.</p>
          <div className="mt-4 space-y-3">
            <Field label="Source">
              <Select items={sourceOptions} value={addSource} onValueChange={(value) => { if (value !== null) setAddSource(value) }}>
                <SelectTrigger size="large" aria-label="Source" className="w-full"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {sourceOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      <SelectItemText>{option.label}</SelectItemText>
                      <SelectItemIndicator />
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field label="File name">
              <Input value={addFileName} onChange={event => setAddFileName(event.target.value)} placeholder="e.g. onboarding-guide.pdf" />
            </Field>
            <button
              type="button"
              onClick={() => {
                if (!addFileName)
                  setAddFileName('uploaded-asset.pdf')
              }}
              className="flex w-full flex-col items-center justify-center rounded-xl border border-dashed border-divider-regular bg-background-default-subtle px-4 py-8 hover:bg-state-base-hover"
            >
              <RiUploadCloud2Line className="size-8 text-text-quaternary" />
              <span className="mt-2 system-sm-medium text-text-secondary">Click to choose files</span>
              <span className="mt-1 system-xs-regular text-text-tertiary">PDF, DOCX, MD, HTML, and more</span>
            </button>
          </div>
          <div className="mt-6 flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setAddOpen(false)}>Cancel</Button>
            <Button variant="primary" onClick={handleAddDocument} disabled={!addFileName.trim() || !addSource}>Add file</Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={!!renameDoc} onOpenChange={(open) => { if (!open) setRenameDoc(null) }}>
        {renameDoc && (
          <DialogContent className="w-[420px] max-w-[calc(100vw-2rem)]">
            <DialogCloseButton />
            <DialogTitle className="system-md-semibold text-text-secondary">Rename document</DialogTitle>
            <Input value={renameValue} onChange={event => setRenameValue(event.target.value)} className="mt-4" aria-label="Document name" />
            <div className="mt-6 flex justify-end gap-2">
              <Button variant="secondary" onClick={() => setRenameDoc(null)}>Cancel</Button>
              <Button variant="primary" onClick={handleRename}>Save</Button>
            </div>
          </DialogContent>
        )}
      </Dialog>

      <Dialog open={metadataOpen} onOpenChange={setMetadataOpen}>
        <DialogContent className="w-[480px] max-w-[calc(100vw-2rem)]">
          <DialogCloseButton />
          <DialogTitle className="system-md-semibold text-text-secondary">Dataset metadata</DialogTitle>
          <p className="mt-1 system-sm-regular text-text-tertiary">Manage metadata fields applied to document assets in this knowledge base.</p>
          <div className="mt-4 space-y-2">
            {metadataFields.map(field => (
              <DetailRow key={field.key} label={field.label} value={field.value} />
            ))}
          </div>
          <div className="mt-6 flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setMetadataOpen(false)}>Close</Button>
            <Button variant="primary" onClick={() => {
              setMetadataOpen(false)
              showToast('Metadata saved.')
            }}
            >
              Save
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={!!detailDoc} onOpenChange={(open) => { if (!open) setDetailDoc(null) }}>
        {detailDoc && (
          <DialogContent className="w-[560px] max-w-[calc(100vw-2rem)]">
            <DialogCloseButton />
            <DialogTitle className="system-md-semibold text-text-secondary">{detailDoc.name}</DialogTitle>
            <div className="mt-4 space-y-2">
              <DetailRow label="Source" value={detailDoc.source} />
              <DetailRow label="Parser status" value={documentParserStatusLabels[detailDoc.parserStatus]} />
              <DetailRow label="Asset version" value={detailDoc.version} />
              <DetailRow label="Index status" value={documentIndexStatusLabels[detailDoc.indexStatus]} />
              <DetailRow label="Evidence inclusion" value={detailDoc.evidenceUse} />
              <DetailRow label="Updated at" value={detailDoc.updatedAt} />
              <DetailRow label="Exclusion reason" value={exclusionReason(detailDoc)} />
            </div>
            <div className="mt-6 flex flex-wrap gap-2">
              <Button variant="secondary" size="small" onClick={() => handleReindex([detailDoc.id])}>Re-index</Button>
              <Button variant="secondary" size="small" onClick={() => {
                setRenameDoc(detailDoc)
                setRenameValue(detailDoc.name)
                setDetailDoc(null)
              }}
              >
                Rename
              </Button>
              <Button variant="ghost" size="small">
                <RiEqualizer2Line className="size-4" />
                Document settings
              </Button>
            </div>
          </DialogContent>
        )}
      </Dialog>

      <ActionToast message={toast} visible={!!toast} />
    </div>
  )
}

function DocumentRowActions({
  onRename,
  onReindex,
  onDelete,
  onOpen,
  onSettings,
}: {
  onRename: () => void
  onReindex: () => void
  onDelete: () => void
  onOpen: () => void
  onSettings: () => void
}) {
  return (
    <div className="flex items-center gap-1">
      <button type="button" aria-label="Document settings" className="inline-flex size-8 items-center justify-center rounded-lg text-text-tertiary hover:bg-state-base-hover" onClick={onSettings}>
        <RiEqualizer2Line className="size-4" />
      </button>
      <DropdownMenu>
        <DropdownMenuTrigger aria-label="Document actions" className="inline-flex size-8 items-center justify-center rounded-lg text-text-tertiary hover:bg-state-base-hover">
          <RiMoreFill className="size-4" />
        </DropdownMenuTrigger>
        <DropdownMenuContent placement="bottom-end">
          <DropdownMenuItem onClick={onOpen}>Open document</DropdownMenuItem>
          <DropdownMenuItem onClick={onRename}>Rename</DropdownMenuItem>
          <DropdownMenuItem onClick={onReindex}>Re-index</DropdownMenuItem>
          <DropdownMenuItem onClick={() => {}}>Download</DropdownMenuItem>
          <DropdownMenuItem onClick={onDelete}>Delete</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <div className="mb-1 system-sm-medium text-text-secondary">{label}</div>
      {children}
    </label>
  )
}
