import type { DatasetItem } from '../../fixtures/items'
import { resolveKnowledgeSpaceId } from '../../fixtures/knowledge-space-bridge'
import { DEVELOP_MCP_TOOLS, DevelopCodeBlock, KNOWLEDGE_MCP_BASE_URL } from './develop-shared'

function buildSkillCliExamples(spaceId: string) {
  return `# Install the knowledge-space skill package
npx @dify/knowledge-skill install --space ${spaceId}

# Authenticate your agent CLI session
dify knowledge auth --api-key {API_KEY}

# Query this space from the terminal
dify knowledge query \\
  --space ${spaceId} \\
  --mode deep \\
  --query "What is the Enterprise SSO refund policy?"

# Browse indexed assets through KnowledgeFS
dify knowledge fs tree --space ${spaceId} --path /
dify knowledge fs grep --space ${spaceId} --pattern "refund"

# Start asynchronous research
dify knowledge research start \\
  --space ${spaceId} \\
  --query "Map every escalation path for enterprise billing disputes."`
}

function buildMcpConfig(spaceId: string) {
  return `{
  "mcpServers": {
    "dify-knowledge": {
      "url": "https://mcp.knowledge.dify.ai/v1/spaces/${spaceId}",
      "headers": {
        "Authorization": "Bearer {API_KEY}"
      }
    }
  }
}`
}

function buildMcpCliExample(spaceId: string) {
  return `# Start the MCP bridge locally (stdio transport)
dify knowledge mcp serve \\
  --space ${spaceId} \\
  --transport stdio

# Or connect agents directly to the hosted MCP endpoint
curl '${KNOWLEDGE_MCP_BASE_URL}/spaces/${spaceId}/manifest' \\
  -H 'Authorization: Bearer {API_KEY}'`
}

export function DevelopAgentAccessPanel({ item }: { item: DatasetItem }) {
  const spaceId = resolveKnowledgeSpaceId(item.id)

  return (
    <div className="space-y-6">
      <section className="space-y-2">
        <h2 className="text-lg font-semibold text-text-primary">Agent-native access</h2>
        <p className="system-sm-regular text-text-tertiary">
          Use this knowledge space from coding agents through SKILL packages, the Dify Knowledge CLI,
          or a hosted MCP server that exposes query, trace, filesystem, and research tools.
        </p>
      </section>

      <section className="space-y-3 rounded-xl border border-components-panel-border bg-components-panel-bg p-4">
        <div>
          <h3 className="system-md-semibold text-text-primary">SKILL + CLI</h3>
          <p className="mt-1 system-sm-regular text-text-tertiary">
            Install the knowledge skill for Cursor, Claude Code, or Codex, then drive the same query and
            filesystem workflows from your terminal.
          </p>
        </div>
        <DevelopCodeBlock code={buildSkillCliExamples(spaceId)} />
        <div className="rounded-lg border border-divider-subtle bg-background-default-subtle px-3 py-2">
          <div className="system-xs-semibold-uppercase text-text-tertiary">Bound space</div>
          <p className="mt-1 system-sm-regular text-text-secondary">{item.name}</p>
          <p className="mt-1 font-mono text-xs text-text-tertiary">{spaceId}</p>
        </div>
      </section>

      <section className="space-y-3 rounded-xl border border-components-panel-border bg-components-panel-bg p-4">
        <div>
          <h3 className="system-md-semibold text-text-primary">MCP server</h3>
          <p className="mt-1 system-sm-regular text-text-tertiary">
            Connect any MCP-compatible agent to the hosted knowledge server for this space.
            Tools expose query, trace, filesystem, and research workflows for this space.
          </p>
        </div>
        <DevelopCodeBlock code={buildMcpConfig(spaceId)} />
        <DevelopCodeBlock code={buildMcpCliExample(spaceId)} />
        <div>
          <div className="mb-2 system-xs-semibold-uppercase text-text-tertiary">Exposed tools</div>
          <div className="space-y-2">
            {DEVELOP_MCP_TOOLS.map(tool => (
              <div key={tool.name} className="rounded-lg border border-divider-subtle bg-background-default-subtle px-3 py-2">
                <code className="system-xs-medium text-text-secondary">{tool.name}</code>
                <p className="mt-1 system-xs-regular text-text-tertiary">{tool.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
