import type { DatasetDetailTab, DatasetItem } from '../../fixtures/items'

export function OverviewRuntimeRiskBanner({
  item,
  onNavigate,
}: {
  item: DatasetItem
  onNavigate: (tab: DatasetDetailTab) => void
}) {
  const risks: { text: string; tab?: DatasetDetailTab }[] = [
    item.indexStatus === 'Stale' && { text: 'Stale index may return outdated answers.', tab: 'documents' },
    item.indexStatus === 'Building' && { text: 'Index is still building. Workflow retrieval may be incomplete.', tab: 'documents' },
    item.blockers.some(blocker => blocker.title.toLowerCase().includes('conflict')) && { text: 'Evidence conflict detected.', tab: 'evidence' },
    item.type === 'Multimodal' && { text: 'Attachment variable required for image retrieval.', tab: 'settings' },
    item.type === 'External' && { text: 'External score normalization or rerank recommended.', tab: 'settings' },
  ].filter(Boolean) as { text: string; tab?: DatasetDetailTab }[]

  if (!risks.length)
    return null

  return (
    <div className="rounded-xl border border-components-panel-border bg-background-default-subtle p-4">
      <div className="system-xs-semibold-uppercase text-text-tertiary">Workflow runtime risks</div>
      <ul className="mt-2 space-y-1">
        {risks.map(risk => (
          <li key={risk.text}>
            <button
              type="button"
              className="flex w-full items-start gap-2 text-left system-sm-regular text-text-secondary hover:text-text-accent"
              onClick={() => risk.tab && onNavigate(risk.tab)}
            >
              <span className="mt-1 size-1.5 shrink-0 rounded-full bg-util-colors-warning-warning-500" />
              {risk.text}
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}
