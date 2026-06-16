import { Button } from '@langgenius/dify-ui/button'
import { cn } from '@langgenius/dify-ui/cn'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@langgenius/dify-ui/dropdown-menu'
import { Input } from '@langgenius/dify-ui/input'
import {
  RiAddLine,
  RiBookOpenLine,
  RiCloseCircleFill,
  RiFileTextFill,
  RiFunctionAddLine,
  RiMoreFill,
  RiRobot2Fill,
  RiSearchLine,
} from '@remixicon/react'
import { StatusBadge } from '../../components/badges'
import { itemHasSourceError, type DatasetItem } from '../../fixtures/items'
import type { DatasetCreateMode } from '../../types/create'

export function SearchInput({ value, onChange, className = 'w-52' }: { value: string; onChange: (value: string) => void; className?: string }) {
  return (
    <div className="relative">
      <RiSearchLine className="pointer-events-none absolute top-1/2 left-2 size-4 -translate-y-1/2 text-components-input-text-placeholder" />
      <Input
        size="medium"
        className={cn('pr-7 pl-7', className)}
        value={value}
        onChange={event => onChange(event.target.value)}
        placeholder="Search"
      />
      {!!value && (
        <button
          type="button"
          aria-label="Clear"
          className="absolute top-1/2 right-2 flex size-4 -translate-y-1/2 items-center justify-center text-components-input-text-placeholder hover:text-components-input-text-filled"
          onClick={() => onChange('')}
        >
          <RiCloseCircleFill className="size-4" />
        </button>
      )}
    </div>
  )
}

export function FilterChip({ iconClassName, label }: { iconClassName: string; label: string }) {
  return (
    <button type="button" className="flex h-8 items-center rounded-lg border-[0.5px] border-transparent bg-components-input-bg-normal px-2 text-[13px] leading-4 text-text-tertiary transition-colors hover:bg-components-input-bg-hover">
      <span aria-hidden className={cn('h-4 w-4 shrink-0 text-text-tertiary', iconClassName)} />
      <span className="px-1 text-text-tertiary">{label}</span>
      <span aria-hidden className="i-ri-arrow-down-s-line h-4 w-4 shrink-0 text-text-tertiary" />
    </button>
  )
}

export function NewDatasetCard({ onOpenCreate }: { onOpenCreate: (mode: DatasetCreateMode) => void }) {
  return (
    <div className="flex h-[190px] flex-col gap-y-0.5 rounded-xl bg-background-default-dimmed">
      <div className="flex grow flex-col items-center justify-center p-2">
        <CreateOption Icon={RiAddLine} text="Create Knowledge" onClick={() => onOpenCreate('standard')} />
        <CreateOption Icon={RiFunctionAddLine} text="Create from Knowledge Pipeline" onClick={() => onOpenCreate('pipeline')} />
      </div>
      <div className="border-t-[0.5px] border-divider-subtle p-2">
        <CreateOption
          Icon={() => <span className="i-custom-vender-solid-development-api-connection-mod size-4 shrink-0" />}
          text="Connect to an External Knowledge Base"
          onClick={() => onOpenCreate('external')}
        />
      </div>
    </div>
  )
}

export function CreateOption({
  Icon,
  text,
  onClick,
}: {
  Icon: React.ComponentType<{ className?: string }>
  text: string
  onClick: () => void
}) {
  return (
    <button type="button" onClick={onClick} className="flex w-full items-center gap-x-2 rounded-lg bg-transparent px-4 py-2 text-text-tertiary shadow-shadow-shadow-3 hover:bg-background-default-dodge hover:text-text-secondary hover:shadow-xs">
      <Icon className="size-4 shrink-0" />
      <span className="grow text-left system-sm-medium">{text}</span>
    </button>
  )
}

export function ListCard({
  item,
  onOpen,
  onDelete,
  deleting,
}: {
  item: DatasetItem
  onOpen: () => void
  onDelete?: () => void
  deleting?: boolean
}) {
  const attentionSignals = (item.listHints?.length
    ? [
        ...item.listHints,
        itemHasSourceError(item) && !item.listHints.some(hint => hint.includes('source')) ? 'source sync error' : null,
      ]
    : [
        itemHasSourceError(item) ? 'source sync error' : null,
        item.indexStatus === 'Stale' ? 'index rebuild needed' : null,
        item.indexStatus === 'Failed' ? 'index failed' : null,
        item.evidenceStatus === 'Conflict' ? 'conflicting evidence' : null,
        item.evidenceStatus === 'Partial' ? 'partial evidence' : null,
      ]).filter(Boolean) as string[]

  return (
    <div className="relative w-full min-w-0">
      <button
        type="button"
        onClick={onOpen}
        className="group relative flex h-47.5 w-full min-w-0 cursor-pointer flex-col rounded-xl border-[0.5px] border-solid border-components-card-border bg-components-card-bg text-left shadow-xs shadow-shadow-shadow-3 transition-all duration-200 ease-in-out hover:shadow-md hover:shadow-shadow-shadow-5"
      >
      {item.cornerLabel && (
        <div className="absolute top-0 right-0 z-5 rounded-tr-xl rounded-bl-lg bg-components-badge-bg-blue-solid px-2 py-0.5 system-2xs-medium-uppercase text-text-primary-on-surface">
          {item.cornerLabel}
        </div>
      )}
      <div className="flex items-center gap-x-3 px-4 pt-4 pb-2">
        <div className="relative shrink-0">
          <span
            className="relative flex size-10 shrink-0 grow-0 items-center justify-center overflow-hidden rounded-[10px] border-[0.5px] border-divider-regular text-[24px] leading-none"
            style={{ background: item.iconBackground }}
          >
            {item.icon}
          </span>
          <div className="absolute -right-1 -bottom-1 z-5 flex size-4 items-center justify-center rounded bg-components-avatar-shape-fill-stop-100 shadow-xs">
            <RiBookOpenLine className="size-3 text-components-icon-bg-orange-solid" />
          </div>
        </div>
        <div className="flex grow flex-col gap-y-1 overflow-hidden py-px pr-4">
          <div className="truncate system-md-semibold text-text-secondary" title={item.name}>
            {item.name}
          </div>
          <div className="flex items-center gap-1 text-[10px] leading-[18px] font-medium text-text-tertiary">
            <div className="truncate" title={item.authorName}>{item.authorName}</div>
            <div>·</div>
            <div className="truncate" title={item.editedAt}>{item.editedAt}</div>
          </div>
        </div>
      </div>
      <div className="line-clamp-2 h-10 px-4 py-1 system-xs-regular text-text-tertiary" title={item.description}>
        {item.description}
      </div>
      {attentionSignals.length > 0
        ? (
            <div className="flex flex-wrap gap-1 px-4 pb-1">
              {attentionSignals.map(signal => (
                <StatusBadge key={signal} label={signal} tone="warn" />
              ))}
            </div>
          )
        : (
            <div className="truncate px-4 pb-1 system-xs-regular text-text-tertiary" title={datasetListSummary(item)}>
              {datasetListSummary(item)}
            </div>
          )}
      <div className="w-full px-3">
        <div className="relative flex w-full gap-1 overflow-hidden py-1">
          {item.tags.map(tag => (
            <span key={tag} className="inline-flex h-6 max-w-[112px] shrink-0 items-center rounded-md border border-divider-subtle bg-components-badge-bg-gray-soft px-2 system-2xs-medium-uppercase text-text-tertiary">
              {tag}
            </span>
          ))}
          <div className="pointer-events-none absolute top-0 right-0 h-full w-20 bg-tag-selector-mask-bg" />
        </div>
      </div>
      <div className="flex items-center gap-x-3 px-4 pt-2 pb-3 text-text-tertiary">
        <div className="flex items-center gap-x-1">
          <RiFileTextFill className="size-3 text-text-quaternary" />
          <span className="system-xs-medium">{item.documentsLabel}</span>
        </div>
        {item.provider !== 'external' && (
          <div className="flex items-center gap-x-1">
            <RiRobot2Fill className="size-3 text-text-quaternary" />
            <span className="system-xs-medium">{item.appCount}</span>
          </div>
        )}
        <span className="system-xs-regular text-divider-deep">/</span>
        <span className="system-xs-regular">{item.updatedAt}</span>
      </div>
      </button>
      {onDelete && (
        <div className="absolute top-3 right-3 z-10">
          <DropdownMenu>
            <DropdownMenuTrigger
              aria-label="Knowledge actions"
              className="inline-flex size-8 items-center justify-center rounded-lg bg-components-card-bg/90 text-text-tertiary shadow-xs hover:bg-state-base-hover"
              onClick={event => event.stopPropagation()}
            >
              <RiMoreFill className="size-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent placement="bottom-end">
              <DropdownMenuItem disabled={deleting} onClick={onDelete}>
                {deleting ? 'Deleting…' : 'Delete knowledge space'}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}
    </div>
  )
}

export function datasetListSummary(item: DatasetItem) {
  if (item.provider === 'external') {
    return [
      'External Knowledge API',
      item.documentsLabel,
      item.indexStatus,
      item.evidenceStatus,
      item.usageLabel,
    ].join(' · ')
  }
  return [
    `${item.sourceCount} sources`,
    `${item.documentsLabel} docs`,
    item.indexStatus,
    item.evidenceStatus,
    item.usageLabel,
  ].join(' · ')
}
