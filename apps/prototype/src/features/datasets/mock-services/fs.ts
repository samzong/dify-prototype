import type {
  KnowledgeFsCatResponse,
  KnowledgeFsDiffResponse,
  KnowledgeFsFindResponse,
  KnowledgeFsGrepResponse,
  KnowledgeFsListResponse,
  KnowledgeFsOpenNodeResponse,
  KnowledgeFsStatResponse,
  KnowledgeFsTreeResponse,
  KnowledgeFsWriteResponse,
} from '../api-types'
import { MockServiceError } from '../api-types'
import { PROTOTYPE_DOCUMENT_IDS } from '../fixtures/scenarios'
import { delay } from './helpers'
import { getKnowledgeMockStore } from './store'

const DEFAULT_ROOT = '/knowledge'

export async function findFs(
  spaceId: string,
  path: string,
  options?: { nameContains?: string; limit?: number },
): Promise<KnowledgeFsFindResponse> {
  await delay(150)
  assertSpace(spaceId)
  const tree = await getFsTree(spaceId, path)
  const needle = options?.nameContains?.toLowerCase() ?? ''
  const items = flattenTree(tree.root).filter((entry) => {
    if (entry.kind !== 'file')
      return false
    return !needle || entry.name.toLowerCase().includes(needle)
  }).slice(0, options?.limit ?? 25).map(entry => ({
    kind: 'resource' as const,
    name: entry.name,
    path: entry.path,
    resourceType: 'document' as const,
    targetId: entry.path.includes('refund-policy') ? PROTOTYPE_DOCUMENT_IDS.refundPolicy : undefined,
    metadata: {},
  }))

  return { path, items, truncated: false }
}

export async function openNodeFs(spaceId: string, nodeId: string): Promise<KnowledgeFsOpenNodeResponse> {
  await delay(130)
  assertSpace(spaceId)

  return {
    node: {
      id: nodeId,
      knowledgeSpaceId: spaceId,
      documentAssetId: PROTOTYPE_DOCUMENT_IDS.refundPolicy,
      parseArtifactId: 'p7000001-0001-4001-8001-000000000001',
      artifactHash: 'f'.repeat(64),
      kind: 'chunk',
      text: 'Enterprise plans can request refunds within 14 days when no production workspace has been activated.',
      startOffset: 120,
      endOffset: 220,
      sourceLocation: { startOffset: 120, endOffset: 220, sectionPath: ['Refund policy'] },
      updatedAt: new Date().toISOString(),
    },
    citation: {
      documentAssetId: PROTOTYPE_DOCUMENT_IDS.refundPolicy,
      parseArtifactId: 'p7000001-0001-4001-8001-000000000001',
      artifactHash: 'f'.repeat(64),
      startOffset: 120,
      endOffset: 220,
      sectionPath: ['Refund policy'],
    },
  }
}

export async function writeFs(spaceId: string, path: string, content: string): Promise<KnowledgeFsWriteResponse> {
  await delay(180)
  assertSpace(spaceId)
  if (!path.startsWith(DEFAULT_ROOT))
    throw new MockServiceError(400, 'Write path must stay under /knowledge')

  return {
    path,
    sizeBytes: content.length,
    modifiedAt: new Date().toISOString(),
  }
}

export async function appendFs(spaceId: string, path: string, content: string): Promise<KnowledgeFsWriteResponse> {
  await delay(160)
  const existing = await catFs(spaceId, path)
  return writeFs(spaceId, path, `${existing.content}\n${content}`)
}

function flattenTree(node?: KnowledgeFsTreeResponse['root']) {
  if (!node)
    return [] as { name: string; path: string; kind: 'directory' | 'file' }[]

  const entries = [{ name: node.name, path: node.path, kind: node.kind === 'directory' ? 'directory' as const : 'file' as const }]
  for (const child of node.children ?? []) {
    if (child.kind === 'file')
      entries.push({ name: child.name, path: child.path, kind: 'file' })
    else
      entries.push(...flattenTree(child))
  }
  return entries
}

export async function getFsTree(spaceId: string, path: string): Promise<KnowledgeFsTreeResponse> {
  await delay(140)
  assertSpace(spaceId)

  return {
    path,
    truncated: false,
    root: {
      name: path.split('/').filter(Boolean).pop() ?? 'knowledge',
      path,
      kind: 'directory',
      children: [
        {
          name: 'documents',
          path: `${path}/documents`,
          kind: 'directory',
          children: [
            {
              name: 'refund-policy.md',
              path: `${path}/documents/refund-policy.md`,
              kind: 'file',
              sizeBytes: 18432,
              modifiedAt: new Date().toISOString(),
            },
            {
              name: 'pricing-legacy.html',
              path: `${path}/documents/pricing-legacy.html`,
              kind: 'file',
              sizeBytes: 9216,
            },
            {
              name: 'sso-enterprise.pdf',
              path: `${path}/documents/sso-enterprise.pdf`,
              kind: 'file',
              sizeBytes: 524288,
            },
          ],
        },
        {
          name: 'evidence',
          path: `${path}/evidence`,
          kind: 'directory',
        },
      ],
    },
  }
}

export async function getFsList(spaceId: string, path: string): Promise<KnowledgeFsListResponse> {
  await delay(120)
  assertSpace(spaceId)
  const tree = await getFsTree(spaceId, path)
  const children = tree.root?.children ?? []

  return {
    path,
    truncated: false,
    items: children.map(node => ({
      name: node.name,
      path: node.path,
      kind: node.kind,
      sizeBytes: node.sizeBytes,
      modifiedAt: node.modifiedAt,
    })),
  }
}

export async function grepFs(spaceId: string, path: string, query: string): Promise<KnowledgeFsGrepResponse> {
  await delay(160)
  assertSpace(spaceId)

  return {
    query,
    path,
    truncated: false,
    matches: [
      {
        path: `${path}/documents/refund-policy.md`,
        line: 12,
        text: `Enterprise plans can request refunds within 14 days (${query})`,
      },
    ],
  }
}

export async function catFs(spaceId: string, path: string): Promise<KnowledgeFsCatResponse> {
  await delay(120)
  assertSpace(spaceId)

  const content = path.endsWith('refund-policy.md')
    ? '# Refund policy\n\nEnterprise plans can request refunds within 14 days when no production workspace has been activated.'
    : 'Mock KnowledgeFS file content.'

  return {
    path,
    content,
    truncated: false,
    sizeBytes: content.length,
  }
}

export async function statFs(spaceId: string, path: string): Promise<KnowledgeFsStatResponse> {
  await delay(100)
  assertSpace(spaceId)

  return {
    path,
    kind: path.endsWith('.md') || path.endsWith('.pdf') ? 'file' : 'directory',
    sizeBytes: path.endsWith('.pdf') ? 524288 : 18432,
    modifiedAt: new Date().toISOString(),
    metadata: {
      documentAssetId: path.includes('refund-policy')
        ? PROTOTYPE_DOCUMENT_IDS.refundPolicy
        : undefined,
    },
  }
}

export async function diffFs(spaceId: string, leftPath: string, rightPath: string): Promise<KnowledgeFsDiffResponse> {
  await delay(180)
  assertSpace(spaceId)

  return {
    leftPath,
    rightPath,
    summary: '1 chunk changed',
    hunks: [{
      header: '@@ refund policy @@',
      lines: [
        { prefix: '-', text: 'Refunds within 7 days' },
        { prefix: '+', text: 'Refunds within 14 days' },
      ],
    }],
  }
}

function assertSpace(spaceId: string) {
  const exists = getKnowledgeMockStore().spaces.some(space => space.id === spaceId)
  if (!exists)
    throw new MockServiceError(404, 'Knowledge space not found')
}
