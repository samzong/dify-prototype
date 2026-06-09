import { Button } from '@langgenius/dify-ui/button'
import { Input } from '@langgenius/dify-ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectItemIndicator,
  SelectItemText,
  SelectTrigger,
  SelectValue,
} from '@langgenius/dify-ui/select'
import { Slider } from '@langgenius/dify-ui/slider'
import { Switch } from '@langgenius/dify-ui/switch'
import { Textarea } from '@langgenius/dify-ui/textarea'
import { useState } from 'react'
import type { Knowledge2Item, RetrievalDepth } from './knowledge-2-data'

const rowClass = 'flex gap-x-1'
const labelClass = 'flex shrink-0 items-center pt-1 h-7 w-[180px]'
const sectionLabelClass = 'flex w-[180px] shrink-0 flex-col'

type Permission = 'only_me' | 'all_team_members' | 'partial_members'

const permissionOptions = [
  { value: 'only_me', label: 'Only me' },
  { value: 'all_team_members', label: 'All team members' },
  { value: 'partial_members', label: 'Partial team members' },
]

const retrievalModeOptions: { value: RetrievalDepth; label: string }[] = [
  { value: 'Fast', label: 'Fast' },
  { value: 'Deep', label: 'Deep' },
  { value: 'Research', label: 'Research' },
]

const retentionOptions = [
  { value: 'forever', label: 'Forever', days: null },
  { value: '7', label: '7 days', days: 7 },
  { value: '30', label: '30 days', days: 30 },
  { value: '60', label: '60 days', days: 60 },
  { value: '90', label: '90 days', days: 90 },
  { value: '120', label: '120 days', days: 120 },
  { value: '180', label: '180 days', days: 180 },
  { value: '365', label: '365 days', days: 365 },
]

const dayRetentionOptions = retentionOptions.filter(option => option.days !== null)

const artifactVersionOptions = [
  { value: '3', label: 'Keep last 3 versions', versions: 3 },
  { value: '5', label: 'Keep last 5 versions', versions: 5 },
  { value: '10', label: 'Keep last 10 versions', versions: 10 },
]

const sessionInactivityOptions = [
  { value: '60', label: '1 hour', minutes: 60 },
  { value: '240', label: '4 hours', minutes: 240 },
  { value: '1440', label: '24 hours', minutes: 1440 },
]

function permissionFromItem(item: Knowledge2Item): Permission {
  if (item.permission === 'Workspace' || item.permission === 'Editors')
    return 'all_team_members'
  if (item.permission === 'Sales' || item.permission === 'Product team')
    return 'partial_members'
  return 'only_me'
}

export function KnowledgeSettingsView({ item }: { item: Knowledge2Item }) {
  const config = item.settingsConfig
  const isExternal = item.provider === 'external'

  const [name, setName] = useState(item.name)
  const [description, setDescription] = useState(item.description)
  const [permission, setPermission] = useState<Permission>(permissionFromItem(item))
  const [serviceApiEnabled, setServiceApiEnabled] = useState(config.apiAccess.serviceApiEnabled)
  const [externalApiEnabled, setExternalApiEnabled] = useState(config.apiAccess.externalApiEnabled)
  const [retrievalMode, setRetrievalMode] = useState<RetrievalDepth>(config.defaultRetrieval?.mode ?? 'Fast')
  const [topK, setTopK] = useState(config.defaultRetrieval?.topK ?? config.externalRetrieval?.topK ?? 4)
  const [rerankEnabled, setRerankEnabled] = useState(config.defaultRetrieval?.rerankEnabled ?? false)
  const [multimodalEnabled, setMultimodalEnabled] = useState(config.defaultRetrieval?.multimodalEnabled ?? false)
  const [scoreThreshold, setScoreThreshold] = useState(
    config.defaultRetrieval?.scoreThreshold ?? config.externalRetrieval?.scoreThreshold ?? 0.35,
  )
  const [scoreThresholdEnabled, setScoreThresholdEnabled] = useState(
    config.defaultRetrieval?.scoreThresholdEnabled ?? config.externalRetrieval?.scoreThresholdEnabled ?? false,
  )
  const [parserPolicy, setParserPolicy] = useState(config.processingAndIndex?.parserPolicy ?? '')
  const [chunking, setChunking] = useState(config.processingAndIndex?.chunking ?? '')
  const [embedding, setEmbedding] = useState(config.processingAndIndex?.embedding ?? '')
  const [indexStrategy, setIndexStrategy] = useState(config.processingAndIndex?.indexStrategy ?? '')
  const [pipelineNote, setPipelineNote] = useState(config.processingAndIndex?.pipelineNote ?? '')
  const [rawDocumentRetention, setRawDocumentRetention] = useState<number | null>(config.retention?.rawDocumentRetentionDays ?? null)
  const [artifactVersions, setArtifactVersions] = useState(config.retention?.parseArtifactVersions ?? 5)
  const [answerTraceRetention, setAnswerTraceRetention] = useState(config.retention?.answerTraceRetentionDays ?? 30)
  const [evidenceCacheRetention, setEvidenceCacheRetention] = useState(config.retention?.evidenceCacheRetentionDays ?? 7)
  const [inactiveProjectionRetention, setInactiveProjectionRetention] = useState(config.retention?.inactiveProjectionRetentionDays ?? 90)
  const [sessionInactivityMinutes, setSessionInactivityMinutes] = useState(config.retention?.sessionInactivityMinutes ?? 1440)
  const [saving, setSaving] = useState(false)

  const handleSave = () => {
    setSaving(true)
    window.setTimeout(() => setSaving(false), 400)
  }

  return (
    <div className="flex w-full flex-col gap-y-4 py-2 pr-6 sm:w-[960px]">
      <SettingsRow label="Name & Icon">
        <div className="flex grow items-center gap-x-2">
          <button
            type="button"
            className="relative flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-lg border-[0.5px] border-divider-regular text-base leading-none"
            style={{ background: item.iconBackground }}
          >
            {item.icon}
            <span className="absolute -right-1 -bottom-1 flex size-4 items-center justify-center rounded-full border border-divider-regular bg-components-panel-bg">
              <span className="i-ri-edit-line size-2.5 text-text-tertiary" />
            </span>
          </button>
          <Input value={name} onChange={event => setName(event.target.value)} className="grow" />
        </div>
      </SettingsRow>

      <SettingsRow label="Description">
        <Textarea
          value={description}
          onValueChange={setDescription}
          className="min-h-20 resize-none"
          placeholder="Describe what is in this knowledge base. A detailed description helps apps and workflows understand when to use it."
          aria-label="Description"
        />
      </SettingsRow>

      <SettingsRow label="Permissions">
        <Select
          items={permissionOptions}
          value={permission}
          onValueChange={(value) => {
            if (value !== null)
              setPermission(value as Permission)
          }}
        >
          <SelectTrigger size="large" aria-label="Permissions" className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {permissionOptions.map(option => (
              <SelectItem key={option.value} value={option.value}>
                <SelectItemText>{option.label}</SelectItemText>
                <SelectItemIndicator />
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </SettingsRow>

      <SettingsDivider />
      <SettingsSection
        title="API access"
        description="Control Service API and external retrieval access for this knowledge base."
      >
        <SettingsFieldRow label="Service API">
          <div className="flex h-7 items-center">
            <Switch
              size="md"
              checked={serviceApiEnabled}
              onCheckedChange={setServiceApiEnabled}
              aria-label="Service API"
            />
          </div>
        </SettingsFieldRow>
        <SettingsFieldRow label="External API">
          <div className="flex h-7 items-center gap-x-2">
            <Switch
              size="md"
              checked={externalApiEnabled}
              onCheckedChange={setExternalApiEnabled}
              aria-label="External API"
              disabled={isExternal}
            />
            {isExternal && (
              <span className="system-xs-regular text-text-tertiary">Delegated to partner endpoint</span>
            )}
          </div>
        </SettingsFieldRow>
      </SettingsSection>

      {isExternal && config.externalRetrieval
        ? (
            <>
              <SettingsDivider />
              <SettingsSection
                title="External retrieval"
                description="Configure delegated retrieval and score handling for the partner endpoint."
              >
                <SettingsFieldRow label="External Knowledge API">
                  <Input value={config.externalRetrieval.externalApiName} readOnly className="grow" />
                </SettingsFieldRow>
                <SettingsFieldRow label="External Knowledge ID">
                  <Input value={config.externalRetrieval.externalKnowledgeId} readOnly className="grow" />
                </SettingsFieldRow>
                <SettingsFieldRow label="Top K">
                  <Slider className="w-full max-w-[320px]" value={topK} onValueChange={setTopK} min={1} max={20} />
                </SettingsFieldRow>
                <SettingsFieldRow label="Score threshold">
                  <div className="flex flex-col gap-y-2">
                    <Switch
                      size="md"
                      checked={scoreThresholdEnabled}
                      onCheckedChange={setScoreThresholdEnabled}
                      aria-label="Score threshold"
                    />
                    {scoreThresholdEnabled && (
                      <Slider
                        className="w-full max-w-[320px]"
                        value={scoreThreshold}
                        onValueChange={setScoreThreshold}
                        min={0}
                        max={1}
                        step={0.01}
                      />
                    )}
                  </div>
                </SettingsFieldRow>
                <SettingsFieldRow label="Score handling">
                  <Input value={config.externalRetrieval.scoreHandling} readOnly className="grow" />
                </SettingsFieldRow>
              </SettingsSection>
            </>
          )
        : (
            <>
              {config.defaultRetrieval && (
                <>
                  <SettingsDivider />
                  <SettingsSection
                    title="Default retrieval"
                    description="Default retrieval depth and ranking policy used by apps and workflows."
                  >
                    <SettingsFieldRow label="Retrieval depth">
                      <Select
                        items={retrievalModeOptions}
                        value={retrievalMode}
                        onValueChange={(value) => {
                          if (value !== null)
                            setRetrievalMode(value as RetrievalDepth)
                        }}
                      >
                        <SelectTrigger size="large" aria-label="Retrieval depth" className="w-full max-w-[320px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {retrievalModeOptions.map(option => (
                            <SelectItem key={option.value} value={option.value}>
                              <SelectItemText>{option.label}</SelectItemText>
                              <SelectItemIndicator />
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </SettingsFieldRow>
                    <SettingsFieldRow label="Top K">
                      <Slider className="w-full max-w-[320px]" value={topK} onValueChange={setTopK} min={1} max={20} />
                    </SettingsFieldRow>
                    <SettingsFieldRow label="Rerank">
                      <div className="flex h-7 items-center">
                        <Switch
                          size="md"
                          checked={rerankEnabled}
                          onCheckedChange={setRerankEnabled}
                          aria-label="Rerank"
                        />
                      </div>
                    </SettingsFieldRow>
                    {config.defaultRetrieval.multimodalEnabled !== undefined && (
                      <SettingsFieldRow label="Multimodal retrieval">
                        <div className="flex h-7 items-center">
                          <Switch
                            size="md"
                            checked={multimodalEnabled}
                            onCheckedChange={setMultimodalEnabled}
                            aria-label="Multimodal retrieval"
                          />
                        </div>
                      </SettingsFieldRow>
                    )}
                    <SettingsFieldRow label="Score threshold">
                      <div className="flex flex-col gap-y-2">
                        <Switch
                          size="md"
                          checked={scoreThresholdEnabled}
                          onCheckedChange={setScoreThresholdEnabled}
                          aria-label="Score threshold"
                        />
                        {scoreThresholdEnabled && (
                          <Slider
                            className="w-full max-w-[320px]"
                            value={scoreThreshold}
                            onValueChange={setScoreThreshold}
                            min={0}
                            max={1}
                            step={0.01}
                          />
                        )}
                      </div>
                    </SettingsFieldRow>
                  </SettingsSection>
                </>
              )}

              {config.processingAndIndex && (
                <>
                  <SettingsDivider />
                  <SettingsSection
                    title="Processing and index"
                    description="Parser, chunking, embedding, and index strategy for this knowledge base."
                  >
                    <SettingsFieldRow label="Parser policy">
                      <Input value={parserPolicy} onChange={event => setParserPolicy(event.target.value)} className="grow" />
                    </SettingsFieldRow>
                    <SettingsFieldRow label="Chunking">
                      <Input value={chunking} onChange={event => setChunking(event.target.value)} className="grow" />
                    </SettingsFieldRow>
                    <SettingsFieldRow label="Embedding">
                      <Input value={embedding} onChange={event => setEmbedding(event.target.value)} className="grow" />
                    </SettingsFieldRow>
                    <SettingsFieldRow label="Index strategy">
                      <Input value={indexStrategy} onChange={event => setIndexStrategy(event.target.value)} className="grow" />
                    </SettingsFieldRow>
                    {config.processingAndIndex.pipelineNote && (
                      <SettingsFieldRow label="Pipeline">
                        <Input value={pipelineNote} onChange={event => setPipelineNote(event.target.value)} className="grow" />
                      </SettingsFieldRow>
                    )}
                  </SettingsSection>
                </>
              )}

              {config.retention && (
                <>
                  <SettingsDivider />
                  <SettingsSection
                    title="Retention"
                    description="Retention policy for raw documents, artifacts, traces, and projections."
                  >
                    <SettingsFieldRow label="Raw document retention">
                      <RetentionSelect value={rawDocumentRetention} options={retentionOptions} onChange={setRawDocumentRetention} />
                    </SettingsFieldRow>
                    <SettingsFieldRow label="Parse artifact versions">
                      <ArtifactVersionSelect value={artifactVersions} onChange={setArtifactVersions} />
                    </SettingsFieldRow>
                    <SettingsFieldRow label="Answer trace retention">
                      <RetentionSelect value={answerTraceRetention} options={dayRetentionOptions} onChange={(value) => {
                        if (value !== null)
                          setAnswerTraceRetention(value)
                      }}
                      />
                    </SettingsFieldRow>
                    <SettingsFieldRow label="Evidence cache retention">
                      <RetentionSelect value={evidenceCacheRetention} options={dayRetentionOptions} onChange={(value) => {
                        if (value !== null)
                          setEvidenceCacheRetention(value)
                      }}
                      />
                    </SettingsFieldRow>
                    <SettingsFieldRow label="Inactive projection retention">
                      <RetentionSelect value={inactiveProjectionRetention} options={dayRetentionOptions} onChange={(value) => {
                        if (value !== null)
                          setInactiveProjectionRetention(value)
                      }}
                      />
                    </SettingsFieldRow>
                    <SettingsFieldRow label="Session inactivity">
                      <SessionInactivitySelect value={sessionInactivityMinutes} onChange={setSessionInactivityMinutes} />
                    </SettingsFieldRow>
                  </SettingsSection>
                </>
              )}
            </>
          )}

      {config.advanced && (
        <>
          <SettingsDivider />
          <SettingsSection
            title="Advanced"
            description="Admin-only health checks and cleanup summaries."
          >
            <SettingsFieldRow label="Health check">
              <div className="flex flex-col gap-y-2">
                <p className="system-xs-regular text-text-tertiary">{config.advanced.healthCheckSummary}</p>
                <Button variant="secondary" className="w-fit">
                  Run health check
                </Button>
              </div>
            </SettingsFieldRow>
            <SettingsFieldRow label="Cleanup">
              <div className="flex flex-col gap-y-2">
                <p className="system-xs-regular text-text-tertiary">{config.advanced.cleanupSummary}</p>
                <Button variant="secondary" className="w-fit">
                  Review cleanup
                </Button>
              </div>
            </SettingsFieldRow>
          </SettingsSection>
        </>
      )}

      <SettingsDivider />
      <div className={rowClass}>
        <div className="flex h-7 w-[180px] shrink-0 items-center pt-1" />
        <div className="grow">
          <Button variant="primary" className="min-w-24" loading={saving} onClick={handleSave}>
            Save
          </Button>
        </div>
      </div>
    </div>
  )
}

function RetentionSelect({
  value,
  options,
  onChange,
}: {
  value: number | null
  options: { value: string; label: string; days: number | null }[]
  onChange: (value: number | null) => void
}) {
  const selectedValue = options.find(option => option.days === value)?.value ?? 'forever'
  return (
    <Select
      items={options}
      value={selectedValue}
      onValueChange={(next) => {
        const option = options.find(entry => entry.value === next)
        if (option)
          onChange(option.days)
      }}
    >
      <SelectTrigger size="large" aria-label="Retention" className="w-full max-w-[320px]">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {options.map(option => (
          <SelectItem key={option.value} value={option.value}>
            <SelectItemText>{option.label}</SelectItemText>
            <SelectItemIndicator />
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

function ArtifactVersionSelect({
  value,
  onChange,
}: {
  value: number
  onChange: (value: number) => void
}) {
  return (
    <Select
      items={artifactVersionOptions}
      value={String(value)}
      onValueChange={(next) => {
        const option = artifactVersionOptions.find(entry => entry.value === next)
        if (option)
          onChange(option.versions)
      }}
    >
      <SelectTrigger size="large" aria-label="Parse artifact versions" className="w-full max-w-[320px]">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {artifactVersionOptions.map(option => (
          <SelectItem key={option.value} value={option.value}>
            <SelectItemText>{option.label}</SelectItemText>
            <SelectItemIndicator />
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

function SessionInactivitySelect({
  value,
  onChange,
}: {
  value: number
  onChange: (value: number) => void
}) {
  return (
    <Select
      items={sessionInactivityOptions}
      value={String(value)}
      onValueChange={(next) => {
        const option = sessionInactivityOptions.find(entry => entry.value === next)
        if (option)
          onChange(option.minutes)
      }}
    >
      <SelectTrigger size="large" aria-label="Session inactivity" className="w-full max-w-[320px]">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {sessionInactivityOptions.map(option => (
          <SelectItem key={option.value} value={option.value}>
            <SelectItemText>{option.label}</SelectItemText>
            <SelectItemIndicator />
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

function SettingsRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className={rowClass}>
      <div className={labelClass}>
        <div className="system-sm-semibold text-text-secondary">{label}</div>
      </div>
      <div className="grow">{children}</div>
    </div>
  )
}

function SettingsFieldRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex gap-x-2">
      <div className="flex h-7 w-[140px] shrink-0 items-center system-sm-medium text-text-secondary">{label}</div>
      <div className="grow">{children}</div>
    </div>
  )
}

function SettingsSection({
  title,
  description,
  children,
}: {
  title: string
  description?: string
  children: React.ReactNode
}) {
  return (
    <div className={rowClass}>
      <div className={sectionLabelClass}>
        <div className="flex h-8 items-center system-sm-semibold text-text-secondary">{title}</div>
        {description && <div className="body-xs-regular text-text-tertiary">{description}</div>}
      </div>
      <div className="flex grow flex-col gap-y-3">{children}</div>
    </div>
  )
}

function SettingsDivider() {
  return <div className="my-1 h-px bg-divider-subtle" />
}
