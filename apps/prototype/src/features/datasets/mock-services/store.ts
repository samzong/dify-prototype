import type { KnowledgeScenarioBundle } from '../fixtures/scenarios'
import { resolveScenario } from '../fixtures/scenarios'
import { cloneJson } from './helpers'
import { getActiveKnowledgeScenario } from './scenario'

let activeScenarioId = getActiveKnowledgeScenario()
let store = cloneJson(resolveScenario(activeScenarioId))

function syncFromActiveScenario() {
  const nextId = getActiveKnowledgeScenario()
  if (nextId === activeScenarioId)
    return

  activeScenarioId = nextId
  store = cloneJson(resolveScenario(nextId))
}

export function getKnowledgeMockStore(): KnowledgeScenarioBundle {
  syncFromActiveScenario()
  return store
}

export function resetKnowledgeMockStore(scenarioId = getActiveKnowledgeScenario()) {
  activeScenarioId = scenarioId
  store = cloneJson(resolveScenario(scenarioId))
  return store
}

export function mutateKnowledgeMockStore(mutator: (draft: KnowledgeScenarioBundle) => void) {
  syncFromActiveScenario()
  mutator(store)
  return store
}

export function getActiveScenarioMeta() {
  syncFromActiveScenario()
  return { id: store.id, label: store.label }
}
