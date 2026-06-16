import { Button } from '@langgenius/dify-ui/button'
import { Input } from '@langgenius/dify-ui/input'
import { Textarea } from '@langgenius/dify-ui/textarea'
import { RiArrowLeftLine } from '@remixicon/react'
import { useState } from 'react'
import type { DatasetItem } from '../../fixtures/items'
import { sourceTypeLabels } from '../../fixtures/items'
import { sourceProviderOptionsByType } from '../sources/SourcesView'
import type { DatasetCreateInitialPath, DatasetCreateMode, DatasetStarterSource, FirstSourceDraft } from '../../types/create'
import { buildCreatedDataset } from './create-builders'
import {
  buildStagedDocumentNames,
  createDefaultFirstSourceDraft,
  createInitialPathSummary,
  createModeSummary,
  createPrimaryButtonLabels,
  CreateSummaryRow,
  Field,
} from './create-shared'
import { CreateDatasetBody } from './create-sections'

export function CreatePage({
  mode,
  onBack,
  onCreate,
}: {
  mode: DatasetCreateMode
  onBack: () => void
  onCreate: (item: DatasetItem) => void
}) {
  const [initialPath, setInitialPath] = useState<DatasetCreateInitialPath>('empty')
  const [sourceDraft, setSourceDraft] = useState<FirstSourceDraft>(() => createDefaultFirstSourceDraft('website-crawl'))
  const [documentName, setDocumentName] = useState('')
  const [documentDrafts, setDocumentDrafts] = useState<string[]>([])
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [permission, setPermission] = useState('Workspace')
  const normalizedPath = mode === 'external' ? 'empty' : initialPath
  const selectedProvider = sourceProviderOptionsByType[sourceDraft.type].find(option => option.value === sourceDraft.provider)
  const stagedDocumentNames = buildStagedDocumentNames(documentDrafts, documentName)
  const sourceReady = !!sourceDraft.name.trim() && (sourceDraft.type !== 'website-crawl' || !!sourceDraft.endpoint.trim())
  const documentsReady = stagedDocumentNames.length > 0
  const canCreate = !!name.trim()
    && (normalizedPath !== 'source' || sourceReady)
    && (normalizedPath !== 'documents' || documentsReady)
  const primaryLabel = createPrimaryButtonLabels[mode === 'external' ? 'external' : normalizedPath]

  const handleCreate = () => {
    if (!canCreate)
      return
    onCreate(buildCreatedDataset({
      mode,
      initialPath: normalizedPath,
      sourceDraft,
      documentNames: stagedDocumentNames,
      name,
      description,
      permission,
    }))
  }

  return (
    <main className="relative flex h-0 shrink-0 grow flex-col overflow-y-auto bg-background-body">
      <div className="sticky top-0 z-10 flex items-center justify-between gap-3 bg-background-body px-12 pt-4 pb-3">
        <div className="flex min-w-0 items-center gap-3">
          <Button variant="ghost" onClick={onBack}>
            <RiArrowLeftLine className="size-4" />
            Knowledge
          </Button>
          <div className="h-5 w-px bg-divider-regular" />
          <div className="min-w-0">
            <div className="system-md-semibold text-text-secondary">Create Knowledge</div>
            <div className="system-xs-regular text-text-tertiary">Choose how this dataset receives data and retrieval behavior.</div>
          </div>
        </div>
        <Button variant="primary" onClick={handleCreate} disabled={!canCreate}>
          {primaryLabel}
        </Button>
      </div>

      <div className="grid gap-5 px-12 py-3 xl:grid-cols-[minmax(0,1fr)_360px]">
        <CreateDatasetBody
          mode={mode}
          initialPath={initialPath}
          sourceDraft={sourceDraft}
          documentName={documentName}
          documentDrafts={documentDrafts}
          stagedDocumentNames={stagedDocumentNames}
          onSetInitialPath={setInitialPath}
          onSetSourceType={(sourceType: DatasetStarterSource) => setSourceDraft(createDefaultFirstSourceDraft(sourceType))}
          onSourceDraftChange={setSourceDraft}
          onDocumentNameChange={setDocumentName}
          onAddDocumentDraft={() => {
            const nextName = documentName.trim()
            if (!nextName)
              return
            setDocumentDrafts(current => current.includes(nextName) ? current : [...current, nextName])
            setDocumentName('')
          }}
          onRemoveDocumentDraft={index => setDocumentDrafts(current => current.filter((_, draftIndex) => draftIndex !== index))}
          onSeedDocumentName={() => setDocumentName('support-handbook.pdf')}
        />
        <aside className="h-fit rounded-xl border border-components-panel-border bg-components-panel-bg p-4 shadow-xs">
          <div className="system-sm-semibold text-text-secondary">Basic info</div>
          <div className="mt-4 space-y-3">
            <Field label="Knowledge name">
              <Input
                value={name}
                onChange={event => setName(event.target.value)}
                placeholder="e.g. Customer Support Handbook"
              />
            </Field>
            <Field label="Description">
              <Textarea
                value={description}
                onValueChange={setDescription}
                placeholder="What this Knowledge is used for"
                className="min-h-20 resize-none"
                aria-label="Description"
              />
            </Field>
            <Field label="Permission">
              <Input
                value={permission}
                onChange={event => setPermission(event.target.value)}
                placeholder="Workspace"
              />
            </Field>
          </div>
          <div className="mt-4 rounded-lg border border-divider-subtle bg-background-default-subtle px-3 py-2">
            <div className="system-xs-medium text-text-secondary">{createModeSummary[mode].title}</div>
            <div className="mt-0.5 system-xs-regular text-text-tertiary">
              {mode === 'external'
                ? createModeSummary[mode].description
                : createInitialPathSummary[normalizedPath]}
            </div>
            {normalizedPath === 'source' && (
              <div className="mt-3 space-y-1.5 border-t border-divider-subtle pt-2">
                <CreateSummaryRow label="Type" value={sourceTypeLabels[sourceDraft.type]} />
                <CreateSummaryRow label="Provider" value={selectedProvider?.label ?? 'Not selected'} />
                <CreateSummaryRow label="Source" value={sourceDraft.name.trim() || 'Missing source name'} />
                <CreateSummaryRow label="Endpoint" value={sourceDraft.endpoint.trim() || 'Missing endpoint'} />
              </div>
            )}
            {normalizedPath === 'documents' && (
              <div className="mt-3 space-y-1.5 border-t border-divider-subtle pt-2">
                <CreateSummaryRow label="Documents" value={`${stagedDocumentNames.length} staged`} />
                <CreateSummaryRow label="Source" value="None created" />
              </div>
            )}
          </div>
        </aside>
      </div>
    </main>
  )
}
