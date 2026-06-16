import {
  defaultSourceFreshness,
  sourceProviderOptionsByType,
} from '../sources/SourcesView'
import type { DatasetCreateInitialPath, DatasetCreateMode, DatasetStarterSource, FirstSourceDraft } from '../../types/create'

export const createPrimaryButtonLabels: Record<DatasetCreateInitialPath | 'external', string> = {
  empty: 'Create empty Knowledge',
  source: 'Create Knowledge and add source',
  documents: 'Create Knowledge and upload documents',
  external: 'Create external Knowledge',
}

export const createModeSummary: Record<DatasetCreateMode, { title: string; description: string }> = {
  standard: {
    title: 'Sources and documents stay separated',
    description: 'After creation, add synced Sources first, then review parsed files in Documents.',
  },
  pipeline: {
    title: 'Pipeline starts unpublished',
    description: 'The new Knowledge opens with Pipeline available and waits for a publish step.',
  },
  external: {
    title: 'External API owns retrieval',
    description: 'Sources and Documents are hidden because documents remain provider-managed.',
  },
}

export const createInitialPathSummary: Record<DatasetCreateInitialPath, string> = {
  empty: 'Create only the Knowledge shell. Add Sources or Documents after creation.',
  source: 'Create the Knowledge and register the first synced Source.',
  documents: 'Create the Knowledge and upload initial Documents without creating a Source.',
}

export const sourceNamePlaceholderByType: Record<DatasetStarterSource, string> = {
  'website-crawl': 'e.g. Product docs crawl',
  'online-documents': 'e.g. Support SOP workspace',
  'online-drive': 'e.g. Help center drive folder',
}

export function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <div className="mb-1 system-sm-medium text-text-secondary">{label}</div>
      {children}
    </label>
  )
}

export function CreateSummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 system-xs-regular">
      <span className="shrink-0 text-text-tertiary">{label}</span>
      <span className="min-w-0 truncate text-right text-text-secondary">{value}</span>
    </div>
  )
}

export function createDefaultFirstSourceDraft(type: DatasetStarterSource): FirstSourceDraft {
  return {
    type,
    provider: sourceProviderOptionsByType[type][0]?.value ?? '',
    name: '',
    endpoint: '',
    freshness: defaultSourceFreshness(type),
    permission: 'all_team_members',
    website: {
      crawlSubPages: true,
      useSitemap: true,
      limit: 10,
      maxDepth: 2,
      include: '',
      exclude: '',
      onlyMainContent: true,
    },
  }
}

export function buildStagedDocumentNames(documentDrafts: string[], documentName: string) {
  const names = [...documentDrafts]
  const typedName = documentName.trim()
  if (typedName && !names.includes(typedName))
    names.push(typedName)
  return names
}
