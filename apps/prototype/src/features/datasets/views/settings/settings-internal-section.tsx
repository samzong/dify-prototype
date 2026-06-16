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
import type { DatasetItem, RetrievalDepth } from '../../fixtures/items'
import {
  ArtifactVersionSelect,
  dayRetentionOptions,
  retentionOptions,
  retrievalModeOptions,
  RetentionSelect,
  SessionInactivitySelect,
  SettingsDivider,
  SettingsFieldRow,
  SettingsSection,
} from './settings-layout'
import type { SettingsSectionProps } from './settings-sections'

export function SettingsInternalSections(props: SettingsSectionProps) {
  const {
    config,
    retrievalMode,
    setRetrievalMode,
    topK,
    setTopK,
    rerankEnabled,
    setRerankEnabled,
    multimodalEnabled,
    setMultimodalEnabled,
    scoreThreshold,
    setScoreThreshold,
    scoreThresholdEnabled,
    setScoreThresholdEnabled,
    parserPolicy,
    setParserPolicy,
    chunking,
    setChunking,
    embedding,
    setEmbedding,
    indexStrategy,
    setIndexStrategy,
    pipelineNote,
    setPipelineNote,
    rawDocumentRetention,
    setRawDocumentRetention,
    artifactVersions,
    setArtifactVersions,
    answerTraceRetention,
    setAnswerTraceRetention,
    evidenceCacheRetention,
    setEvidenceCacheRetention,
    inactiveProjectionRetention,
    setInactiveProjectionRetention,
    sessionInactivityMinutes,
    setSessionInactivityMinutes,
  } = props

  return (
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

      <SettingsDivider />
    </>
  )
}
