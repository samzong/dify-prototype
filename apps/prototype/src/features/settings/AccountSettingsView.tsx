import { Avatar } from '@langgenius/dify-ui/avatar'
import { Button } from '@langgenius/dify-ui/button'
import { cn } from '@langgenius/dify-ui/cn'
import { Dialog, DialogContent } from '@langgenius/dify-ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@langgenius/dify-ui/dropdown-menu'
import { MeterIndicator, MeterRoot, MeterTrack } from '@langgenius/dify-ui/meter'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectItemIndicator,
  SelectItemText,
  SelectTrigger,
} from '@langgenius/dify-ui/select'
import { Switch } from '@langgenius/dify-ui/switch'
import { toast } from '@langgenius/dify-ui/toast'
import { RiArrowRightUpLine, RiUserAddLine } from '@remixicon/react'
import { useCallback, useEffect, useState } from 'react'
import { ApiExtensionSettingsView } from './ApiExtensionSettingsView'
import { DataSourceSettingsView } from './DataSourceSettingsView'
import { ModelProviderSettingsView } from './ModelProviderSettingsView'
import {
  languageOptions,
  memberRoleLabels,
  prototypeMembers,
  prototypeWorkspace,
  sandboxPlanUsage,
  timezoneOptions,
  type MemberRole,
  type PlanUsageItem,
  type WorkspaceMember,
} from './fixtures/settings-data'

import type { AppearanceMode } from '../../preferences/theme-preference'
import type { SettingsTab } from './types'

const iconClassName = 'mr-2 h-4 w-4'

type SettingItem = {
  key: SettingsTab
  name: string
  title?: string
  description?: string
  icon: React.ReactNode
  activeIcon: React.ReactNode
}

const settingItems: SettingItem[] = [
  {
    key: 'provider',
    name: 'Model Provider',
    icon: <span className={cn('i-ri-brain-2-line', iconClassName)} />,
    activeIcon: <span className={cn('i-ri-brain-2-fill', iconClassName)} />,
  },
  {
    key: 'members',
    name: 'Members',
    icon: <span className={cn('i-ri-group-2-line', iconClassName)} />,
    activeIcon: <span className={cn('i-ri-group-2-fill', iconClassName)} />,
  },
  {
    key: 'billing',
    name: 'Billing',
    description: 'Manage billing information and receipts',
    icon: <span className={cn('i-ri-money-dollar-circle-line', iconClassName)} />,
    activeIcon: <span className={cn('i-ri-money-dollar-circle-fill', iconClassName)} />,
  },
  {
    key: 'data-source',
    name: 'Data Source',
    icon: <span className={cn('i-ri-database-2-line', iconClassName)} />,
    activeIcon: <span className={cn('i-ri-database-2-fill', iconClassName)} />,
  },
  {
    key: 'api-extension',
    name: 'API Extension',
    icon: <span className={cn('i-ri-puzzle-2-line', iconClassName)} />,
    activeIcon: <span className={cn('i-ri-puzzle-2-fill', iconClassName)} />,
  },
  {
    key: 'custom',
    name: 'Customization',
    icon: <span className={cn('i-ri-color-filter-line', iconClassName)} />,
    activeIcon: <span className={cn('i-ri-color-filter-fill', iconClassName)} />,
  },
  {
    key: 'language',
    name: 'Language',
    title: 'General',
    icon: <span className={cn('i-ri-equalizer-2-line', iconClassName)} />,
    activeIcon: <span className={cn('i-ri-equalizer-2-fill', iconClassName)} />,
  },
]

const workspaceTabs: SettingsTab[] = ['provider', 'members', 'billing', 'data-source', 'api-extension', 'custom']
const userTabs: SettingsTab[] = ['language']

const titleClassName = 'mb-1 system-sm-medium text-text-secondary'

function SandboxPlanIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32" fill="none" aria-hidden="true">
      <rect opacity="0.18" x="1" y="1" width="2" height="2" rx="1" fill="var(--color-text-quaternary)" />
      <path d="M8 2C8 1.44772 8.44772 1 9 1C9.55228 1 10 1.44772 10 2C10 2.55228 9.55228 3 9 3C8.44772 3 8 2.55228 8 2Z" fill="var(--color-saas-dify-blue-inverted)" />
      <path d="M15 2C15 1.44772 15.4477 1 16 1C16.5523 1 17 1.44772 17 2C17 2.55228 16.5523 3 16 3C15.4477 3 15 2.55228 15 2Z" fill="var(--color-saas-dify-blue-inverted)" />
      <path d="M22 2C22 1.44772 22.4477 1 23 1C23.5523 1 24 1.44772 24 2C24 2.55228 23.5523 3 23 3C22.4477 3 22 2.55228 22 2Z" fill="var(--color-saas-dify-blue-inverted)" />
      <path d="M29 2C29 1.44772 29.4477 1 30 1C30.5523 1 31 1.44772 31 2C31 2.55228 30.5523 3 30 3C29.4477 3 29 2.55228 29 2Z" fill="var(--color-saas-dify-blue-inverted)" />
      <path d="M1 16C1 15.4477 1.44772 15 2 15C2.55228 15 3 15.4477 3 16C3 16.5523 2.55228 17 2 17C1.44772 17 1 16.5523 1 16Z" fill="var(--color-saas-dify-blue-inverted)" />
      <path d="M15 16C15 15.4477 15.4477 15 16 15C16.5523 15 17 15.4477 17 16C17 16.5523 16.5523 17 16 17C15.4477 17 15 16.5523 15 16Z" fill="var(--color-saas-dify-blue-inverted)" />
      <path d="M29 16C29 15.4477 29.4477 15 30 15C30.5523 15 31 15.4477 31 16C31 16.5523 30.5523 17 30 17C29.4477 17 29 16.5523 29 16Z" fill="var(--color-saas-dify-blue-inverted)" />
      <path d="M1 30C1 29.4477 1.44772 29 2 29C2.55228 29 3 29.4477 3 30C3 30.5523 2.55228 31 2 31C1.44772 31 1 30.5523 1 30Z" fill="var(--color-saas-dify-blue-inverted)" />
      <path d="M15 30C15 29.4477 15.4477 29 16 29C16.5523 29 17 29.4477 17 30C17 30.5523 16.5523 31 16 31C15.4477 31 15 30.5523 15 30Z" fill="var(--color-saas-dify-blue-inverted)" />
      <path d="M29 30C29 29.4477 29.4477 29 30 29C30.5523 29 31 29.4477 31 30C31 30.5523 30.5523 31 30 31C29.4477 31 29 30.5523 29 30Z" fill="var(--color-saas-dify-blue-inverted)" />
    </svg>
  )
}

function UsageMeter({ item }: { item: PlanUsageItem }) {
  const percent = item.total === 'unlimited' || item.belowThreshold
    ? 0
    : Math.min((item.usage / item.total) * 100, 100)
  const tone = percent >= 100 ? 'error' : percent >= 80 ? 'warning' : 'neutral'

  return (
    <div className="flex flex-col gap-2 rounded-xl bg-components-panel-bg p-4">
      <span aria-hidden className={cn('size-4 text-text-tertiary', item.iconClassName)} />
      <div className="flex items-center gap-1">
        <div className="system-sm-medium text-text-secondary">{item.name}</div>
      </div>
      <div className="flex items-center gap-1 system-md-semibold text-text-primary">
        {item.belowThreshold && item.isSandboxStorage
          ? (
              <>
                <span>&lt; 50</span>
                <span className="system-md-regular text-text-quaternary">MB</span>
              </>
            )
          : (
              <>
                <span>{item.usage}</span>
                <span className="system-md-regular text-text-quaternary">/</span>
                <span>{item.total === 'unlimited' ? 'Unlimited' : item.total}</span>
              </>
            )}
      </div>
      {item.belowThreshold
        ? (
            <div aria-hidden="true" className="overflow-hidden rounded-md bg-components-progress-bar-bg">
              <div className="h-1 w-full rounded-md bg-progress-bar-indeterminate-stripe" />
            </div>
          )
        : (
            <MeterRoot value={percent} max={100} aria-label={item.name}>
              <MeterTrack>
                <MeterIndicator tone={tone} />
              </MeterTrack>
            </MeterRoot>
          )}
      {item.resetInDays !== undefined && (
        <div className="system-xs-regular text-text-tertiary">
          Resets in
          {' '}
          {item.resetInDays}
          {' '}
          days
        </div>
      )}
    </div>
  )
}

function MembersPanel({
  members,
  onUpdateRole,
}: {
  members: WorkspaceMember[]
  onUpdateRole: (memberId: string, role: MemberRole) => void
}) {
  return (
    <div className="flex flex-col">
      <div className="mb-6 flex items-center gap-3 rounded-xl border-t-[0.5px] border-l-[0.5px] border-divider-subtle bg-linear-to-r from-background-gradient-bg-fill-chat-bg-2 to-background-gradient-bg-fill-chat-bg-1 py-2 pr-5 pl-2">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-components-icon-bg-blue-solid text-[20px]">
          <span className="bg-linear-to-r from-components-avatar-shape-fill-stop-0 to-components-avatar-shape-fill-stop-100 bg-clip-text font-semibold text-shadow-shadow-1 uppercase opacity-90">
            {prototypeWorkspace.name[0]?.toLocaleUpperCase()}
          </span>
        </div>
        <div className="grow">
          <div className="flex items-center gap-1 system-md-semibold text-text-secondary">
            <span>{prototypeWorkspace.name}</span>
            <button type="button" aria-label="Edit workspace info" className="cursor-pointer rounded-md border-none bg-transparent p-1 hover:bg-black/5">
              <span aria-hidden className="i-ri-pencil-line size-4 text-text-tertiary" />
            </button>
          </div>
          <div className="mt-1 flex space-x-1 system-xs-medium text-text-tertiary">
            <div>{members.length}</div>
            <div>members</div>
            <div>/</div>
            <div>1</div>
          </div>
        </div>
        <Button variant="primary">
          <RiUserAddLine className="mr-1 size-4" />
          Invite
        </Button>
      </div>
      <div className="overflow-visible lg:overflow-visible">
        <div className="flex min-w-[480px] items-center border-b border-divider-regular py-[7px]">
          <div className="grow px-3 system-xs-medium-uppercase text-text-tertiary">Name</div>
          <div className="w-[120px] shrink-0 px-2 system-xs-medium-uppercase text-text-tertiary">Last active</div>
          <div className="w-[96px] shrink-0 px-2 system-xs-medium-uppercase text-text-tertiary">Role</div>
        </div>
        <div className="relative min-w-[480px]">
          {members.map(member => (
            <div key={member.id} className="flex border-b border-divider-subtle">
              <div className="flex grow items-center px-3 py-2">
                <Avatar name={member.name} avatar={null} size="sm" className="mr-2" />
                <div>
                  <div className="system-sm-medium text-text-secondary">
                    {member.name}
                    {member.isCurrentUser && <span className="system-xs-regular text-text-tertiary"> (You)</span>}
                  </div>
                  <div className="system-xs-regular text-text-tertiary">{member.email}</div>
                </div>
              </div>
              <div className="flex w-[120px] shrink-0 items-center px-2 py-2 system-sm-regular text-text-secondary">{member.lastActiveLabel}</div>
              <div className="flex w-[96px] shrink-0 items-center">
                {member.role === 'owner'
                  ? <div className="px-3 system-sm-regular text-text-secondary">{memberRoleLabels.owner}</div>
                  : (
                      <MemberRoleMenu
                        role={member.role}
                        onSelect={nextRole => onUpdateRole(member.id, nextRole)}
                      />
                    )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function MemberRoleMenu({
  role,
  onSelect,
}: {
  role: MemberRole
  onSelect: (role: MemberRole) => void
}) {
  const roles: MemberRole[] = ['admin', 'editor', 'normal']

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className="group flex size-full cursor-pointer items-center justify-between border-none bg-transparent px-3 text-left system-sm-regular text-text-secondary hover:bg-state-base-hover data-popup-open:bg-state-base-hover"
      >
        {memberRoleLabels[role]}
        <span aria-hidden className="i-ri-arrow-down-s-line hidden size-4 shrink-0 group-hover:block group-data-popup-open:block" />
      </DropdownMenuTrigger>
      <DropdownMenuContent placement="bottom-end" sideOffset={4} popupClassName="inline-flex flex-col rounded-xl p-0">
        <div className="p-1">
          {roles.map(nextRole => (
            <DropdownMenuItem
              key={nextRole}
              className="h-auto items-start gap-2 rounded-lg px-3 py-2"
              onClick={() => onSelect(nextRole)}
            >
              {nextRole === role
                ? <span aria-hidden className="mt-[2px] i-ri-check-line h-4 w-4 shrink-0 text-text-accent" />
                : <span aria-hidden className="mt-[2px] h-4 w-4 shrink-0" />}
              <div>
                <div className="system-sm-semibold whitespace-nowrap text-text-secondary">{memberRoleLabels[nextRole]}</div>
              </div>
            </DropdownMenuItem>
          ))}
        </div>
        <DropdownMenuSeparator className="my-0" />
        <div className="p-1">
          <DropdownMenuItem className="h-auto items-start gap-2 rounded-lg px-3 py-2" onClick={() => toast.success('Member removed')}>
            <span aria-hidden className="mt-[2px] h-4 w-4 shrink-0" />
            <div>
              <div className="system-sm-semibold whitespace-nowrap text-text-secondary">Remove from team</div>
              <div className="system-xs-regular whitespace-nowrap text-text-tertiary">Revoke access to this workspace</div>
            </div>
          </DropdownMenuItem>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

function BillingPanel() {
  return (
    <div>
      <div className="relative rounded-2xl border-[0.5px] border-effects-highlight-lightmode-off bg-background-section-burn">
        <div className="p-6 pb-2">
          <SandboxPlanIcon />
          <div className="mt-1 flex items-center">
            <div className="grow">
              <div className="mb-1 system-md-semibold-uppercase text-text-primary">{prototypeWorkspace.planLabel}</div>
              <div className="system-xs-regular text-util-colors-gray-gray-600">{prototypeWorkspace.planDescription}</div>
            </div>
            <Button variant="primary" className="shrink-0">Upgrade</Button>
          </div>
        </div>
        <div className="grid grid-cols-3 content-start gap-1 p-2">
          {sandboxPlanUsage.map(item => (
            <UsageMeter key={item.name} item={item} />
          ))}
        </div>
      </div>
      <button
        type="button"
        className="mt-3 flex w-full items-center justify-between rounded-xl bg-background-section-burn px-4 py-3"
        onClick={() => toast.info('Billing portal would open in production')}
      >
        <div className="flex flex-col gap-0.5 text-left">
          <div className="system-md-semibold text-text-primary">Billing portal</div>
          <div className="system-sm-regular text-text-secondary">Manage payment methods, invoices, and receipts</div>
        </div>
        <span className="inline-flex h-8 w-24 items-center justify-center gap-0.5 rounded-lg border-[0.5px] border-components-button-secondary-border bg-components-button-secondary-bg px-3 py-2 text-saas-dify-blue-accessible shadow-[0_1px_2px_rgba(9,9,11,0.05)] backdrop-blur-[5px]">
          <span className="system-sm-medium leading-none">View</span>
          <RiArrowRightUpLine className="size-4" />
        </span>
      </button>
    </div>
  )
}

function CustomPanel() {
  const [brandRemoved, setBrandRemoved] = useState(false)

  return (
    <div className="flex flex-col">
      <div className="mb-1 flex justify-between rounded-xl bg-linear-to-r from-components-input-border-active-prompt-1 to-components-input-border-active-prompt-2 p-4 pl-6 shadow-lg backdrop-blur-xs">
        <div className="space-y-1 text-text-primary-on-surface">
          <div className="title-xl-semi-bold">Upgrade to remove branding</div>
          <div className="system-sm-regular">Remove the Powered by Dify badge and customize your web app logo.</div>
        </div>
        <button type="button" className="flex h-10 w-[120px] cursor-pointer items-center justify-center rounded-3xl border-none bg-white p-0 system-md-semibold text-text-accent shadow-xs hover:opacity-95">
          Upgrade
        </button>
      </div>
      <div className="py-4">
        <div className="mb-2 flex items-center justify-between rounded-xl bg-background-section-burn p-4 system-md-medium text-text-primary">
          Remove Powered by Dify
          <Switch size="lg" checked={brandRemoved} disabled onCheckedChange={setBrandRemoved} />
        </div>
        <div className={cn('flex h-14 items-center justify-between rounded-xl bg-background-section-burn px-4', brandRemoved && 'opacity-30')}>
          <div>
            <div className="system-md-medium text-text-primary">Change web app logo</div>
            <div className="system-xs-regular text-text-tertiary">PNG or SVG, recommended size 128×128</div>
          </div>
          <Button className="relative mr-2" disabled>
            <span className="mr-1 i-ri-image-add-line size-4" />
            Upload
          </Button>
        </div>
        <div className="mt-5 mb-2 flex items-center gap-2">
          <div className="shrink-0 system-xs-medium-uppercase text-text-tertiary">Preview</div>
          <div className="h-px grow bg-linear-to-r from-transparent via-divider-regular to-transparent" />
        </div>
        <div className="relative mb-2 flex items-center gap-3">
          <CustomPreviewCard title="Chatflow App" iconClassName="i-custom-vender-solid-communication-bubble-text-mod bg-components-icon-bg-blue-light-solid" brandRemoved={brandRemoved} />
          <CustomPreviewCard title="Workflow App" iconClassName="i-ri-exchange-2-fill bg-components-icon-bg-indigo-solid" brandRemoved={brandRemoved} />
        </div>
      </div>
    </div>
  )
}

function CustomPreviewCard({
  title,
  iconClassName,
  brandRemoved,
}: {
  title: string
  iconClassName: string
  brandRemoved: boolean
}) {
  return (
    <div className="flex h-[320px] grow basis-1/2 overflow-hidden rounded-2xl border-[0.5px] border-components-panel-border-subtle bg-background-default-burn">
      <div className="flex h-full w-[232px] shrink-0 flex-col p-1 pr-0">
        <div className="flex items-center gap-3 p-3 pr-2">
          <div className={cn('inline-flex size-8 items-center justify-center rounded-lg border border-divider-regular', iconClassName.split(' ').slice(1).join(' '))}>
            <span className={cn('size-4 text-components-avatar-shape-fill-stop-100', iconClassName.split(' ')[0])} />
          </div>
          <div className="grow system-md-semibold text-text-secondary">{title}</div>
        </div>
        <div className="grow px-3 pt-5">
          <div className="flex h-8 items-center px-3 py-1">
            <div className="h-2 w-14 rounded-xs bg-text-quaternary opacity-20" />
          </div>
          <div className="flex h-8 items-center px-3 py-1">
            <div className="h-2 w-[168px] rounded-xs bg-text-quaternary opacity-20" />
          </div>
        </div>
      </div>
      <div className="relative flex min-w-0 grow flex-col bg-background-default-subtle">
        <div className="grow" />
        {!brandRemoved && (
          <div className="flex shrink-0 items-center justify-center gap-1 py-3 system-2xs-medium text-text-quaternary">
            <span>POWERED BY</span>
            <img src="/logo/logo.svg" className="h-3 w-auto" alt="" />
          </div>
        )}
      </div>
    </div>
  )
}

function PreferencesPanel({
  theme,
  appearanceMode,
  onAppearanceChange,
}: {
  theme: 'light' | 'dark'
  appearanceMode: AppearanceMode
  onAppearanceChange: (mode: AppearanceMode) => void
}) {
  const [language, setLanguage] = useState('en-US')
  const [timezone, setTimezone] = useState('America/Los_Angeles')

  const appearanceOptions = [
    { value: 'system', name: 'Follow system' },
    { value: 'light', name: 'Light' },
    { value: 'dark', name: 'Dark' },
  ]

  return (
    <>
      <div className="mb-6">
        <div className={titleClassName}>Appearance</div>
        <Select
          value={appearanceMode}
          onValueChange={(nextValue) => {
            if (nextValue === 'system' || nextValue === 'light' || nextValue === 'dark')
              onAppearanceChange(nextValue)
          }}
        >
          <SelectTrigger size="medium">
            {appearanceOptions.find(item => item.value === appearanceMode)?.name ?? 'Follow system'}
          </SelectTrigger>
          <SelectContent>
            {appearanceOptions.map(item => (
              <SelectItem key={item.value} value={item.value}>
                <SelectItemText>{item.name}</SelectItemText>
                <SelectItemIndicator />
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="mt-1 system-xs-regular text-text-tertiary">
          Current theme:
          {' '}
          {theme}
        </div>
      </div>
      <div className="mb-6">
        <div className={titleClassName}>Display language</div>
        <Select
          value={language}
          onValueChange={(nextValue) => {
            if (!nextValue)
              return
            setLanguage(nextValue)
            toast.success('Language updated')
          }}
        >
          <SelectTrigger size="medium">
            {languageOptions.find(item => item.value === language)?.name ?? 'Select'}
          </SelectTrigger>
          <SelectContent>
            {languageOptions.map(item => (
              <SelectItem key={item.value} value={item.value}>
                <SelectItemText>{item.name}</SelectItemText>
                <SelectItemIndicator />
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="mb-6">
        <div className={titleClassName}>Timezone</div>
        <Select
          value={timezone}
          onValueChange={(nextValue) => {
            if (!nextValue)
              return
            setTimezone(nextValue)
            toast.success('Timezone updated')
          }}
        >
          <SelectTrigger size="medium">
            {timezoneOptions.find(item => item.value === timezone)?.name ?? 'Select'}
          </SelectTrigger>
          <SelectContent>
            {timezoneOptions.map(item => (
              <SelectItem key={item.value} value={item.value}>
                <SelectItemText>{item.name}</SelectItemText>
                <SelectItemIndicator />
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </>
  )
}

export function AccountSettingsView({
  open,
  onClose,
  theme,
  appearanceMode,
  onAppearanceChange,
  initialTab = 'members',
}: {
  open: boolean
  onClose: () => void
  theme: 'light' | 'dark'
  appearanceMode: AppearanceMode
  onAppearanceChange: (mode: AppearanceMode) => void
  initialTab?: SettingsTab
}) {
  const [activeTab, setActiveTab] = useState<SettingsTab>(initialTab)
  const [members, setMembers] = useState(prototypeMembers)

  const activeItem = settingItems.find(item => item.key === activeTab)

  const handleClose = useCallback(() => {
    onClose()
  }, [onClose])

  useEffect(() => {
    if (open)
      setActiveTab(initialTab)
  }, [open, initialTab])

  useEffect(() => {
    if (!open)
      return

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape')
        handleClose()
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [open, handleClose])

  const handleUpdateRole = (memberId: string, role: MemberRole) => {
    setMembers(current => current.map(member => member.id === memberId ? { ...member, role } : member))
    toast.success('Role updated')
  }

  const renderMenuGroup = (groupKey: string, groupName: string | undefined, tabs: SettingsTab[], withDivider = false) => {
    const items = tabs.map(tab => settingItems.find(item => item.key === tab)).filter(Boolean) as SettingItem[]

    return (
      <div key={groupKey} className={cn(groupKey === 'workspace-group' ? 'mb-2' : 'mt-2')}>
        {groupName && (
          <div className="flex h-7 items-center px-3 system-xs-medium-uppercase text-text-tertiary">
            {groupName}
          </div>
        )}
        <div className={cn(withDivider && 'border-t border-divider-subtle pt-3')}>
          {items.map(item => (
            <button
              type="button"
              key={item.key}
              className={cn(
                'mb-0.5 flex h-8 w-full items-center rounded-lg px-3 text-left text-sm',
                activeTab === item.key
                  ? 'bg-state-base-active system-sm-semibold text-components-menu-item-text-active'
                  : 'system-sm-medium text-components-menu-item-text',
              )}
              aria-label={item.name}
              title={item.name}
              onClick={() => setActiveTab(item.key)}
            >
              {activeTab === item.key ? item.activeIcon : item.icon}
              <div className="truncate">{item.name}</div>
            </button>
          ))}
        </div>
      </div>
    )
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen)
          handleClose()
      }}
    >
      <DialogContent
        backdropClassName="z-40 bg-transparent"
        className="top-0 left-0 z-40 h-full max-h-none w-full max-w-none translate-x-0 translate-y-0 scale-100 overflow-hidden rounded-none border-none bg-background-sidenav-bg p-0 shadow-none backdrop-blur-md transition-opacity data-ending-style:scale-100 data-starting-style:scale-100"
      >
        <div className="absolute top-0 right-0 h-full w-1/2 bg-components-panel-bg" />
        <div className="flex h-screen w-full max-w-full pl-0 sm:pl-[232px]">
          <div className="flex w-[44px] shrink-0 flex-col pr-6 pl-4 sm:w-[224px]">
            <div className="mt-6 mb-8 flex h-[38px] items-center px-3 title-2xl-semi-bold whitespace-nowrap text-text-primary">Settings</div>
            <div className="w-full">
              {renderMenuGroup('workspace-group', 'Workspace', workspaceTabs)}
              {renderMenuGroup('user-group', 'General', userTabs, true)}
            </div>
          </div>
          <div className="relative flex min-h-0 w-[824px]">
            <div className="fixed top-6 right-6 z-9999 flex flex-col items-center">
              <Button variant="tertiary" size="large" className="px-2" aria-label="Close" onClick={handleClose}>
                <span className="i-ri-close-line size-5" />
              </Button>
              <div className="mt-1 system-2xs-medium-uppercase text-text-tertiary">ESC</div>
            </div>
            <div className="h-full min-h-0 flex-1 overflow-y-auto overscroll-contain bg-components-panel-bg">
              <div className="sticky top-0 z-20 mx-8 flex min-h-[60px] items-end bg-components-panel-bg pt-8 pb-2">
                <div className="shrink-0 title-2xl-semi-bold text-text-primary">
                  {activeItem?.title ?? activeItem?.name}
                  {activeItem?.description && (
                    <div className="mt-1 system-sm-regular text-text-tertiary">{activeItem.description}</div>
                  )}
                </div>
              </div>
              <div className="px-4 pt-6 pb-8 sm:px-8">
                {activeTab === 'provider' && <ModelProviderSettingsView />}
                {activeTab === 'members' && <MembersPanel members={members} onUpdateRole={handleUpdateRole} />}
                {activeTab === 'billing' && <BillingPanel />}
                {activeTab === 'data-source' && <DataSourceSettingsView />}
                {activeTab === 'api-extension' && <ApiExtensionSettingsView />}
                {activeTab === 'custom' && <CustomPanel />}
                {activeTab === 'language' && (
                  <PreferencesPanel
                    theme={theme}
                    appearanceMode={appearanceMode}
                    onAppearanceChange={onAppearanceChange}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
