import { StatusBadge } from '../../components/badges'
import { EmptyPanel, SegmentedMode } from '../../components/panel'
import {
  ArtifactVersionSelect,
  dayRetentionOptions,
  retentionOptions,
  SessionInactivitySelect,
  SettingsFieldRow,
  SettingsSection,
  RetentionSelect,
} from './settings-layout'
import type { useRetentionSettings } from './useRetentionSettings'

type RetentionSettings = ReturnType<typeof useRetentionSettings>

export function SettingsRetentionSection({
  retention,
}: {
  retention: RetentionSettings
}) {
  const {
    scope,
    setScope,
    loading,
    error,
    inheritsWorkspaceDefault,
    hasSpaceOverride,
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
  } = retention

  return (
    <>
      <SettingsSection
        title="Retention"
        description="Retention policy for raw documents, artifacts, traces, and projections."
      >
        <SettingsFieldRow label="Policy scope">
          <div className="flex flex-col gap-2">
            <SegmentedMode
              options={['Workspace default', 'This knowledge base'] as const}
              value={scope === 'tenant' ? 'Workspace default' : 'This knowledge base'}
              onChange={(label) => {
                setScope(label === 'Workspace default' ? 'tenant' : 'knowledge_space')
              }}
            />
            {scope === 'knowledge_space' && hasSpaceOverride && (
              <StatusBadge label="Overrides workspace default" tone="info" />
            )}
            {scope === 'knowledge_space' && inheritsWorkspaceDefault && (
              <StatusBadge label="Matches workspace default" tone="neutral" />
            )}
          </div>
        </SettingsFieldRow>

        {loading && <EmptyPanel text="Loading retention policy…" />}
        {error && !loading && <EmptyPanel text={error} />}

        {!loading && !error && (
          <>
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
          </>
        )}
      </SettingsSection>
    </>
  )
}
