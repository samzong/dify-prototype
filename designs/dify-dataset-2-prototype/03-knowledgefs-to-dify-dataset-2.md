# 03. KnowledgeFS 到 Dify Dataset 2.0 的产品映射

## 定位

KnowledgeFS 应该成为 Dify Dataset 2.0 的能力底座，而不是被原样复制成一个裸露的管理后台。

Dify 用户需要的是产品概念，而不是存储、锁、索引指纹、对象路径和一致性原语。

## 核心翻译表

| KnowledgeFS 概念 | 原始含义 | Dify 产品名称 | 面向对象 |
|---|---|---|---|
| `KnowledgeSpace` | 租户内知识容器 | Dataset 2.0 / Knowledge Space | 所有构建者 |
| `KnowledgeSpaceManifest` | 空间级策略与配置 | 高级设置 | 管理员 |
| `Source` | upload/object-storage/connector/web 来源 | 数据源 | 构建者 |
| `ResourceMount` | 挂载的资源 | 已连接数据源 | 构建者/管理员 |
| `DocumentAsset` | 已保存的上传或同步文件 | 文档资产 | 构建者 |
| `ParseArtifact` | 解析产物 | 解析内容 | 构建者/管理员 |
| `KnowledgeNode` | 可检索知识单元 | Chunk / Node | 构建者 |
| `IndexProjection` | 向量、全文、metadata、图索引投影 | 索引版本 | 构建者/管理员 |
| `KnowledgeSpaceStagedCommit` | 导入、重建、发布状态 | 导入/发布任务 | 构建者/管理员 |
| `KnowledgePath` | 物理/语义虚拟路径 | Knowledge Explorer | 构建者 |
| `EvidenceBundle` | 带状态的检索证据集合 | 证据结果 | 构建者/Workflow |
| `AnswerTrace` | 回答过程追踪 | 回答链路追踪 | 构建者/管理员 |
| `GoldenQuestion` | 评测基准问题 | 黄金问题 | PM/管理员 |
| `KnowledgeFsLease` | 锁/会话 | 运行中任务锁 | 仅管理员 |
| FSCK | 一致性问题 | 健康检查 | 仅管理员 |
| GC | 垃圾回收 | 存储清理 | 仅管理员 |

## 产品分层

### 第一层：构建者工作台

应该展示：

- Dataset / Knowledge Space
- 数据源
- 文档资产
- 处理状态
- 检索设置
- 证据测试
- Workflow 连接

应该隐藏：

- object key
- 原始 manifest JSON
- projection fingerprint
- lease records

### 第二层：Workflow 构建者界面

应该展示：

- 已选择的知识空间
- query 变量
- attachment 变量
- 检索策略
- 检索深度
- metadata filter
- 输出模式
- evidence state
- trace id

### 第三层：质量运营

应该展示：

- EvidenceBundle 历史
- AnswerTrace
- bad cases
- golden questions
- missing evidence 趋势
- conflict 趋势

### 第四层：管理与运维

应该展示：

- 健康检查
- 重建索引
- 保留策略
- 存储清理
- provider budget
- 失败导入任务
- 长时间运行任务

## Dataset 2.0 能力映射

### Knowledge Space

当前 Dify `Dataset` 已经有名称、描述、provider、permission、runtime mode、retrieval model、多模态标记等字段。

KnowledgeFS 补充了空间级策略：

- 一致性
- 保留策略
- 配额
- 存储
- parser policy
- projection policy

产品建议：

- 用户主名称仍然叫 Dataset / Knowledge。
- 在解释下一代能力时引入 Knowledge Space。
- 把 manifest 拆成分组设置，而不是暴露 JSON。

### 数据源与已连接数据源

当前 Dify 快速创建支持：

- 文件上传
- Notion
- 网页抓取
- 外部知识 API

KnowledgeFS 补充：

- object storage
- connector
- database
- GitHub
- Slack
- internal mounts
- freshness policy
- cache policy
- permission scope

产品建议：

- 给普通用户看数据源卡片：provider、状态、上次同步、freshness、权限。
- cache、source pointer、底层 capability 放到管理员设置中。

### 导入与发布任务

KnowledgeFS 阶段化提交状态可以翻译成：

| 原始状态 | 产品状态 |
|---|---|
| received | 已接收 |
| object-staged | 已上传 |
| object-verified | 已验证 |
| metadata-prepared | metadata 已准备 |
| artifacts-built | 已解析 |
| nodes-built | 已分块 |
| projections-built | 已索引 |
| published | 已发布 |
| failed-retryable | 失败，可重试 |
| failed-terminal | 失败 |
| canceled | 已取消 |

用户动作：

- 重试
- 取消
- 查看错误
- 重建索引
- 恢复上一个版本

### 检索模式

当前 Dify：

- Single / Multiple 是“知识来源选择策略”。

KnowledgeFS：

- Fast / Deep / Research 是“检索深度策略”。
- `RetrievalPlan` 暴露 `topK`、`denseTopK`、`ftsTopK`、`fusionLimit`、`rerankCandidateLimit`。

产品建议：

- 不要直接替换 Dify 的 Single / Multiple。
- 增加“检索深度”作为第二个维度。
- `RetrievalPlan` 只在 debug 或高级模式展示。

### EvidenceBundle

KnowledgeFS EvidenceBundle 有 answerability 状态：

- answerable
- partial
- not-enough-evidence
- conflict
- permission-limited

产品建议：

- Dataset 2.0 中把 Hit Testing 升级为 Evidence Testing。
- 展示 citations、missing evidence、conflicts、freshness、score、trace id。
- Workflow 输出增加 evidence state 和 trace。

### 质量闭环

KnowledgeFS 增加：

- GoldenQuestion
- AnswerTrace
- Production BadCase

产品建议：

- Dataset Workbench 增加 Quality tab。
- PM/管理员可以从 bad case 生成 golden question。
- 检索质量应该可观察，而不是靠主观感觉判断。

## API 缺口

Dify 集成前需要决策：

- Dify 的 `top_k` / `limit` 如何映射到 KnowledgeFS query。
- 元数据过滤结构如何兼容 Dify 当前格式。
- 输出模式如何定义：chunks、evidence、answer context。
- `auto` mode 是否对用户可见。
- 内部/外部知识库分数如何归一化。
- Workflow 变量解析继续留在 Dify 侧。

## 非目标

不要把这些作为普通用户控制项：

- 原始 manifest JSON
- 原始 projection fingerprint
- 对象存储 key
- lease 记录
- fsck 枚举
- 垃圾回收队列
- 解析产物 schema

## PM 决策清单

每个 KnowledgeFS 能力都要问：

1. 这是用户价值，还是实现细节？
2. 哪类用户需要它？
3. 它帮助用户创建、检索、解释还是维护知识？
4. 它能否被命名为 Dify 产品语言？
5. 它属于知识库工作台、工作流、质量页还是管理员入口？
6. 哪些字段必填？
7. 哪些非法组合必须前置阻断？
8. 什么证据能证明它有效？
