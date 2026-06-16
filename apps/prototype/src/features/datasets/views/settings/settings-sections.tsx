import { Input } from '@langgenius/dify-ui/input'
import { Slider } from '@langgenius/dify-ui/slider'
import { Switch } from '@langgenius/dify-ui/switch'
import type { DatasetItem, RetrievalDepth } from '../../fixtures/items'
import {
  SettingsDivider,
  SettingsFieldRow,
  SettingsSection,
} from './settings-layout'
import { SettingsInternalSections } from './settings-internal-section'

export type SettingsSectionProps = {
  item: DatasetItem
  isExternal: boolean
  config: DatasetItem['settingsConfig']
  retrievalMode: RetrievalDepth
  setRetrievalMode: (value: RetrievalDepth) => void
  topK: number
  setTopK: (value: number) => void
  rerankEnabled: boolean
  setRerankEnabled: (value: boolean) => void
  multimodalEnabled: boolean
  setMultimodalEnabled: (value: boolean) => void
  scoreThreshold: number
  setScoreThreshold: (value: number) => void
  scoreThresholdEnabled: boolean
  setScoreThresholdEnabled: (value: boolean) => void
  parserPolicy: string
  setParserPolicy: (value: string) => void
  chunking: string
  setChunking: (value: string) => void
  embedding: string
  setEmbedding: (value: string) => void
  indexStrategy: string
  setIndexStrategy: (value: string) => void
  pipelineNote: string
  setPipelineNote: (value: string) => void
  rawDocumentRetention: number | null
  setRawDocumentRetention: (value: number | null) => void
  artifactVersions: number
  setArtifactVersions: (value: number) => void
  answerTraceRetention: number
  setAnswerTraceRetention: (value: number) => void
  evidenceCacheRetention: number
  setEvidenceCacheRetention: (value: number) => void
  inactiveProjectionRetention: number
  setInactiveProjectionRetention: (value: number) => void
  sessionInactivityMinutes: number
  setSessionInactivityMinutes: (value: number) => void
}

export function SettingsDatasetSections(props: SettingsSectionProps) {
  const {
    isExternal,
    config,
    topK,
    setTopK,
    scoreThreshold,
    setScoreThreshold,
    scoreThresholdEnabled,
    setScoreThresholdEnabled,
  } = props

  if (isExternal && config.externalRetrieval) {
    return (
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
  }

  return <SettingsInternalSections {...props} />
}
