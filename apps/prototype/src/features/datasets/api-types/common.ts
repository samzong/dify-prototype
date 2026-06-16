export type Uuid = string

export type ConsistencyClass =
  | 'path-consistent'
  | 'snapshot-consistent'
  | 'cache-consistent'
  | 'eventual-preview'

export type QueryMode = 'fast' | 'deep' | 'research' | 'auto'

export type EvidenceBundleState =
  | 'answerable'
  | 'partial'
  | 'not-enough-evidence'
  | 'conflict'
  | 'permission-limited'

export type MissingEvidenceReason =
  | 'not-retrieved'
  | 'permission-filtered'
  | 'stale'
  | 'conflict'
  | 'unknown'

export type ConflictSeverity = 'info' | 'warning' | 'blocking'

export class MockServiceError extends Error {
  readonly status: number

  constructor(status: number, message: string) {
    super(message)
    this.name = 'MockServiceError'
    this.status = status
  }
}

export type PaginatedList<T> = {
  items: T[]
  nextCursor?: string
}

export type KnowledgeScenarioId =
  | 'default'
  | 'empty'
  | 'job-failed'
  | 'trace-with-conflicts'
  | 'ingest-success'
  | 'upload-rejected'
