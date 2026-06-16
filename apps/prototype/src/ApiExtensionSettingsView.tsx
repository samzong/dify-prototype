import { Button } from '@langgenius/dify-ui/button'
import { Input } from '@langgenius/dify-ui/input'
import { toast } from '@langgenius/dify-ui/toast'
import { RiCloseCircleFill, RiSearchLine } from '@remixicon/react'
import { useMemo, useState } from 'react'
import { prototypeApiExtensions } from './settings-data'

export function ApiExtensionSettingsView() {
  const [searchText, setSearchText] = useState('')
  const filtered = useMemo(() => {
    const query = searchText.trim().toLowerCase()
    if (!query)
      return prototypeApiExtensions
    return prototypeApiExtensions.filter(item =>
      item.name.toLowerCase().includes(query)
      || item.endpoint.toLowerCase().includes(query),
    )
  }, [searchText])

  return (
    <div className="relative">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="relative w-50 shrink-0">
          <RiSearchLine className="pointer-events-none absolute top-1/2 left-2 size-4 -translate-y-1/2 text-components-input-text-placeholder" />
          <Input
            size="medium"
            className="pr-7 pl-7"
            value={searchText}
            onChange={event => setSearchText(event.target.value)}
            placeholder="Search"
          />
          {!!searchText && (
            <button type="button" aria-label="Clear" className="absolute top-1/2 right-2 flex size-4 -translate-y-1/2 items-center justify-center" onClick={() => setSearchText('')}>
              <RiCloseCircleFill className="size-4 text-components-input-text-placeholder" />
            </button>
          )}
        </div>
        <Button variant="primary" onClick={() => toast.info('Create API extension dialog would open')}>
          <span className="mr-1 i-ri-add-line size-4" />
          Add API Extension
        </Button>
      </div>
      {filtered.length === 0
        ? (
            <div className="rounded-[10px] bg-workflow-process-bg p-4">
              <div className="system-sm-medium text-text-secondary">No API extensions yet</div>
              <p className="mt-1 system-xs-regular text-text-tertiary">Create an API-based extension to connect external services.</p>
            </div>
          )
        : (
            <div className="flex flex-col gap-2">
              {filtered.map(item => (
                <div
                  key={item.id}
                  className="group mb-2 flex items-center rounded-xl border-[0.5px] border-transparent bg-components-input-bg-normal px-4 py-2 hover:border-components-input-border-active hover:shadow-xs"
                >
                  <div className="min-w-0 grow">
                    <div className="mb-0.5 text-[13px] font-medium text-text-secondary">{item.name}</div>
                    <div className="truncate text-xs text-text-tertiary">{item.endpoint}</div>
                  </div>
                  <div className="pointer-events-none flex shrink-0 items-center gap-1 opacity-0 transition-opacity group-hover:pointer-events-auto group-hover:opacity-100">
                    <Button onClick={() => toast.info('Edit extension')}>
                      <span className="mr-1 i-ri-edit-line size-4" />
                      Edit
                    </Button>
                    <Button onClick={() => toast.success('Extension deleted')}>
                      <span className="mr-1 i-ri-delete-bin-line size-4" />
                      Delete
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
    </div>
  )
}
