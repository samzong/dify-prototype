import {
  sourceTypeLabels,
  type DatasetDocumentRow,
  type DatasetSourceRow,
} from '../../fixtures/items'
import { sourceProviderOptionsByType } from '../sources/SourcesView'
import type {
  DatasetCreateInitialPath,
  DatasetCreateMode,
  DatasetStarterSource,
  FirstSourceDraft,
} from '../../types/create'

export const createDescriptionByMode: Record<DatasetCreateMode, string> = {
  standard: 'A standard Knowledge base ready for synced sources and document review.',
  pipeline: 'A pipeline-managed Knowledge base ready for source setup and publish.',
  external: 'An external Knowledge base delegated to a provider-managed retrieval API.',
}

export function buildCreatedListHints(
  mode: DatasetCreateMode,
  initialPath: DatasetCreateInitialPath,
  sourceType: DatasetStarterSource,
  documentCount: number,
) {
  if (mode === 'external')
    return undefined
  if (initialPath === 'source')
    return [`${sourceTypeLabels[sourceType]} source syncing`]
  if (initialPath === 'documents')
    return [`${documentCount} uploaded docs processing`]
  return ['No source or documents yet']
}

export function buildCreatedStatusBlocks(
  mode: DatasetCreateMode,
  initialPath: DatasetCreateInitialPath,
  sourceCount: number,
  documentCount: number,
) {
  if (mode === 'external') {
    return [
      { label: 'External Knowledge API', value: 'Not configured', note: 'Add endpoint settings', tone: 'warn' as const },
      { label: 'Documents', value: 'External', note: 'Provider-managed', tone: 'neutral' as const },
      { label: 'Retrieval', value: 'Delegated', note: 'Awaiting provider', tone: 'info' as const },
      { label: 'Evidence', value: 'Unknown', note: 'Run first test', tone: 'neutral' as const },
      { label: 'Usage', value: '0 apps', note: 'Not connected', tone: 'neutral' as const },
    ]
  }

  if (initialPath === 'source') {
    return [
      { label: 'Sources', value: `${sourceCount} syncing`, note: 'First source queued', tone: 'info' as const },
      { label: 'Documents', value: '0 / 0', note: 'Awaiting synced files', tone: 'neutral' as const },
      { label: 'Index', value: 'Syncing', note: 'Source sync pending', tone: 'info' as const },
      { label: 'Evidence', value: 'Unknown', note: 'No indexed evidence', tone: 'neutral' as const },
      { label: 'Usage', value: '0 apps', note: 'Not connected', tone: 'neutral' as const },
    ]
  }

  if (initialPath === 'documents') {
    return [
      { label: 'Sources', value: '0 connected', note: 'Manual uploads only', tone: 'neutral' as const },
      { label: 'Documents', value: `0 / ${documentCount}`, note: 'Processing uploaded files', tone: 'info' as const },
      { label: 'Index', value: 'Building', note: 'Parser queued', tone: 'info' as const },
      { label: 'Evidence', value: 'Unknown', note: 'Waiting for index', tone: 'neutral' as const },
      { label: 'Usage', value: '0 apps', note: 'Not connected', tone: 'neutral' as const },
    ]
  }

  return [
    { label: 'Sources', value: '0 connected', note: 'No source yet', tone: 'neutral' as const },
    { label: 'Documents', value: '0 / 0', note: 'No documents yet', tone: 'neutral' as const },
    { label: 'Index', value: 'Empty', note: 'Waiting for documents', tone: 'neutral' as const },
    { label: 'Evidence', value: 'Unknown', note: 'No test result', tone: 'neutral' as const },
    { label: 'Usage', value: '0 apps', note: 'Not connected', tone: 'neutral' as const },
  ]
}

export function buildCreatedTasks(
  mode: DatasetCreateMode,
  initialPath: DatasetCreateInitialPath,
  sourceType: DatasetStarterSource,
  documentCount: number,
) {
  if (mode === 'pipeline') {
    const setupTask = initialPath === 'source'
      ? { title: 'First source sync queued', detail: `${sourceTypeLabels[sourceType]} will populate Documents after sync.`, tone: 'info' as const }
      : initialPath === 'documents'
        ? { title: 'Uploaded documents processing', detail: `${documentCount} files are queued for parser and index.`, tone: 'info' as const }
        : { title: 'Add Source or Documents', detail: 'Pipeline Knowledge is empty until initial data is added.', tone: 'warn' as const }
    return [setupTask, { title: 'Publish pipeline', detail: 'Pipeline is created but not published.', tone: 'info' as const }]
  }
  if (mode === 'external')
    return [{ title: 'Configure endpoint', detail: 'Set external API name and Knowledge ID.', tone: 'warn' as const }]

  if (initialPath === 'source')
    return [{ title: 'First source sync queued', detail: `${sourceTypeLabels[sourceType]} will populate Documents after sync.`, tone: 'info' as const }]
  if (initialPath === 'documents')
    return [{ title: 'Uploaded documents processing', detail: `${documentCount} files are queued for parser and index.`, tone: 'info' as const }]
  return [{ title: 'Add Source or Documents', detail: 'Create a source connection or upload documents when ready.', tone: 'warn' as const }]
}

export function buildCreatedBlockers(
  mode: DatasetCreateMode,
  initialPath: DatasetCreateInitialPath,
  sourceType: DatasetStarterSource,
  documentCount: number,
) {
  if (mode === 'external')
    return []
  if (initialPath === 'source') {
    return [
      { title: 'Waiting for first Source sync', detail: `${sourceTypeLabels[sourceType]} has not produced indexed Documents yet.`, tone: 'warn' as const },
    ]
  }
  if (initialPath === 'documents') {
    return [
      { title: 'Waiting for Document indexing', detail: `${documentCount} uploaded files are not answerable until parser and index finish.`, tone: 'warn' as const },
    ]
  }
  return [
    { title: 'No data added', detail: 'This Knowledge has no Sources and no Documents yet.', tone: 'warn' as const },
  ]
}

export function buildCreatedMissingEvidence(mode: DatasetCreateMode, initialPath: DatasetCreateInitialPath, documentCount: number) {
  if (mode === 'external')
    return ['External retrieval has not been tested yet.']
  if (initialPath === 'source')
    return ['First Source sync has not produced indexed documents yet.']
  if (initialPath === 'documents')
    return [`${documentCount} uploaded documents are still waiting for parser and index.`]
  return ['No indexed documents are available yet.']
}

export function buildCreatedEvidenceFreshness(mode: DatasetCreateMode, initialPath: DatasetCreateInitialPath) {
  if (mode === 'external')
    return 'External provider pending'
  if (initialPath === 'source')
    return 'Source sync queued'
  if (initialPath === 'documents')
    return 'Uploaded documents processing'
  return 'No sources connected'
}

export function buildCreatedSettings(mode: DatasetCreateMode, id: string, initialPath: DatasetCreateInitialPath) {
  if (mode === 'external') {
    return {
      apiAccess: { serviceApiEnabled: false, externalApiEnabled: true },
      externalRetrieval: {
        externalApiName: '',
        externalKnowledgeId: id,
        topK: 4,
        scoreThreshold: 0.35,
        scoreThresholdEnabled: true,
        scoreHandling: 'Normalize before mixed rerank',
      },
      advanced: {
        healthCheckSummary: 'External endpoint not configured',
        cleanupSummary: 'Delegated retention managed by provider',
      },
    }
  }

  return {
    apiAccess: { serviceApiEnabled: true, externalApiEnabled: false },
    defaultRetrieval: {
      mode: mode === 'pipeline' ? 'Fast' as const : 'Fast' as const,
      topK: mode === 'pipeline' ? 6 : 8,
      rerankEnabled: true,
      scoreThreshold: 0.5,
      scoreThresholdEnabled: true,
    },
    processingAndIndex: {
      parserPolicy: mode === 'pipeline' ? 'Pipeline-managed parser' : 'General document parser',
      chunking: mode === 'pipeline' ? 'Parent-child' : 'General',
      embedding: 'text-embedding-3-large',
      indexStrategy: mode === 'pipeline' ? 'Pipeline vector projection' : 'Hybrid dense + FTS',
      pipelineNote: mode === 'pipeline' ? 'Draft pipeline' : undefined,
    },
    retention: {
      rawDocumentRetentionDays: null,
      parseArtifactVersions: 5,
      answerTraceRetentionDays: 30,
      evidenceCacheRetentionDays: 7,
      inactiveProjectionRetentionDays: 90,
      sessionInactivityMinutes: 1440,
    },
    advanced: {
      healthCheckSummary: initialPath === 'source'
        ? 'First source sync queued'
        : initialPath === 'documents'
          ? 'Initial uploaded documents queued'
          : 'No projection created yet',
      cleanupSummary: 'No inactive assets pending cleanup',
    },
  }
}

export function slugifyDatasetName(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'dataset'
}
