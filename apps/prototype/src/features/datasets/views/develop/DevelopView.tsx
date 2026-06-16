import type { DatasetItem } from '../../fixtures/items'
import { DevelopAgentAccessPanel } from './DevelopAgentAccessPanel'

export function DevelopView({ item }: { item: DatasetItem }) {
  return (
    <div className="pr-6">
      <DevelopAgentAccessPanel item={item} />
    </div>
  )
}
