import { RiArrowDownSLine, RiTShirt2Line } from '@remixicon/react'
import { PrototypeRepoLink } from '../../../shared/components/PrototypeRepoLink'

export function SignInHeader({
  theme,
  onThemeChange,
}: {
  theme: 'light' | 'dark'
  onThemeChange: (theme: 'light' | 'dark') => void
}) {
  return (
    <div className="flex w-full items-center justify-between p-6">
      <img src={theme === 'dark' ? '/logo/logo-monochrome-white.svg' : '/logo/logo.svg'} className="block h-7 w-16 object-contain" alt="Dify" />
      <div className="flex items-center gap-1">
        <button type="button" className="flex h-8 items-center gap-1 rounded-lg px-2 system-xs-medium text-text-tertiary hover:bg-state-base-hover">
          English
          <RiArrowDownSLine className="size-4" />
        </button>
        <div className="mx-0 ml-2 h-4 w-px shrink-0 bg-divider-regular" />
        <PrototypeRepoLink />
        <button
          type="button"
          aria-label="Toggle theme"
          className="flex size-8 items-center justify-center rounded-lg text-text-tertiary hover:bg-state-base-hover"
          onClick={() => onThemeChange(theme === 'light' ? 'dark' : 'light')}
        >
          <RiTShirt2Line className="size-4" />
        </button>
      </div>
    </div>
  )
}
