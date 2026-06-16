import type { ConsistencyClass } from './common'

export type KnowledgeFsNodeKind = 'directory' | 'file' | 'symlink'

export type KnowledgeFsTreeNode = {
  name: string
  path: string
  kind: KnowledgeFsNodeKind
  sizeBytes?: number
  modifiedAt?: string
  children?: KnowledgeFsTreeNode[]
}

export type KnowledgeFsTreeResponse = {
  path: string
  root?: KnowledgeFsTreeNode
  nextCursor?: string
  truncated: boolean
  consistencyClass?: ConsistencyClass
  preview?: boolean
}

export type KnowledgeFsListEntry = {
  name: string
  path: string
  kind: KnowledgeFsNodeKind
  sizeBytes?: number
  modifiedAt?: string
}

export type KnowledgeFsListResponse = {
  path: string
  items: KnowledgeFsListEntry[]
  nextCursor?: string
  truncated: boolean
}

export type KnowledgeFsGrepMatch = {
  path: string
  line: number
  text: string
}

export type KnowledgeFsGrepResponse = {
  query: string
  path: string
  matches: KnowledgeFsGrepMatch[]
  truncated: boolean
}

export type KnowledgeFsCatResponse = {
  path: string
  content: string
  truncated: boolean
  sizeBytes: number
}

export type KnowledgeFsStatResponse = {
  path: string
  kind: KnowledgeFsNodeKind
  sizeBytes: number
  modifiedAt?: string
  metadata?: Record<string, unknown>
}

export type KnowledgeFsDiffResponse = {
  leftPath: string
  rightPath: string
  summary: string
  hunks: {
    header: string
    lines: { prefix: '+' | '-' | ' '; text: string }[]
  }[]
}
