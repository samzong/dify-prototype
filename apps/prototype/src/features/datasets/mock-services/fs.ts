import type {
  KnowledgeFsCatResponse,
  KnowledgeFsDiffResponse,
  KnowledgeFsGrepResponse,
  KnowledgeFsListResponse,
  KnowledgeFsStatResponse,
  KnowledgeFsTreeResponse,
} from '../api-types'
import { MockServiceError } from '../api-types'
import { PROTOTYPE_DOCUMENT_IDS } from '../fixtures/scenarios'
import { delay } from './helpers'
import { getKnowledgeMockStore } from './store'

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
