import { cn } from '@langgenius/dify-ui/cn'
import { appTypeIconClassNames, appTypeLabels } from '../constants'
import type { AppMode } from '../fixtures/apps'

export function AppTypeIcon({ type, className, wrapperClassName }: { type: AppMode; className?: string; wrapperClassName?: string }) {
  const [iconClassName, backgroundClassName] = appTypeIconClassNames[type].split(' ')

  return (
    <div className={cn('inline-flex size-5 items-center justify-center rounded-md border border-divider-regular', backgroundClassName, wrapperClassName)} title={appTypeLabels[type]}>
      <span className={cn(iconClassName, 'text-components-avatar-shape-fill-stop-100', className ?? 'size-3.5')} />
    </div>
  )
}
