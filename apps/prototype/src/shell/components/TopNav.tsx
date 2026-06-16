import { cn } from '@langgenius/dify-ui/cn'

export function TopNav({
  icon,
  activeIcon,
  text,
  active = false,
  onClick,
}: {
  icon: React.ReactNode
  activeIcon?: React.ReactNode
  text: string
  active?: boolean
  onClick?: () => void
}) {
  return (
    <div className={cn(
      'flex h-8 max-w-167.5 shrink-0 items-center rounded-xl px-0.5 text-sm font-medium max-[1024px]:max-w-100',
      active && 'bg-components-main-nav-nav-button-bg-active font-semibold shadow-md',
      !active && 'hover:bg-components-main-nav-nav-button-bg-hover',
    )}
    >
      <button type="button" aria-current={active ? 'page' : undefined} onClick={onClick} className={cn('flex h-7 cursor-pointer items-center rounded-[10px] px-2.5', active ? 'text-components-main-nav-nav-button-text-active' : 'text-components-main-nav-nav-button-text')}>
        <span>{active ? activeIcon ?? icon : icon}</span>
        <span className="ml-2 max-[1024px]:hidden">{text}</span>
      </button>
    </div>
  )
}
