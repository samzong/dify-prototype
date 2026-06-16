import { cn } from '@langgenius/dify-ui/cn'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@langgenius/dify-ui/dropdown-menu'
import { RiAddLine, RiArrowDownSLine } from '@remixicon/react'
import { useMemo, useState } from 'react'
import type { DatasetScreen } from '../../../routing/dataset-routes'
import type { DatasetItem } from '../fixtures/items'
import type { DatasetCreateMode } from '../types/create'

export function DatasetsTopNav({
  active,
  screen,
  items,
  onActivate,
  onGoToList,
  onSelectDataset,
  onOpenCreate,
}: {
  active: boolean
  screen: DatasetScreen
  items: DatasetItem[]
  onActivate: () => void
  onGoToList: () => void
  onSelectDataset: (id: string) => void
  onOpenCreate: (mode: DatasetCreateMode) => void
}) {
  const [hovered, setHovered] = useState(false)
  const curNav = useMemo(() => {
    if (screen.kind !== 'detail')
      return undefined
    return items.find(entry => entry.id === screen.datasetId)
  }, [items, screen])

  return (
    <div className={cn(
      'flex h-8 max-w-167.5 shrink-0 items-center rounded-xl px-0.5 text-sm font-medium max-[1024px]:max-w-100',
      active && 'bg-components-main-nav-nav-button-bg-active font-semibold shadow-md',
      !curNav && !active && 'hover:bg-components-main-nav-nav-button-bg-hover',
    )}
    >
      <button
        type="button"
        aria-current={active ? 'page' : undefined}
        onClick={() => {
          onActivate()
          onGoToList()
        }}
        className={cn(
          'flex h-7 cursor-pointer items-center rounded-[10px] px-2.5',
          active ? 'text-components-main-nav-nav-button-text-active' : 'text-components-main-nav-nav-button-text',
          curNav && active && 'hover:bg-components-main-nav-nav-button-bg-active-hover',
        )}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        {hovered && curNav
          ? <span className="i-custom-vender-line-arrows-arrow-narrow-left size-4" />
          : active
            ? <span className="i-ri-book-2-fill size-4" />
            : <span className="i-ri-book-2-line size-4" />}
        <span className="ml-2 max-[1024px]:hidden">Knowledge</span>
      </button>
      {curNav && active && (
        <>
          <div className="font-light text-divider-deep">/</div>
          <NavSelector curNav={curNav} items={items} onSelect={onSelectDataset} onOpenCreate={onOpenCreate} />
        </>
      )}
    </div>
  )
}

function NavSelector({
  curNav,
  items,
  onSelect,
  onOpenCreate,
}: {
  curNav: DatasetItem
  items: DatasetItem[]
  onSelect: (id: string) => void
  onOpenCreate: (mode: DatasetCreateMode) => void
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="group flex h-7 max-w-[200px] items-center rounded-[10px] px-2.5 hover:bg-components-main-nav-nav-button-bg-active-hover">
        <span className="truncate system-sm-medium text-components-main-nav-nav-button-text-active">{curNav.name}</span>
        <RiArrowDownSLine className="ml-1 size-4 shrink-0 text-text-tertiary" />
      </DropdownMenuTrigger>
      <DropdownMenuContent placement="bottom-start" className="w-60">
        {items.map(item => (
          <DropdownMenuItem key={item.id} onClick={() => onSelect(item.id)}>
            <span className="mr-2">{item.icon}</span>
            <span className="truncate">{item.name}</span>
          </DropdownMenuItem>
        ))}
        <DropdownMenuItem onClick={() => onOpenCreate('standard')}>
          <RiAddLine className="size-4" />
          Create Knowledge
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
