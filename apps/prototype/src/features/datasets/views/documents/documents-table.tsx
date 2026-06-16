import { Button } from '@langgenius/dify-ui/button'
import { Checkbox } from '@langgenius/dify-ui/checkbox'
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
import { RiAddLine, RiDraftLine, RiSearchLine } from '@remixicon/react'
import type { KnowledgeFsFindResponse } from '../../api-types'
import { evidenceUseTone, indexTone, parserTone, StatusBadge } from '../../components/badges'
import { EmptyPanel } from '../../components/panel'
import {
  documentIndexStatusLabels,
  documentParserStatusLabels,
  documentSortOptions,
  documentStatusFilterOptions,
  type DatasetDocumentRow,
} from '../../fixtures/items'
import { DocumentRowActions, bulkJobStatusLabel, bulkJobStatusTone, type BulkJob } from './documents-helpers'

export function DocumentsTablePanel({
  search,
  setSearch,
  statusFilter,
  setStatusFilter,
  sortValue,
  setSortValue,
  selectedIds,
  setSelectedIds,
  filteredDocuments,
  allVisibleSelected,
  toggleSelectAll,
  bulkJob,
  onOpenBulkDrawer,
  setAddOpen,
  setMetadataOpen,
  updateDocument,
  removeDocuments,
  handleReindex,
  setRenameDoc,
  setRenameValue,
  setDetailDoc,
  showToast,
  onViewJob,
  onViewArtifact,
  knowledgeSearch,
  setKnowledgeSearch,
  knowledgeSearchResults,
  knowledgeSearchLoading,
  onKnowledgeSearch,
  onOpenKnowledgeResult,
}: {
  search: string
  setSearch: (value: string) => void
  statusFilter: (typeof documentStatusFilterOptions)[number]['value']
  setStatusFilter: (value: (typeof documentStatusFilterOptions)[number]['value']) => void
  sortValue: (typeof documentSortOptions)[number]['value']
  setSortValue: (value: (typeof documentSortOptions)[number]['value']) => void
  selectedIds: string[]
  setSelectedIds: React.Dispatch<React.SetStateAction<string[]>>
  filteredDocuments: DatasetDocumentRow[]
  allVisibleSelected: boolean
  toggleSelectAll: () => void
  bulkJob: BulkJob | null
  onOpenBulkDrawer: () => void
  setAddOpen: (open: boolean) => void
  setMetadataOpen: (open: boolean) => void
  updateDocument: (id: string, patch: Partial<DatasetDocumentRow>) => void
  removeDocuments: (ids: string[]) => void
  handleReindex: (ids: string[]) => void
  setRenameDoc: (doc: DatasetDocumentRow | null) => void
  setRenameValue: (value: string) => void
  setDetailDoc: (doc: DatasetDocumentRow | null) => void
  showToast: (message: string) => void
  onViewJob: (doc: DatasetDocumentRow) => void
  onViewArtifact: (doc: DatasetDocumentRow) => void
  knowledgeSearch: string
  setKnowledgeSearch: (value: string) => void
  knowledgeSearchResults: KnowledgeFsFindResponse | null
  knowledgeSearchLoading: boolean
  onKnowledgeSearch: () => void
  onOpenKnowledgeResult: (name: string) => void
}) {
  return (
    <>
      <div className="rounded-xl border border-components-panel-border bg-components-panel-bg px-4 py-3 shadow-xs">
        <div className="system-xs-semibold-uppercase text-text-tertiary">Search in knowledge</div>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <div className="relative min-w-[240px] flex-1">
            <RiSearchLine className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-text-quaternary" />
            <Input
              value={knowledgeSearch}
              onChange={event => setKnowledgeSearch(event.target.value)}
              onKeyDown={event => {
                if (event.key === 'Enter')
                  onKnowledgeSearch()
              }}
              placeholder="Find content across indexed knowledge"
              className="pl-8"
              aria-label="Search in knowledge"
            />
          </div>
          <Button variant="secondary" size="small" loading={knowledgeSearchLoading} onClick={onKnowledgeSearch}>
            Search
          </Button>
        </div>
        {knowledgeSearchResults && (
          <div className="mt-3 space-y-2">
            {knowledgeSearchResults.items.length
              ? knowledgeSearchResults.items.map(item => (
                  <button
                    key={item.path}
                    type="button"
                    onClick={() => onOpenKnowledgeResult(item.name)}
                    className="flex w-full items-center justify-between gap-3 rounded-lg border border-divider-subtle bg-background-default-subtle px-3 py-2 text-left hover:bg-state-base-hover"
                  >
                    <span className="truncate system-sm-semibold text-text-secondary">{item.name}</span>
                    <span className="shrink-0 system-xs-regular text-text-quaternary">{item.path}</span>
                  </button>
                ))
              : <EmptyPanel text="No matching knowledge assets." />}
          </div>
        )}
      </div>

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
        <button
          type="button"
          onClick={onOpenBulkDrawer}
          className="w-full rounded-xl border border-components-panel-border bg-components-panel-bg px-4 py-3 text-left shadow-xs hover:bg-state-base-hover"
        >
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="min-w-0">
              <div className="system-sm-semibold text-text-secondary">
                {bulkJob.kind === 'bulk' ? 'Bulk re-index job' : 'Compilation job'}
                {' '}
                {bulkJob.id}
              </div>
              <div className="mt-1 system-xs-regular text-text-tertiary">
                {bulkJob.completed}
                {' / '}
                {bulkJob.total}
                {' documents'}
                {bulkJob.failedItemIds && bulkJob.failedItemIds.length > 0 && (
                  <span>
                    {' · '}
                    {bulkJob.failedItemIds.length}
                    {' failed'}
                  </span>
                )}
              </div>
            </div>
            <StatusBadge label={bulkJobStatusLabel(bulkJob)} tone={bulkJobStatusTone(bulkJob)} />
          </div>
          <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-background-default-dimmed">
            <div
              className="h-full rounded-full bg-util-colors-blue-blue-500 transition-all"
              style={{ width: `${Math.min(100, Math.round((bulkJob.completed / Math.max(1, bulkJob.total)) * 100))}%` }}
            />
          </div>
        </button>
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
                          onViewJob={() => onViewJob(doc)}
                          onViewArtifact={() => onViewArtifact(doc)}
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
    </>
  )
}
