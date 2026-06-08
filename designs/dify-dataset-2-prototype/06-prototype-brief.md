# 06. 产品原型说明

## 目标

在 `/Users/x/git/lg/dify-design/dify-dataset-2-prototype` 下构建一个 Dify 风格的 HTML 原型，用来表达 Dataset 2.0 作为 RAG 生命周期工作台的产品形态。

这个原型要解释四件事：

- 知识库如何被管理。
- 单个知识库如何进入工作台持续维护。
- 命中测试如何升级为证据测试。
- 知识库如何在工作流 Knowledge Retrieval 节点中被使用。

## 视觉来源

原型应该以当前 Dify 页面为视觉来源：

- `web/app/components/datasets/list/index.tsx`
- `web/app/components/datasets/list/datasets.tsx`
- `web/app/components/datasets/list/dataset-card/index.tsx`
- `web/app/components/datasets/list/new-dataset-card/index.tsx`
- `web/app/components/workflow/nodes/knowledge-retrieval/panel.tsx`
- `web/app/components/workflow/nodes/knowledge-retrieval/components/retrieval-config.tsx`
- `web/app/components/workflow/nodes/knowledge-retrieval/components/metadata/*`

不要做营销落地页，不要做新品牌页。第一屏必须是可用的产品界面。

## 视觉约束

- 使用 Dify 当前工作台风格。
- 浅色背景，信息密度高。
- 顶部工具栏紧凑。
- 知识库卡片网格。
- 8-12px 圆角界面元素。
- 0.5px 或 1px 边框。
- 柔和卡片和浮层阴影。
- 小型 badge 和状态标签。
- 模式切换用 segmented control。
- 检索设置使用 popover 或 drawer。
- 不做 hero section。
- 不做装饰性渐变背景、光斑、抽象插画。
- 不在普通用户界面展示底层工程词汇。

## 必须包含的界面

### 界面 A：知识库列表

必须展示：

- All Knowledge 勾选项。
- 标签过滤。
- 搜索。
- Service API 按钮。
- External API 按钮。
- 创建知识库卡片。
- 不同类型的知识库卡片：内部知识库、外部知识库、Pipeline 知识库、多模态知识库、同步失败知识库、索引过期知识库。

每张卡片应该展示：

- 名称。
- 描述。
- 类型 badge。
- runtime mode。
- 数据源数量。
- 文档数量。
- 可用文档数量。
- 检索摘要。
- 证据健康状态。
- 最近更新时间或最近测试时间。

### 界面 B：Dataset Workbench

头部必须展示：

- 名称。
- 类型。
- 权限。
- 状态。
- 被哪些 App 或工作流使用。
- API 是否启用。
- 操作：添加数据源、测试检索、重建索引。

Tab 必须包含：

- Documents：文档和状态。
- Sources：数据源和同步。
- Retrieval：检索配置。
- Evidence：证据测试。
- Quality：坏例、黄金问题、追踪。
- Settings：权限、API、保留策略、高级设置。

### 界面 C：证据测试

必须展示：

- 查询输入框。
- 检索模式：Fast / Deep / Research。
- `EvidenceBundle` 结果。
- 可回答状态。
- 引用内容。
- 缺失证据。
- 冲突证据。
- trace id。
- 结果可加入坏例或黄金问题的动作。

### 界面 D：工作流 Knowledge Retrieval 面板

必须展示：

- 查询变量选择器。
- 附件变量选择器。
- 已选知识库列表。
- 检索设置按钮和浮层。
- 元数据过滤区域。
- 输出变量结构。

必须展示的护栏示例：

- 混合 high_quality 和 economy 索引时需要重排。
- 混合内部和外部知识库时需要重排或明确合并策略。
- embedding provider/model 不一致时禁用 weighted score。
- 自动元数据过滤需要模型配置。
- 手动元数据过滤至少需要一个条件。

## 原型数据要求

原型中使用的示例数据必须服务于产品判断，而不是随机占位：

- 至少一个可用知识库。
- 至少一个外部知识库。
- 至少一个索引失败或同步失败知识库。
- 至少一个索引过期知识库。
- 至少一个多模态知识库。
- 至少一次证据测试结果包含缺失证据。
- 至少一次证据测试结果包含冲突证据。
- 工作流面板中至少展示一个非法组合提示。

## 原型验收标准

- 打开 `index.html` 后第一屏就是知识库管理界面。
- 用户可以在知识库列表、工作台、证据测试、工作流面板之间切换。
- 工作台 tab 可以切换。
- 检索设置浮层可以打开。
- 护栏提示随配置变化出现。
- 桌面宽度下信息不重叠、不溢出。
- 不依赖 Dify 源码仓库，不写入 `/Users/x/git/lg/dify`。
