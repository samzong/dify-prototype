import {
  RiBarChartFill,
  RiBarChartLine,
  RiDashboardFill,
  RiDashboardLine,
  RiEqualizer2Fill,
  RiEqualizer2Line,
  RiFileTextFill,
  RiFileTextLine,
  RiFocus2Fill,
  RiFocus2Line,
  RiFunctionAddLine,
  RiLinksFill,
  RiLinksLine,
} from '@remixicon/react'
import type { DatasetDetailTab, DatasetItem } from '../fixtures/items'

export type NavItem = {
  id: DatasetDetailTab
  label: string
  icon: React.ComponentType<{ className?: string }>
  activeIcon: React.ComponentType<{ className?: string }>
  hidden?: (item: DatasetItem) => boolean
}

export const detailNavItems: NavItem[] = [
  { id: 'overview', label: 'Overview', icon: RiDashboardLine, activeIcon: RiDashboardFill },
  { id: 'sources', label: 'Sources', icon: RiLinksLine, activeIcon: RiLinksFill, hidden: item => item.provider === 'external' },
  {
    id: 'documents',
    label: 'Documents',
    icon: RiFileTextLine,
    activeIcon: RiFileTextFill,
    hidden: item => item.provider === 'external',
  },
  { id: 'evidence', label: 'Evidence', icon: RiFocus2Line, activeIcon: RiFocus2Fill },
  { id: 'quality', label: 'Quality', icon: RiBarChartLine, activeIcon: RiBarChartFill },
  { id: 'settings', label: 'Settings', icon: RiEqualizer2Line, activeIcon: RiEqualizer2Fill },
  {
    id: 'pipeline',
    label: 'Pipeline',
    icon: RiFunctionAddLine,
    activeIcon: RiFunctionAddLine,
    hidden: item => item.runtimeMode !== 'rag_pipeline',
  },
]

export const pageMeta: Record<DatasetDetailTab, { title: string; description: string }> = {
  overview: {
    title: 'Overview',
    description: 'Check whether this Knowledge can safely supply Apps and Workflows.',
  },
  sources: {
    title: 'Sources',
    description: 'See where knowledge comes from, whether it is fresh, and whether sync succeeded.',
  },
  documents: {
    title: 'Documents',
    description: 'Review document assets, parser status, index inclusion, and evidence use.',
  },
  evidence: {
    title: 'Evidence',
    description: 'Test whether retrieved evidence is enough to support an answer.',
  },
  quality: {
    title: 'Quality',
    description: 'Track answer traces, bad cases, and golden questions over time.',
  },
  settings: {
    title: 'Knowledge settings',
    description: 'Manage basic info, API access, default retrieval, processing policy, retention, and admin health summaries.',
  },
  pipeline: {
    title: 'Pipeline',
    description: 'Maintain the generation pipeline for this Knowledge.',
  },
}
