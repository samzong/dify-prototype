# 08. 未决问题与下一步

## 产品未决问题

1. Dataset 2.0 是否应该把 “Knowledge Space” 作为用户可见术语，还是继续使用 “Knowledge”，把 Space 作为底层技术概念隐藏？
2. Fast / Deep / Research 三种模式应该同时出现在 Dataset 测试和工作流节点里，还是只在 Dataset 测试中出现，工作流使用更稳定的策略名？
3. `auto` 检索模式是否应该用户可见，还是作为内部策略解析结果？
4. Evidence Testing 应该直接替代 Hit Testing，还是先并存一段时间？
5. Quality tab 应该对所有构建者开放，还是仅对工作区管理员开放？
6. Dify 应该如何归一化内部知识库和外部知识库的 score？
7. 工作流输出模式应该是什么：chunks、evidence、answer context，还是允许用户选择？
8. 保留策略、存储清理、健康检查应暴露给普通工作区管理者多少？
9. Dataset 2.0 是否需要“被使用位置”视图，明确展示哪些 App、Chatflow、Workflow 正在依赖它？
10. 索引过期、数据源过期、检索配置过期是否要拆成不同状态，还是合并成一个用户可理解的“需要更新”状态？

## API 未决问题

1. KnowledgeFS 的元数据过滤如何映射到当前 Dify 元数据过滤结构？
2. KnowledgeFS query API 是否需要接受 Dify 传入的显式 `top_k` / `limit`？
3. `activeDocumentIds` 和 `activeEntityIds` 应该如何在工作流节点中暴露？
4. `AnswerTrace` id 应该存储在 Dify 运行时 metadata 的哪个位置？
5. `DatasetQuery` 如何演进，才能支持 `EvidenceBundle` 历史记录？
6. 外部知识库的检索结果如何补齐当前 `Source` 输出结构里的 title、url、icon、metadata、files？
7. 多模态知识库在工作流中的附件变量和文本查询变量如何组合？
8. KnowledgeFS 的发布/阶段化提交状态如何映射到 Dify 当前文档索引状态？

## 原型下一步

1. 在本目录创建 `index.html`。
2. 实现四个主界面切换：知识库列表、工作台、证据测试、工作流面板。
3. 实现工作台 tab 切换。
4. 实现检索设置浮层。
5. 实现检索护栏提示。
6. 实现 `EvidenceBundle` 状态切换。
7. 实现一组贴近 Dify 的示例知识库数据。
8. 桌面宽度下做视觉检查，确保文字不重叠、不溢出。

## 建议后续文件结构

```text
index.html
assets/
  screenshots/
  notes/
```

## 明确边界

- 原型文件放在 `/Users/x/git/lg/dify-design/dify-dataset-2-prototype`。
- 不把原型或调研文档放进 `/Users/x/git/lg/dify`。
- Agent 文件放在 `/Users/x/.agents/agents/dify-rag-pm`。
- 技术字段可以保留英文代码名，但解释文字必须中文。
- 后续进入真正产品方案时，继续以源码为准，不把当前文档当成最终事实。
