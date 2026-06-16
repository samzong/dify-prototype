export type DocumentCompilationJobStage =
  | 'queued'
  | 'parsed'
  | 'nodes_generated'
  | 'projection_built'
  | 'smoke_eval_passed'
  | 'published'
  | 'failed'
  | 'canceled'

export type DocumentCompilationJob = {
  id: string
  knowledgeSpaceId: string
  tenantId: string
  documentAssetId: string
  queueJobId: string
  stage: DocumentCompilationJobStage
  version: number
  error?: string
  createdAt: number
  updatedAt: number
  completedAt?: number
}

export type BulkOperationType = 'document_upload' | 'document_delete' | 'document_reindex'

export type BulkOperationStatus = 'running' | 'completed' | 'failed'

export type BulkOperationProgress = {
  id: string
  knowledgeSpaceId: string
  type: BulkOperationType
  status: BulkOperationStatus
  totalItems: number
  completedItems: number
  failedItems: number
  failedItemIds: string[]
  createdAt: string
  updatedAt: string
}

export const DOCUMENT_COMPILATION_JOB_STAGES: readonly DocumentCompilationJobStage[] = [
  'queued',
  'parsed',
  'nodes_generated',
  'projection_built',
  'smoke_eval_passed',
  'published',
]
