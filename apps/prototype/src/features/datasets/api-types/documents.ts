import type { Uuid } from './common'

export type DocumentParserStatus = 'pending' | 'parsed' | 'failed'

export type DocumentAsset = {
  id: Uuid
  knowledgeSpaceId: Uuid
  filename: string
  mimeType: string
  objectKey: string
  sha256: string
  sizeBytes: number
  parserStatus: DocumentParserStatus
  version: number
  sourceId?: Uuid
  metadata?: Record<string, unknown>
  createdAt: string
  updatedAt?: string
}

export type DocumentAssetList = {
  items: DocumentAsset[]
  nextCursor?: Uuid
}

export type ParseArtifactElementType =
  | 'title'
  | 'heading'
  | 'paragraph'
  | 'table'
  | 'list'
  | 'image'
  | 'code'
  | 'page-break'

export type ParseArtifactElement = {
  id: string
  type: ParseArtifactElementType
  text?: string
  pageNumber?: number
  sectionPath?: string[]
  metadata?: Record<string, unknown>
}

export type ParseArtifact = {
  id: Uuid
  documentAssetId: Uuid
  version: number
  artifactHash: string
  contentType: 'text' | 'structured' | 'mixed'
  parser: 'native-markdown' | 'native-html' | 'native-structured' | 'unstructured'
  elements: ParseArtifactElement[]
  metadata?: Record<string, unknown>
  createdAt: string
  updatedAt?: string
}

export type DocumentUploadAccepted = {
  asset: DocumentAsset
  compilationJob: {
    id: string
    stage: 'queued'
  }
  statusUrl: string
}
