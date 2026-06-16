import { Button } from '@langgenius/dify-ui/button'
import { Input } from '@langgenius/dify-ui/input'
import { toast } from '@langgenius/dify-ui/toast'
import { RiCloseCircleFill, RiSearchLine } from '@remixicon/react'
import { useMemo, useState } from 'react'
import { DataSourceIcon } from '../../shared/icons/dify-provider-icons'
import { prototypeDataSources } from './fixtures/settings-data'

function DataSourceCard({
  source,
}: {
  source: typeof prototypeDataSources[number]
}) {
  return (
    <div className="rounded-xl border-[0.5px] border-divider-regular bg-third-party-model-bg-default shadow-xs">
      <div className="flex items-start gap-3 p-4">
        <DataSourceIcon
          id={source.id}
          name={source.name}
          org={source.org}
          pluginName={source.pluginName}
        />
        <div className="min-w-0 grow">
          <div className="flex items-center gap-2">
            <div className="system-md-semibold text-text-secondary">{source.name}</div>
            <span className="inline-flex h-[18px] items-center rounded-[5px] border border-divider-deep bg-components-badge-bg-dimm px-[5px] system-2xs-medium-uppercase text-text-tertiary">
              {source.version}
            </span>
          </div>
          <div className="mt-1 system-xs-regular text-text-tertiary">{source.description}</div>
        </div>
        <Button
          variant={source.configured ? 'secondary' : 'primary'}
          size="small"
          onClick={() => toast.info(source.configured ? 'Configure data source' : 'Connect data source')}
        >
          {source.configured ? 'Configure' : 'Connect'}
        </Button>
      </div>
    </div>
  )
}

export function DataSourceSettingsView() {
  const [searchText, setSearchText] = useState('')
  const filtered = useMemo(() => {
    const query = searchText.trim().toLowerCase()
    if (!query)
      return prototypeDataSources
    return prototypeDataSources.filter(source => source.name.toLowerCase().includes(query))
  }, [searchText])

  return (
    <div className="relative">
      <div className="mb-2 flex items-center justify-between gap-3">
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
        <Button variant="secondary" size="small" className="size-8 px-2" aria-label="Plugin update settings">
          <span className="i-ri-settings-3-line size-4" />
        </Button>
      </div>
      <div className="flex flex-col gap-2">
        {filtered.map(source => (
          <DataSourceCard key={source.id} source={source} />
        ))}
      </div>
    </div>
  )
}
