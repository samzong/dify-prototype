# 02. 工作流字段契约

## 范围

本文描述工作流 Knowledge Retrieval 节点如何把工作流变量连接到 Dataset 检索运行时。

这是 Dataset 产品经理最需要掌握的内容之一，因为用户价值最终发生在工作流运行时，而不是停留在 Knowledge 管理页。

## 代码锚点

- `/Users/x/git/lg/dify/api/core/workflow/nodes/knowledge_retrieval/entities.py`
- `/Users/x/git/lg/dify/api/core/workflow/nodes/knowledge_retrieval/knowledge_retrieval_node.py`
- `/Users/x/git/lg/dify/api/core/rag/retrieval/dataset_retrieval.py`
- `/Users/x/git/lg/dify/web/app/components/workflow/nodes/knowledge-retrieval/types.ts`
- `/Users/x/git/lg/dify/web/app/components/workflow/nodes/knowledge-retrieval/panel.tsx`
- `/Users/x/git/lg/dify/web/app/components/workflow/nodes/knowledge-retrieval/utils.ts`

## 节点字段

| 字段 | 含义 | 是否必填 | 条件 | 运行时影响 |
|---|---:|---|---|---|
| `dataset_ids` | 选择的知识库 | 是 | 始终需要 | 决定检索范围。 |
| `query_variable_selector` | 文本 query 的 Workflow 变量选择器 | 通常是 | 文本检索和 single retrieval 需要 | 运行时从变量池解析值。 |
| `query_attachment_selector` | 文件/图片 query 的变量选择器 | 否 | 只在多模态 Dataset 场景展示 | 运行时解析 file reference 为 attachment id。 |
| `retrieval_mode` | single 或 multiple | 是 | 始终需要 | 决定走 LLM 路由还是多库检索。 |
| `single_retrieval_config.model` | LLM router 模型 | 是 | `retrieval_mode = single` 时需要 | LLM 根据 query 和 Dataset 描述选择一个 Dataset。 |
| `multiple_retrieval_config.top_k` | 候选数量 | 是 | `retrieval_mode = multiple` 时需要 | 传入检索运行时。 |
| `score_threshold` | 最低得分阈值 | 否 | multiple 模式 | 缺省时按 `0.0` 处理。 |
| `reranking_mode` | rerank model 或 weighted score | 条件必填 | multiple 模式 | 决定检索后处理策略。 |
| `reranking_enable` | 是否启用 rerank | 条件必填 | multiple 模式 | 控制 rerank model 行为。 |
| `reranking_model` | provider/model 组合 | 条件必填 | 混合组合需要 | 传给 reranking 服务。 |
| `weights` | 向量/关键词权重 | 条件必填 | weighted score 模式 | 作为 weighted score 配置传入。 |
| `metadata_filtering_mode` | disabled / automatic / manual | 否 | 默认 disabled | 控制是否启用 metadata 过滤。 |
| `metadata_model_config` | 自动 metadata 过滤使用的模型 | 条件必填 | automatic 模式 | 根据 query 推断过滤条件。 |
| `metadata_filtering_conditions` | 手动 metadata 过滤条件 | 条件必填 | manual 模式 | 运行时会解析 Workflow 变量。 |

## 变量选择器语义

`query_variable_selector` 不是普通文本框，而是 Workflow 变量选择器。

产品要求：

- 文案应该叫“Query variable”，不是“Question”。
- 必须展示变量来自哪个节点、变量类型是什么。
- 应拒绝非字符串变量。
- 没有选择多模态 Dataset 时，不应展示 attachment selector。

## Single Retrieval

Single retrieval 的含义是：用 LLM 把 query 路由到一个 Dataset。

必需字段：

- `dataset_ids`
- `query_variable_selector`
- `single_retrieval_config.model`

产品含义：

- Dataset 描述会变成路由依据。
- Dataset 描述太空泛会降低路由质量。
- UI 必须说明“模型会选择一个知识来源”，而不是让用户误解为“只查询第一个知识库”。

## Multiple Retrieval

Multiple retrieval 的含义是：跨选中的 Dataset 检索，然后合并、rerank 或按权重打分。

必需字段：

- `dataset_ids`
- `multiple_retrieval_config.top_k`

可选字段：

- query 变量
- attachment 变量
- 阈值
- reranking model
- weighted score
- metadata filter

## 非法组合与保护规则

| 组合 | 当前运行时行为 | 产品要求 |
|---|---|---|
| 高质量与经济索引混选但没有重排模型 | 运行时报错 | 界面必须强制配置重排模型。 |
| 内部与外部知识库混选 | 分数不可直接比较 | 界面应推荐或强制配置重排模型，并解释原因。 |
| embedding model/provider 不一致却使用 weighted score | 运行时报错 | 界面必须禁用 weighted score。 |
| weighted score 缺少 weights | 运行时报错 | 界面必须要求向量/关键词权重。 |
| single retrieval 缺少模型 | 运行时报错 | 界面必须要求 LLM 配置。 |
| 自动元数据过滤缺少模型 | 运行时报错 | 界面必须要求配置元数据模型。 |
| 手动元数据过滤没有条件 | 过滤无意义或弱 | 界面应要求至少一个条件或明确警告。 |
| 没有多模态 Dataset 却展示附件选择器 | 前端会清空/隐藏 | 界面应直接隐藏。 |
| 多个 Dataset 的 metadata 字段不一致 | 前端取交集 | 界面应解释为什么部分字段消失。 |

## Metadata Filter

模式：

- Disabled
- Automatic
- Manual

常见操作符：

- contains
- not contains
- start with
- end with
- is
- is not
- empty
- not empty
- =
- !=
- >
- <
- >=
- <=
- is null
- is not null
- in
- not in
- before
- after

manual 模式中的值可以包含 Workflow 变量模板，运行时会从变量池解析。

## 当前输出

当前输出：

```text
result: Array[Object]
```

当前子字段：

- `content`
- `title`
- `url`
- `icon`
- `metadata`
- `files`

Dataset 2.0 建议新增输出字段：

- `evidence_state`
- `trace_id`
- `citations`
- `missing_evidence`
- `conflicts`
- `retrieval_plan`

## PM 检查清单

修改工作流 Knowledge Retrieval 界面之前，必须确认：

- 界面是否把变量选择器和文本输入区分开？
- 界面是否提前阻止非法检索组合？
- 界面是否说明 single 模式是模型路由？
- 多 Dataset 场景下，界面是否只展示共同 metadata 字段？
- UI 是否让下游节点清楚看到输出结构？
