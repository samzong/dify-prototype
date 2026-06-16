import { Button } from '@langgenius/dify-ui/button'
import { Checkbox } from '@langgenius/dify-ui/checkbox'
import { cn } from '@langgenius/dify-ui/cn'
import { RiBookOpenLine, RiEqualizer2Line } from '@remixicon/react'
import type { WebsiteCrawlOptions, WebsiteCrawlResult } from './source-types'

export function WebsiteCrawlHeader({
  title,
  configureLabel,
  docTitle,
  docLink,
  onConfigure,
}: {
  title: string
  configureLabel: string
  docTitle: string
  docLink: string
  onConfigure: () => void
}) {
  return (
    <div className="flex items-center gap-x-2">
      <div className="flex min-w-0 grow items-center gap-x-1">
        <div className="truncate system-md-semibold text-text-secondary" title={title}>{title}</div>
        <div className="mx-1 h-3.5 w-px shrink-0 bg-divider-regular" />
        <Button variant="secondary" size="small" className="gap-x-0.5 px-1.5" onClick={onConfigure}>
          <RiEqualizer2Line className="size-4" />
          <span className="system-xs-medium">{configureLabel}</span>
        </Button>
      </div>
      <a
        className="flex shrink-0 items-center gap-x-1 overflow-hidden system-xs-medium text-text-accent"
        href={docLink}
        target="_blank"
        rel="noopener noreferrer"
      >
        <RiBookOpenLine className="size-3.5 shrink-0" />
        <span className="grow truncate" title={docTitle}>{docTitle}</span>
      </a>
    </div>
  )
}

export function WebsiteOptionsWrap({
  open,
  onOpenChange,
  children,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  children: React.ReactNode
}) {
  return (
    <div className={cn('mt-4', open ? 'mb-3' : 'mb-0')}>
      <button
        type="button"
        className="flex h-[26px] w-full cursor-pointer items-center gap-x-1 py-1 select-none"
        onClick={() => onOpenChange(!open)}
      >
        <div className="flex grow items-center">
          <RiEqualizer2Line className="mr-1 size-4 text-text-secondary" />
          <span className="text-[13px] leading-4 font-semibold text-text-secondary uppercase">Options</span>
        </div>
        <span className={cn('i-ri-arrow-right-s-line size-4 shrink-0 text-text-tertiary', open && 'rotate-90')} />
      </button>
      {open && (
        <div className="mb-4 space-y-2">
          {children}
        </div>
      )}
    </div>
  )
}

export function WebsiteOptionCheckbox({
  label,
  checked,
  onChange,
  tooltip,
}: {
  label: string
  checked: boolean
  onChange: (checked: boolean) => void
  tooltip?: string
}) {
  return (
    <div className="flex min-h-7 items-center">
      <label className="flex min-w-0 cursor-pointer items-center">
        <Checkbox checked={checked} onCheckedChange={value => onChange(value === true)} />
        <span className="ml-2 min-w-0 text-left text-[13px] leading-4 font-medium text-text-secondary">{label}</span>
      </label>
      {tooltip && (
        <span className="ml-1 size-4 text-text-tertiary" title={tooltip}>
          <span className="i-ri-question-line size-4" />
        </span>
      )}
    </div>
  )
}

export function WebsiteOptionField({
  label,
  value,
  onChange,
  placeholder = '',
  isNumber = false,
  required = false,
  tooltip,
}: {
  label: string
  value: string | number
  onChange: (value: string | number) => void
  placeholder?: string
  isNumber?: boolean
  required?: boolean
  tooltip?: string
}) {
  return (
    <div>
      <div className="flex py-[7px]">
        <div className="flex h-4 items-center text-[13px] font-semibold text-text-secondary">
          {label}
        </div>
        {required && <span className="ml-0.5 text-xs font-semibold text-text-destructive">*</span>}
        {tooltip && (
          <span className="ml-1 size-4 text-text-tertiary" title={tooltip}>
            <span className="i-ri-question-line size-4" />
          </span>
        )}
      </div>
      <input
        type={isNumber ? 'number' : 'text'}
        min={isNumber ? 0 : undefined}
        value={value}
        onChange={(event) => {
          if (isNumber) {
            const nextValue = event.target.value
            onChange(nextValue === '' ? '' : Math.max(0, Number.parseInt(nextValue, 10)))
            return
          }
          onChange(event.target.value)
        }}
        className="flex h-8 w-full rounded-lg border border-transparent bg-components-input-bg-normal p-2 system-xs-regular text-components-input-text-filled caret-[#295eff] placeholder:text-components-input-text-placeholder hover:border hover:border-components-input-border-hover hover:bg-components-input-bg-hover focus:border focus:border-components-input-border-active focus:bg-components-input-bg-active focus:shadow-xs focus:shadow-shadow-shadow-3 focus-visible:outline-hidden"
        placeholder={placeholder}
      />
    </div>
  )
}

export function WebsiteCrawling({ crawledNum, totalNum }: { crawledNum: number; totalNum: number }) {
  return (
    <div className="mt-3 rounded-b-xl">
      <div className="flex h-[34px] items-center border-y-[0.5px] border-divider-regular px-4 text-xs text-text-tertiary shadow-xs shadow-shadow-shadow-3">
        Total pages scraped:
        {' '}
        {crawledNum}
        /
        {totalNum}
      </div>
      <div className="p-2">
        {[0, 1, 2, 3].map(index => (
          <div className="flex items-start gap-3 py-[9px]" key={index}>
            <div className="mt-0.5 size-4 shrink-0 rounded bg-text-quaternary opacity-25" />
            <div className="min-w-0 grow space-y-2">
              <div className="h-2.5 w-2/3 rounded bg-text-quaternary opacity-25" />
              <div className="h-2 w-11/12 rounded bg-text-quaternary opacity-20" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export function WebsiteCrawledResult({
  results,
  checkedUrls,
  selectedSet,
  onCheckedUrlsChange,
  onPreview,
}: {
  results: WebsiteCrawlResult[]
  checkedUrls: string[]
  selectedSet: Set<string>
  onCheckedUrlsChange: (urls: string[]) => void
  onPreview: (result: WebsiteCrawlResult) => void
}) {
  const isCheckAll = results.length > 0 && checkedUrls.length === results.length

  return (
    <div className="mt-3 border-t-[0.5px] border-divider-regular shadow-xs shadow-shadow-shadow-3">
      <div className="flex h-[34px] items-center justify-between px-4">
        <WebsiteOptionCheckbox
          label={isCheckAll ? 'Reset All' : 'Select All'}
          checked={isCheckAll}
          onChange={() => onCheckedUrlsChange(isCheckAll ? [] : results.map(result => result.source_url))}
        />
        <div className="text-xs text-text-tertiary">Scraped {results.length} pages in total within 1.4s</div>
      </div>
      <div className="p-2">
        {results.map(result => (
          <WebsiteCrawledResultItem
            key={result.source_url}
            result={result}
            checked={selectedSet.has(result.source_url)}
            onCheckedChange={(checked) => {
              if (checked) {
                onCheckedUrlsChange([...checkedUrls, result.source_url])
                return
              }
              onCheckedUrlsChange(checkedUrls.filter(url => url !== result.source_url))
            }}
            onPreview={() => onPreview(result)}
          />
        ))}
      </div>
    </div>
  )
}

export function WebsiteCrawledResultItem({
  result,
  checked,
  onCheckedChange,
  onPreview,
}: {
  result: WebsiteCrawlResult
  checked: boolean
  onCheckedChange: (checked: boolean) => void
  onPreview: () => void
}) {
  return (
    <div className="group rounded-lg p-2 hover:bg-state-base-hover">
      <div className="relative flex">
        <label className="flex min-w-0 grow cursor-pointer">
          <div className="flex h-5 items-center">
            <Checkbox
              className="mr-2 shrink-0"
              checked={checked}
              onCheckedChange={value => onCheckedChange(value === true)}
            />
          </div>
          <div className="flex min-w-0 grow flex-col">
            <div className="truncate text-sm font-medium text-text-secondary" title={result.title}>
              {result.title}
            </div>
            <div className="mt-0.5 truncate text-xs text-text-tertiary" title={result.source_url}>
              {result.source_url}
            </div>
          </div>
        </label>
        <Button
          onClick={onPreview}
          className="top-0 right-0 hidden h-6 px-1.5 text-xs font-medium uppercase group-hover:absolute group-hover:block"
        >
          Preview
        </Button>
      </div>
    </div>
  )
}
