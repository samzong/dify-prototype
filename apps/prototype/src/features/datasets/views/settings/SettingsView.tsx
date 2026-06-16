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
import type { DatasetItem, RetrievalDepth } from '../../fixtures/items'

import {
  ArtifactVersionSelect,
  dayRetentionOptions,
  permissionFromItem,
  permissionOptions,
  retentionOptions,
  retrievalModeOptions,
  rowClass,
  SettingsDivider,
  SettingsFieldRow,
  SettingsRow,
  SettingsSection,
  type Permission,
} from './settings-layout'
import { SettingsDatasetSections } from './settings-sections'

export function SettingsView({ item }: { item: DatasetItem }) {
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

      <SettingsDatasetSections
        item={item}
        isExternal={isExternal}
        config={config}
        retrievalMode={retrievalMode}
        setRetrievalMode={setRetrievalMode}
        topK={topK}
        setTopK={setTopK}
        rerankEnabled={rerankEnabled}
        setRerankEnabled={setRerankEnabled}
        multimodalEnabled={multimodalEnabled}
        setMultimodalEnabled={setMultimodalEnabled}
        scoreThreshold={scoreThreshold}
        setScoreThreshold={setScoreThreshold}
        scoreThresholdEnabled={scoreThresholdEnabled}
        setScoreThresholdEnabled={setScoreThresholdEnabled}
        parserPolicy={parserPolicy}
        setParserPolicy={setParserPolicy}
        chunking={chunking}
        setChunking={setChunking}
        embedding={embedding}
        setEmbedding={setEmbedding}
        indexStrategy={indexStrategy}
        setIndexStrategy={setIndexStrategy}
        pipelineNote={pipelineNote}
        setPipelineNote={setPipelineNote}
        rawDocumentRetention={rawDocumentRetention}
        setRawDocumentRetention={setRawDocumentRetention}
        artifactVersions={artifactVersions}
        setArtifactVersions={setArtifactVersions}
        answerTraceRetention={answerTraceRetention}
        setAnswerTraceRetention={setAnswerTraceRetention}
        evidenceCacheRetention={evidenceCacheRetention}
        setEvidenceCacheRetention={setEvidenceCacheRetention}
        inactiveProjectionRetention={inactiveProjectionRetention}
        setInactiveProjectionRetention={setInactiveProjectionRetention}
        sessionInactivityMinutes={sessionInactivityMinutes}
        setSessionInactivityMinutes={setSessionInactivityMinutes}
      />

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
