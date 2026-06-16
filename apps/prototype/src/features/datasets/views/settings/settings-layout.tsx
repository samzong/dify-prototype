import { Button } from '@langgenius/dify-ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectItemIndicator,
  SelectItemText,
  SelectTrigger,
  SelectValue,
} from '@langgenius/dify-ui/select'
import type { DatasetItem, RetrievalDepth } from '../../fixtures/items'

export const rowClass = 'flex gap-x-1'
const labelClass = 'flex shrink-0 items-center pt-1 h-7 w-[180px]'
const sectionLabelClass = 'flex w-[180px] shrink-0 flex-col'

export type Permission = 'only_me' | 'all_team_members' | 'partial_members'

export const permissionOptions = [
  { value: 'only_me', label: 'Only me' },
  { value: 'all_team_members', label: 'All team members' },
  { value: 'partial_members', label: 'Partial team members' },
]

export const retrievalModeOptions: { value: RetrievalDepth; label: string }[] = [
  { value: 'Fast', label: 'Fast' },
  { value: 'Deep', label: 'Deep' },
  { value: 'Research', label: 'Research' },
]

export const retentionOptions = [
  { value: 'forever', label: 'Forever', days: null },
  { value: '7', label: '7 days', days: 7 },
  { value: '30', label: '30 days', days: 30 },
  { value: '60', label: '60 days', days: 60 },
  { value: '90', label: '90 days', days: 90 },
  { value: '120', label: '120 days', days: 120 },
  { value: '180', label: '180 days', days: 180 },
  { value: '365', label: '365 days', days: 365 },
]

export const dayRetentionOptions = retentionOptions.filter(option => option.days !== null)

const artifactVersionOptions = [
  { value: '3', label: 'Keep last 3 versions', versions: 3 },
  { value: '5', label: 'Keep last 5 versions', versions: 5 },
  { value: '10', label: 'Keep last 10 versions', versions: 10 },
]

const sessionInactivityOptions = [
  { value: '60', label: '1 hour', minutes: 60 },
  { value: '240', label: '4 hours', minutes: 240 },
  { value: '1440', label: '24 hours', minutes: 1440 },
]

export function permissionFromItem(item: DatasetItem): Permission {
  if (item.permission === 'Workspace' || item.permission === 'Editors')
    return 'all_team_members'
  if (item.permission === 'Sales' || item.permission === 'Product team')
    return 'partial_members'
  return 'only_me'
}
export function RetentionSelect({
  value,
  options,
  onChange,
}: {
  value: number | null
  options: { value: string; label: string; days: number | null }[]
  onChange: (value: number | null) => void
}) {
  const selectedValue = options.find(option => option.days === value)?.value ?? 'forever'
  return (
    <Select
      items={options}
      value={selectedValue}
      onValueChange={(next) => {
        const option = options.find(entry => entry.value === next)
        if (option)
          onChange(option.days)
      }}
    >
      <SelectTrigger size="large" aria-label="Retention" className="w-full max-w-[320px]">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {options.map(option => (
          <SelectItem key={option.value} value={option.value}>
            <SelectItemText>{option.label}</SelectItemText>
            <SelectItemIndicator />
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

export function ArtifactVersionSelect({
  value,
  onChange,
}: {
  value: number
  onChange: (value: number) => void
}) {
  return (
    <Select
      items={artifactVersionOptions}
      value={String(value)}
      onValueChange={(next) => {
        const option = artifactVersionOptions.find(entry => entry.value === next)
        if (option)
          onChange(option.versions)
      }}
    >
      <SelectTrigger size="large" aria-label="Parse artifact versions" className="w-full max-w-[320px]">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {artifactVersionOptions.map(option => (
          <SelectItem key={option.value} value={option.value}>
            <SelectItemText>{option.label}</SelectItemText>
            <SelectItemIndicator />
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

export function SessionInactivitySelect({
  value,
  onChange,
}: {
  value: number
  onChange: (value: number) => void
}) {
  return (
    <Select
      items={sessionInactivityOptions}
      value={String(value)}
      onValueChange={(next) => {
        const option = sessionInactivityOptions.find(entry => entry.value === next)
        if (option)
          onChange(option.minutes)
      }}
    >
      <SelectTrigger size="large" aria-label="Session inactivity" className="w-full max-w-[320px]">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {sessionInactivityOptions.map(option => (
          <SelectItem key={option.value} value={option.value}>
            <SelectItemText>{option.label}</SelectItemText>
            <SelectItemIndicator />
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

export function SettingsRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className={rowClass}>
      <div className={labelClass}>
        <div className="system-sm-semibold text-text-secondary">{label}</div>
      </div>
      <div className="grow">{children}</div>
    </div>
  )
}

export function SettingsFieldRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex gap-x-2">
      <div className="flex h-7 w-[140px] shrink-0 items-center system-sm-medium text-text-secondary">{label}</div>
      <div className="grow">{children}</div>
    </div>
  )
}

export function SettingsSection({
  title,
  description,
  children,
}: {
  title: string
  description?: string
  children: React.ReactNode
}) {
  return (
    <div className={rowClass}>
      <div className={sectionLabelClass}>
        <div className="flex h-8 items-center system-sm-semibold text-text-secondary">{title}</div>
        {description && <div className="body-xs-regular text-text-tertiary">{description}</div>}
      </div>
      <div className="flex grow flex-col gap-y-3">{children}</div>
    </div>
  )
}

export function SettingsDivider() {
  return <div className="my-1 h-px bg-divider-subtle" />
}
