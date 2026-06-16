import { cn } from '@langgenius/dify-ui/cn'
import type { DatasetDetailTab, DatasetItem } from '../../fixtures/items'
import type { NavItem } from '../../constants/detail-nav'

export function DatasetDetailSidebar({
  item,
  navItems,
  activeTab,
  onTabChange,
}: {
  item: DatasetItem
  navItems: NavItem[]
  activeTab: DatasetDetailTab
  onTabChange: (tab: DatasetDetailTab) => void
}) {
  return (
    <aside className="flex w-[216px] shrink-0 flex-col border-r border-divider-burn bg-background-default-subtle">
      <div className="p-2">
        <div className="relative flex flex-col gap-2 p-2">
          <div className="flex items-center gap-1">
            <span
              className="flex size-10 shrink-0 items-center justify-center rounded-[10px] border-[0.5px] border-divider-regular text-[24px] leading-none"
              style={{ background: item.iconBackground }}
            >
              {item.icon}
            </span>
          </div>
          <div className="flex flex-col gap-y-1 pb-0.5">
            <div className="truncate system-md-semibold text-text-secondary" title={item.name}>
              {item.name}
            </div>
            <div className="system-2xs-medium-uppercase text-text-tertiary">
              {item.provider === 'external'
                ? 'External Knowledge Base'
                : (
                    <div className="flex items-center gap-x-2">
                      <span>{item.docForm}</span>
                      {!!item.indexingText && <span>{item.indexingText}</span>}
                    </div>
                  )}
            </div>
          </div>
          {!!item.description && (
            <p className="line-clamp-3 system-xs-regular text-text-tertiary first-letter:capitalize">
              {item.description}
            </p>
          )}
        </div>
      </div>
      <div className="relative px-4 py-2">
        <div className="my-0 h-px bg-linear-to-r from-divider-subtle to-background-gradient-mask-transparent" />
      </div>
      <nav className="flex grow flex-col gap-y-0.5 px-3 py-2">
        {navItems.map(entry => (
          <DatasetNavLink
            key={entry.id}
            name={entry.label}
            active={activeTab === entry.id}
            icon={activeTab === entry.id ? entry.activeIcon : entry.icon}
            onClick={() => onTabChange(entry.id)}
          />
        ))}
      </nav>
      <DatasetSidebarExtra item={item} />
    </aside>
  )
}

export function DatasetNavLink({
  name,
  active,
  icon: Icon,
  onClick,
}: {
  name: string
  active: boolean
  icon: React.ComponentType<{ className?: string }>
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex h-8 items-center rounded-lg pl-3 pr-1',
        active
          ? 'border-b-[0.25px] border-l-[0.75px] border-r-[0.25px] border-t-[0.75px] border-effects-highlight-lightmode-off bg-components-menu-item-bg-active text-text-accent-light-mode-only system-sm-semibold'
          : 'text-components-menu-item-text system-sm-medium hover:bg-components-menu-item-bg-hover hover:text-components-menu-item-text-hover',
      )}
    >
      <Icon className="size-4 shrink-0" />
      <span className="ml-2 truncate">{name}</span>
    </button>
  )
}

export function DatasetSidebarExtra({ item }: { item: DatasetItem }) {
  return (
    <>
      <div className="flex items-center gap-x-0.5 p-2 pb-0">
        <div className="flex grow flex-col px-2 pt-1 pb-1.5">
          <div className="system-md-semibold-uppercase text-text-secondary">{item.documentsLabel}</div>
          <div className="system-2xs-medium-uppercase text-text-tertiary">Documents</div>
        </div>
        <div className="h-full w-px bg-divider-regular" />
        <div className="flex grow flex-col px-2 pt-1 pb-1.5">
          <div className="system-md-semibold-uppercase text-text-secondary">{item.appCount}</div>
          <div className="system-2xs-medium-uppercase text-text-tertiary">Related apps</div>
        </div>
      </div>
      <div className="p-3 pt-2">
        <div className="flex h-8 items-center gap-2 rounded-lg border border-components-panel-border px-3">
          <span className="i-custom-vender-solid-development-api-connection-mod size-4 shrink-0 text-text-secondary" />
          <div className="grow system-sm-medium text-text-secondary">API Access</div>
          <span className={cn('size-2 rounded-full', item.apiEnabled ? 'bg-util-colors-green-green-500' : 'bg-util-colors-warning-warning-500')} />
        </div>
      </div>
    </>
  )
}

export function PageHeader({ title, description }: { title: string; description: string }) {
  return (
    <div className="mb-4 flex flex-col justify-center">
      <h1 className="text-base font-semibold text-text-primary">{title}</h1>
      <p className="mt-0.5 text-[13px] leading-4 font-normal text-text-tertiary">{description}</p>
    </div>
  )
}
