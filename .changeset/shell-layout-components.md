---
'@jitoffice/ui': minor
---

新增 M3 第二批五件：`OjSplitter`、`OjPaneGroup`、`OjVirtualList`、`OjDockPanel`、`OjDropZone`，以及行为层
`shell/splitter.ts` / `shell/virtual.ts` / `shell/dock.ts` / `shell/drop-zone.ts`。

- **`OjSplitter` 是受控的**：拖拽与键盘只上抛 `update:size`，组件本地不留尺寸副本——拖拽期间宿主可能同时在钳制
  （窗口缩小、另一栏被折叠），本地一份就会出现松开后"跳一下"。`size` 指**被调那一栏**，方向由
  `pane: 'before' | 'after'`（默认 `after`）声明；三栏布局里左条子调大纲、右条子调批注，方向恰好相反。
  折叠阈值取 `min / 2`，已折叠的栏在拖拽中不会自动弹开。
- **键盘走 WAI-ARIA window splitter 语义**：方向键移动的是分隔条本身，`Home` 折叠（不可折叠时到 `min`）、
  `End` 到 `max`、`Enter` / 双击切换折叠。在 `min` 上再按"变小"直接折叠到 0——否则键盘永远收不起侧栏。
- **`OjPaneGroup` 是声明式多栏容器**：`panes` 描述每栏尺寸/上下界/是否可伸缩，栏位内容走命名插槽 `#<id>`，
  `update:size` 带栏位 id 上抛。分隔条由 `paneSplitter()` 决定**只调固定宽的那一栏**（可伸缩栏的尺寸是
  "剩下的空间"），两侧都可伸缩或该栏 `resizable: false` 时不画条子。
- **`OjVirtualList` 是变高虚拟列表**：前缀和只改被量那一行之后的偏移（测量期不抖）；数据更新前记住
  "视口顶部那一行 + 偏移"，更新后还原（往顶部插新条目时用户眼前那行不动），锚点行被删则保持原位置；
  高度为 0 的视口也渲染一行，否则首帧被折叠的侧栏里永远量不到行高。行高由宿主在插槽里调
  `measure(height)` 上报，也可以直接写进 `items[].size`；`scrollToIndex(index, align)` 已暴露。
- **`OjDockPanel` 是受控的停靠面板**：`state` 里同时记 `side` 与 `docked`（上次停靠侧），浮动后点停靠回原侧
  而不是默认右侧；收起只藏内容、标题栏留着（否则再也找不到展开入口）；浮动态按标题栏拖动，位置**在拖动时**
  就夹回视口（至少露出 `FLOAT_GRAB_STRIP`），松手才修正等于允许把面板拖出屏幕。
- **`OjDropZone` 按 `DataTransfer.types` 分支**：`Files` 走受理与上传，`text/html` / `text/plain` 走富文本导入
  （`insert` 事件，默认关闭 `textPayload`，避免拖选区内文字就弹遮罩）。受理规则是
  **扩展名 → MIME 通配 → MIME 精确**三级匹配，拒绝原因分开给 `type`（格式不支持）与 `count`（一次只能一个），
  同时命中时 `type` 优先。
- **整页遮罩用 `dragenter` / `dragleave` 计数进出**，`relatedTarget === null`（离开窗口）直接归零；
  遮罩 `pointer-events: none`，`drop` 仍然落到文档区。粘贴只接管带文件的剪贴板，纯文本原样留给宿主。
- 受理结果保留原始 `File`（`selectDropped` 是泛型），宿主拿到的不是重新拼的副本；文案全部由使用方给。
- **行为层修复**：`clampPane` 不再把 `max: Infinity` 当成"缺省 = min"（那会让"不设上限"的栏拖一下就弹回最小宽度）。

升级方式：纯新增组件与函数，既有 API 不变（`OjSplitter` 新增可选 `pane` prop，默认值与既有行为一致）。
