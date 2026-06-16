import { useEffect, useState } from 'react'
import type { GraphTraverseResult } from '../../api-types'
import { MockServiceError } from '../../api-types'
import { StatusBadge } from '../../components/badges'
import { SideDrawer } from '../../components/side-drawer'
import { EmptyPanel } from '../../components/panel'
import type { DatasetItem } from '../../fixtures/items'
import { PROTOTYPE_ENTITY_IDS } from '../../fixtures/scenarios'
import { resolveKnowledgeSpaceId } from '../../fixtures/knowledge-space-bridge'
import { traverseGraph } from '../../mock-services'

function mockErrorMessage(error: unknown) {
  if (error instanceof MockServiceError)
    return `${error.status}: ${error.message}`
  if (error instanceof Error)
    return error.message
  return 'Unexpected mock service error'
}

export function GraphContextDrawer({
  open,
  item,
  entityId = PROTOTYPE_ENTITY_IDS.enterpriseRefundPolicy,
  contextLabel = 'Enterprise refund policy',
  onClose,
}: {
  open: boolean
  item: DatasetItem
  entityId?: string
  contextLabel?: string
  onClose: () => void
}) {
  const spaceId = resolveKnowledgeSpaceId(item.id)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<GraphTraverseResult | null>(null)

  useEffect(() => {
    if (!open)
      return

    let cancelled = false
    setLoading(true)
    setError(null)
    void traverseGraph(spaceId, entityId, { depth: 2 })
      .then((response) => {
        if (!cancelled)
          setResult(response)
      })
      .catch((cause) => {
        if (!cancelled)
          setError(mockErrorMessage(cause))
      })
      .finally(() => {
        if (!cancelled)
          setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [entityId, open, spaceId])

  return (
    <SideDrawer
      open={open}
      title="Related knowledge graph"
      description={`Entity context for ${contextLabel}`}
      onClose={onClose}
      panelClassName="max-w-lg"
    >
      {loading && <EmptyPanel text="Loading related entities…" />}
      {!loading && error && <EmptyPanel text={error} />}
      {!loading && !error && result && (
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <StatusBadge label={`${result.entities.length} entities`} tone="info" />
            <StatusBadge label={`${result.relations.length} relations`} tone="neutral" />
            <StatusBadge label={`depth ${result.metrics.depthReached}`} tone="neutral" />
          </div>
          <div>
            <div className="mb-2 system-xs-semibold-uppercase text-text-tertiary">Entities</div>
            <ul className="space-y-2">
              {result.entities.map(entity => (
                <li key={entity.id} className="rounded-lg border border-divider-subtle bg-background-default-subtle px-3 py-2">
                  <div className="system-sm-semibold text-text-secondary">{entity.name}</div>
                  <div className="mt-1 system-xs-regular text-text-quaternary">{entity.type}</div>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <div className="mb-2 system-xs-semibold-uppercase text-text-tertiary">Relations</div>
            {result.relations.length
              ? (
                  <ul className="space-y-2">
                    {result.relations.map(relation => (
                      <li key={relation.id} className="rounded-lg border border-divider-subtle bg-background-default-subtle px-3 py-2 system-xs-regular text-text-secondary">
                        {relation.type.replace(/_/g, ' ')}
                      </li>
                    ))}
                  </ul>
                )
              : <EmptyPanel text="No relations in this slice." />}
          </div>
        </div>
      )}
    </SideDrawer>
  )
}
