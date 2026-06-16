import { useCallback, useEffect, useState } from 'react'
import type { RetentionPolicy } from '../../api-types'
import { MockServiceError } from '../../api-types'
import { getRetentionPolicy, patchRetentionPolicy } from '../../mock-services'

export type RetentionScope = 'tenant' | 'knowledge_space'

function mockErrorMessage(error: unknown) {
  if (error instanceof MockServiceError)
    return `${error.status}: ${error.message}`
  if (error instanceof Error)
    return error.message
  return 'Unexpected mock service error'
}

function policiesMatch(spacePolicy: RetentionPolicy, tenantPolicy: RetentionPolicy) {
  return spacePolicy.parseArtifactVersions === tenantPolicy.parseArtifactVersions
    && spacePolicy.rawDocumentRetentionDays === tenantPolicy.rawDocumentRetentionDays
    && spacePolicy.answerTraceRetentionDays === tenantPolicy.answerTraceRetentionDays
    && spacePolicy.evidenceCacheRetentionDays === tenantPolicy.evidenceCacheRetentionDays
    && spacePolicy.inactiveProjectionRetentionDays === tenantPolicy.inactiveProjectionRetentionDays
    && spacePolicy.sessionInactivityMinutes === tenantPolicy.sessionInactivityMinutes
}

export function useRetentionSettings(spaceId: string, enabled: boolean) {
  const [scope, setScope] = useState<RetentionScope>('knowledge_space')
  const [tenantPolicy, setTenantPolicy] = useState<RetentionPolicy | null>(null)
  const [spacePolicy, setSpacePolicy] = useState<RetentionPolicy | null>(null)
  const [loading, setLoading] = useState(enabled)
  const [error, setError] = useState<string | null>(null)

  const [rawDocumentRetention, setRawDocumentRetention] = useState<number | null>(null)
  const [artifactVersions, setArtifactVersions] = useState(5)
  const [answerTraceRetention, setAnswerTraceRetention] = useState(30)
  const [evidenceCacheRetention, setEvidenceCacheRetention] = useState(7)
  const [inactiveProjectionRetention, setInactiveProjectionRetention] = useState(90)
  const [sessionInactivityMinutes, setSessionInactivityMinutes] = useState(1440)

  const applyPolicyToForm = useCallback((policy: RetentionPolicy) => {
    setRawDocumentRetention(policy.rawDocumentRetentionDays)
    setArtifactVersions(policy.parseArtifactVersions)
    setAnswerTraceRetention(policy.answerTraceRetentionDays)
    setEvidenceCacheRetention(policy.evidenceCacheRetentionDays)
    setInactiveProjectionRetention(policy.inactiveProjectionRetentionDays)
    setSessionInactivityMinutes(policy.sessionInactivityMinutes)
  }, [])

  const refresh = useCallback(async () => {
    if (!enabled)
      return

    setLoading(true)
    setError(null)
    try {
      const [tenant, space] = await Promise.all([
        getRetentionPolicy('tenant'),
        getRetentionPolicy('knowledge_space', spaceId),
      ])
      setTenantPolicy(tenant)
      setSpacePolicy(space)
    }
    catch (cause) {
      setError(mockErrorMessage(cause))
    }
    finally {
      setLoading(false)
    }
  }, [enabled, spaceId])

  useEffect(() => {
    void refresh()
  }, [refresh])

  useEffect(() => {
    const active = scope === 'tenant' ? tenantPolicy : spacePolicy
    if (active)
      applyPolicyToForm(active)
  }, [applyPolicyToForm, scope, spacePolicy, tenantPolicy])

  const inheritsWorkspaceDefault = scope === 'knowledge_space'
    && !!tenantPolicy
    && !!spacePolicy
    && policiesMatch(spacePolicy, tenantPolicy)

  const hasSpaceOverride = scope === 'knowledge_space'
    && !!tenantPolicy
    && !!spacePolicy
    && !policiesMatch(spacePolicy, tenantPolicy)

  const save = async () => {
    const patch = {
      parseArtifactVersions: artifactVersions,
      rawDocumentRetentionDays: rawDocumentRetention,
      answerTraceRetentionDays: answerTraceRetention,
      evidenceCacheRetentionDays: evidenceCacheRetention,
      inactiveProjectionRetentionDays: inactiveProjectionRetention,
      sessionInactivityMinutes,
    }

    const updated = await patchRetentionPolicy(
      scope,
      patch,
      scope === 'knowledge_space' ? spaceId : undefined,
    )

    if (scope === 'tenant')
      setTenantPolicy(updated)
    else
      setSpacePolicy(updated)

    return updated
  }

  return {
    scope,
    setScope,
    tenantPolicy,
    spacePolicy,
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
    save,
    refresh,
  }
}
