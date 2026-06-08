# 01. Dify Dataset 当前模型

## 产品定义

Dataset / Knowledge 是 Dify 的 RAG 生命周期容器。它不只是文档列表，而是同时负责数据源接入、文档处理、索引、检索配置、metadata 过滤、Workflow/App 使用、外部知识连接，以及 RAG Pipeline 运行模式。

换句话说，Dataset 是“知识如何进入 Dify、如何变成可检索上下文、如何被 Workflow 使用、如何被维护和优化”的完整产品模块。

## 代码锚点

后端：

- `/Users/x/git/lg/dify/api/models/dataset.py`
- `/Users/x/git/lg/dify/api/models/enums.py`
- `/Users/x/git/lg/dify/api/services/dataset_service.py`
- `/Users/x/git/lg/dify/api/services/hit_testing_service.py`
- `/Users/x/git/lg/dify/api/core/indexing_runner.py`
- `/Users/x/git/lg/dify/api/core/rag/retrieval/dataset_retrieval.py`
- `/Users/x/git/lg/dify/api/core/workflow/nodes/knowledge_retrieval/`
- `/Users/x/git/lg/dify/api/core/workflow/nodes/knowledge_index/`

前端：

- `/Users/x/git/lg/dify/web/models/datasets.ts`
- `/Users/x/git/lg/dify/web/app/components/datasets/`
- `/Users/x/git/lg/dify/web/app/components/workflow/nodes/knowledge-retrieval/`

文档：

- `/Users/x/git/lg/dify-docs/en/use-dify/knowledge/`

## 当前 Dataset 类型

| 类型 | 代码信号 | 产品含义 |
|---|---|---|
| 内部 Dataset | `provider = vendor` | Dify 管理文档、分段、索引、metadata 和检索配置。 |
| 外部知识库 | `provider = external` | Dify 保存外部 API 和知识库 ID，内容与检索由外部服务负责。 |
| RAG Pipeline Dataset | `runtime_mode = rag_pipeline` | 由 pipeline 生产知识内容。 |
| 多模态 Dataset | `is_multimodal = true` | Workflow 可以展示附件/图片查询变量。 |
| 高质量索引 Dataset | `indexing_technique = high_quality` | 支持 embedding、向量、全文、混合检索和 rerank。 |
| 经济索引 Dataset | `indexing_technique = economy` | 主要走关键词/倒排索引检索。 |
| 父子分段 Dataset | `doc_form = hierarchical_model` | 子块用于命中，父块用于提供更完整上下文。 |
| Q&A Dataset | `doc_form = qa_model` | 面向问答结构的分段形式。 |

## PM 必须关注的 Dataset 字段

| 字段 | 产品含义 |
|---|---|
| `provider` | Dify 自管知识还是外部知识。 |
| `permission` | 谁能访问或编辑这个 Dataset。 |
| `data_source_type` | 文档来源类型。 |
| `indexing_technique` | 经济索引还是高质量索引。 |
| `embedding_model` / `embedding_model_provider` | 高质量检索和 weighted score 的关键兼容字段。 |
| `retrieval_model` | 检索方式、`top_k`、阈值、rerank、权重。 |
| `summary_index_setting` | 摘要索引增强设置。 |
| `built_in_field_enabled` | 是否启用内置 metadata 字段。 |
| `runtime_mode` | 普通 Dataset 还是 RAG Pipeline Dataset。 |
| `pipeline_id` | RAG Pipeline 关联 ID。 |
| `chunk_structure` | Pipeline 中使用的 chunk 结构。 |
| `enable_api` | 是否启用 service API。 |
| `is_multimodal` | 是否支持附件/图片检索。 |

## 文档生命周期

当前技术状态：

```text
waiting -> parsing -> cleaning -> splitting -> indexing -> completed
                                      \-> paused
                                      \-> error
```

用户可理解状态：

| 技术状态 | 用户状态 | 产品动作 |
|---|---|---|
| `waiting` | 排队中 | 查看队列、取消。 |
| `parsing/cleaning/splitting/indexing` | 处理中 | 展示进度和当前阶段。 |
| `paused` | 已暂停 | 继续或取消。 |
| `error` | 失败 | 查看原因并重试。 |
| `completed + enabled + not archived` | 可用 | 可用于 Workflow 和检索测试。 |
| `completed + disabled` | 已禁用 | 启用或维护 metadata。 |
| `completed + archived` | 已归档 | 恢复或删除。 |

## 当前数据源类型

快速创建路径当前支持：

- `upload_file`
- `notion_import`
- `website_crawl`

后端枚举和 KnowledgeFS 中存在更宽的数据源概念，但在产品分析中不能直接宣称它们已经是当前 Dify 用户界面能力，除非前端和 controller 流程都支持。

## 检索方式

当前检索方法：

- 语义检索
- 全文检索
- 混合检索
- 关键词检索

当前 Workflow 检索策略：

- Single retrieval：使用 LLM router 选择一个 Dataset。
- Multiple retrieval：跨多个 Dataset 检索并合并/rerank。

## 产品含义

Dataset UI 不应该按“文档 CRUD”来设计，而应该设计成一个工作台：

- 数据源管理
- 文档处理状态机
- 检索配置
- 证据测试
- Workflow 连接器
- 质量运营
- 管理维护
