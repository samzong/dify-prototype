export function NewAppCard({ onOpenWorkflow }: { onOpenWorkflow: () => void }) {
  return (
    <div className="relative col-span-1 inline-flex h-[160px] flex-col justify-between rounded-xl border-[0.5px] border-components-card-border bg-components-card-bg transition-opacity">
      <div className="grow rounded-t-xl p-2">
        <div className="px-6 pt-2 pb-1 text-xs leading-[18px] font-medium text-text-tertiary">Create App</div>
        <button type="button" className="mb-1 flex w-full cursor-pointer items-center rounded-lg px-6 py-[7px] text-[13px] leading-[18px] font-medium text-text-tertiary hover:bg-state-base-hover hover:text-text-secondary" onClick={onOpenWorkflow}>
          <span className="mr-2 i-ri-file-add-line size-4 shrink-0" />
          Start from blank
        </button>
        <button type="button" className="flex w-full cursor-pointer items-center rounded-lg px-6 py-[7px] text-[13px] leading-[18px] font-medium text-text-tertiary hover:bg-state-base-hover hover:text-text-secondary">
          <span className="mr-2 i-ri-file-copy-2-line size-4 shrink-0" />
          Start from template
        </button>
        <button type="button" className="flex w-full cursor-pointer items-center rounded-lg px-6 py-[7px] text-[13px] leading-[18px] font-medium text-text-tertiary hover:bg-state-base-hover hover:text-text-secondary">
          <span className="mr-2 i-ri-file-upload-line size-4 shrink-0" />
          Import DSL
        </button>
      </div>
    </div>
  )
}
