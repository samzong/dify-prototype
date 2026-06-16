import type { KnowledgeScenarioId } from '../api-types'
import { KNOWLEDGE_SCENARIO_OPTIONS } from '../fixtures/scenarios'

const SCENARIO_QUERY_KEY = 'kpScenario'
const SCENARIO_STORAGE_KEY = 'dify-prototype:kp-scenario'

export function isKnowledgeScenarioId(value: string): value is KnowledgeScenarioId {
  return KNOWLEDGE_SCENARIO_OPTIONS.some(option => option.id === value)
}

export function readScenarioFromUrl(): KnowledgeScenarioId | null {
  if (typeof window === 'undefined')
    return null

  const value = new URL(window.location.href).searchParams.get(SCENARIO_QUERY_KEY)
  if (!value || !isKnowledgeScenarioId(value))
    return null

  return value
}

export function readScenarioFromStorage(): KnowledgeScenarioId | null {
  if (typeof window === 'undefined')
    return null

  const value = window.localStorage.getItem(SCENARIO_STORAGE_KEY)
  if (!value || !isKnowledgeScenarioId(value))
    return null

  return value
}

export function getActiveKnowledgeScenario(): KnowledgeScenarioId {
  return readScenarioFromUrl() ?? readScenarioFromStorage() ?? 'default'
}

export function setActiveKnowledgeScenario(id: KnowledgeScenarioId) {
  if (typeof window === 'undefined')
    return

  window.localStorage.setItem(SCENARIO_STORAGE_KEY, id)
  const url = new URL(window.location.href)
  url.searchParams.set(SCENARIO_QUERY_KEY, id)
  window.history.replaceState(window.history.state, '', url.toString())
}

export function buildScenarioUrl(id: KnowledgeScenarioId) {
  const url = new URL(typeof window !== 'undefined' ? window.location.href : 'http://127.0.0.1:5173/')
  url.searchParams.set(SCENARIO_QUERY_KEY, id)
  return url.toString()
}

export const knowledgeScenarioControls = {
  queryKey: SCENARIO_QUERY_KEY,
  storageKey: SCENARIO_STORAGE_KEY,
  options: KNOWLEDGE_SCENARIO_OPTIONS,
}
