import { cn } from '@langgenius/dify-ui/cn'
import type { BadgeTone } from '../fixtures/items'

export const badgeToneClasses: Record<BadgeTone, string> = {
  good: 'bg-util-colors-green-green-50 text-util-colors-green-green-600',
  warn: 'bg-util-colors-warning-warning-50 text-util-colors-warning-warning-600',
  bad: 'bg-util-colors-red-red-50 text-util-colors-red-red-600',
  info: 'bg-components-badge-bg-blue-soft text-text-accent',
  neutral: 'border border-divider-subtle bg-components-badge-bg-gray-soft text-text-tertiary',
  purple: 'bg-util-colors-violet-violet-50 text-util-colors-violet-violet-600',
}

export function StatusBadge({ label, tone }: { label: string; tone: BadgeTone }) {
  return (
    <span className={cn('inline-flex h-5 items-center rounded-md px-1.5 system-2xs-medium-uppercase', badgeToneClasses[tone])}>
      {label}
    </span>
  )
}

export function sourceStatusTone(status: string): BadgeTone {
  if (status === 'Active')
    return 'good'
  if (status === 'Syncing')
    return 'info'
  if (status === 'Error')
    return 'bad'
  return 'neutral'
}

export function indexTone(status: string): BadgeTone {
  if (status === 'ready' || status === 'Ready')
    return 'good'
  if (status === 'building' || status === 'Building' || status === 'pending' || status === 'Pending')
    return 'info'
  if (status === 'stale' || status === 'failed' || status === 'Stale' || status === 'Failed')
    return 'bad'
  return 'neutral'
}

export function parserTone(status: string): BadgeTone {
  if (status === 'parsed' || status === 'Parsed')
    return 'good'
  if (status === 'pending' || status === 'Pending')
    return 'info'
  if (status === 'failed' || status === 'Failed')
    return 'bad'
  return 'neutral'
}

export function evidenceUseTone(status: string): BadgeTone {
  if (status === 'Included')
    return 'good'
  if (status === 'Pending')
    return 'info'
  if (status.startsWith('Excluded'))
    return 'warn'
  return 'neutral'
}
