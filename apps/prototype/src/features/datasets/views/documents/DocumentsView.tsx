import { useMemo } from 'react'
import { transitionToSideDrawer } from '../../components/side-drawer'
import { ActionToast } from '../../components/panel'
import type { DatasetDocumentRow, DatasetItem } from '../../fixtures/items'
import { resolveKnowledgeSpaceId } from '../../fixtures/knowledge-space-bridge'
import { DocumentsDialogs } from './documents-dialogs'
import {
  BulkJobDrawer,
  DocumentArtifactDrawer,
  DocumentJobDrawer,
} from './documents-drawers'
import { DocumentInspectorDrawer } from './document-inspector-drawer'
import { DocumentsTablePanel } from './documents-table'
import { buildSourceAssetOptions, metadataFields } from './documents-helpers'
import { useDocumentsController } from './useDocumentsController'

export function DocumentsView({
  item,
  onDocumentsChange,
}: {
  item: DatasetItem
  onDocumentsChange?: (documents: DatasetDocumentRow[]) => void
}) {
  const spaceId = resolveKnowledgeSpaceId(item.id)
  const controller = useDocumentsController(item, onDocumentsChange)
  const availableSources = useMemo(
    () => item.sources.filter(source => source.status !== 'Disabled'),
    [item.sources],
  )
  const sourceOptions = useMemo(
    () => availableSources.map(source => ({ value: source.id, label: source.name })),
    [availableSources],
  )
  const selectedSource = availableSources.find(source => source.id === controller.addSourceId)
  const sourceAssetOptions = useMemo(
    () => selectedSource ? buildSourceAssetOptions(selectedSource) : [],
    [selectedSource],
  )

  const selectAddMode = (mode: typeof controller.addMode) => {
    controller.setAddMode(mode)
    if (mode === 'source' && availableSources[0]) {
      const source = availableSources.find(entry => entry.id === controller.addSourceId) ?? availableSources[0]
      const firstAsset = buildSourceAssetOptions(source)[0]
      controller.setAddSourceId(source.id)
      controller.setAddSourceAsset(firstAsset?.value ?? '')
    }
  }

  const selectSource = (sourceId: string) => {
    const source = availableSources.find(entry => entry.id === sourceId)
    controller.setAddSourceId(sourceId)
    controller.setAddSourceAsset(source ? buildSourceAssetOptions(source)[0]?.value ?? '' : '')
  }

  const canAddDocument = controller.addMode === 'source'
    ? !!selectedSource && !!controller.addSourceAsset
    : !!controller.addFileName.trim()

  const openInspector = (doc: DatasetDocumentRow) => {
    controller.setDetailDoc(doc)
  }

  const openKnowledgeResult = (name: string) => {
    const doc = controller.documents.find(entry => entry.name === name)
    if (doc)
      openInspector(doc)
  }

  return (
    <div className="space-y-4 pr-6">
      {controller.loadingDocuments && (
        <div className="rounded-xl border border-components-panel-border bg-components-panel-bg px-4 py-3 system-sm-regular text-text-tertiary">
          Loading document assets…
        </div>
      )}
      {controller.documentsError && (
        <div className="rounded-xl border border-util-colors-warning-warning-500/30 bg-util-colors-warning-warning-50 px-4 py-3 system-sm-regular text-text-secondary dark:bg-util-colors-warning-warning-500/10">
          {controller.documentsError}
        </div>
      )}
      <DocumentsTablePanel
        search={controller.search}
        setSearch={controller.setSearch}
        statusFilter={controller.statusFilter}
        setStatusFilter={controller.setStatusFilter}
        sortValue={controller.sortValue}
        setSortValue={controller.setSortValue}
        selectedIds={controller.selectedIds}
        setSelectedIds={controller.setSelectedIds}
        filteredDocuments={controller.filteredDocuments}
        allVisibleSelected={controller.allVisibleSelected}
        toggleSelectAll={controller.toggleSelectAll}
        bulkJob={controller.bulkJob}
        onOpenBulkDrawer={controller.openBulkDrawer}
        setAddOpen={controller.setAddOpen}
        setMetadataOpen={controller.setMetadataOpen}
        updateDocument={controller.updateDocument}
        removeDocuments={controller.removeDocuments}
        handleReindex={controller.handleReindex}
        setRenameDoc={controller.setRenameDoc}
        setRenameValue={controller.setRenameValue}
        setDetailDoc={(doc) => {
          if (doc)
            openInspector(doc)
        }}
        showToast={controller.showToast}
        onViewJob={doc => void controller.openJobDrawer(doc)}
        onViewArtifact={doc => void controller.openArtifactDrawer(doc)}
        knowledgeSearch={controller.knowledgeSearch}
        setKnowledgeSearch={controller.setKnowledgeSearch}
        knowledgeSearchResults={controller.knowledgeSearchResults}
        knowledgeSearchLoading={controller.knowledgeSearchLoading}
        onKnowledgeSearch={() => void controller.runKnowledgeSearch()}
        onOpenKnowledgeResult={openKnowledgeResult}
      />
      <DocumentsDialogs
        addOpen={controller.addOpen}
        setAddOpen={controller.setAddOpen}
        metadataOpen={controller.metadataOpen}
        setMetadataOpen={controller.setMetadataOpen}
        renameDoc={controller.renameDoc}
        setRenameDoc={controller.setRenameDoc}
        renameValue={controller.renameValue}
        setRenameValue={controller.setRenameValue}
        addMode={controller.addMode}
        selectAddMode={selectAddMode}
        addFileName={controller.addFileName}
        setAddFileName={controller.setAddFileName}
        addSourceId={controller.addSourceId}
        selectSource={selectSource}
        addSourceAsset={controller.addSourceAsset}
        setAddSourceAsset={controller.setAddSourceAsset}
        availableSources={availableSources}
        sourceOptions={sourceOptions}
        sourceAssetOptions={sourceAssetOptions}
        selectedSource={selectedSource}
        canAddDocument={canAddDocument && !controller.uploading}
        handleAddDocument={() => {
          const filename = controller.addMode === 'source'
            ? sourceAssetOptions.find(option => option.value === controller.addSourceAsset)?.label
            : controller.addFileName.trim()
          void controller.handleAddDocument({ filename, sourceId: controller.addSourceId || undefined })
        }}
        handleRename={controller.handleRename}
        metadataFields={metadataFields}
        showToast={controller.showToast}
      />
      <DocumentInspectorDrawer
        open={!!controller.detailDoc}
        document={controller.detailDoc}
        spaceId={spaceId}
        exclusionReason={controller.exclusionReason}
        onClose={() => controller.setDetailDoc(null)}
        onReindex={doc => controller.handleReindex([doc.id])}
        onRename={(doc) => {
          controller.setRenameDoc(doc)
          controller.setRenameValue(doc.name)
          controller.setDetailDoc(null)
        }}
        onViewJob={(doc) => {
          transitionToSideDrawer(
            () => controller.setDetailDoc(null),
            () => void controller.openJobDrawer(doc),
          )
        }}
        onViewArtifact={(doc) => {
          transitionToSideDrawer(
            () => controller.setDetailDoc(null),
            () => void controller.openArtifactDrawer(doc),
          )
        }}
      />
      <DocumentJobDrawer
        open={controller.jobDrawerOpen}
        job={controller.activeJob}
        loading={controller.jobLoading}
        error={controller.jobError}
        onClose={() => controller.setJobDrawerOpen(false)}
        onCancel={controller.handleCancelJob}
        onRetry={controller.handleRetryJob}
        canceling={controller.cancelingJob}
      />
      <DocumentArtifactDrawer
        open={controller.artifactDrawerOpen}
        document={controller.activeArtifactDocument}
        artifact={controller.artifact}
        loading={controller.artifactLoading}
        error={controller.artifactError}
        onClose={() => controller.setArtifactDrawerOpen(false)}
      />
      <BulkJobDrawer
        open={controller.bulkDrawerOpen}
        bulkJob={controller.bulkJobDetail}
        onClose={() => controller.setBulkDrawerOpen(false)}
      />
      <ActionToast message={controller.toast} visible={!!controller.toast} />
    </div>
  )
}
