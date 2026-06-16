import { cn } from '@langgenius/dify-ui/cn'

export const KNOWLEDGE_MCP_BASE_URL = 'https://mcp.knowledge.dify.ai/v1'

export const DEVELOP_MCP_TOOLS = [
  { name: 'knowledge_query', description: 'Run fast, deep, or research retrieval against the bound space.' },
  { name: 'knowledge_trace_get', description: 'Load answer trace steps, evidence, conflicts, and missing evidence.' },
  { name: 'knowledge_fs_tree', description: 'List KnowledgeFS nodes under a mount path.' },
  { name: 'knowledge_fs_grep', description: 'Search indexed assets with grep semantics.' },
  { name: 'knowledge_fs_cat', description: 'Read a file-like knowledge asset by path.' },
  { name: 'knowledge_research_start', description: 'Create and stream an asynchronous research task.' },
] as const

export function DevelopCodeBlock({
  code,
  className,
}: {
  code: string
  className?: string
}) {
  return (
    <pre className={cn(
      'overflow-x-auto rounded-xl border border-components-panel-border bg-background-section-burn p-4 font-mono text-xs leading-5 text-text-secondary select-text',
      className,
    )}
    >
      {code}
    </pre>
  )
}
