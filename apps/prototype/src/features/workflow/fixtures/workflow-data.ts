import type { PrototypeDataset } from '../../datasets/fixtures/datasets'
import { prototypeDatasets } from '../../datasets/fixtures/datasets'

export type WorkflowNodeKind = 'start' | 'knowledge-retrieval' | 'llm' | 'answer'

export type WorkflowNode = {
  id: string
  title: string
  kind: WorkflowNodeKind
  description: string
  position: {
    x: number
    y: number
  }
}

export type WorkflowVariable = {
  id: string
  label: string
  selector: string
  type: 'string' | 'file' | 'arrayFile' | 'number'
}

export type WorkflowMetadata = {
  id: string
  name: string
  type: 'string' | 'number' | 'time' | 'select'
}

export type WorkflowDataset = PrototypeDataset & {
  isMultimodal?: boolean
  retrievalSource: 'internal' | 'external'
  indexingTechnique: 'high_quality' | 'economy'
  searchMethod: 'hybrid_search' | 'semantic_search' | 'keyword_search'
  embeddingProvider?: string
  embeddingModel?: string
  metadata: WorkflowMetadata[]
}

export type MetadataCondition = {
  id: string
  metadataId: string
  operator: string
  valueSource: 'constant' | 'variable'
  value: string
  variableSelector: string
}

export const workflowNodes: WorkflowNode[] = [
  {
    id: 'start',
    title: 'Start',
    kind: 'start',
    description: 'Receives user query and uploaded files.',
    position: {
      x: 84,
      y: 188,
    },
  },
  {
    id: 'knowledge-retrieval',
    title: 'Knowledge Retrieval',
    kind: 'knowledge-retrieval',
    description: 'Retrieves relevant segments from selected Knowledge.',
    position: {
      x: 378,
      y: 188,
    },
  },
  {
    id: 'llm',
    title: 'LLM',
    kind: 'llm',
    description: 'Generates an answer using retrieval result.',
    position: {
      x: 672,
      y: 188,
    },
  },
  {
    id: 'answer',
    title: 'Answer',
    kind: 'answer',
    description: 'Returns final response to the user.',
    position: {
      x: 966,
      y: 188,
    },
  },
]

export const workflowStringVariables: WorkflowVariable[] = [
  {
    id: 'sys-query',
    label: 'sys.query',
    selector: 'Start / sys.query',
    type: 'string',
  },
  {
    id: 'topic',
    label: 'topic',
    selector: 'Start / topic',
    type: 'string',
  },
  {
    id: 'customer-tier',
    label: 'customer_tier',
    selector: 'Start / customer_tier',
    type: 'string',
  },
]

export const workflowFileVariables: WorkflowVariable[] = [
  {
    id: 'sys-files',
    label: 'sys.files',
    selector: 'Start / sys.files',
    type: 'arrayFile',
  },
  {
    id: 'uploaded-image',
    label: 'uploaded_image',
    selector: 'Start / uploaded_image',
    type: 'file',
  },
]

export const workflowNumberVariables: WorkflowVariable[] = [
  {
    id: 'priority-score',
    label: 'priority_score',
    selector: 'Start / priority_score',
    type: 'number',
  },
]

export const workflowDatasets: WorkflowDataset[] = [
  {
    ...prototypeDatasets[0]!,
    isMultimodal: true,
    retrievalSource: 'internal',
    indexingTechnique: 'high_quality',
    searchMethod: 'hybrid_search',
    embeddingProvider: 'openai',
    embeddingModel: 'text-embedding-3-large',
    metadata: [
      {
        id: 'category',
        name: 'category',
        type: 'string',
      },
      {
        id: 'customer_tier',
        name: 'customer_tier',
        type: 'select',
      },
      {
        id: 'priority',
        name: 'priority',
        type: 'number',
      },
      {
        id: 'updated_at',
        name: 'updated_at',
        type: 'time',
      },
    ],
  },
  {
    ...prototypeDatasets[1]!,
    retrievalSource: 'internal',
    indexingTechnique: 'high_quality',
    searchMethod: 'semantic_search',
    embeddingProvider: 'openai',
    embeddingModel: 'text-embedding-3-large',
    metadata: [
      {
        id: 'product_area',
        name: 'product_area',
        type: 'string',
      },
      {
        id: 'release_version',
        name: 'release_version',
        type: 'string',
      },
      {
        id: 'published_at',
        name: 'published_at',
        type: 'time',
      },
    ],
  },
  {
    ...prototypeDatasets[2]!,
    retrievalSource: 'external',
    indexingTechnique: 'economy',
    searchMethod: 'keyword_search',
    metadata: [
      {
        id: 'partner',
        name: 'partner',
        type: 'string',
      },
      {
        id: 'region',
        name: 'region',
        type: 'select',
      },
    ],
  },
]

export const workflowModelOptions = [
  'gpt-4.1',
  'gpt-4.1-mini',
  'claude-3-7-sonnet',
]

export const workflowRerankModelOptions = [
  'bge-reranker-v2-m3',
  'rerank-english-v3.0',
  'jina-reranker-v2-base-multilingual',
]

export const workflowOutputVars = [
  ['result', 'Array[Object]', 'Retrieval segmented data'],
  ['content', 'string', 'Segmented content'],
  ['title', 'string', 'Segmented title'],
  ['url', 'string', 'Segmented URL'],
  ['icon', 'string', 'Segmented icon'],
  ['metadata', 'object', 'Other metadata'],
  ['files', 'Array[File]', 'Retrieved files'],
] as const
