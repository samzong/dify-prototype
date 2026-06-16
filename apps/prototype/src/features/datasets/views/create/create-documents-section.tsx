import { Button } from '@langgenius/dify-ui/button'
import { Input } from '@langgenius/dify-ui/input'
import { RiUploadCloud2Line } from '@remixicon/react'
import { CreateSummaryRow } from './create-shared'

export function CreateDocumentsSection({
  mode,
  documentName,
  documentDrafts,
  stagedDocumentNames,
  onDocumentNameChange,
  onAddDocumentDraft,
  onRemoveDocumentDraft,
  onSeedDocumentName,
}: {
  mode: 'standard' | 'pipeline' | 'external'
  documentName: string
  documentDrafts: string[]
  stagedDocumentNames: string[]
  onDocumentNameChange: (value: string) => void
  onAddDocumentDraft: () => void
  onRemoveDocumentDraft: (index: number) => void
  onSeedDocumentName: () => void
}) {
  return (
                    <section className="rounded-xl border border-components-panel-border bg-components-panel-bg p-4 shadow-xs">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <div className="system-sm-semibold text-text-secondary">Upload initial Documents</div>
                          <div className="mt-0.5 system-xs-regular text-text-tertiary">These files become Documents. They do not create a Source.</div>
                        </div>
                        <Button variant="secondary" size="small" onClick={() => onDocumentNameChange('support-handbook.pdf')}>
                          <RiUploadCloud2Line className="size-4" />
                          Choose file
                        </Button>
                      </div>
                      <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,1fr)_280px]">
                        <div className="space-y-3">
                          <div className="rounded-xl border border-dashed border-divider-regular bg-background-default-subtle p-4">
                            <div className="flex items-start gap-3">
                              <div className="flex size-10 shrink-0 items-center justify-center rounded-lg border border-components-panel-border bg-background-default-dodge">
                                <RiUploadCloud2Line className="size-5 text-text-tertiary" />
                              </div>
                              <div className="min-w-0 grow">
                                <div className="system-sm-medium text-text-secondary">Manual upload</div>
                                <div className="mt-0.5 system-xs-regular text-text-tertiary">Stage files here, then create the Knowledge and process them in Documents.</div>
                                <div className="mt-3 flex gap-2">
                                  <Input
                                    value={documentName}
                                    onChange={event => onDocumentNameChange(event.target.value)}
                                    placeholder="e.g. refund-policy.pdf"
                                    aria-label="Document file name"
                                  />
                                  <Button variant="secondary" onClick={onAddDocumentDraft} disabled={!documentName.trim()}>
                                    Add
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="overflow-hidden rounded-xl border border-divider-subtle bg-background-default">
                            {stagedDocumentNames.length
                              ? stagedDocumentNames.map((fileName, index) => (
                                  <div key={fileName} className="flex items-center justify-between gap-3 border-b border-divider-subtle px-3 py-2 last:border-b-0">
                                    <div className="flex min-w-0 items-center gap-2">
                                      <span className="i-ri-file-text-line size-4 shrink-0 text-text-tertiary" />
                                      <span className="truncate system-sm-medium text-text-secondary">{fileName}</span>
                                    </div>
                                    <button
                                      type="button"
                                      className="system-xs-medium text-text-tertiary hover:text-text-secondary"
                                      onClick={() => onRemoveDocumentDraft(index)}
                                    >
                                      Remove
                                    </button>
                                  </div>
                                ))
                              : (
                                  <div className="px-3 py-6 text-center system-sm-regular text-text-tertiary">
                                    No documents staged.
                                  </div>
                                )}
                          </div>
                        </div>
                        <div className="rounded-xl border border-divider-subtle bg-background-default-subtle p-3">
                          <div className="system-sm-semibold text-text-secondary">Document processing</div>
                          <div className="mt-3 space-y-2">
                            <CreateSummaryRow label="Origin" value="Manual upload" />
                            <CreateSummaryRow label="Parser" value={mode === 'pipeline' ? 'Pipeline-managed' : 'General document parser'} />
                            <CreateSummaryRow label="Index" value="Queued after creation" />
                            <CreateSummaryRow label="Evidence" value="Pending indexing" />
                          </div>
                        </div>
                      </div>
                    </section>
  )
}
