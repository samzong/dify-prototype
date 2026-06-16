import { cn } from '@langgenius/dify-ui/cn'
import { RiCheckLine, RiStoreLine } from '@remixicon/react'

export function InstallDataSourceCard({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex min-h-[96px] items-start gap-2 rounded-xl border border-dashed border-components-option-card-option-border bg-components-option-card-option-bg p-3 text-left hover:bg-components-option-card-bg-hover"
    >
      <div className="flex size-8 shrink-0 items-center justify-center rounded-lg border border-components-panel-border bg-background-default-dodge">
        <RiStoreLine className="size-4 text-text-tertiary" />
      </div>
      <div className="min-w-0">
        <div className="system-sm-medium text-text-secondary">Install more data sources</div>
        <div className="mt-0.5 system-xs-regular text-text-tertiary">Add providers from Marketplace before connecting them here.</div>
      </div>
    </button>
  )
}

export function SourceSetupCard({
  label,
  description,
  selected,
  icon: Icon,
  onClick,
  onAfterClick,
}: {
  label: string
  description: string
  selected: boolean
  icon: React.ComponentType<{ className?: string }>
  onClick: () => void
  onAfterClick?: () => void
}) {
  return (
    <button
      type="button"
      onClick={() => {
        onClick()
        onAfterClick?.()
      }}
      className={cn(
        'relative flex min-h-[96px] items-start gap-2 rounded-xl border p-3 text-left',
        selected
          ? 'border-components-option-card-option-selected-border bg-components-option-card-option-selected-bg ring-[0.5px] ring-components-option-card-option-selected-border'
          : 'border-components-option-card-option-border bg-components-option-card-option-bg hover:bg-components-option-card-bg-hover',
      )}
    >
      <div className="flex size-8 shrink-0 items-center justify-center rounded-lg border border-components-panel-border bg-background-default-dodge">
        <Icon className="size-4 text-text-tertiary" />
      </div>
      <div className="min-w-0 pr-5">
        <div className="system-sm-medium text-text-secondary">{label}</div>
        <div className="mt-0.5 system-xs-regular text-text-tertiary">{description}</div>
      </div>
      {selected && (
        <div className="absolute top-3 right-3 flex size-4 items-center justify-center rounded-full bg-components-button-primary-bg">
          <RiCheckLine className="size-3 text-text-primary-on-surface" />
        </div>
      )}
    </button>
  )
}
