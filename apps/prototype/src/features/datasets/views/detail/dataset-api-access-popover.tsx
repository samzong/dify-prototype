import { cn } from '@langgenius/dify-ui/cn'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@langgenius/dify-ui/popover'
import { Switch } from '@langgenius/dify-ui/switch'
import { RiArrowRightUpLine, RiBookOpenLine } from '@remixicon/react'
import type { DatasetItem } from '../../fixtures/items'

const KNOWLEDGE_API_REFERENCE_URL = 'https://api.knowledge.dify.ai/v1/openapi.json'

export function DatasetApiAccessPopover({
  item,
  onUpdateItem,
}: {
  item: DatasetItem
  onUpdateItem: (updater: (current: DatasetItem) => DatasetItem) => void
}) {
  const isExternal = item.provider === 'external'
  const enabled = isExternal
    ? item.settingsConfig.apiAccess.externalApiEnabled
    : item.settingsConfig.apiAccess.serviceApiEnabled

  const setEnabled = (checked: boolean) => {
    onUpdateItem(current => ({
      ...current,
      apiEnabled: checked,
      settingsConfig: {
        ...current.settingsConfig,
        apiAccess: isExternal
          ? { ...current.settingsConfig.apiAccess, externalApiEnabled: checked }
          : { ...current.settingsConfig.apiAccess, serviceApiEnabled: checked },
      },
    }))
  }

  return (
    <Popover>
      <PopoverTrigger
        render={(
          <button
            type="button"
            className="flex h-8 w-full items-center gap-2 rounded-lg border border-components-panel-border px-3 text-left hover:bg-components-menu-item-bg-hover"
          >
            <span className="i-custom-vender-solid-development-api-connection-mod size-4 shrink-0 text-text-secondary" />
            <div className="grow system-sm-medium text-text-secondary">API Access</div>
            <span className={cn('size-2 rounded-full', enabled ? 'bg-util-colors-green-green-500' : 'bg-util-colors-warning-warning-500')} />
          </button>
        )}
      />
      <PopoverContent placement="top" popupClassName="w-[280px] rounded-xl border border-components-panel-border bg-components-panel-bg p-0 shadow-lg">
        <div className="space-y-3 p-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className={cn('size-2 rounded-full', enabled ? 'bg-util-colors-green-green-500' : 'bg-util-colors-warning-warning-500')} />
              <span className={cn(
                'system-xs-semibold-uppercase',
                enabled ? 'text-util-colors-green-green-600' : 'text-util-colors-warning-warning-600',
              )}
              >
                {enabled ? 'Enabled' : 'Disabled'}
              </span>
            </div>
            <Switch
              size="md"
              checked={enabled}
              onCheckedChange={setEnabled}
              aria-label="API Access"
            />
          </div>
          <p className="system-xs-regular leading-5 text-text-tertiary">
            {isExternal
              ? 'This external knowledge base is accessible via the partner API.'
              : 'This knowledge base is accessible via the Service API.'}
          </p>
        </div>
        <a
          href={KNOWLEDGE_API_REFERENCE_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 border-t border-divider-subtle px-4 py-3 system-xs-medium text-text-secondary hover:bg-state-base-hover"
        >
          <RiBookOpenLine className="size-3.5 shrink-0 text-text-tertiary" />
          <span className="grow">API Reference</span>
          <RiArrowRightUpLine className="size-3.5 shrink-0 text-text-quaternary" />
        </a>
      </PopoverContent>
    </Popover>
  )
}
