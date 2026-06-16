export type AppMode = 'workflow' | 'advanced-chat' | 'chat' | 'agent-chat' | 'completion'

export type PrototypeApp = {
  id: string
  name: string
  description: string
  authorName: string
  editedAt: string
  icon: string
  iconBackground: string
  mode: AppMode
  access: 'public' | 'organization' | 'private'
  tags: string[]
}

export const prototypeApps: PrototypeApp[] = [
  {
    id: 'sales-intake',
    name: 'Sales Intake Workflow',
    description: 'Qualifies inbound leads, routes enterprise requests, and drafts account follow-up messages.',
    authorName: 'Dify Admin',
    editedAt: 'Edited 2 days ago',
    icon: '🚀',
    iconBackground: '#EFF4FF',
    mode: 'workflow',
    access: 'organization',
    tags: ['Sales', 'Workflow'],
  },
  {
    id: 'support-agent',
    name: 'Support Agent',
    description: 'Answers product questions with knowledge retrieval and collects escalation details.',
    authorName: 'Morgan Chen',
    editedAt: 'Edited Jun 6, 2026',
    icon: '🤖',
    iconBackground: '#F0FDF9',
    mode: 'agent-chat',
    access: 'public',
    tags: ['Support'],
  },
  {
    id: 'knowledge-writer',
    name: 'Knowledge Base Writer',
    description: 'Turns uploaded notes into structured help center articles and release summaries.',
    authorName: 'Dify Admin',
    editedAt: 'Edited Jun 3, 2026',
    icon: '📚',
    iconBackground: '#FFF4ED',
    mode: 'advanced-chat',
    access: 'private',
    tags: ['Knowledge'],
  },
]
