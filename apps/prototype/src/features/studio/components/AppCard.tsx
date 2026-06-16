import { RiBuilding4Line, RiDoorLockLine, RiGlobalLine } from '@remixicon/react'
import type { PrototypeApp } from '../fixtures/apps'
import { AppTypeIcon } from './AppTypeIcon'

export function AppCard({ app, onOpenWorkflow }: { app: PrototypeApp; onOpenWorkflow: () => void }) {
  return (
    <div className="group relative col-span-1 inline-flex h-[160px] cursor-pointer flex-col rounded-xl border border-solid border-components-card-border bg-components-card-bg shadow-sm transition-shadow duration-200 ease-in-out hover:shadow-lg" onClick={app.mode === 'workflow' ? onOpenWorkflow : undefined}>
      <div className="flex h-[66px] shrink-0 grow-0 items-center gap-3 px-[14px] pt-[14px] pb-3">
        <div className="relative shrink-0">
          <span className="relative flex h-10 w-10 shrink-0 grow-0 items-center justify-center overflow-hidden rounded-[10px] border-[0.5px] border-divider-regular text-[24px] leading-none" style={{ background: app.iconBackground }}>
            {app.icon}
          </span>
          <AppTypeIcon type={app.mode} wrapperClassName="absolute -right-0.5 -bottom-0.5 size-4 shadow-sm" className="size-3" />
        </div>
        <div className="w-0 grow py-px">
          <div className="flex items-center text-sm/5 font-semibold text-text-secondary">
            <div className="truncate" title={app.name}>{app.name}</div>
          </div>
          <div className="flex items-center gap-1 text-[10px] leading-[18px] font-medium text-text-tertiary">
            <div className="truncate" title={app.authorName}>{app.authorName}</div>
            <div>·</div>
            <div className="truncate" title={app.editedAt}>{app.editedAt}</div>
          </div>
        </div>
        <div className="flex h-full shrink-0 flex-col items-end justify-between py-px">
          <div className="flex size-5 items-center justify-center">
            {app.access === 'public' && <RiGlobalLine className="size-4 text-text-quaternary" />}
            {app.access === 'organization' && <RiBuilding4Line className="size-4 text-text-quaternary" />}
            {app.access === 'private' && <RiDoorLockLine className="size-4 text-text-quaternary" />}
          </div>
        </div>
      </div>
      <div className="h-[90px] px-[14px] text-xs leading-normal text-text-tertiary">
        <div className="line-clamp-2" title={app.description}>{app.description}</div>
      </div>
      <div className="absolute right-0 bottom-1 left-0 flex h-[42px] shrink-0 items-center pt-1 pr-[6px] pb-[6px] pl-[14px]">
        <div className="flex w-0 grow items-center gap-1 overflow-hidden">
          {app.tags.map(tag => (
            <span key={tag} className="inline-flex h-5 max-w-[92px] shrink-0 items-center rounded-md border border-divider-subtle bg-components-badge-bg-gray-soft px-1.5 system-2xs-medium-uppercase text-text-tertiary">
              {tag}
            </span>
          ))}
        </div>
        <button type="button" aria-label="More" className="flex size-8 items-center justify-center rounded-lg text-text-tertiary opacity-0 hover:bg-state-base-hover group-hover:opacity-100">
          <span className="i-ri-more-fill size-4" />
        </button>
      </div>
    </div>
  )
}
