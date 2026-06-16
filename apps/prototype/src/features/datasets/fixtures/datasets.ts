export type PrototypeDataset = {
  id: string
  name: string
  description: string
  authorName: string
  editedAt: string
  updatedAt: string
  icon: string
  iconBackground: string
  docForm: string
  indexingText: string
  documentCount: number
  availableDocumentCount: number
  appCount: number
  tags: string[]
  cornerLabel?: string
  provider?: 'external'
}

export const prototypeDatasets: PrototypeDataset[] = [
  {
    id: 'customer-support',
    name: 'Customer Support Handbook',
    description: 'Policies, escalation playbooks, and product support articles for frontline agents.',
    authorName: 'Dify Admin',
    editedAt: 'Edited 3 hours ago',
    updatedAt: 'Updated 3 hours ago',
    icon: '📙',
    iconBackground: '#FFF4ED',
    docForm: 'General',
    indexingText: 'HQ HYBRID',
    documentCount: 128,
    availableDocumentCount: 128,
    appCount: 4,
    tags: ['Support', 'Docs'],
  },
  {
    id: 'release-notes',
    name: 'Release Notes Pipeline',
    description: 'A pipeline knowledge base that normalizes changelogs, upgrade notes, and launch briefs.',
    authorName: 'Morgan Chen',
    editedAt: 'Edited yesterday',
    updatedAt: 'Updated yesterday',
    icon: '🧩',
    iconBackground: '#EEF4FF',
    docForm: 'Parent-child',
    indexingText: 'HQ VECTOR',
    documentCount: 42,
    availableDocumentCount: 39,
    appCount: 2,
    tags: ['Product'],
    cornerLabel: 'Pipeline',
  },
  {
    id: 'external-api',
    name: 'Partner Knowledge API',
    description: 'External knowledge connected through API for partner implementation references.',
    authorName: 'Dify Admin',
    editedAt: 'Edited Jun 5, 2026',
    updatedAt: 'Updated Jun 5, 2026',
    icon: '🔌',
    iconBackground: '#F0FDF9',
    docForm: 'External Knowledge Base',
    indexingText: '',
    documentCount: 18,
    availableDocumentCount: 18,
    appCount: 0,
    tags: ['External'],
    provider: 'external',
  },
]
