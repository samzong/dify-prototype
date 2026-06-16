import type { KnowledgeSpace } from '../api-types'
import { datasetItems } from './dataset-items'
import type { DatasetItem } from './types'
import { PROTOTYPE_SPACE_IDS, PROTOTYPE_TENANT_ID, isoAt } from './scenarios/ids'

const FIXTURE_ID_BY_SPACE_ID: Record<string, string> = {
  [PROTOTYPE_SPACE_IDS.supportHandbook]: 'support-handbook',
  [PROTOTYPE_SPACE_IDS.releaseNotes]: 'release-notes',
  [PROTOTYPE_SPACE_IDS.docsCrawl]: 'docs-crawl',
  [PROTOTYPE_SPACE_IDS.salesDeck]: 'sales-deck',
  [PROTOTYPE_SPACE_IDS.partnerApi]: 'partner-api',
}

const SPACE_ID_BY_FIXTURE_ID: Record<string, string> = Object.fromEntries(
  Object.entries(FIXTURE_ID_BY_SPACE_ID).map(([spaceId, fixtureId]) => [fixtureId, spaceId]),
)

const SLUG_BY_FIXTURE_ID: Record<string, string> = {
  'support-handbook': 'customer-support-handbook',
  'release-notes': 'release-notes-pipeline',
  'docs-crawl': 'docs-crawl',
  'sales-deck': 'sales-deck',
  'partner-api': 'partner-api',
}

export function fixtureIdToSpaceId(fixtureId: string) {
  return SPACE_ID_BY_FIXTURE_ID[fixtureId] ?? fixtureId
}

export function spaceIdToFixtureId(spaceId: string) {
  return FIXTURE_ID_BY_SPACE_ID[spaceId]
}

export function resolveKnowledgeSpaceId(id: string) {
  if (FIXTURE_ID_BY_SPACE_ID[id])
    return id
  return SPACE_ID_BY_FIXTURE_ID[id] ?? id
}

export function findFixtureForSpace(space: KnowledgeSpace): DatasetItem | undefined {
  const fixtureId = spaceIdToFixtureId(space.id)
  if (!fixtureId)
    return undefined
  return datasetItems.find(item => item.id === fixtureId)
}

export function findFixtureByRouteId(routeId: string): DatasetItem | undefined {
  const fixtureId = spaceIdToFixtureId(routeId) ?? routeId
  return datasetItems.find(item => item.id === fixtureId)
}

export function spaceFromFixture(fixture: DatasetItem, spaceId: string): KnowledgeSpace {
  const now = isoAt()
  return {
    id: spaceId,
    name: fixture.name,
    slug: SLUG_BY_FIXTURE_ID[fixture.id] ?? slugifyKnowledgeSpaceName(fixture.name),
    tenantId: PROTOTYPE_TENANT_ID,
    description: fixture.description,
    createdAt: isoAt(86400000 * 30),
    updatedAt: now,
  }
}

export function mergeSpaceWithFixture(space: KnowledgeSpace, fixture?: DatasetItem): DatasetItem {
  if (!fixture)
    return createMinimalDatasetItemFromSpace(space)

  return {
    ...fixture,
    id: space.id,
    name: space.name,
    description: space.description ?? fixture.description,
    updatedAt: formatKnowledgeSpaceUpdatedAt(space.updatedAt),
    editedAt: formatKnowledgeSpaceUpdatedAt(space.updatedAt),
  }
}

export function createMinimalDatasetItemFromSpace(space: KnowledgeSpace): DatasetItem {
  const template = datasetItems[0]
  return {
    ...template,
    id: space.id,
    name: space.name,
    description: space.description ?? '',
    tags: ['General'],
    sources: [],
    documents: [],
    sourceCount: 0,
    documentsLabel: '0 / 0',
    indexStatus: 'Empty',
    evidenceStatus: 'Unknown',
    usageLabel: '0 apps',
    appCount: 0,
    updatedAt: formatKnowledgeSpaceUpdatedAt(space.updatedAt),
    editedAt: formatKnowledgeSpaceUpdatedAt(space.updatedAt),
    statusBlocks: [
      { label: 'Slug', value: space.slug, note: space.tenantId, tone: 'neutral' },
      { label: 'Documents', value: '0 / 0', note: 'No documents yet', tone: 'neutral' },
      { label: 'Index', value: 'Empty', note: 'Awaiting ingest', tone: 'warn' },
      { label: 'Evidence', value: 'Unknown', note: 'No queries yet', tone: 'neutral' },
      { label: 'Usage', value: '0 apps', note: 'Not connected', tone: 'neutral' },
    ],
    tasks: [],
    blockers: [],
    traces: [],
    goldenQuestions: [],
    badCases: [],
    listHints: ['New knowledge space'],
  }
}

export function resolveCatalogItem(routeId: string, items: DatasetItem[]) {
  const spaceId = resolveKnowledgeSpaceId(routeId)
  const fromCatalog = items.find(item => item.id === spaceId)
  if (fromCatalog)
    return fromCatalog

  const fixture = findFixtureByRouteId(routeId)
  if (fixture)
    return mergeSpaceWithFixture(spaceFromFixture(fixture, spaceId), fixture)

  return undefined
}

export function slugifyKnowledgeSpaceName(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'knowledge-space'
}

export const KNOWLEDGE_SPACE_SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

export function isValidKnowledgeSpaceSlug(slug: string) {
  return KNOWLEDGE_SPACE_SLUG_PATTERN.test(slug)
}

export function formatKnowledgeSpaceUpdatedAt(iso: string) {
  const deltaMs = Date.now() - new Date(iso).getTime()
  const minutes = Math.floor(deltaMs / 60000)
  if (minutes < 1)
    return 'Just now'
  if (minutes < 60)
    return `${minutes} min ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24)
    return `${hours} hours ago`
  const days = Math.floor(hours / 24)
  return `${days} days ago`
}
