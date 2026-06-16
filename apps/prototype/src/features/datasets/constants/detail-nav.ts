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
  RiShieldCheckFill,
  RiShieldCheckLine,
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
  { id: 'operations', label: 'Operations', icon: RiShieldCheckLine, activeIcon: RiShieldCheckFill },
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
    description: 'Knowledge space API snapshots and workspace entry points.',
  },
  sources: {
    title: 'Sources',
    description: 'See where knowledge comes from, whether it is fresh, and whether sync succeeded.',
  },
  documents: {
    title: 'Documents',
    description: 'Browse knowledge assets, inspect indexed content, and search across the knowledge base.',
  },
  evidence: {
    title: 'Evidence',
    description: 'Run research tasks and quick retrieval tests to validate answers and evidence coverage.',
  },
  quality: {
    title: 'Quality',
    description: 'Manage golden questions, production bad cases, and answer trace history.',
  },
  operations: {
    title: 'Operations',
    description: 'Run fsck, staged-object GC, lease review, and staged commit recovery.',
  },
  settings: {
    title: 'Knowledge settings',
    description: 'Manage basic info, API access, default retrieval, processing policy, and retention.',
  },
  pipeline: {
    title: 'Pipeline',
    description: 'Maintain the generation pipeline for this Knowledge.',
  },
}
