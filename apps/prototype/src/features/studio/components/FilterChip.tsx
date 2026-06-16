import { cn } from '@langgenius/dify-ui/cn'

export function FilterChip({ iconClassName, label }: { iconClassName: string; label: string }) {
  return (
    <button type="button" className="flex h-8 items-center rounded-lg border-[0.5px] border-transparent bg-components-input-bg-normal px-2 text-[13px] leading-4 text-text-tertiary transition-colors hover:bg-components-input-bg-hover">
      <span aria-hidden className={cn('h-4 w-4 shrink-0 text-text-tertiary', iconClassName)} />
      <span className="px-1 text-text-tertiary">{label}</span>
      <span aria-hidden className="i-ri-arrow-down-s-line h-4 w-4 shrink-0 text-text-tertiary" />
    </button>
  )
}
