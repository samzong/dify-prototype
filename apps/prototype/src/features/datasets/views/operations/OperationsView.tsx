import { resolveKnowledgeSpaceId } from '../../fixtures/knowledge-space-bridge'
import type { DatasetItem } from '../../fixtures/items'
import { OperationsSections } from './OperationsSections'

export function OperationsView({ item }: { item: DatasetItem }) {
  const spaceId = resolveKnowledgeSpaceId(item.id)
  return <OperationsSections spaceId={spaceId} />
}
