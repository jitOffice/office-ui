# 组件体系与分期路线图

## 1. 架构基石：命令系统（Command Registry）

**这是本库与普通组件库最根本的分歧，也是唯一必须先写、写对、不可回退的抽象。**

Office 应用里，同一个"加粗"要出现在 6 个地方：Ribbon 按钮、右键菜单、快捷键 `Ctrl+B`、命令面板搜索结果、撤销历史、宏/脚本 API。如果每处各自实现，必然出现状态不同步（Ribbon 显示未加粗但文本已加粗）——这是自研办公界面最常见的 bug 来源。

解法：**UI 组件不持有行为，只渲染命令**。命令是唯一事实来源。

```ts
// 用户注册一次，六处自动一致
oj.commands.register({
  id: 'format.bold',
  label: '加粗',                       // 由 i18n key 解析，见 §5
  icon: 'oj-format-bold',
  keys: 'mod+b',
  group: '开始',
  tooltip: '加粗文本 (Ctrl+B)',
  // 状态由文档引擎提供，UI 只订阅
  state: () => ({
    enabled: editor.selection.isRange(),
    active:  editor.marks.has('bold'),
    indeterminate: editor.marks.some('bold'),   // 部分加粗 → 按钮半激活
  }),
  run: () => editor.toggleMark('bold'),          // 必须可撤销
})
```

```ts
interface OjCommand {
  id: string                       // 'namespace.action'，全局唯一，点分
  label: string | IntlMessage
  description?: string | IntlMessage
  icon?: string
  keys?: string | string[]         // 'mod+b'；mod 在 Win/Linux=Ctrl，Mac=Cmd
  group?: string                   // Ribbon 分组归属
  order?: number
  when?: (ctx: OjContext) => boolean      // 是否适用当前上下文（选中图片时才出现）
  state?: (ctx: OjContext) => OjCommandState
  run: (ctx: OjContext, arg?: unknown) => void | Promise<void>
  history?: 'undoable' | 'transient' | 'none'   // 是否进撤销栈
}

interface OjCommandState {
  enabled?: boolean
  active?: boolean          // 切换态按钮的按下状态
  indeterminate?: boolean   // 部分生效：加粗按钮的第三种视觉态
  value?: string | number   // 字号、颜色等带当前值
  label?: string            // 运行时改文案："接受所有修订" ↔ "接受此修订"
}
```

消费同一注册表的组件：`OjRibbon`、`OjToolbar`、`OjCommandButton`、`OjContextMenu`、`OjCommandPalette`、`OjHotkeys`、`OjHistoryTimeline`、`OjStatusBar`。

**状态订阅必须靠通知，不能靠轮询。** 宿主引擎的状态源是否"响应式"不重要，重要的是它能在变化时
叫我们一次——所以契约只有 `subscribe(listener)`，不要求它是 Vue 的 `ref`（ADR-0005 把这一点
从"需是 Vue 响应式源"改成框架中立，因为协同服务端与 jQuery 宿主也要读同一张表）。
反之，让用户自己记得调 `oj.commands.refresh()` 仍然是设计缺陷：`bind(source)` 必须是接入的第一步，
`refresh()` 只作为给不出通知源的宿主的退路存在。

### 命令状态刷新节流
选区高频变化时 `state()` 会被大量调用。注册表内置 `requestAnimationFrame` 合帧 + 脏检查（`active/enabled/value` 未变则不触发重渲染），否则 Ribbon 在拖选长文档时会掉帧。

### 落地契约（M0 已实现，`packages/shared/src/commands/`）

实现把上面那段设计钉成了七条可执行语义，其中四条是设计文档当时**没写**、但不写就会出事的：

```ts
import { createCommandRegistry } from '@jitoffice/shared/commands'

const oj = createCommandRegistry<Editor>({
  context: () => editor,                 // 每次求值取当前上下文
  resolve: (msg) => i18n.t(msg),          // 不传则退回 key 本身，保证零依赖可运行
  history: undoStack,                     // { transact(label, invoke), recordRecent(label) }
  schedule: raf,                          // 测试可注入手动泵
  dev: import.meta.env.DEV,
  onError: (e, id) => report(e, id),
})

oj.register(command)                      // 返回撤销函数
oj.bind({ subscribe: (l) => editor.on('change', l) })   // 唯一的状态源契约
oj.state('format.bold')                   // 记忆化取值
oj.run('format.bold')                     // 不 rethrow，见 OjRunResult
oj.list({ group: '开始', includeUnavailable: false })
```

| # | 语义 | 为什么必须有 |
|---|---|---|
| 1 | `OjReactiveSource` 只有 `subscribe(listener): () => void` | Vue 的 `watch`、Redux store、手写事件总线都满足它；注册表因此不必 import 任何框架（ADR-0005） |
| 2 | 失效是**代次（epoch）递增 + 一帧一轮**，同一代次内每个命令只求值一次 | 一千次 `selectionchange` 只重算 200 次而不是 200000 次 |
| 3 | 脏检查的基准是"**上次广播值**"，不是"上次求值" | 组件自己调 `state()` 会顺手更新缓存；若拿缓存做基准，Vue 侧的 ref 会永久停在旧值 |
| 4 | 首次求值**建立基线但不广播** | 订阅方自己会先读一次初值，再推一次"undefined → 当前值"是伪变化，每个按钮白渲染一遍 |
| 5 | `run()` 里的 `enabled` **现算**，不读缓存 | 缓存里的 `enabled: true` 放行一个刚被禁用的命令 = 执行了本不该执行的写操作 |
| 6 | `run()` 不 rethrow，用 `{ ok, skipped, error }` 表达；无 `onError` 时走 `console.error` | 一个命令内部异常不该打断整条快捷键链，但也绝不静默吞异常 |
| 7 | `history` **缺省即 `undoable`** | 漏标撤销的格式命令让用户失去找回能力；反向缺省会让视图命令污染 Ctrl+Z。两者都是 bug，但前者的后果是数据 |

`run()` 挡下命令时 `skipped` 取 `'not-found' | 'when' | 'disabled'` 三值之一——
`OjContextMenu` 与 `OjHotkey` 需要区分"这条命令不存在"和"这条命令此刻不该出现"，
前者是配置错误，后者是正常态。

消费同一张表还要求一条**使用约束**（不是实现细节，要写进文档站）：
`state(ctx)` 必须是 O(1) 读取，禁止在里头遍历或异步取数。粗粒度失效把它该省的
依赖追踪换成了"一轮求值 0.006 ms"（200 命令，实测见 ADR-0005），
这个前提一旦被打破，单个慢命令就会拖慢整帧。

---

## 2. 统一 API 规范

| 项 | 规定 | 理由 |
|---|---|---|
| 组件前缀 | `Oj`，模板中 `<oj-button>` | 与 `El`/`A`/`t` 区隔，避免全局冲突 |
| class | BEM：`oj-block__elem--mod` | 与 token 命名空间一致 |
| 状态表达 | **属性优先于 class**：`[data-active]` `[aria-disabled]` `[aria-expanded]` | 天然满足无障碍；用户覆盖样式无需记 class 名 |
| v-model | 单值 `modelValue`；多值显式命名（`selection`、`visible`） | 与 Vue 3 生态一致 |
| v-model 修饰符 | `.lazy`（松手才提交）、`.number`、`.debounce="300"` | 拖动滑块/输入字号时必须能延迟提交，否则引擎被高频打断 |
| 事件 | `update:x` + 语义事件（`select` `commit` `cancel` `change`）；**`change` 只在用户操作后触发，程序化赋值不触发** | 区分"用户改了"与"我设了值"是表单类组件的常见事故点 |
| 尺寸 | `size: 'mini'\|'small'\|'medium'\|'large'`，默认取 `--oj-control-height-md` | 与密度 token 联动而非各自写死 |
| 布尔默认 | 除 `disabled` `visible` 外，一律默认 `false` | "默认开启的魔法行为"无法被关闭，是长期抱怨来源 |
| 插槽 | 每个具名插槽必须有同名 `xxx` prop 作为 fallback；文档标注作用域参数类型 | 保证 API 可被非 SFC 用户（UMD/h()）使用 |
| 受控/非受控 | 所有可选面板组件同时支持 `v-model` 与 `defaultVisible` | 只给受控会把简单场景写复杂 |
| 弹层归属 | 统一 `teleport` prop：`'body'\|'[selector]'\|false` | Office 场景必须能投进特定容器（全屏放映、iframe 内、打印区域） |
| 图标传参 | `icon` 接受字符串（注册表 id）**或**组件/插槽，二者等价 | UMD 用户无法传组件对象，只能给字符串 |
| 可访问名 | 所有纯图标组件**必须声明意图**：给 `label`（有语义）或标 `decorative`（装饰性，渲染 `aria-hidden`），两者皆无时 dev 模式告警 | 图标按钮无文本是办公界面最普遍的 a11y 缺陷。**2026-10-26 修订**：原文写的是"强制 `label`"，落地时发现 `<button aria-label="关闭"><OjIcon name="oj-close"/></button>` 这类正确用法会被误报——图标是装饰，硬写 label 会让读屏念两遍。契约因此从"必须给 label"收紧成"必须声明意图"，多出来的 `decorative` 是这条修订的产物 |

### 命名禁止清单
- 禁止 `show`/`isShow` → 用 `visible`
- 禁止 `onXxx` prop → 用事件
- 禁止 `hasXxx` 表示"是否渲染" → 用插槽/`v-if`
- 禁止缩写 prop（`tpl` `cfg` `cb`）

---

## 3. 组件清单

标记：⭐ = PRD 已点名 · 🔴 = L1 核心不可缺 · 🟡 = 有价值可延后

### A. 图标（`@jitoffice/icons`）
| 组件 | 说明 |
|---|---|
| ⭐🔴 `OjIcon` | 消费 SVG 组件 / `sprite.svg` `<use>` / JS 常量三种形态；`spin` `size` `label`；继承 currentColor。**2026-10-29 状态**：前两种已交付（`@jitoffice/icons/vue` 的每图组件、`dist/sprite.svg` 的 `<symbol>`），第三种是 `@jitoffice/icons` 根入口的 `icons` 常量（含 `viewBox`/`attrs`/`body`，canvas 直接用 `body` 绘制）；`spin` 未做。单枚组件 tree-shaken 后 **836 B gzip**（阈值 1 KB），由 size-limit 守着 |
| 🔴 `IconRegistry` | `add(name, svgString)` 运行时注册，支持业务自定义图标接入 Ribbon。**未做**——业务图标接入是 JitWord 实际采用时才会逼出来的需求，现在做等于凭空设计 API |
| 🔴 办公图标集 | **v1 交付 120 个**（当前 31 个，覆盖 E1/E2 用到的命令；管线已就绪，缺的是画，见 05 C2）；覆盖：字体（B/I/U/S/上下标/字符间距/清除格式）、段落（6 向对齐/缩进 4 种/行距/项目符号/编号/增加减少级别）、表格（插入/删除行列单元格/合并/边框九宫格/底纹）、插入（表格/图片/图标/页码/批注/链接/分隔线/分页符）、审阅（接受/拒绝/修订模式/显示标记）、视图（页面/大纲/Web/阅读/缩放/标尺/网格线）、文件（新建/分享/下载/打印/历史/权限/收藏/重命名） |
| 🟡 多色/分层图标 | 中日韩字形图标、彩色文档类型图标（docx/xlsx/pptx/pdf） |

图标必须**自绘**（见 00 号文档许可红线）。SVG 源文件入库，构建产出三种形态：Vue 组件（tree-shakable）、`sprite.svg`（供 `<use>` 消费，覆盖无构建器场景）、JS 常量（供 canvas 绘制）。**不产出图标字体**——字体二进制会静默合并各字形的原始许可且丢失许可文件，是授权链断裂的经典来源；`sprite.svg` 在无构建器场景下同样可用，没有理由承担这个风险。

### B. 命令与工具栏
| 组件 | 说明 |
|---|---|
| ⭐🔴 `OjRibbon` | 选项卡 + 组 + 启动器 + 自动折叠（双击标签收起，同 Word） |
| 🔴 `OjRibbonTab` / `OjRibbonGroup` | 组支持 `large/medium/small` 三档布局，宽度不足自动降级并溢出到 `»` |
| 🔴 `OjToolbar` | 单行工具条（JitKnow/轻量编辑器的简化形态），支持 `overflow: 'menu'\|'scroll'\|'wrap'` |
| ⭐ `OjCommandButton` | 从 `command` id 渲染，自动同步 active/indeterminate/disabled/tooltip/快捷键 |
| 🔴 `OjToggleButton` | 保持按下态，用于格式刷、修订模式 |
| 🔴 `OjSplitButton` | 主操作 + 下拉箭头分离，箭头区可独立点击 |
| 🔴 `OjDropdownButton` | 整块点击展开面板（颜色、边框、表格选择器） |
| 🔴 `OjCommandLauncher` | 组右下角小箭头 → 打开对话框（Word 的"段落"对话框入口） |
| 🔴 `OjQuickAccessBar` | 标题栏左侧常驻命令，支持用户自定义与命令面板添加 |
| 🔴 `OjContextMenu` | 右键菜单；**必须支持在 canvas 上按坐标弹出**（无 DOM 目标），这是办公场景刚需 |
| 🔴 `OjCommandPalette` | `Ctrl+/` 或 `Ctrl+P` 唤起，搜命令 + 搜文件 + 搜内容三源聚合 |
| 🔴 `OjTooltip` | 默认 400ms 延迟（同 Office）、`manual` 模式、支持富内容（图 + 描述 + 快捷键） |
| 🔴 `OjHotkey` | 注册/冲突检测/`mod` 平台适配/Mac 符号显示（⌘ vs Ctrl） |
| 🔴 `OjStatusBar` | 底部：视图切换 + 缩放 + 页码 + 字数 + 语言 + 协同状态 |
| 🟡 `OjRibbonGallery` | 命令的网格陈列（样式库、符号） |

### C. 选择器（办公特有，本库最大差异化）
| 组件 | 说明 |
|---|---|
| ⭐🔴 `OjTableGridPicker` | **PRD 点名**。见 §4 专项设计 |
| 🔴 `OjColorPicker` | 主题色（10 档梯度）/标准色/最近使用/自定义/`eyedropper`（EyeDropper API + 降级）；支持"字体色 vs 底纹色"双通道与透明色 |
| 🔴 `OjFontPicker` | 字体名 + 实时预览 + 中文字体本地名映射（`宋体=SimSun`）+ 未安装字体灰显 + 中英文字体分列（`ascii`/`eastAsia`/`hAnsi` 三属性，Word 的真实模型） |
| 🔴 `OjFontSizeField` | 字号：下拉常用值 + 手输 + 步进 + `pt`/`px`/`号`（初号/小四…）三套单位换算 |
| 🔴 `OjAlignmentPicker` | 九宫格对齐（水平×垂直），用于单元格与文本框 |
| 🔴 `OjLineSpacingPicker` | 1.0/1.15/1.5/1.8/2.0/固定值/多倍值，含"对齐网格"复选 |
| 🔴 `OjBorderPicker` | 线型 + 粗细 + 颜色 + 九宫格位置选择（Word 边框对话框模型） |
| 🔴 `OjNumberField` | 步进 + 单位后缀（mm/cm/pt/%）+ 方向键微调 + IME 安全 |
| 🔴 `OjSymbolPicker` | 分组符号库：中日韩标点、数学、箭头、序号、单位、装饰；含最近使用 |
| 🔴 `OjZoomControl` | 滑块 + 百分比输入 + 适应宽度/适应页面/100%；**必须与 canvas 缩放同步而非 CSS transform** |
| 🔴 `OjStyleGallery` | 段落/字符样式库，带真实排版预览（"Aa 标题 1"） |
| 🟡 `OjPageSetupPicker` | 纸张（A4/B5/Letter/自定义）+ 方向 + 边距 + 装订线 |
| 🟡 `OjGallery` | 通用图标网格选择器，上面多个 picker 的共用底座 |
| 🟡 `OjHighlightPicker` | 荧光笔色（半透明叠加，与底纹色不同语义） |
| 🟡 `OjEmojiPicker` | 归入 SymbolPicker 的一个分组，不独立成件 |

### D. 浮层与布局底座（内部共用，同时对外导出）
| 组件 | 说明 |
|---|---|
| 🔴 `OjPopper` | 定位引擎。**自研极小实现，不引入 Popper.js**：需支持锚定"矩形区域"（选区）而非仅元素、多区间选区取包围盒、边界翻转、`strategy: 'fixed'` 以适配 canvas 滚动容器。**2026-10-29 状态**：`placePopper()` 纯函数已落地（锚矩形/翻转/夹取，单测覆盖），面板本身就是 `position: fixed`；**多区间选区取包围盒**未做 |
| 🔴 `OjPortal` | teleport 封装 + 层级取自 `--oj-z-*` + 滚动锁 + 焦点陷阱。**2026-10-29 交付**：`to: 'body'\|'#sel'\|false`；`zIndex` 默认 `var(--oj-z-popover)`；滚动锁用计数（多个浮层同时开不会互相踩，解除时恢复原值而不是清空）；焦点陷阱含 Tab 首尾环绕，**卸载归还焦点**——这条掉不得，否则键盘用户关掉弹层就丢了位置 |
| 🔴 `OjTrigger` | `hover/click/focus/manual` 组合触发器，含离开延迟（下拉面板必须能移进去）。**2026-10-29 交付**：交互语义在零依赖的 `createTriggerMachine()`（注入 scheduler，9 例把每条时序钉死），组件只负责接线 + `OjPortal`/`OjPopper` 组合；受控/非受控都支持（`open` + `@update:open`） |
| 🔴 `OjSplitter` / `OjPaneGroup` | 可拖拽分栏（文档 + 批注侧栏），支持折叠到 0 与最小宽度约束 |
| 🔴 `OjDockPanel` | 可停靠/浮动/收起的面板（右侧属性、AI 任务面板） |
| 🔴 `OjVirtualList` | 变高虚拟列表（大纲、评论、缩略图），必须支持 `scrollToIndex` 与"锚点稳定"（上方插入不跳动） |
| 🔴 `OjDragDropContext` | 统一拖放协议（内部拖拽 vs 外部文件），带 `dataTransfer` 类型协商 |
| 🔴 `OjHotkeys`/`OjMeasure` | 尺寸测量（ResizeObserver + rAF 合帧）、SSR 安全 |
| 🟡 `OjResizable` | 图片/文本框八向手柄，含等比（Shift）与中心（Alt）约束 |

### E. 审阅与协同
| 组件 | 说明 |
|---|---|
| 🔴 `OjCommentThread` | 批注线程：作者、时间、回复、解决/重开、@提及、与正文锚点联动高亮 |
| 🔴 `OjReviewPanel` | 修订列表 + 逐条/全部接受拒绝 + 按作者/类型筛选 |
| 🔴 `OjPresenceAvatars` | 协同头像堆叠 + 悬停显示 + 点击跳到对方光标；超过 N 个折叠 |
| 🔴 `OjShareDialog` | 权限选择（私有/链接/组织/指定人）+ 角色 + 有效期；**UI 与后端解耦，全部走事件** |
| 🔴 `OjVersionHistory` | 时间线 + 命名版本 + 预览 + 恢复确认 |
| 🟡 `OjDiffViewer` | 双栏/内联 diff 文本对比 |
| 🟡 `OjMentionPopover` | `@` 提及，异步搜索 + 键盘导航 + 防抖取消 |
| 🟡 `OjTaskPane` | 右侧常驻任务面板（AI 助手、模板、属性） |
| 🟡 `OjReactionBar` | 表情回应 |

### F. 文件与内容生命周期
| 组件 | 说明 |
|---|---|
| 🔴 `OjDropZone` | 拖放导入，含整页遮罩、类型校验、多文件、粘贴图片 |
| 🔴 `OjFileNameHeader` | 内联重命名 + 收藏 + 协作状态 + 自动保存指示（"已保存到云端"） |
| 🔴 `OjSearchReplaceBar` | 查找/替换条：`Aa` 区分大小写、全字匹配、正则、上一个/下一个、全部替换、命中计数 |
| 🔴 `OjUploadProgress` | 分片进度 + 暂停/续传/失败重试 UI |
| 🟡 `OjTemplateGallery` | 模板库：分类 + 预览卡 + 搜索 + 使用次数 |
| 🟡 `OjRecentList` | 最近打开 |
| 🟡 `OjBreadcrumbPath` | 路径导航 + 中间省略 + 点击展开同级 |
| 🟡 `OjFileListItem` | 列表/网格双形态 |

### G. 文档/表格/演示外壳（L2）
| 组件 | 说明 |
|---|---|
| 🔴 `OjRuler` | 水平/垂直标尺，带左缩进/悬挂缩进/右缩进三个可拖标记 + 制表位 + 标尺单位切换（cm/in/pt/字符） |
| 🔴 `OjPaper` | A4 纸张容器：阴影、页边距参考线、分页符可视化、跨页阴影 |
| 🔴 `OjDocumentShell` | 标尺 + 缩放 + 滚动同步 + 页面流 + 选区层的组合骨架 |
| 🔴 `OjOutlineTree` | 大纲/目录，拖拽调整层级与顺序、与滚动位置双向跟随 |
| 🔴 `OjSelectionOverlay` | 选区绘制层（多区间、跨页、矩形/文本两种模式） |
| 🔴 `OjGridContainer` | 表格虚拟网格容器：行高列宽可拖、冻结窗格、选区、填充柄 |
| 🔴 `OjFormulaBar` | 编辑栏 + 函数提示 + `fx` 入口 |
| 🔴 `OjSheetTabs` | 工作表标签：重命名、颜色标记、横向滚动、右键菜单 |
| 🟡 `OjMinimap` | 长文档缩略导航 |
| 🟡 `OjSlideCanvas` / `OjLayerPanel` / `OjSlideThumbnails` / `OjPresenterBar` | 演示外壳 |
| 🟡 `OjConditionalFormatPanel` | 条件格式规则编辑 |

### 实现状态（2026-10-26）

上面 45 件是**目标清单**，不是已完成清单。当前实际交付 17 件（`@jitoffice/ui/vue`），其中 8 件在清单内、9 件在清单外：

| 清单内已实现 | 所属组 |
|---|---|
| `OjIcon` | A |
| `OjCommandButton`、`OjTooltip` | B |
| `OjTableGridPicker`、`OjZoomControl` | C |
| `OjPopper` | D |
| `OjSearchReplaceBar` | F |
| `OjRuler` | G（L2 首个） |

| 清单外已实现 | 位置 | 为什么在这里 |
|---|---|---|
| `OjDropdown` | B 的邻域 | 与 `OjDropdownButton` 有重叠但**不等价**：它只提供触发器 + 浮层，不绑定命令。要么并进 B 作为 `OjDropdownButton` 的底座，要么在 B 里单列——**待定** |
| `OjTabs` | B 的邻域 | Ribbon 的选项卡是它的一个用法，但它本身是通用外壳件 |
| `OjDialog` | B 的邻域 | `OjCommandLauncher` 要打开的就是它；清单里漏了"对话框"这一件 |
| `OjFileTree` | F 的邻域 | 与 `OjOutlineTree`（G）语义不同：文件树是文件，大纲是文档结构 |
| `OjSignaturePad` | 新增 | 印章/签名是 Office 场景刚需，45 件清单里完全没有这一类 |
| `OjStamp` | 新增 | 同上 |
| `OjWatermark` | 新增 | 同上 |
| `OjAiPanel` | E 的邻域 | 与 `OjTaskPane` 重叠；AI 侧栏是 JitWord/JitKnow 的实际需求，建议把 `OjTaskPane` 的定位改成"通用任务面板"、AI 面板作为它的一个 preset |
| `OjCodeBlock` | G 的邻域 | 文档节点级渲染件，严格说属于内核适配层 |

这 9 件是 E1/E2 为"外壳可演示"加进来的，先落地再回写。**需要你拍板的只有一处**：`OjDropdown` 与 `OjDropdownButton`、`OjAiPanel` 与 `OjTaskPane` 这两对是合并还是并列——合并会让 API 更少但语义更含糊，并列会让清单从 45 涨到 47。其余 7 件的归属按上表补进 §3 即可。

### 实现状态（2026-10-29 增补）

M1「Ribbon 闭环」的**组件面已收口**（`@jitoffice/ui/vue`）：`OjRibbon` / `OjRibbonTab` /
`OjRibbonGroup`（large/medium/small 自动降级、宽度自探、`»` 溢出、`launcher` 插槽）、
`OjToolbar`（`menu`/`scroll`/`wrap`）、`OjToggleButton` / `OjSplitButton` / `OjDropdownButton`、
`OjCommandLauncher`（组右下角入口，`aria-haspopup="dialog"`）、
`OjContextMenu`（**按矩形锚点定位**，canvas 右键没有 DOM 目标也成立）、
`OjHotkey`（冲突检测与 `mod` 平台适配）、`OjStatusBar`、`OjRibbonGallery`、`OjCommandPalette`；
D 组的 `OjPopper`（新增 `anchorBox`）/ `OjPortal` / `OjTrigger` 已交付。

语言层（04 §6.1）同时补上：`OjLocaleProvider` + `useLocale`（**结构类型**收运行时，`ui` 的
`dependencies` 仍为空）、`OjLocaleSwitcher`（原生 `<select>`，受控与非受控都给），
以及 `oj.common.language` 四语文案。Provider 负责把 `html[lang]` / `html[dir]` 与语言包同步、
卸载时归还宿主原值——tokens 的语言覆写层选择器正是 `html[lang|="ja"]`，少这一步就是"文案换了、
字体栈没换"的半切换。

**M1 仍缺**：图标 40 → 120（等 B4 的设计产能决策）、文档站骨架（毛玻璃 + 搜索 + 在线预览）。
`OjQuickAccessBar` 不在 M1 清单内，仍属未开工的 B 组件。

---

## 4. 专项：`OjTableGridPicker`（PRD 点名，作为架构样板）

选它做第一个完整实现的组件，因为它同时压测了浮层、键盘、i18n、canvas-free 交互、token 五套体系。

**交互模型**（对齐 Word/WPS）：
1. 点击 Ribbon"插入表格"→ 在按钮下方弹出面板，默认 `8×10` 网格。
2. 悬停单元格 → 从 `(1,1)` 到当前格整片高亮，底部实时显示 `3 × 5 表格`。
3. 点击 → 提交并关闭。
4. 面板底部"插入表格…"→ 打开 `OjDialog` 精确输入行列 + 默认套用样式 + "记住上次尺寸"。
5. **键盘可达**：方向键移动高亮、`Home/End` 跳边界、`Enter` 提交、`Esc` 关闭；打开时不抢焦点到网格，先停在搜索/首格，`Tab` 进入网格。
6. 网格上限 `10×20`，超出时提示"请使用插入表格对话框"（Word 的真实限制，用户预期一致）。

**API**：
```ts
<OjTableGridPicker
  v-model:open="open"
  :max="{ rows: 10, cols: 20 }"
  :default-size="lastUsed"
  :cell-size="24"          // 受密度 token 影响
  @select="(s) => insert(s.rows, s.cols)"
  @detail="openInsertDialog"
/>
```

**易被忽略的实现点**：
- 悬停高亮必须用**单个覆盖层 + CSS 变量**（`--oj-gp-row/--oj-gp-col`）绘制，不能给 200 个格子各自加 class——否则 mousemove 触发 200 次样式重算，在低配国产化机器上明显卡顿。
- 面板打开后鼠标移出网格区**不得**清空高亮（用户会移向"插入表格…"链接）。
- `cell-size` 小于 20px 时格子的 hover 命中区需外扩（`::before` 扩大热区），否则触屏与低 DPI 下几乎点不中。
- 文案 `"{rows} × {cols} 表格"` 在日语下语序不同 → 必须用带占位符的 message，禁止字符串拼接。

---

## 5. 无障碍与键盘模型（不可后补）

1. **焦点可见**：全局 `:focus-visible` 用 `--oj-focus-ring`。禁止 `outline: none` 而不提供替代。
2. **Ribbon 键盘导航**：`Alt` 唤起键提示（Key Tips，Word 的核心交互）、`←/→` 切标签、`Tab` 在组内移动、`Enter/Space` 激活。这是办公用户判断"是不是真办公组件库"的第一标准。
3. **弹层焦点管理**：打开时记忆触发元素、焦点入面板、`Esc` 关闭并归还焦点、`Tab` 循环不逃出面板（焦点陷阱）。
4. **ARIA 角色**：`OjRibbon` = `role="tablist"` + `tab` + `tabpanel`；`OjDropdownButton` = `aria-haspopup="true"` + `aria-expanded`；`OjTableGridPicker` 网格 = `role="grid"` + `gridcell` + `aria-selected`；`OjToggleButton` = `aria-pressed`。
5. **纯图标组件强制可命名**：`label` prop 缺失时 dev 环境 `console.warn` 并输出组件路径。
6. **对比度**：所有 token 组合需过 WCAG AA（正文 4.5:1，大字/图标 3:1）。构建期用脚本校验 Alias 表全部前景/背景组合，不达标直接失败。`--oj-text-4`（占位符 `#9A9CA6` on `#FFF` = 3.1:1）**不达标**，需调深至 `#8A8C96` 以上——这类问题必须在 token 层解决，而不是每个组件自己调。
7. **IME 安全**：所有可输入组件（字号、查找替换、单元格编辑）必须在 `compositionstart/end` 期间抑制 `Enter`/`Esc`/搜索触发。中日文用户是核心用户，此项出 bug 等于核心场景不可用。
8. **触屏降级**：hover 依赖的交互（Key Tips、网格选择）需提供长按/双击等价路径。

---

## 6. 分期路线图

原则：**每个里程碑都必须能被 JitWord 真实采用一个页面**，否则视为未交付。

### M0 · 地基（3 周，任务拆解见 [05-m0-delivery-plan.md](./05-m0-delivery-plan.md)）
`pnpm workspace` + Turborepo、CI、发布流水线；`@jitoffice/tokens` 三层结构与双产物；`@jitoffice/icons` 构建管线 + 首批 40 图标；`OjIcon`、`OjPopper`、`OjPortal`、`OjTrigger`；命令注册表（含 `state` 订阅与节流）；stylelint 魔法数卡关。
**验收**：一个 demo 页用 `<script src>` 引 UMD 渲染出带 tooltip 的图标按钮，且 tree-shaking 后 ESM 产物 ≤ 8 KB。

### M1 · Ribbon 闭环（4 周）→ 对应"6 个月 28 件"的前半
`OjCommandButton` `OjToggleButton` `OjSplitButton` `OjDropdownButton` `OjToolbar` `OjRibbon` `OjRibbonTab` `OjRibbonGroup` `OjCommandLauncher` `OjTooltip` `OjHotkey` `OjContextMenu` `OjStatusBar`；图标补到 120；`i18n` 四语包 + `LocaleProvider`；文档站骨架（毛玻璃主题 + 搜索 + 在线预览）。
**验收**：用 L1 组件 + 一个假编辑器状态，复刻 JitWord 顶部 Ribbon 全部交互，键盘可完整操作，包体 gzip ≤ 45 KB。

### M2 · 选择器集群（4 周）
`OjTableGridPicker`（PRD 点名）`OjColorPicker` `OjFontPicker` `OjFontSizeField` `OjAlignmentPicker` `OjLineSpacingPicker` `OjBorderPicker` `OjNumberField` `OjSymbolPicker` `OjZoomControl` `OjStyleGallery` `OjGallery`。
**验收**：格式相关命令端到端可用（选字体→字号→加粗→颜色→边框），三语无拼接文案，视觉回归 12 组通过。

### M3 · 外壳与协同（6 周）
`OjSplitter` `OjDockPanel` `OjVirtualList` `OjDragDropContext` `OjCommandPalette` `OjCommentThread` `OjReviewPanel` `OjPresenceAvatars` `OjShareDialog` `OjVersionHistory` `OjDropZone` `OjFileNameHeader` `OjSearchReplaceBar` `OjUploadProgress`。
**验收**：搭出完整"合同审阅" preset 页面（左大纲 + 中文档 + 右批注 + 顶 Ribbon + 底状态栏）。

### M4 · L2 文档外壳（8 周，可与 M3 并行启动）
`@jitoffice/docs-shell`：`OjRuler` `OjPaper` `OjDocumentShell` `OjOutlineTree` `OjSelectionOverlay`；ProseMirror 命令桥；canvas token 双产物接入。
**验收**：在真实 ProseMirror 实例上跑通标尺 + 缩放 + 分页可视化 + 大纲跟随。

### M5 · 表格与演示外壳（8 周）
`@jitoffice/sheet-shell`：`OjGridContainer` `OjFormulaBar` `OjSheetTabs`；Univer adapter；`@jitoffice/slide-shell` 骨架。
**验收**：`sheet-shell` 支撑 10 万格虚拟滚动，选区/填充柄/冻结窗格 60fps。

### 里程碑与组件数
| 里程碑 | 周 | 累计 L1 组件 | 可交付价值 |
|---|---|---|---|
| M0 | 3 | 4 | 地基 + 命令系统 |
| M1 | +4 | 15 | 一个完整 Ribbon |
| M2 | +4 | 28 | **6 个月目标达成，可对外发 v0.5** |
| M3 | +6 | 45 | 完整审阅应用 |
| M4/M5 | +14 | +L2 | 真引擎外壳，v1.0 |

---

## 7. 版本与破坏性变更策略

- 语义化版本；`0.x` 期间允许破坏性变更但必须提供 codemod（`npx @jitoffice/codemod v0.3`）。
- **命令 id 是公开 API**，一旦发布不得改名（用户会持久化到自定义 Ribbon 配置里）。改名需走 `deprecate + alias` 双注册至少一个大版本。
- token 变量名同理：`--oj-*` 名称即契约，废弃变量保留两个大版本并在 CSS 中给出注释指向新名。
- L1 与 L2 独立版本号，L1 永不 require L2 的任一版本。

---

## 8. 各组组件的硬工程问题（实现前必读）

§3 的清单回答"做什么"，本节回答"哪里会卡住"。按"没解决就无法发布"排序。

### 8.1 命令栈（对 §1 的必要补充）

- **`history` 档位必须区分"进撤销栈"与"不进"**。自动保存、协同状态同步、视图缩放、滚动定位都属于 `transient`/`none`——若 autosave 进了撤销栈，用户 `Ctrl+Z` 会撤销一次保存动作，这是自研编辑器最经典的逻辑错误。
- **选区有三套表示**：编辑器模型偏移量（`{start, end}` 数字）、DOM `Range`、canvas 像素矩形。三者必须有**唯一的双向序列化器**，否则每处消费方各自换算，在缩放/DPR/跨页场景必然错位。Ribbon 读模型偏移，浮层定位读像素矩形，剪贴板读 DOM Range。
- 命令谓词（`enabled`/`visible`/`active`）在**每次选区变化时全量求值**。45 个命令 × 每次鼠标移动 = 灾难。必须做派生状态记忆化（按依赖键缓存），而不是让每个按钮各自 `computed`——后者会造成 computed 风暴且顺序不可控。

### 8.2 Ribbon 与键盘

- **Windows 上裸 `Alt` 被浏览器/系统菜单吞掉**：Chrome 对裸 Alt 只发 `keyup` 不发 `keydown`。Key Tips（按 `Alt` 显示字母提示）必须监听 `keyup` 唤起、并在 `keydown` 阶段拦截后续字母键，否则会先跳出浏览器菜单。这是所有复刻 Word 快捷键的库都会踩的坑。
- **命令执行后焦点必须归还文档**，否则用户点一次"加粗"就丢失编辑焦点，无法连续操作。`OjPopper`/`OjPortal` 需内建"关闭时归还焦点到触发点或指定的 `focusRestoreTarget`"。
- 上下文选项卡（选中图片才出现的"图片格式"）由**选区类型驱动**，且激活时不得抢焦点。
- 标签页用 `role="tablist"`，工具条用 `role="toolbar"` + `aria-activedescendant`；下拉展开时指针移入面板**不得**关闭面板（需离开延迟 + 面板本身计入 hover 区）。
- **i18n 会让 Ribbon 撑爆**：德语/俄语标签长度约为中文 1.8 倍，日语全角字符更宽。`OjRibbonGroup` 的 `large/medium/small` 降级必须按**实测宽度**而非字符数触发，溢出进 `»` 菜单。

### 8.3 文档画布：坐标与缩放

- 存在**三套坐标系**：文档单位（pt/mm）、CSS px、设备 px（DPR）。必须只有一个投影函数，所有组件（标尺、选区、批注锚点、协同光标）共用。多处各自换算 = 永久错位 bug。
- **缩放用 CSS `transform: scale()` 还是重新布局？** 这是 L2 最大的架构分叉。`transform` 便宜，但：文字发虚、**IME 候选窗位置错乱**（输入法按屏幕坐标定位）、`getBoundingClientRect` 命中测试失真。重新布局正确但慢。结论：**排版缩放（影响分页与字号）走重新布局，仅视觉放大走 transform，且绝不在含可编辑 input 的区域用 transform**。`OjZoomControl` 必须把当前模式暴露给外壳。
- 虚拟化的单位是**页**不是行——一页是变高、自渲染的单元，需独立的页级虚拟化与页间隙（page gap）处理，分数缩放时页缝会出现 1px 亮线（需 `Math.round` 对齐设备像素）。
- SSR 安全：`getBoundingClientRect` 只能在挂载后调用。**禁止在 `setup` 里算布局**。

### 8.4 富文本外壳

- **IME 合成期必须挂起重渲染**：监听 `compositionstart/update/end`，期间不触发搜索、不提交 `v-model`、不重绘选区。中日文核心用户的第一体验门槛。
- **粘贴净化必须是允许列表（allow-list），不是黑名单**。要剥离 `<script>`、事件属性、`data-*`、Word 的 `mso-*` 垃圾与 `w:` 命名空间残留；列表编号要重建而非信任内联样式；并实现"保留文本 / 匹配格式 / 合并格式"三种粘贴语义。
- 格式刷（`FormatPainter`）是"粘性命令"：一次点击后进入待刷状态，Esc 取消，双击锁定——它不属于普通按钮的交互模型，需独立状态机。

### 8.5 表格网格

- **DOM 还是 canvas？** DOM 免费送 IME、原生选区、`aria`、`Ctrl+C`，但约 2000 行后崩；canvas 撑 10 万行，但**欠一个无障碍方案**。结论：canvas 渲染 + **隐藏 DOM 镜像 + `aria-live` 播报**（当前单元格地址、选区范围、值）。这个镜像层必须在 `OjGridContainer` 内建，不能指望用户自己补。
- 行高是**异构**的（合并单元格、自动换行），通用虚拟列表只解决等高/单变高。
- 选区状态机：多区间、Shift/Ctrl 扩展、合并单元格、以及"正在编辑"子状态——该子状态必须能扛住 IME 合成与粘贴。
- 撤销栈要对抗**公式依赖 DAG**：脏值传播与循环引用检测在内核侧，但 UI 必须能显示"正在重算/循环引用"态。
- 剪贴板是**矩阵**：TSV 双向，且"选择性粘贴"有值/格式/公式/转置多种单位变体。

### 8.6 演示外壳

- 几何模型要同时处理缩放、DPR、旋转、翻转，八向手柄在旋转后的拖拽方向需反向旋转计算；浮点累加误差要用固定精度收敛。
- **混合渲染**：编辑期用 DOM/SVG（命中测试、吸附参考线、文本编辑），放映期用 canvas/WebGL（还原 PPTX 的 EMF/FreeForm）。两套渲染的视觉一致性本身就是长期工作量。
- 缩略图再生成成本极高：按内容哈希做离屏渲染缓存，落 IndexedDB。
- 动画预览时钟**不得走 Vue 响应式**（每帧一次响应式更新会拖垮主线程），需独立的 rAF 时钟源。
- 拖拽排序用 Pointer Capture 而非 HTML5 DnD——后者在 iframe 与 CDN 嵌入场景不可靠。

### 8.7 协同在场（Presence）

- **Presence 是与文档操作分离的高频瞬态通道**：10–20 Hz、按标签页合并、需背压丢弃、陈旧对端 GC、时钟偏移容忍。把它接进文档命令栈是架构错误。
- 远端光标/选区位置是**模型偏移**，必须在每次滚动、缩放、重排后重新投影为屏幕坐标——且要复用 §8.3 那个投影函数，否则本地与远端光标会漂移分离。
- Presence 必须画在**独立覆盖层**，让在场更新不失效网格/画布的重绘。
- 无障碍契约：仅靠颜色区分对端不够（色盲 + 屏幕阅读器），需 `aria-live` 播报"张三加入了编辑"与可聚焦的对端导航（"跳到下一位协作者"）。头像为用户上传图片，涉及肖像权与商标，须由接入方自担授权。

### 8.8 选择器

- `OjFontPicker` 的字体探测成本：绝不可对 900 个字体各测一次宽度。用 `document.fonts.check()` + **双回退宽度差探测**，且只对当前可见项惰性执行。
- `OjColorPicker` 的主题色梯度必须与 token 色板同源（01 号文档 §2），否则"主题色"面板与产品实际配色不一致。
- 颜色/边框是**成对**状态（笔色 + 底纹色），面板要同时表达两者——Word 的 A/I 双通道模型，不是单个 color input。
- `OjTableGridPicker` 的 hover 矩阵见 §4。

### 8.9 文件生命周期

- `OjDropZone` 必须按 `DataTransfer` **类型分支**：`Files`（上传）/ `text/html`（富文本粘贴导入）/ `text/plain`（插入文本）。面向表单的 upload 组件不做这个区分，这正是通用库不能直接拿来用的一个具体例子。
- 自动保存状态芯片（已保存/保存中/离线已排队）与撤销栈无关，但必须共享同一个 dirty bit。
- 离线队列需要幂等、保序的操作 + 服务端 ack；本地快照受 IndexedDB 配额与驱逐策略约束。
- 大文件上传用 `ReadableStream` + 可取消分片。
- **版本 diff 由服务端计算、客户端渲染**——分页文档的客户端 diff 不现实。
- 权限语义（所有者/协作者/可编辑/可批注/只读 × 链接范围 × 有效期）是**法务文案，不是单选按钮组**：措辞随司法辖区变化，必须进语言包，不可硬编码在组件里。

### 8.10 可参考但不可依赖的实现

零运行时依赖规则（02 号文档 §3）禁止引入下列库，但它们的**设计**值得复刻：

| 目标能力 | 参考对象 | 说明 |
|---|---|---|
| 虚拟滚动 | Element Plus `virtual-list` / `table-v2`、antd-vue `vc-virtual-list` | 仅 DOM 场景，canvas 需自研 |
| 焦点管理 | Element Plus `focus-trap` / `roving-focus-group` / `collection` | Ribbon 键盘导航的地基，必须自研但照抄其职责划分 |
| 浮层定位 | Element Plus `popper` | 需扩展为"锚定矩形"，其实现不覆盖选区场景 |
| 颜色面板 | Element Plus `color-picker-panel` | 色相/透明度在其内部是私有子组件，我们需重构成可组合件以支持"主题色 + 底纹色"双通道 |
| SSR 安全测量 | Naive UI `useSsrAdapter` | 一个干净的 SSR 门控模式，值得照搬思路 |
| 溢出列表 | Arco `overflow-list` | Ribbon 组降级与 `»` 溢出的现成范式 |
| 无构建器示例 | TDesign `generate-js-examples.ts` | 机械地把 TS 从示例里剥掉，让文档展示可直接复制的 JS 版本（见 04 号文档） |

MIT/Apache 代码在保留版权声明的前提下可以复制进本库并记入 `NOTICE`（00 号文档红线 7）。若某块自研成本明显高于移植，允许移植——但**必须逐文件标注来源**，不得整包引入。
