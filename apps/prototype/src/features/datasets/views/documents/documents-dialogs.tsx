import { Button } from '@langgenius/dify-ui/button'
import { Dialog, DialogCloseButton, DialogContent, DialogTitle } from '@langgenius/dify-ui/dialog'
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
import { RiAddLine, RiUploadCloud2Line } from '@remixicon/react'
import {
  sourceTypeLabels,
  type DatasetDocumentRow,
  type DatasetSourceRow,
} from '../../fixtures/items'
import { DetailRow } from '../../components/panel'
import {
  AddDocumentModeCard,
  Field,
  type AddDocumentMode,
  type SourceAssetOption,
} from './documents-helpers'

export function DocumentsDialogs({
  addOpen,
  setAddOpen,
  metadataOpen,
  setMetadataOpen,
  renameDoc,
  setRenameDoc,
  renameValue,
  setRenameValue,
  addMode,
  selectAddMode,
  addFileName,
  setAddFileName,
  addSourceId,
  selectSource,
  addSourceAsset,
  setAddSourceAsset,
  availableSources,
  sourceOptions,
  sourceAssetOptions,
  selectedSource,
  canAddDocument,
  handleAddDocument,
  handleRename,
  metadataFields,
  showToast,
}: {
  addOpen: boolean
  setAddOpen: (open: boolean) => void
  metadataOpen: boolean
  setMetadataOpen: (open: boolean) => void
  renameDoc: DatasetDocumentRow | null
  setRenameDoc: (doc: DatasetDocumentRow | null) => void
  renameValue: string
  setRenameValue: (value: string) => void
  addMode: AddDocumentMode
  selectAddMode: (mode: AddDocumentMode) => void
  addFileName: string
  setAddFileName: (value: string) => void
  addSourceId: string
  selectSource: (id: string) => void
  addSourceAsset: string
  setAddSourceAsset: (value: string) => void
  availableSources: DatasetSourceRow[]
  sourceOptions: { value: string; label: string }[]
  sourceAssetOptions: SourceAssetOption[]
  selectedSource: DatasetSourceRow | undefined
  canAddDocument: boolean
  handleAddDocument: () => void
  handleRename: () => void
  metadataFields: { key: string; label: string; value: string }[]
  showToast: (message: string) => void
}) {
  return (
    <>
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="w-[520px] max-w-[calc(100vw-2rem)]">
          <DialogCloseButton />
          <DialogTitle className="system-md-semibold text-text-secondary">Add document asset</DialogTitle>
          <p className="mt-1 system-sm-regular text-text-tertiary">Create a Document from a local upload or from files exposed by an existing Source.</p>
          <div className="mt-4 grid grid-cols-2 gap-2">
            <AddDocumentModeCard mode="manual" selected={addMode === 'manual'} title="Manual upload" description="Upload a local file." onSelect={selectAddMode} />
            <AddDocumentModeCard mode="source" selected={addMode === 'source'} title="Existing source" description="Pick a file or page from a Source." onSelect={selectAddMode} />
          </div>
          <div className="mt-4 space-y-3">
            {addMode === 'manual'
              ? (
                  <>
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
                  </>
                )
              : availableSources.length
                ? (
                    <>
                      <Field label="Source">
                        <Select items={sourceOptions} value={addSourceId} onValueChange={(value) => { if (value !== null) selectSource(value) }}>
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
                      <Field label="Document asset">
                        <Select items={sourceAssetOptions} value={addSourceAsset} onValueChange={(value) => { if (value !== null) setAddSourceAsset(value) }}>
                          <SelectTrigger size="large" aria-label="Document asset" className="w-full"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {sourceAssetOptions.map(option => (
                              <SelectItem key={option.value} value={option.value}>
                                <SelectItemText>{option.label}</SelectItemText>
                                <SelectItemIndicator />
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </Field>
                      {selectedSource && (
                        <div className="rounded-lg border border-divider-subtle bg-background-default-subtle px-3 py-2">
                          <div className="system-xs-medium text-text-secondary">{sourceTypeLabels[selectedSource.type]}</div>
                          <div className="mt-0.5 system-xs-regular text-text-tertiary">{selectedSource.providerName ?? 'Default provider'} · {selectedSource.endpoint ?? 'Provider-managed selection'}</div>
                        </div>
                      )}
                    </>
                  )
                : (
                    <div className="rounded-xl border border-divider-subtle bg-background-default-subtle px-4 py-6 text-center">
                      <div className="system-sm-medium text-text-secondary">No existing Sources</div>
                      <div className="mt-1 system-xs-regular text-text-tertiary">Add a Source in Sources first, then return here to pick its files.</div>
                    </div>
                  )}
          </div>
          <div className="mt-6 flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setAddOpen(false)}>Cancel</Button>
            <Button variant="primary" onClick={handleAddDocument} disabled={!canAddDocument}>Add document</Button>
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
    </>
  )
}
