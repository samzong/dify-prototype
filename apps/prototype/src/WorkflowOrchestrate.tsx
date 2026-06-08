import { Button } from '@langgenius/dify-ui/button'
import { Checkbox } from '@langgenius/dify-ui/checkbox'
import { cn } from '@langgenius/dify-ui/cn'
import { Input } from '@langgenius/dify-ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectItemIndicator,
  SelectItemText,
  SelectTrigger,
  SelectValue,
} from '@langgenius/dify-ui/select'
import { Slider } from '@langgenius/dify-ui/slider'
import { Switch } from '@langgenius/dify-ui/switch'
import {
  RiAddLine,
  RiArrowLeftLine,
  RiArrowRightLine,
  RiArrowRightSLine,
  RiCloseLine,
  RiDeleteBinLine,
  RiEqualizer2Line,
  RiEyeLine,
  RiFileTextFill,
  RiFocus3Line,
  RiHistoryLine,
  RiMoreFill,
  RiPlayLargeLine,
  RiRobot2Fill,
  RiSettings3Line,
} from '@remixicon/react'
import { Children, isValidElement, useMemo, useState } from 'react'
import {
  type MetadataCondition,
  type WorkflowDataset,
  type WorkflowNode,
  workflowDatasets,
  workflowFileVariables,
  workflowModelOptions,
  workflowNodes,
  workflowNumberVariables,
  workflowOutputVars,
  workflowRerankModelOptions,
  workflowStringVariables,
} from './workflow-data'

type RetrievalMode = 'multiway' | 'oneway'
type RerankingMode = 'reranking_model' | 'weighted_score'
type MetadataMode = 'disabled' | 'automatic' | 'manual'
type LogicalOperator = 'and' | 'or'

const nodeIconClassNames: Record<WorkflowNode['kind'], string> = {
  start: 'i-custom-vender-workflow-home bg-util-colors-blue-brand-blue-brand-500',
  'knowledge-retrieval': 'i-custom-vender-workflow-knowledge-retrieval bg-util-colors-green-green-500',
  llm: 'i-custom-vender-workflow-llm bg-util-colors-indigo-indigo-500',
  answer: 'i-custom-vender-workflow-answer bg-util-colors-warning-warning-500',
}

const comparisonOperators = [
  'contains',
  'not contains',
  'start with',
  'end with',
  'is',
  'is not',
  'empty',
  'not empty',
  '=',
  '\u2260',
  '>',
  '<',
  '\u2265',
  '\u2264',
  'is null',
  'is not null',
  'in',
  'not in',
  'all of',
  'exists',
  'not exists',
  'before',
  'after',
]

export function WorkflowOrchestrate({ onBack }: { onBack: () => void }) {
  const [selectedNodeId, setSelectedNodeId] = useState('knowledge-retrieval')
  const [queryVariable, setQueryVariable] = useState('sys-query')
  const [queryAttachment, setQueryAttachment] = useState('sys-files')
  const [selectedDatasetIds, setSelectedDatasetIds] = useState(['customer-support', 'release-notes'])
  const [showDatasetPicker, setShowDatasetPicker] = useState(false)
  const [retrievalMode, setRetrievalMode] = useState<RetrievalMode>('multiway')
  const [rerankingMode, setRerankingMode] = useState<RerankingMode>('reranking_model')
  const [rerankEnabled, setRerankEnabled] = useState(true)
  const [rerankModel, setRerankModel] = useState(workflowRerankModelOptions[0]!)
  const [topK, setTopK] = useState(4)
  const [scoreThresholdEnabled, setScoreThresholdEnabled] = useState(false)
  const [scoreThreshold, setScoreThreshold] = useState(0.5)
  const [vectorWeight, setVectorWeight] = useState(0.7)
  const [singleModel, setSingleModel] = useState(workflowModelOptions[0]!)
  const [singleTemperature, setSingleTemperature] = useState(0.7)
  const [metadataMode, setMetadataMode] = useState<MetadataMode>('manual')
  const [metadataLogicalOperator, setMetadataLogicalOperator] = useState<LogicalOperator>('and')
  const [metadataModel, setMetadataModel] = useState(workflowModelOptions[1]!)
  const [metadataTemperature, setMetadataTemperature] = useState(0.7)
  const [conditions, setConditions] = useState<MetadataCondition[]>([
    {
      id: 'condition-category',
      metadataId: 'category',
      operator: 'is',
      valueSource: 'constant',
      value: 'support',
      variableSelector: 'Start / customer_tier',
    },
    {
      id: 'condition-priority',
      metadataId: 'priority',
      operator: '>',
      valueSource: 'variable',
      value: '3',
      variableSelector: 'Start / priority_score',
    },
  ])

  const selectedNode = workflowNodes.find(node => node.id === selectedNodeId) ?? workflowNodes[1]!
  const selectedDatasets = useMemo(
    () => workflowDatasets.filter(dataset => selectedDatasetIds.includes(dataset.id)),
    [selectedDatasetIds],
  )
  const metadataList = useMemo(() => {
    const allMetadata = selectedDatasets.flatMap(dataset => dataset.metadata)
    const names = new Set<string>()
    return allMetadata.filter((metadata) => {
      if (names.has(metadata.name))
        return false
      names.add(metadata.name)
      return true
    })
  }, [selectedDatasets])
  const showImageQueryVarSelector = selectedDatasets.some(dataset => dataset.isMultimodal)

  const toggleDataset = (datasetId: string) => {
    setSelectedDatasetIds((ids) => {
      if (ids.includes(datasetId))
        return ids.filter(id => id !== datasetId)

      return [...ids, datasetId]
    })
  }

  const addCondition = () => {
    const metadata = metadataList[0] ?? workflowDatasets[0]!.metadata[0]!
    setConditions(current => [
      ...current,
      {
        id: `condition-${Date.now()}`,
        metadataId: metadata.id,
        operator: metadata.type === 'number' ? '=' : 'is',
        valueSource: 'constant',
        value: '',
        variableSelector: workflowStringVariables[0]!.selector,
      },
    ])
  }

  const updateCondition = (id: string, next: Partial<MetadataCondition>) => {
    setConditions(current => current.map(condition => condition.id === id ? { ...condition, ...next } : condition))
  }

  return (
    <div className="flex h-full flex-col bg-workflow-canvas-workflow-bg text-text-primary">
      <WorkflowHeader onBack={onBack} selectedNode={selectedNode} />
      <div className="relative flex min-h-0 grow overflow-hidden">
        <CanvasRail selectedNodeId={selectedNodeId} onSelectNode={setSelectedNodeId} />
        <div
          className="relative h-full min-w-0 grow overflow-hidden bg-workflow-canvas-workflow-bg"
          style={{
            backgroundImage: 'radial-gradient(var(--color-workflow-canvas-workflow-dot-color) 1px, transparent 1px)',
            backgroundSize: '18px 18px',
          }}
        >
          <div className="absolute top-20 left-12 flex items-center gap-2 rounded-xl border border-divider-subtle bg-components-panel-bg px-2 py-1 shadow-xs">
            <Button variant="ghost" size="small">
              <RiFocus3Line className="mr-1 size-3.5" />
              Fit view
            </Button>
            <Button variant="ghost" size="small">100%</Button>
          </div>
          <WorkflowCanvas selectedNodeId={selectedNodeId} onSelectNode={setSelectedNodeId} selectedDatasets={selectedDatasets} />
        </div>
        <KnowledgeRetrievalPanel
          selectedNode={selectedNode}
          queryVariable={queryVariable}
          onQueryVariableChange={setQueryVariable}
          showImageQueryVarSelector={showImageQueryVarSelector}
          queryAttachment={queryAttachment}
          onQueryAttachmentChange={setQueryAttachment}
          selectedDatasets={selectedDatasets}
          selectedDatasetIds={selectedDatasetIds}
          showDatasetPicker={showDatasetPicker}
          onDatasetPickerChange={setShowDatasetPicker}
          onDatasetToggle={toggleDataset}
          retrievalMode={retrievalMode}
          onRetrievalModeChange={setRetrievalMode}
          rerankingMode={rerankingMode}
          onRerankingModeChange={setRerankingMode}
          rerankEnabled={rerankEnabled}
          onRerankEnabledChange={setRerankEnabled}
          rerankModel={rerankModel}
          onRerankModelChange={setRerankModel}
          topK={topK}
          onTopKChange={setTopK}
          scoreThresholdEnabled={scoreThresholdEnabled}
          onScoreThresholdEnabledChange={setScoreThresholdEnabled}
          scoreThreshold={scoreThreshold}
          onScoreThresholdChange={setScoreThreshold}
          vectorWeight={vectorWeight}
          onVectorWeightChange={setVectorWeight}
          singleModel={singleModel}
          onSingleModelChange={setSingleModel}
          singleTemperature={singleTemperature}
          onSingleTemperatureChange={setSingleTemperature}
          metadataMode={metadataMode}
          onMetadataModeChange={setMetadataMode}
          metadataLogicalOperator={metadataLogicalOperator}
          onMetadataLogicalOperatorChange={setMetadataLogicalOperator}
          metadataModel={metadataModel}
          onMetadataModelChange={setMetadataModel}
          metadataTemperature={metadataTemperature}
          onMetadataTemperatureChange={setMetadataTemperature}
          metadataList={metadataList}
          conditions={conditions}
          onAddCondition={addCondition}
          onRemoveCondition={id => setConditions(current => current.filter(condition => condition.id !== id))}
          onUpdateCondition={updateCondition}
        />
      </div>
    </div>
  )
}

function WorkflowHeader({ onBack, selectedNode }: { onBack: () => void; selectedNode: WorkflowNode }) {
  return (
    <div className="relative z-20 flex h-14 shrink-0 items-center justify-between border-b border-divider-subtle bg-workflow-canvas-workflow-top-bar-1 px-3 backdrop-blur-[8px]">
      <div className="flex min-w-0 items-center gap-2">
        <button type="button" className="flex size-8 items-center justify-center rounded-lg text-text-tertiary hover:bg-state-base-hover" onClick={onBack} aria-label="Back to Studio">
          <RiArrowLeftLine className="size-4" />
        </button>
        <div className="flex min-w-0 flex-col">
          <div className="flex items-center gap-1 text-sm font-semibold text-text-secondary">
            <span className="truncate">Untitled workflow</span>
            <span className="rounded-md border border-components-button-secondary-border px-1.5 system-2xs-medium-uppercase text-text-tertiary">Draft</span>
          </div>
          <div className="system-xs-regular text-text-tertiary">Orchestrate / {selectedNode.title}</div>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <button type="button" className="flex size-8 items-center justify-center rounded-lg text-text-tertiary hover:bg-state-base-hover" aria-label="Version history">
          <RiHistoryLine className="size-4" />
        </button>
        <Button variant="secondary" size="small">
          <RiEyeLine className="mr-1 size-3.5" />
          Preview
        </Button>
        <Button variant="secondary" size="small">
          <RiPlayLargeLine className="mr-1 size-3.5" />
          Run
        </Button>
        <Button size="small">Publish</Button>
      </div>
    </div>
  )
}

function CanvasRail({
  selectedNodeId,
  onSelectNode,
}: {
  selectedNodeId: string
  onSelectNode: (nodeId: string) => void
}) {
  return (
    <aside className="hidden w-[212px] shrink-0 border-r border-divider-subtle bg-background-body px-3 py-4 lg:block">
      <div className="mb-3 flex items-center justify-between">
        <div className="system-xs-semibold-uppercase text-text-tertiary">Nodes</div>
        <Button variant="ghost" size="small">
          <RiAddLine className="size-3.5" />
        </Button>
      </div>
      <div className="space-y-1">
        {workflowNodes.map(node => (
          <button
            key={node.id}
            type="button"
            className={cn(
              'flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left hover:bg-state-base-hover',
              selectedNodeId === node.id && 'bg-state-base-hover',
            )}
            onClick={() => onSelectNode(node.id)}
          >
            <WorkflowBlockIcon kind={node.kind} />
            <span className="min-w-0 flex-1 truncate system-sm-medium text-text-secondary">{node.title}</span>
          </button>
        ))}
      </div>
    </aside>
  )
}

function WorkflowCanvas({
  selectedNodeId,
  onSelectNode,
  selectedDatasets,
}: {
  selectedNodeId: string
  onSelectNode: (nodeId: string) => void
  selectedDatasets: WorkflowDataset[]
}) {
  return (
    <div className="absolute top-0 left-0 h-[760px] w-[1240px] origin-top-left scale-[0.92] xl:scale-100">
      <ConnectionLine from={workflowNodes[0]!} to={workflowNodes[1]!} />
      <ConnectionLine from={workflowNodes[1]!} to={workflowNodes[2]!} />
      <ConnectionLine from={workflowNodes[2]!} to={workflowNodes[3]!} />
      {workflowNodes.map(node => (
        <WorkflowNodeCard
          key={node.id}
          node={node}
          selected={node.id === selectedNodeId}
          onClick={() => onSelectNode(node.id)}
          selectedDatasets={selectedDatasets}
        />
      ))}
      <button type="button" className="absolute top-[228px] left-[625px] flex size-8 items-center justify-center rounded-full border border-components-button-secondary-border bg-components-button-secondary-bg text-text-tertiary shadow-md hover:bg-state-base-hover">
        <RiAddLine className="size-4" />
      </button>
    </div>
  )
}

function ConnectionLine({ from, to }: { from: WorkflowNode; to: WorkflowNode }) {
  return (
    <div className="absolute flex items-center" style={{ left: from.position.x + 240, top: from.position.y + 58, width: to.position.x - from.position.x - 240 }}>
      <div className="h-px grow bg-divider-deep" />
      <RiArrowRightLine className="-ml-1 size-4 text-text-quaternary" />
    </div>
  )
}

function WorkflowNodeCard({
  node,
  selected,
  onClick,
  selectedDatasets,
}: {
  node: WorkflowNode
  selected: boolean
  onClick: () => void
  selectedDatasets: WorkflowDataset[]
}) {
  return (
    <button
      type="button"
      className={cn(
        'absolute w-[240px] rounded-2xl border p-px text-left transition-all',
        selected ? 'border-components-option-card-option-selected-border shadow-lg' : 'border-transparent hover:shadow-lg',
      )}
      style={{ left: node.position.x, top: node.position.y }}
      onClick={onClick}
    >
      <div className="rounded-[15px] border border-transparent bg-workflow-block-bg pb-1 shadow-xs">
        <div className="flex items-center gap-2 px-3 py-2">
          <WorkflowBlockIcon kind={node.kind} />
          <div className="min-w-0 flex-1 truncate system-sm-semibold text-text-secondary">{node.title}</div>
          <RiMoreFill className="size-4 text-text-tertiary" />
        </div>
        <div className="px-3 pb-2 system-xs-regular text-text-tertiary">{node.description}</div>
        {node.kind === 'knowledge-retrieval' && (
          <div className="mb-1 space-y-0.5 px-3 py-1">
            {selectedDatasets.map(dataset => (
              <div key={dataset.id} className="flex h-[26px] items-center gap-x-1 rounded-md bg-workflow-block-parma-bg px-1">
                <span className="flex size-4 shrink-0 items-center justify-center rounded text-xs" style={{ background: dataset.iconBackground }}>{dataset.icon}</span>
                <div className="w-0 grow truncate system-xs-regular text-text-secondary">{dataset.name}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </button>
  )
}

function WorkflowBlockIcon({ kind }: { kind: WorkflowNode['kind'] }) {
  const [iconClassName, backgroundClassName] = nodeIconClassNames[kind].split(' ')
  return (
    <span className={cn('flex size-5 shrink-0 items-center justify-center rounded-md border-[0.5px] border-white/2 text-white shadow-xs', backgroundClassName)}>
      <span className={cn('size-3.5', iconClassName)} />
    </span>
  )
}

type KnowledgeRetrievalPanelProps = {
  selectedNode: WorkflowNode
  queryVariable: string
  onQueryVariableChange: (value: string) => void
  showImageQueryVarSelector: boolean
  queryAttachment: string
  onQueryAttachmentChange: (value: string) => void
  selectedDatasets: WorkflowDataset[]
  selectedDatasetIds: string[]
  showDatasetPicker: boolean
  onDatasetPickerChange: (value: boolean) => void
  onDatasetToggle: (datasetId: string) => void
  retrievalMode: RetrievalMode
  onRetrievalModeChange: (value: RetrievalMode) => void
  rerankingMode: RerankingMode
  onRerankingModeChange: (value: RerankingMode) => void
  rerankEnabled: boolean
  onRerankEnabledChange: (value: boolean) => void
  rerankModel: string
  onRerankModelChange: (value: string) => void
  topK: number
  onTopKChange: (value: number) => void
  scoreThresholdEnabled: boolean
  onScoreThresholdEnabledChange: (value: boolean) => void
  scoreThreshold: number
  onScoreThresholdChange: (value: number) => void
  vectorWeight: number
  onVectorWeightChange: (value: number) => void
  singleModel: string
  onSingleModelChange: (value: string) => void
  singleTemperature: number
  onSingleTemperatureChange: (value: number) => void
  metadataMode: MetadataMode
  onMetadataModeChange: (value: MetadataMode) => void
  metadataLogicalOperator: LogicalOperator
  onMetadataLogicalOperatorChange: (value: LogicalOperator) => void
  metadataModel: string
  onMetadataModelChange: (value: string) => void
  metadataTemperature: number
  onMetadataTemperatureChange: (value: number) => void
  metadataList: WorkflowDataset['metadata']
  conditions: MetadataCondition[]
  onAddCondition: () => void
  onRemoveCondition: (id: string) => void
  onUpdateCondition: (id: string, next: Partial<MetadataCondition>) => void
}

function KnowledgeRetrievalPanel(props: KnowledgeRetrievalPanelProps) {
  return (
    <aside className="relative z-10 flex w-[430px] shrink-0 flex-col border-l border-divider-subtle bg-components-panel-bg shadow-xl">
      <div className="flex h-14 shrink-0 items-center justify-between border-b border-divider-subtle px-4">
        <div className="flex min-w-0 items-center gap-2">
          <WorkflowBlockIcon kind="knowledge-retrieval" />
          <div className="min-w-0">
            <div className="truncate system-md-semibold text-text-secondary">{props.selectedNode.title}</div>
            <div className="system-xs-regular text-text-tertiary">Node settings</div>
          </div>
        </div>
        <button type="button" className="flex size-8 items-center justify-center rounded-lg text-text-tertiary hover:bg-state-base-hover" aria-label="Panel settings">
          <RiSettings3Line className="size-4" />
        </button>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto pt-2">
        <div className="space-y-4 px-4 pb-2">
          <PanelField title="Query Text">
            <SelectControl value={props.queryVariable} onChange={props.onQueryVariableChange}>
              {workflowStringVariables.map(variable => (
                <option key={variable.id} value={variable.id}>{variable.selector}</option>
              ))}
            </SelectControl>
          </PanelField>
          {props.showImageQueryVarSelector && (
            <PanelField title="Query Images">
              <SelectControl value={props.queryAttachment} onChange={props.onQueryAttachmentChange}>
                {workflowFileVariables.map(variable => (
                  <option key={variable.id} value={variable.id}>{variable.selector}</option>
                ))}
              </SelectControl>
            </PanelField>
          )}
          <PanelField
            title="Knowledge"
            required
            operations={(
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="small" onClick={() => props.onDatasetPickerChange(!props.showDatasetPicker)}>
                  <RiAddLine className="mr-1 size-3.5" />
                  Add Knowledge
                </Button>
              </div>
            )}
          >
            <DatasetEditor
              selectedDatasets={props.selectedDatasets}
              selectedDatasetIds={props.selectedDatasetIds}
              showDatasetPicker={props.showDatasetPicker}
              onDatasetToggle={props.onDatasetToggle}
            />
          </PanelField>
        </div>
        <RetrievalSettings {...props} />
        <MetadataFiltering {...props} />
        <OutputVariables />
      </div>
    </aside>
  )
}

function PanelField({
  title,
  required = false,
  operations,
  children,
}: {
  title: string
  required?: boolean
  operations?: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <div>
      <div className="mb-1 flex h-8 items-center justify-between">
        <div className="system-sm-semibold-uppercase text-text-secondary">
          {title}
          {required && <span className="ml-0.5 text-text-destructive">*</span>}
        </div>
        {operations}
      </div>
      {children}
    </div>
  )
}

function SelectControl({
  value,
  onChange,
  children,
}: {
  value: string
  onChange: (value: string) => void
  children: React.ReactNode
}) {
  const options = Children.toArray(children).flatMap((child) => {
    if (!isValidElement<{ value?: string | number; children?: React.ReactNode }>(child) || child.props.value === undefined)
      return []

    return [{
      value: String(child.props.value),
      label: String(child.props.children ?? child.props.value),
    }]
  })

  return (
    <Select
      items={options}
      value={value}
      onValueChange={(nextValue) => {
        if (nextValue !== null)
          onChange(nextValue)
      }}
    >
      <SelectTrigger size="large" aria-label="Select option">
        <SelectValue />
      </SelectTrigger>
      <SelectContent listProps={{ 'aria-label': 'Select options' }}>
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

function TextInput({
  value,
  onChange,
  placeholder,
}: {
  value: string
  onChange: (value: string) => void
  placeholder?: string
}) {
  return (
    <Input
      size="large"
      value={value}
      placeholder={placeholder}
      onChange={event => onChange(event.target.value)}
    />
  )
}

function DatasetEditor({
  selectedDatasets,
  selectedDatasetIds,
  showDatasetPicker,
  onDatasetToggle,
}: {
  selectedDatasets: WorkflowDataset[]
  selectedDatasetIds: string[]
  showDatasetPicker: boolean
  onDatasetToggle: (datasetId: string) => void
}) {
  return (
    <div className="space-y-1">
      {selectedDatasets.length
        ? selectedDatasets.map(dataset => (
            <div key={dataset.id} className="group/dataset-item flex h-10 cursor-pointer items-center justify-between rounded-lg border-[0.5px] border-components-panel-border-subtle bg-components-panel-on-panel-item-bg px-2 hover:bg-components-panel-on-panel-item-bg-hover">
              <div className="flex w-0 grow items-center gap-1.5">
                <span className="flex size-5 shrink-0 items-center justify-center rounded text-sm" style={{ background: dataset.iconBackground }}>{dataset.icon}</span>
                <div className="w-0 grow truncate system-sm-medium text-text-secondary">{dataset.name}</div>
              </div>
              <div className="ml-2 flex shrink-0 items-center gap-1">
                {dataset.isMultimodal && <span className="rounded-md border border-divider-subtle px-1 system-2xs-medium-uppercase text-text-tertiary">Vision</span>}
                <span className="rounded-md border border-divider-subtle px-1 system-2xs-medium-uppercase text-text-tertiary">{dataset.indexingText || 'External'}</span>
                <button type="button" className="hidden size-7 items-center justify-center rounded-lg text-text-tertiary hover:bg-state-base-hover group-hover/dataset-item:flex" aria-label={`Remove ${dataset.name}`} onClick={() => onDatasetToggle(dataset.id)}>
                  <RiDeleteBinLine className="size-4" />
                </button>
              </div>
            </div>
          ))
        : (
            <div className="cursor-default rounded-lg bg-background-section p-3 text-center text-xs text-text-tertiary select-none">
              Select Knowledge to retrieve context.
            </div>
          )}
      {showDatasetPicker && (
        <div className="mt-2 rounded-xl border border-components-panel-border bg-components-panel-on-panel-item-bg p-2 shadow-xs">
          <div className="mb-2 flex items-center justify-between">
            <div className="system-xs-semibold-uppercase text-text-tertiary">Available Knowledge</div>
            <RiCloseLine className="size-4 text-text-quaternary" />
          </div>
          <div className="space-y-1">
            {workflowDatasets.map(dataset => (
              <label key={dataset.id} className="flex min-h-10 cursor-pointer items-center gap-2 rounded-lg px-2 py-1 hover:bg-state-base-hover">
                <Checkbox
                  checked={selectedDatasetIds.includes(dataset.id)}
                  onCheckedChange={() => onDatasetToggle(dataset.id)}
                  aria-label={dataset.name}
                />
                <span className="flex size-6 shrink-0 items-center justify-center rounded text-base" style={{ background: dataset.iconBackground }}>{dataset.icon}</span>
                <span className="min-w-0 flex-1 truncate system-sm-medium text-text-secondary">{dataset.name}</span>
                <span className="rounded-md bg-components-badge-bg-gray-soft px-1.5 system-2xs-medium-uppercase text-text-tertiary">{dataset.provider === 'external' ? 'External' : dataset.indexingText}</span>
              </label>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function RetrievalSettings({
  selectedDatasets,
  retrievalMode,
  onRetrievalModeChange,
  rerankingMode,
  onRerankingModeChange,
  rerankEnabled,
  onRerankEnabledChange,
  rerankModel,
  onRerankModelChange,
  topK,
  onTopKChange,
  scoreThresholdEnabled,
  onScoreThresholdEnabledChange,
  scoreThreshold,
  onScoreThresholdChange,
  vectorWeight,
  onVectorWeightChange,
  singleModel,
  onSingleModelChange,
  singleTemperature,
  onSingleTemperatureChange,
}: KnowledgeRetrievalPanelProps) {
  const hasExternal = selectedDatasets.some(dataset => dataset.retrievalSource === 'external')
  const hasInternal = selectedDatasets.some(dataset => dataset.retrievalSource === 'internal')
  const allHighQuality = selectedDatasets.length > 0 && selectedDatasets.every(dataset => dataset.indexingTechnique === 'high_quality')
  const canUseWeightedScore = allHighQuality && selectedDatasets.every(dataset => dataset.embeddingModel === selectedDatasets[0]?.embeddingModel)
  const keywordWeight = Number((1 - vectorWeight).toFixed(1))

  return (
    <div className="border-t border-divider-subtle px-4 py-4">
      <div className="mb-1 flex items-center gap-1">
        <RiEqualizer2Line className="size-4 text-text-tertiary" />
        <div className="system-sm-semibold-uppercase text-text-secondary">Retrieval Setting</div>
      </div>
      <div className="mb-3 system-xs-regular text-text-tertiary">Multi-path retrieval is used by default. Knowledge is retrieved from multiple knowledge bases and then re-ranked.</div>
      <SegmentedControl
        value={retrievalMode}
        options={[
          {
            value: 'multiway',
            label: 'Multi-path retrieval',
          },
          {
            value: 'oneway',
            label: 'N-to-1 retrieval',
          },
        ]}
        onChange={value => onRetrievalModeChange(value as RetrievalMode)}
      />
      {retrievalMode === 'multiway'
        ? (
            <div className="mt-4 space-y-4">
              {(hasExternal && hasInternal) && <WarningText text="Mixed internal and external Knowledge should use a rerank model because scores are not directly comparable." />}
              {hasExternal && !hasInternal && <WarningText text="External-only Knowledge can sort by raw score, but rerank is recommended when strategies differ." />}
              <div>
                <div className="mb-2 text-center system-xs-semibold-uppercase text-text-secondary">Rerank Setting</div>
                {canUseWeightedScore && (
                  <SegmentedControl
                    value={rerankingMode}
                    options={[
                      {
                        value: 'weighted_score',
                        label: 'Weighted Score',
                      },
                      {
                        value: 'reranking_model',
                        label: 'Rerank Model',
                      },
                    ]}
                    onChange={value => onRerankingModeChange(value as RerankingMode)}
                  />
                )}
              </div>
              {rerankingMode === 'weighted_score' && canUseWeightedScore
                ? (
                    <div className="space-y-4">
                      <div className="rounded-lg border border-components-panel-border px-3 pt-5 pb-2">
                        <Slider
                          min={0}
                          max={1}
                          step={0.1}
                          value={vectorWeight}
                          onValueChange={onVectorWeightChange}
                          aria-label="Semantic weight"
                        />
                        <div className="mt-3 flex justify-between">
                          <div className="system-xs-semibold-uppercase text-util-colors-blue-light-blue-light-500">Semantic {vectorWeight.toFixed(1)}</div>
                          <div className="system-xs-semibold-uppercase text-util-colors-teal-teal-500">{keywordWeight.toFixed(1)} Keyword</div>
                        </div>
                      </div>
                      <RangeField label="Top K" value={topK} min={1} max={20} step={1} onChange={onTopKChange} />
                      <ThresholdField enabled={scoreThresholdEnabled} onEnabledChange={onScoreThresholdEnabledChange} value={scoreThreshold} onChange={onScoreThresholdChange} />
                    </div>
                  )
                : (
                    <div className="space-y-4">
                      <ToggleRow label="Rerank Model" enabled={rerankEnabled} onChange={onRerankEnabledChange} />
                      {rerankEnabled && (
                        <SelectControl value={rerankModel} onChange={onRerankModelChange}>
                          {workflowRerankModelOptions.map(model => <option key={model} value={model}>{model}</option>)}
                        </SelectControl>
                      )}
                      <RangeField label="Top K" value={topK} min={1} max={20} step={1} onChange={onTopKChange} />
                      {rerankEnabled && <ThresholdField enabled={scoreThresholdEnabled} onEnabledChange={onScoreThresholdEnabledChange} value={scoreThreshold} onChange={onScoreThresholdChange} />}
                    </div>
                  )}
            </div>
          )
        : (
            <div className="mt-4 space-y-4">
              <WarningText text="N-to-1 retrieval is legacy in current Dify source. This prototype keeps the node data path editable for field-coverage review." />
              <PanelField title="System Reasoning Model">
                <SelectControl value={singleModel} onChange={onSingleModelChange}>
                  {workflowModelOptions.map(model => <option key={model} value={model}>{model}</option>)}
                </SelectControl>
              </PanelField>
              <RangeField label="Temperature" value={singleTemperature} min={0} max={1} step={0.1} onChange={onSingleTemperatureChange} />
            </div>
          )}
    </div>
  )
}

function MetadataFiltering({
  metadataMode,
  onMetadataModeChange,
  metadataLogicalOperator,
  onMetadataLogicalOperatorChange,
  metadataModel,
  onMetadataModelChange,
  metadataTemperature,
  onMetadataTemperatureChange,
  metadataList,
  conditions,
  onAddCondition,
  onRemoveCondition,
  onUpdateCondition,
}: KnowledgeRetrievalPanelProps) {
  const variableOptions = [...workflowStringVariables, ...workflowNumberVariables]

  return (
    <div className="border-t border-divider-subtle px-4 py-4">
      <div className="mb-2 flex items-center justify-between">
        <div>
          <div className="system-sm-semibold-uppercase text-text-secondary">Metadata Filtering</div>
          <div className="mt-0.5 system-xs-regular text-text-tertiary">Use metadata attributes to refine and control retrieval.</div>
        </div>
        {metadataMode === 'manual' && (
          <Button variant="ghost" size="small" onClick={onAddCondition}>
            <RiAddLine className="mr-1 size-3.5" />
            Add Condition
          </Button>
        )}
      </div>
      <SegmentedControl
        value={metadataMode}
        options={[
          {
            value: 'disabled',
            label: 'Disabled',
          },
          {
            value: 'automatic',
            label: 'Automatic',
          },
          {
            value: 'manual',
            label: 'Manual',
          },
        ]}
        onChange={value => onMetadataModeChange(value as MetadataMode)}
      />
      {metadataMode === 'automatic' && (
        <div className="mt-3 space-y-3">
          <div className="body-xs-regular text-text-tertiary">Automatically generate metadata filtering conditions based on Query Variable.</div>
          <PanelField title="Metadata Model">
            <SelectControl value={metadataModel} onChange={onMetadataModelChange}>
              {workflowModelOptions.map(model => <option key={model} value={model}>{model}</option>)}
            </SelectControl>
          </PanelField>
          <RangeField label="Temperature" value={metadataTemperature} min={0} max={1} step={0.1} onChange={onMetadataTemperatureChange} />
        </div>
      )}
      {metadataMode === 'manual' && (
        <div className="mt-3 rounded-xl border border-components-panel-border bg-components-panel-on-panel-item-bg p-3">
          <div className="mb-3 flex items-center justify-between">
            <div className="system-xs-semibold-uppercase text-text-tertiary">Conditions</div>
            <SegmentedControl
              value={metadataLogicalOperator}
              options={[
                {
                  value: 'and',
                  label: 'AND',
                },
                {
                  value: 'or',
                  label: 'OR',
                },
              ]}
              onChange={value => onMetadataLogicalOperatorChange(value as LogicalOperator)}
              compact
            />
          </div>
          <div className="space-y-2">
            {conditions.map(condition => (
              <div key={condition.id} className="rounded-lg border border-divider-subtle bg-background-default-subtle p-2">
                <div className="mb-2 flex items-center gap-2">
                  <SelectControl value={condition.metadataId} onChange={value => onUpdateCondition(condition.id, { metadataId: value })}>
                    {metadataList.map(metadata => (
                      <option key={metadata.id} value={metadata.id}>{metadata.name}</option>
                    ))}
                  </SelectControl>
                  <button type="button" className="flex size-8 shrink-0 items-center justify-center rounded-lg text-text-tertiary hover:bg-state-base-hover" aria-label="Remove condition" onClick={() => onRemoveCondition(condition.id)}>
                    <RiDeleteBinLine className="size-4" />
                  </button>
                </div>
                <div className="grid grid-cols-[1fr_1fr] gap-2">
                  <SelectControl value={condition.operator} onChange={value => onUpdateCondition(condition.id, { operator: value })}>
                    {comparisonOperators.map(operator => <option key={operator} value={operator}>{operator}</option>)}
                  </SelectControl>
                  <SelectControl value={condition.valueSource} onChange={value => onUpdateCondition(condition.id, { valueSource: value as MetadataCondition['valueSource'] })}>
                    <option value="constant">Constant</option>
                    <option value="variable">Variable</option>
                  </SelectControl>
                </div>
                <div className="mt-2">
                  {condition.valueSource === 'constant'
                    ? <TextInput value={condition.value} onChange={value => onUpdateCondition(condition.id, { value })} placeholder="Enter value" />
                    : (
                        <SelectControl value={condition.variableSelector} onChange={value => onUpdateCondition(condition.id, { variableSelector: value })}>
                          {variableOptions.map(variable => <option key={variable.id} value={variable.selector}>{variable.selector}</option>)}
                        </SelectControl>
                      )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function OutputVariables() {
  return (
    <div className="border-t border-divider-subtle px-4 py-4">
      <div className="mb-2 system-sm-semibold-uppercase text-text-secondary">Output Variables</div>
      <div className="overflow-hidden rounded-xl border border-divider-subtle">
        {workflowOutputVars.map(([name, type, description], index) => (
          <div key={name} className={cn('grid grid-cols-[116px_92px_1fr] gap-2 px-3 py-2 system-xs-regular', index !== 0 && 'border-t border-divider-subtle')}>
            <div className={index === 0 ? 'font-semibold text-text-secondary' : 'pl-3 text-text-tertiary'}>{name}</div>
            <div className="text-text-accent">{type}</div>
            <div className="text-text-tertiary">{description}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

function SegmentedControl({
  value,
  options,
  onChange,
  compact = false,
}: {
  value: string
  options: { value: string; label: string }[]
  onChange: (value: string) => void
  compact?: boolean
}) {
  return (
    <div
      className={cn('grid gap-1 rounded-lg bg-components-segmented-control-bg-normal p-0.5', compact && 'grid-cols-2')}
      style={compact ? undefined : { gridTemplateColumns: `repeat(${options.length}, minmax(0, 1fr))` }}
    >
      {options.map(option => (
        <button
          key={option.value}
          type="button"
          className={cn(
            'flex h-7 items-center justify-center rounded-md px-2 system-xs-medium text-text-tertiary hover:text-text-secondary',
            value === option.value && 'bg-components-segmented-control-item-active-bg text-text-secondary shadow-xs',
          )}
          onClick={() => onChange(option.value)}
        >
          {option.label}
        </button>
      ))}
    </div>
  )
}

function ToggleRow({
  label,
  enabled,
  onChange,
}: {
  label: string
  enabled: boolean
  onChange: (value: boolean) => void
}) {
  return (
    <label className="flex h-8 cursor-pointer items-center justify-between rounded-lg">
      <span className="system-sm-semibold text-text-secondary">{label}</span>
      <Switch size="md" checked={enabled} onCheckedChange={onChange} aria-label={label} />
    </label>
  )
}

function RangeField({
  label,
  value,
  min,
  max,
  step,
  onChange,
}: {
  label: string
  value: number
  min: number
  max: number
  step: number
  onChange: (value: number) => void
}) {
  return (
    <div>
      <div className="mb-1 flex items-center justify-between">
        <div className="system-sm-semibold text-text-secondary">{label}</div>
        <div className="system-xs-medium text-text-tertiary">{value}</div>
      </div>
      <Slider min={min} max={max} step={step} value={value} onValueChange={onChange} aria-label={label} />
    </div>
  )
}

function ThresholdField({
  enabled,
  onEnabledChange,
  value,
  onChange,
}: {
  enabled: boolean
  onEnabledChange: (value: boolean) => void
  value: number
  onChange: (value: number) => void
}) {
  return (
    <div>
      <ToggleRow label="Score Threshold" enabled={enabled} onChange={onEnabledChange} />
      {enabled && <RangeField label="Score" value={value} min={0} max={1} step={0.01} onChange={onChange} />}
    </div>
  )
}

function WarningText({ text }: { text: string }) {
  return (
    <div className="rounded-lg bg-state-warning-bg px-3 py-2 system-xs-medium text-text-warning">
      {text}
    </div>
  )
}
