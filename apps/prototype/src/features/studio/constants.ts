import type { AppMode } from './fixtures/apps'

export const appTypeLabels: Record<AppMode, string> = {
  workflow: 'Workflow',
  'advanced-chat': 'Chatflow',
  chat: 'Chatbot',
  'agent-chat': 'Agent',
  completion: 'Text Generator',
}

export const appTypeIconClassNames: Record<AppMode, string> = {
  workflow: 'i-ri-exchange-2-fill bg-components-icon-bg-indigo-solid',
  'advanced-chat': 'i-ri-message-3-fill bg-components-icon-bg-blue-light-solid',
  chat: 'i-ri-message-3-fill bg-components-icon-bg-blue-solid',
  'agent-chat': 'i-ri-robot-3-fill bg-components-icon-bg-violet-solid',
  completion: 'i-ri-file-text-fill bg-components-icon-bg-teal-solid',
}
