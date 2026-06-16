import type { DocumentAsset, DocumentParserStatus } from '../api-types'
import type { DatasetDocumentIndexStatus, DatasetDocumentParserStatus, DatasetDocumentRow } from './types'
import { formatKnowledgeSpaceUpdatedAt } from './knowledge-space-bridge'

export function documentAssetToRow(asset: DocumentAsset): DatasetDocumentRow {
  return {
    id: asset.id,
    name: asset.filename,
    source: asset.sourceId ? 'Synced source' : 'Manual upload',
    parserStatus: asset.parserStatus,
    version: `v${asset.version}`,
    versionNumber: asset.version,
    mimeType: asset.mimeType,
    objectKey: asset.objectKey,
    sha256: asset.sha256,
    sizeBytes: asset.sizeBytes,
    sourceId: asset.sourceId,
    metadata: asset.metadata,
    indexStatus: indexStatusFromParser(asset.parserStatus),
    evidenceUse: evidenceUseFromParser(asset.parserStatus),
    updatedAt: formatKnowledgeSpaceUpdatedAt(asset.updatedAt ?? asset.createdAt),
  }
}

export function enrichFixtureDocumentRow(row: DatasetDocumentRow): DatasetDocumentRow {
  if (row.mimeType)
    return row

  const ext = row.name.split('.').pop()?.toLowerCase()
  const mimeType = ext === 'pdf'
    ? 'application/pdf'
    : ext === 'md'
      ? 'text/markdown'
      : ext === 'html'
        ? 'text/html'
        : ext === 'xlsx'
          ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
          : 'application/octet-stream'

  return {
    ...row,
    versionNumber: row.versionNumber ?? (Number.parseInt(row.version.replace(/^v/i, ''), 10) || 1),
    mimeType,
    objectKey: row.objectKey ?? `tenants/mock/raw/${row.name}`,
    sha256: row.sha256 ?? '0'.repeat(64),
    sizeBytes: row.sizeBytes ?? 16384,
    metadata: row.metadata ?? {},
  }
}

function indexStatusFromParser(parserStatus: DocumentParserStatus): DatasetDocumentIndexStatus {
  if (parserStatus === 'pending')
    return 'building'
  if (parserStatus === 'failed')
    return 'failed'
  return 'ready'
}

function evidenceUseFromParser(parserStatus: DatasetDocumentParserStatus): string {
  if (parserStatus === 'pending')
    return 'Pending'
  if (parserStatus === 'failed')
    return 'Excluded'
  return 'Included'
}

export function formatDocumentBytes(sizeBytes?: number) {
  if (sizeBytes === undefined)
    return '—'
  if (sizeBytes < 1024)
    return `${sizeBytes} B`
  if (sizeBytes < 1024 * 1024)
    return `${(sizeBytes / 1024).toFixed(1)} KB`
  return `${(sizeBytes / (1024 * 1024)).toFixed(1)} MB`
}

export function guessMimeTypeFromFilename(filename: string) {
  const ext = filename.split('.').pop()?.toLowerCase()
  if (ext === 'pdf')
    return 'application/pdf'
  if (ext === 'md')
    return 'text/markdown'
  if (ext === 'html')
    return 'text/html'
  if (ext === 'xlsx')
    return 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  return 'application/octet-stream'
}
