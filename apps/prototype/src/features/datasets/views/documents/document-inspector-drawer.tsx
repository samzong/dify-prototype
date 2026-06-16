import { useEffect, useState } from 'react'
import { Button } from '@langgenius/dify-ui/button'
import type { ParseArtifact } from '../../api-types'
import { MockServiceError } from '../../api-types'
import { indexTone, parserTone, StatusBadge } from '../../components/badges'
import { SideDrawer } from '../../components/side-drawer'
import { DetailRow, EmptyPanel } from '../../components/panel'
import {
  documentIndexStatusLabels,
  documentParserStatusLabels,
  type DatasetDocumentRow,
} from '../../fixtures/items'
import { catFs, getParseArtifact } from '../../mock-services'

function documentKnowledgePath(name: string) {
  return `/knowledge/documents/${name}`
}

function mockErrorMessage(error: unknown) {
  if (error instanceof MockServiceError)
    return `${error.status}: ${error.message}`
  if (error instanceof Error)
    return error.message
  return 'Unexpected mock service error'
}

export function DocumentInspectorDrawer({
  open,
  document,
  spaceId,
  exclusionReason,
  onClose,
  onReindex,
  onRename,
  onViewJob,
  onViewArtifact,
}: {
  open: boolean
  document: DatasetDocumentRow | null
  spaceId: string
  exclusionReason: (doc: DatasetDocumentRow) => string
  onClose: () => void
  onReindex: (doc: DatasetDocumentRow) => void
  onRename: (doc: DatasetDocumentRow) => void
  onViewJob?: (doc: DatasetDocumentRow) => void
  onViewArtifact?: (doc: DatasetDocumentRow) => void
}) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [artifact, setArtifact] = useState<ParseArtifact | null>(null)

  useEffect(() => {
    if (!open || !document)
      return

    let cancelled = false
    setLoading(true)
    setError(null)
    setPreview(null)
    setArtifact(null)

    const path = documentKnowledgePath(document.name)
    const version = document.versionNumber ?? (Number.parseInt(document.version.replace(/^v/i, ''), 10) || 1)

    void Promise.all([
      catFs(spaceId, path).catch(() => null),
      getParseArtifact(spaceId, document.id, version).catch(() => null),
    ])
      .then(([catResponse, artifactResponse]) => {
        if (cancelled)
          return
        if (catResponse?.content)
          setPreview(catResponse.content)
        if (artifactResponse)
          setArtifact(artifactResponse)
      })
      .catch((cause) => {
        if (!cancelled)
          setError(mockErrorMessage(cause))
      })
      .finally(() => {
        if (!cancelled)
          setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [document, open, spaceId])

  return (
    <SideDrawer
      open={open}
      title={document?.name ?? 'Document'}
      description={document ? `${document.source} · ${document.version}` : undefined}
      onClose={onClose}
      panelClassName="max-w-xl"
    >
      {!document && <EmptyPanel text="Select a document to inspect." />}
      {document && loading && <EmptyPanel text="Loading document preview…" />}
      {document && !loading && error && <EmptyPanel text={error} />}
      {document && !loading && !error && (
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <StatusBadge label={documentParserStatusLabels[document.parserStatus]} tone={parserTone(document.parserStatus)} />
            <StatusBadge label={documentIndexStatusLabels[document.indexStatus]} tone={indexTone(document.indexStatus)} />
            <StatusBadge label={document.evidenceUse} tone="info" />
          </div>

          <DetailRow label="Source" value={document.source} />
          <DetailRow label="Updated" value={document.updatedAt} />
          {exclusionReason(document) !== '—' && (
            <DetailRow label="Exclusion" value={exclusionReason(document)} />
          )}

          <div>
            <div className="mb-2 system-xs-semibold-uppercase text-text-tertiary">Preview</div>
            {preview
              ? (
                  <pre className="max-h-48 overflow-y-auto whitespace-pre-wrap rounded-lg border border-divider-subtle bg-background-default-subtle p-3 system-xs-regular text-text-secondary">
                    {preview}
                  </pre>
                )
              : <EmptyPanel text="No preview available for this document yet." />}
          </div>

          <div>
            <div className="mb-2 system-xs-semibold-uppercase text-text-tertiary">
              Indexed blocks
              {artifact ? ` (${artifact.elements.length})` : ''}
            </div>
            {artifact?.elements.length
              ? (
                  <div className="max-h-56 space-y-2 overflow-y-auto">
                    {artifact.elements.map(element => (
                      <div key={element.id} className="rounded-lg border border-divider-subtle bg-background-default-subtle px-3 py-2">
                        <div className="flex items-center gap-2">
                          <StatusBadge label={element.type} tone="neutral" />
                          {element.pageNumber !== undefined && (
                            <span className="system-xs-regular text-text-quaternary">p.{element.pageNumber}</span>
                          )}
                        </div>
                        {element.text && (
                          <p className="mt-2 line-clamp-4 system-xs-regular text-text-secondary">{element.text}</p>
                        )}
                      </div>
                    ))}
                  </div>
                )
              : <EmptyPanel text="Structured blocks appear after parsing completes." />}
          </div>

          <div className="flex flex-wrap gap-2 border-t border-divider-subtle pt-3">
            {onViewArtifact && (
              <Button variant="secondary" size="small" onClick={() => onViewArtifact(document)}>Full parse view</Button>
            )}
            {onViewJob && (
              <Button variant="secondary" size="small" onClick={() => onViewJob(document)}>Compilation job</Button>
            )}
            <Button variant="secondary" size="small" onClick={() => onReindex(document)}>Re-index</Button>
            <Button variant="ghost" size="small" onClick={() => onRename(document)}>Rename</Button>
          </div>
        </div>
      )}
    </SideDrawer>
  )
}
