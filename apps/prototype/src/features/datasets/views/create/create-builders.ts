import {
  datasetItems,
  sourceTypeLabels,
  type DatasetDocumentRow,
  type DatasetItem,
  type DatasetSourceRow,
} from '../../fixtures/items'
import {
  defaultSourceFreshness,
  sourceProviderOptionsByType,
} from '../sources/SourcesView'
import type {
  DatasetCreateInitialPath,
  DatasetCreateMode,
  DatasetStarterSource,
  FirstSourceDraft,
} from '../../types/create'
import { createDefaultFirstSourceDraft } from './create-shared'
import {
  buildCreatedBlockers,
  buildCreatedEvidenceFreshness,
  buildCreatedListHints,
  buildCreatedMissingEvidence,
  buildCreatedSettings,
  buildCreatedStatusBlocks,
  buildCreatedTasks,
  createDescriptionByMode,
  slugifyDatasetName,
} from './create-builders-meta'

export function buildCreatedDataset({
  mode,
  initialPath,
  sourceDraft,
  documentNames,
  name,
  description,
  permission,
}: {
  mode: DatasetCreateMode
  initialPath: DatasetCreateInitialPath
  sourceDraft: FirstSourceDraft
  documentNames: string[]
  name: string
  description: string
  permission: string
}): DatasetItem {
  const trimmedName = name.trim()
  const isExternal = mode === 'external'
  const isPipeline = mode === 'pipeline'
  const id = `${slugifyDatasetName(trimmedName)}-${Date.now().toString(36)}`
  const shouldCreateSource = !isExternal && initialPath === 'source'
  const shouldCreateDocuments = !isExternal && initialPath === 'documents'
  const initialSource = shouldCreateSource ? buildInitialSource(id, sourceDraft) : undefined
  const initialDocuments = shouldCreateDocuments ? buildInitialDocuments(id, documentNames) : []
  const sourceCount = initialSource ? 1 : 0
  const documentCount = initialDocuments.length

  return {
    ...datasetItems[0],
    id,
    name: trimmedName,
    description: description.trim() || createDescriptionByMode[mode],
    authorName: 'Dify Admin',
    editedAt: 'Edited just now',
    tags: isExternal ? ['External'] : isPipeline ? ['Pipeline'] : ['General'],
    icon: isExternal ? '🔌' : isPipeline ? '🧩' : '📘',
    iconBackground: isExternal ? '#F0FDF9' : '#EEF4FF',
    docForm: isExternal ? 'External Knowledge Base' : isPipeline ? 'Parent-child' : 'General',
    indexingText: isExternal ? '' : isPipeline ? 'HQ VECTOR' : 'HQ HYBRID',
    appCount: 0,
    cornerLabel: isPipeline ? 'Pipeline' : undefined,
    provider: isExternal ? 'external' : undefined,
    listHints: buildCreatedListHints(mode, initialPath, sourceDraft.type, documentCount),
    type: isExternal ? 'External' : isPipeline ? 'RAG Pipeline' : 'Internal',
    permission: permission.trim() || 'Workspace',
    apiEnabled: !isExternal,
    sourceCount,
    documentsLabel: isExternal ? 'External' : shouldCreateDocuments ? `0 / ${documentCount}` : '0 / 0',
    indexStatus: isExternal ? 'Delegated' : shouldCreateSource ? 'Syncing' : shouldCreateDocuments ? 'Building' : 'Empty',
    evidenceStatus: 'Unknown',
    usageLabel: '0 apps',
    updatedAt: 'Just now',
    runtimeMode: isPipeline ? 'rag_pipeline' : undefined,
    isPublished: isPipeline ? false : undefined,
    statusBlocks: buildCreatedStatusBlocks(mode, initialPath, sourceCount, documentCount),
    tasks: buildCreatedTasks(mode, initialPath, sourceDraft.type, documentCount),
    blockers: buildCreatedBlockers(mode, initialPath, sourceDraft.type, documentCount),
    sources: initialSource ? [initialSource] : [],
    documents: initialDocuments,
    evidenceState: 'not-enough-evidence',
    evidenceItems: [],
    missingEvidence: buildCreatedMissingEvidence(mode, initialPath, documentCount),
    conflictingEvidence: [],
    traces: [],
    goldenQuestions: [],
    badCases: [],
    qualityStats: [
      { label: 'Answerable rate', value: 'Pending', tone: 'neutral' },
      { label: 'Conflict trend', value: 'N/A', tone: 'neutral' },
      { label: 'Missing evidence', value: 'No data', tone: 'neutral' },
    ],
    qualityMissingTrend: 'No data',
    settingsConfig: buildCreatedSettings(mode, id, initialPath),
    defaultQuery: '',
    evidenceTraceId: '',
    evidenceFreshness: buildCreatedEvidenceFreshness(mode, initialPath),
    connectedWorkflows: [],
  }
}

function buildInitialSource(id: string, draft: FirstSourceDraft): DatasetSourceRow {
  const selectedProvider = sourceProviderOptionsByType[draft.type].find(option => option.value === draft.provider)
  return {
    id: `${id}-src-initial`,
    name: draft.name.trim(),
    type: draft.type,
    status: 'Syncing',
    freshness: draft.freshness,
    permission: draft.permission,
    lastSync: 'Sync queued',
    endpoint: draft.endpoint.trim() || undefined,
    providerName: selectedProvider?.label,
    configSummary: draft.type === 'website-crawl' ? buildInitialWebsiteSourceSummary(draft) : undefined,
  }
}

function buildInitialWebsiteSourceSummary(draft: FirstSourceDraft): DatasetSourceRow['configSummary'] {
  return [
    { label: 'Provider', value: sourceProviderOptionsByType[draft.type].find(option => option.value === draft.provider)?.label ?? draft.provider },
    { label: 'Crawl sub-pages', value: draft.website.crawlSubPages ? 'Enabled' : 'Disabled' },
    { label: 'Use sitemap', value: draft.website.useSitemap ? 'Enabled' : 'Disabled' },
    { label: 'Page limit', value: `${draft.website.limit}` },
    { label: 'Max depth', value: `${draft.website.maxDepth}` },
    { label: 'Only main content', value: draft.website.onlyMainContent ? 'Enabled' : 'Disabled' },
    ...(draft.website.include ? [{ label: 'Include paths', value: draft.website.include }] : []),
    ...(draft.website.exclude ? [{ label: 'Exclude paths', value: draft.website.exclude }] : []),
  ]
}

function buildInitialDocuments(id: string, documentNames: string[]): DatasetDocumentRow[] {
  return documentNames.map((documentName, index) => ({
    id: `${id}-doc-initial-${index + 1}`,
    name: documentName,
    source: 'Manual upload',
    parserStatus: 'pending',
    version: 'v1',
    indexStatus: 'building',
    evidenceUse: 'Pending',
    updatedAt: 'Just now',
  }))
}

