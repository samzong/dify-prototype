import { Avatar } from '@langgenius/dify-ui/avatar'
import { cn } from '@langgenius/dify-ui/cn'
import { Dialog, DialogContent } from '@langgenius/dify-ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLinkItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@langgenius/dify-ui/dropdown-menu'
import { RiCloseLine } from '@remixicon/react'
import { useState } from 'react'
import type { SettingsTab } from '../features/settings/types'
import { prototypeUser } from '../features/settings/fixtures/settings-data'

function MenuItemContent({
  iconClassName,
  label,
  trailing,
}: {
  iconClassName: string
  label: React.ReactNode
  trailing?: React.ReactNode
}) {
  return (
    <>
      <span aria-hidden className={cn('size-4 shrink-0 text-text-tertiary', iconClassName)} />
      <div className="min-w-0 grow truncate px-1 text-text-secondary system-md-regular">{label}</div>
      {trailing}
    </>
  )
}

function ExternalLinkIndicator() {
  return <span aria-hidden className="i-ri-arrow-right-up-line size-[14px] shrink-0 text-text-tertiary" />
}

function ThemeSwitcher({
  theme,
  onThemeChange,
}: {
  theme: 'light' | 'dark'
  onThemeChange: (theme: 'light' | 'dark') => void
}) {
  return (
    <div className="inline-flex items-center rounded-lg border border-divider-regular bg-components-panel-bg p-0.5">
      <button
        type="button"
        aria-label="Light theme"
        aria-pressed={theme === 'light'}
        className={cn(
          'flex size-6 items-center justify-center rounded-md',
          theme === 'light' ? 'bg-state-base-active text-text-secondary' : 'text-text-tertiary hover:bg-state-base-hover',
        )}
        onClick={() => onThemeChange('light')}
      >
        <span aria-hidden className="i-ri-sun-line size-3.5" />
      </button>
      <button
        type="button"
        aria-label="Dark theme"
        aria-pressed={theme === 'dark'}
        className={cn(
          'flex size-6 items-center justify-center rounded-md',
          theme === 'dark' ? 'bg-state-base-active text-text-secondary' : 'text-text-tertiary hover:bg-state-base-hover',
        )}
        onClick={() => onThemeChange('dark')}
      >
        <span aria-hidden className="i-ri-moon-line size-3.5" />
      </button>
    </div>
  )
}

function AccountAboutDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <Dialog open={open} onOpenChange={(nextOpen) => { if (!nextOpen) onClose() }}>
      <DialogContent className="w-[calc(100vw-2rem)]! max-w-[480px]! overflow-hidden! border-none px-6! py-4! text-left align-middle">
        <div className="relative">
          <button
            type="button"
            className="absolute top-0 right-0 flex size-8 cursor-pointer items-center justify-center border-none bg-transparent p-0"
            aria-label="Close"
            onClick={onClose}
          >
            <RiCloseLine className="size-4 text-text-tertiary" aria-hidden="true" />
          </button>
          <div className="flex flex-col items-center gap-4 py-8">
            <img src="/logo/logo.svg" className="block h-7 w-auto object-contain" alt="Dify" />
            <div className="text-center text-xs font-normal text-text-tertiary">Version 1.0.0-prototype</div>
            <div className="flex flex-col items-center gap-2 text-center text-xs font-normal text-text-secondary">
              <div>© 2026 LangGenius, Inc., Contributors.</div>
              <div className="text-text-accent">
                <a href="https://dify.ai/privacy" target="_blank" rel="noopener noreferrer">Privacy Policy</a>
                ,&nbsp;
                <a href="https://dify.ai/terms" target="_blank" rel="noopener noreferrer">Terms of Service</a>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export function AccountDropdown({
  theme,
  onThemeChange,
  onOpenSettings,
  onSignOut,
}: {
  theme: 'light' | 'dark'
  onThemeChange: (theme: 'light' | 'dark') => void
  onOpenSettings: (tab: SettingsTab) => void
  onSignOut: () => void
}) {
  const [open, setOpen] = useState(false)
  const [aboutOpen, setAboutOpen] = useState(false)

  const closeMenu = () => setOpen(false)

  return (
    <>
      <DropdownMenu open={open} onOpenChange={setOpen}>
        <DropdownMenuTrigger
          aria-label="Account"
          className={cn('inline-flex items-center rounded-[20px] p-0.5 hover:bg-background-default-dodge', open && 'bg-background-default-dodge')}
        >
          <Avatar avatar={prototypeUser.avatar} name={prototypeUser.name} size="lg" />
        </DropdownMenuTrigger>
        <DropdownMenuContent
          placement="bottom-end"
          sideOffset={6}
          popupClassName="w-60 max-w-80 bg-components-panel-bg-blur! py-0! backdrop-blur-xs"
        >
          <DropdownMenuGroup className="py-1">
            <div className="mx-1 flex flex-nowrap items-center py-2 pr-2 pl-3">
              <div className="grow">
                <div className="system-md-medium break-all text-text-primary">{prototypeUser.name}</div>
                <div className="system-xs-regular break-all text-text-tertiary">{prototypeUser.email}</div>
              </div>
              <Avatar avatar={prototypeUser.avatar} name={prototypeUser.name} size="lg" />
            </div>
            <DropdownMenuLinkItem
              className="justify-between"
              href="https://cloud.dify.ai/account"
              target="_blank"
              rel="noopener noreferrer"
            >
              <MenuItemContent iconClassName="i-ri-account-circle-line" label="Account" trailing={<ExternalLinkIndicator />} />
            </DropdownMenuLinkItem>
            <DropdownMenuItem
              className="justify-between"
              onClick={() => {
                closeMenu()
                onOpenSettings('members')
              }}
            >
              <MenuItemContent iconClassName="i-ri-settings-3-line" label="Settings" />
            </DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator className="my-0! bg-divider-subtle" />
          <DropdownMenuGroup className="py-1">
            <DropdownMenuLinkItem
              className="justify-between"
              href="https://docs.dify.ai"
              target="_blank"
              rel="noopener noreferrer"
            >
              <MenuItemContent iconClassName="i-ri-book-open-line" label="Help center" trailing={<ExternalLinkIndicator />} />
            </DropdownMenuLinkItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator className="my-0! bg-divider-subtle" />
          <DropdownMenuGroup className="py-1">
            <DropdownMenuLinkItem
              className="justify-between"
              href="https://roadmap.dify.ai"
              target="_blank"
              rel="noopener noreferrer"
            >
              <MenuItemContent iconClassName="i-ri-map-2-line" label="Roadmap" trailing={<ExternalLinkIndicator />} />
            </DropdownMenuLinkItem>
            <DropdownMenuLinkItem
              className="justify-between"
              href="https://github.com/langgenius/dify"
              target="_blank"
              rel="noopener noreferrer"
            >
              <MenuItemContent
                iconClassName="i-ri-github-line"
                label="GitHub"
                trailing={(
                  <div className="flex items-center gap-0.5 rounded-[5px] border border-divider-deep bg-components-badge-bg-dimm px-[5px] py-[3px]">
                    <span aria-hidden className="i-ri-star-line size-3 shrink-0 text-text-tertiary" />
                    <span className="system-2xs-medium-uppercase text-text-tertiary">98k</span>
                  </div>
                )}
              />
            </DropdownMenuLinkItem>
            <DropdownMenuItem
              className="justify-between"
              onClick={() => {
                closeMenu()
                setAboutOpen(true)
              }}
            >
              <MenuItemContent
                iconClassName="i-ri-information-2-line"
                label="About"
                trailing={(
                  <div className="flex shrink-0 items-center">
                    <div className="mr-2 system-xs-regular text-text-tertiary">1.0.0</div>
                    <span aria-hidden className="size-1.5 rounded-full bg-util-colors-green-green-500" />
                  </div>
                )}
              />
            </DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator className="my-0! bg-divider-subtle" />
          <DropdownMenuGroup className="py-1">
            <DropdownMenuItem closeOnClick={false} className="cursor-default justify-between data-highlighted:bg-transparent">
              <MenuItemContent iconClassName="i-ri-t-shirt-2-line" label="Theme" trailing={<ThemeSwitcher theme={theme} onThemeChange={onThemeChange} />} />
            </DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator className="my-0! bg-divider-subtle" />
          <DropdownMenuGroup className="py-1">
            <DropdownMenuItem
              className="justify-between"
              onClick={() => {
                closeMenu()
                onSignOut()
              }}
            >
              <MenuItemContent iconClassName="i-ri-logout-box-r-line" label="Log out" />
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
      <AccountAboutDialog open={aboutOpen} onClose={() => setAboutOpen(false)} />
    </>
  )
}
