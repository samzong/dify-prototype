import { useState } from 'react'
import type { DatasetItem, RetrievalDepthOption } from '../../fixtures/items'
import { GraphContextDrawer } from './graph-context-drawer'
import { QuickTestPanel } from './QuickTestPanel'

export function EvidenceView({
  item,
  initialMode,
  initialQuery,
  onOpenQuality,
}: {
  item: DatasetItem
  initialMode?: RetrievalDepthOption
  initialQuery?: string
  onOpenQuality?: () => void
}) {
  const [graphDrawerOpen, setGraphDrawerOpen] = useState(false)

  return (
    <div className="pr-6">
      <QuickTestPanel
        item={item}
        initialMode={initialMode}
        initialQuery={initialQuery}
        onOpenQuality={onOpenQuality}
        onViewGraph={() => setGraphDrawerOpen(true)}
      />

      <GraphContextDrawer
        open={graphDrawerOpen}
        item={item}
        onClose={() => setGraphDrawerOpen(false)}
      />
    </div>
  )
}
