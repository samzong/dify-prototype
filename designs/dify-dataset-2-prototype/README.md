# Dify Dataset 2.0 原型调研包

这是 Dify Dataset / Knowledge / RAG 模块的产品调研包，服务两个目标：

1. 帮助新负责 Dataset 模块的产品经理建立功能画像和产品意识矩阵。
2. 为后续 Dify Dataset 2.0 / KnowledgeFS 产品化 HTML 原型提供依据。

## 建议阅读顺序

1. `01-dify-dataset-current-model.md`
2. `02-workflow-field-contract.md`
3. `03-knowledgefs-to-dify-dataset-2.md`
4. `04-user-story-map-and-information-flow.md`
5. `05-pm-product-consciousness-matrix.md`
6. `06-prototype-brief.md`
7. `07-dify-rag-pm-agent.md`

## 核心判断

Dify Dataset 不是文档增删改查。它是把用户数据连接到 App 和 Workflow 运行时的 RAG 生命周期容器。

KnowledgeFS 不应该被原样复制成一个裸露的管理后台。它应该被翻译成 Dify 的产品界面和用户语言：

- Knowledge Space
- Connected Source
- Import / Publish Task
- Index Version
- Evidence Result
- Answer Trace
- Golden Question
- Health Check
- Retention Policy

## 重要本地来源

- Dify 源码：`/Users/x/git/lg/dify`
- Dify 文档：`/Users/x/git/lg/dify-docs`
- KnowledgeFS 源码：`/Users/x/git/lg/knowledge-fs`
- 全局 agent 记忆：`/Users/x/.agents/agents/dify-rag-pm`

## 原型目标

最终原型应该放在这个目录，不进入 Dify 源码仓库。

建议未来 HTML 入口：

```text
/Users/x/git/lg/dify-design/dify-dataset-2-prototype/index.html
```
