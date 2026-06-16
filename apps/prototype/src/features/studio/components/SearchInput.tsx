import { cn } from '@langgenius/dify-ui/cn'
import { Input } from '@langgenius/dify-ui/input'
import { RiCloseCircleFill, RiSearchLine } from '@remixicon/react'

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
