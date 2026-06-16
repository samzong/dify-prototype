import type { DatasetCreateInitialPath, DatasetCreateMode, DatasetStarterSource, FirstSourceDraft } from '../../types/create'
import { CreatePathCard } from './create-cards'
import { CreateDocumentsSection } from './create-documents-section'
import { CreateSourceSection } from './create-source-section'

export function CreateDatasetBody({
  mode,
  initialPath,
  sourceDraft,
  documentName,
  documentDrafts,
  stagedDocumentNames,
  onSetInitialPath,
  onSetSourceType,
  onSourceDraftChange,
  onDocumentNameChange,
  onAddDocumentDraft,
  onRemoveDocumentDraft,
  onSeedDocumentName,
}: {
  mode: DatasetCreateMode
  initialPath: DatasetCreateInitialPath
  sourceDraft: FirstSourceDraft
  documentName: string
  documentDrafts: string[]
  stagedDocumentNames: string[]
  onSetInitialPath: (path: DatasetCreateInitialPath) => void
  onSetSourceType: (sourceType: DatasetStarterSource) => void
  onSourceDraftChange: React.Dispatch<React.SetStateAction<FirstSourceDraft>>
  onDocumentNameChange: (value: string) => void
  onAddDocumentDraft: () => void
  onRemoveDocumentDraft: (index: number) => void
  onSeedDocumentName: () => void
}) {
  return (
    <section className="space-y-6">
      {mode !== 'external'
        ? (
            <>
              <section className="rounded-xl border border-components-panel-border bg-components-panel-bg p-4 shadow-xs">
                <div className="system-sm-semibold text-text-secondary">Start with</div>
                <div className="mt-3 grid grid-cols-1 gap-2 md:grid-cols-3">
                  <CreatePathCard
                    path="empty"
                    selected={initialPath === 'empty'}
                    iconClassName="i-ri-folder-line"
                    title="Empty Knowledge"
                    description="Create the dataset shell first. Add Sources or Documents later."
                    onSelect={onSetInitialPath}
                  />
                  <CreatePathCard
                    path="source"
                    selected={initialPath === 'source'}
                    iconClassName="i-ri-links-line"
                    title="First Source"
                    description="Create one synced Source connection as the first data input."
                    onSelect={onSetInitialPath}
                  />
                  <CreatePathCard
                    path="documents"
                    selected={initialPath === 'documents'}
                    iconClassName="i-ri-upload-cloud-2-line"
                    title="Uploaded Documents"
                    description="Upload files into Documents without creating a Source."
                    onSelect={onSetInitialPath}
                  />
                </div>
              </section>
              {initialPath === 'source' && (
                <CreateSourceSection
                  sourceDraft={sourceDraft}
                  onSetSourceType={onSetSourceType}
                  onSourceDraftChange={onSourceDraftChange}
                />
              )}
              {initialPath === 'documents' && (
                <CreateDocumentsSection
                  mode={mode}
                  documentName={documentName}
                  documentDrafts={documentDrafts}
                  stagedDocumentNames={stagedDocumentNames}
                  onDocumentNameChange={onDocumentNameChange}
                  onAddDocumentDraft={onAddDocumentDraft}
                  onRemoveDocumentDraft={onRemoveDocumentDraft}
                  onSeedDocumentName={onSeedDocumentName}
                />
              )}
            </>
          )
        : (
            <div className="rounded-xl border border-components-panel-border bg-components-panel-bg p-4 shadow-xs">
              <div className="system-sm-semibold text-text-secondary">External retrieval</div>
              <div className="mt-3 rounded-xl border border-divider-subtle bg-background-default-subtle p-3">
                <div className="system-sm-medium text-text-secondary">External Knowledge API</div>
                <div className="mt-0.5 system-xs-regular text-text-tertiary">Configure endpoint and Knowledge ID after creation.</div>
              </div>
            </div>
          )}
    </section>
  )
}
