import type { KnowledgeScenarioBundle } from '../fixtures/scenarios'
import { resolveScenario } from '../fixtures/scenarios'
import { cloneJson } from './helpers'
import { seedScenarioFromFixtures } from './seed'
import { getActiveKnowledgeScenario } from './scenario'

function materializeScenario(scenarioId: ReturnType<typeof getActiveKnowledgeScenario>) {
  return seedScenarioFromFixtures(cloneJson(resolveScenario(scenarioId)))
}

let activeScenarioId = getActiveKnowledgeScenario()
let store = materializeScenario(activeScenarioId)

function syncFromActiveScenario() {
  const nextId = getActiveKnowledgeScenario()
  if (nextId === activeScenarioId)
    return

  activeScenarioId = nextId
  store = materializeScenario(nextId)
}

export function getKnowledgeMockStore(): KnowledgeScenarioBundle {
  syncFromActiveScenario()
  return store
}

export function resetKnowledgeMockStore(scenarioId = getActiveKnowledgeScenario()) {
  activeScenarioId = scenarioId
  store = materializeScenario(scenarioId)
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
