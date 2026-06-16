import { Button } from '@langgenius/dify-ui/button'
import { Dialog, DialogCloseButton, DialogContent, DialogTitle } from '@langgenius/dify-ui/dialog'
import { Input } from '@langgenius/dify-ui/input'
import { toast } from '@langgenius/dify-ui/toast'
import { useState } from 'react'
import { websiteCrawlProviderDetails } from './source-options'
import type { WebsiteCrawlOptions, WebsiteCrawlResult, WebsiteCrawlStatus } from './source-types'
import {
  WebsiteCrawlHeader,
  WebsiteCrawledResult,
  WebsiteCrawling,
  WebsiteOptionCheckbox,
  WebsiteOptionField,
  WebsiteOptionsWrap,
} from './website-crawl-parts'

export function WebsiteCrawlSetup({
  provider,
  providerName,
  url,
  onUrlChange,
  options,
  onOptionsChange,
  optionsOpen,
  onOptionsOpenChange,
  status,
  results,
  checkedUrls,
  onCheckedUrlsChange,
  onRun,
}: {
  provider: string
  providerName: string
  url: string
  onUrlChange: (value: string) => void
  options: WebsiteCrawlOptions
  onOptionsChange: (options: WebsiteCrawlOptions) => void
  optionsOpen: boolean
  onOptionsOpenChange: (open: boolean) => void
  status: WebsiteCrawlStatus
  results: WebsiteCrawlResult[]
  checkedUrls: string[]
  onCheckedUrlsChange: (urls: string[]) => void
  onRun: () => void
}) {
  const [preview, setPreview] = useState<WebsiteCrawlResult | null>(null)
  const details = websiteCrawlProviderDetails[provider] ?? websiteCrawlProviderDetails.firecrawl
  const isJinaReader = provider === 'jina-reader'
  const crawlTotal = options.limit === '' ? 0 : Number(options.limit)
  const selectedSet = new Set(checkedUrls)

  const updateOption = <Key extends keyof WebsiteCrawlOptions>(key: Key, value: WebsiteCrawlOptions[Key]) => {
    onOptionsChange({
      ...options,
      [key]: value,
    })
  }

  return (
    <section>
      <WebsiteCrawlHeader
        title={details.title}
        configureLabel={details.configureLabel}
        docTitle={details.docTitle}
        docLink={details.docLink}
        onConfigure={() => toast.info(`${details.configureLabel} opened`)}
      />
      <div className="mt-2 overflow-hidden rounded-xl border border-components-panel-border bg-background-default-subtle">
        <div className="p-4 pb-0">
          <div className="flex items-center justify-between gap-x-2">
            <Input
              value={url}
              onChange={event => onUrlChange(event.target.value)}
              placeholder="https://docs.dify.ai"
              aria-label={`${providerName} root URL`}
              className="h-11 system-md-semibold"
            />
            <Button variant="primary" onClick={onRun} disabled={status === 'running'} className="h-11 min-w-20">
              {status === 'running'
                ? <span className="i-ri-loader-4-line size-4 animate-spin" />
                : 'Run'}
            </Button>
          </div>
          <WebsiteOptionsWrap open={optionsOpen} onOpenChange={onOptionsOpenChange}>
            <WebsiteOptionCheckbox
              label="Crawl sub-pages"
              checked={options.crawl_sub_pages}
              onChange={value => updateOption('crawl_sub_pages', value)}
            />
            {isJinaReader && (
              <WebsiteOptionCheckbox
                label="Use sitemap"
                checked={options.use_sitemap}
                onChange={value => updateOption('use_sitemap', value)}
                tooltip="Follow the sitemap to crawl the site. If not, Jina Reader will crawl iteratively based on page relevance, yielding fewer but higher-quality pages."
              />
            )}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <WebsiteOptionField
                label="Limit"
                required
                value={options.limit}
                isNumber
                onChange={value => updateOption('limit', value === '' ? '' : Number(value))}
              />
              {!isJinaReader && (
                <WebsiteOptionField
                  label="Max depth"
                  value={options.max_depth}
                  isNumber
                  tooltip="Maximum depth to crawl relative to the entered URL. Depth 0 just scrapes the entered URL."
                  onChange={value => updateOption('max_depth', value === '' ? '' : Number(value))}
                />
              )}
            </div>
            {!isJinaReader && (
              <>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <WebsiteOptionField
                    label="Exclude paths"
                    value={options.excludes}
                    placeholder="blog/*, /about/*"
                    onChange={value => updateOption('excludes', String(value))}
                  />
                  <WebsiteOptionField
                    label="Include only paths"
                    value={options.includes}
                    placeholder="articles/*"
                    onChange={value => updateOption('includes', String(value))}
                  />
                </div>
                <WebsiteOptionCheckbox
                  label="Extract only main content (no headers, navs, footers, etc.)"
                  checked={options.only_main_content}
                  onChange={value => updateOption('only_main_content', value)}
                />
              </>
            )}
          </WebsiteOptionsWrap>
        </div>

        {status === 'running' && <WebsiteCrawling crawledNum={1} totalNum={crawlTotal} />}
        {status === 'finished' && (
          <WebsiteCrawledResult
            results={results}
            checkedUrls={checkedUrls}
            selectedSet={selectedSet}
            onCheckedUrlsChange={onCheckedUrlsChange}
            onPreview={setPreview}
          />
        )}
      </div>

      <Dialog open={!!preview} onOpenChange={(open) => {
        if (!open)
          setPreview(null)
      }}
      >
        {preview && (
          <DialogContent className="w-[680px] max-w-[calc(100vw-2rem)]">
            <DialogCloseButton />
            <DialogTitle className="system-md-semibold text-text-secondary">{preview.title}</DialogTitle>
            <div className="mt-2 truncate system-xs-regular text-text-tertiary">{preview.source_url}</div>
            <div className="mt-4 max-h-[420px] overflow-y-auto rounded-xl border border-divider-subtle bg-background-default-subtle p-4 system-sm-regular text-text-secondary">
              {preview.content}
            </div>
          </DialogContent>
        )}
      </Dialog>
    </section>
  )
}
