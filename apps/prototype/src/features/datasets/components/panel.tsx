import { cn } from '@langgenius/dify-ui/cn'
import type { BadgeTone } from '../fixtures/items'
import { StatusBadge } from './badges'

export function Panel({
  title,
  badge,
  badgeTone = 'neutral',
  children,
  action,
}: {
  title: string
  badge?: string
  badgeTone?: BadgeTone
  children: React.ReactNode
  action?: React.ReactNode
}) {
  return (
    <article className="overflow-hidden rounded-xl border border-components-panel-border bg-components-panel-bg shadow-xs">
      <div className="flex min-h-12 items-center justify-between border-b border-divider-subtle px-4">
        <h3 className="system-sm-semibold text-text-secondary">{title}</h3>
        <div className="flex items-center gap-2">
          {badge && <StatusBadge label={badge} tone={badgeTone} />}
          {action}
        </div>
      </div>
      <div className="space-y-2 p-4">{children}</div>
    </article>
  )
}

export function TaskRow({
  title,
  detail,
  tone,
  onClick,
}: {
  title: string
  detail: string
  tone: BadgeTone
  onClick?: () => void
}) {
  const content = (
    <>
      <div className="flex items-center justify-between gap-2">
        <div className="system-sm-semibold text-text-secondary">{title}</div>
        <StatusBadge label={tone === 'good' ? 'Done' : tone === 'info' ? 'Running' : 'Action'} tone={tone} />
      </div>
      <div className="mt-1 system-xs-regular text-text-tertiary">{detail}</div>
    </>
  )

  if (!onClick) {
    return (
      <div className="rounded-lg border border-divider-subtle bg-background-default-subtle p-3">
        {content}
      </div>
    )
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full rounded-lg border border-divider-subtle bg-background-default-subtle p-3 text-left hover:bg-state-base-hover"
    >
      {content}
    </button>
  )
}

export function EmptyPanel({ text }: { text: string }) {
  return <p className="system-sm-regular text-text-tertiary">{text}</p>
}

export function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-lg border border-divider-subtle bg-background-default-subtle px-3 py-2">
      <span className="system-xs-medium text-text-tertiary">{label}</span>
      <span className="system-sm-regular text-text-secondary">{value}</span>
    </div>
  )
}

export function ActionToast({ message, visible }: { message: string; visible: boolean }) {
  if (!visible)
    return null
  return (
    <div className="fixed right-6 bottom-6 z-60 rounded-xl border border-components-panel-border bg-components-panel-bg px-4 py-3 shadow-lg">
      <p className="system-sm-medium text-text-secondary">{message}</p>
    </div>
  )
}

export function SegmentedMode<T extends string>({
  options,
  value,
  onChange,
}: {
  options: readonly T[]
  value: T
  onChange: (value: T) => void
}) {
  return (
    <div className="inline-flex gap-0.5 rounded-lg bg-components-main-nav-nav-button-bg-hover p-0.5">
      {options.map(option => (
        <button
          key={option}
          type="button"
          onClick={() => onChange(option)}
          className={cn(
            'h-7 rounded-[10px] px-3 system-sm-medium',
            value === option
              ? 'bg-components-main-nav-nav-button-bg-active font-semibold text-components-main-nav-nav-button-text-active shadow-md'
              : 'text-components-main-nav-nav-button-text hover:bg-components-main-nav-nav-button-bg-hover',
          )}
        >
          {option}
        </button>
      ))}
    </div>
  )
}
