# @jitoffice/i18n

## 0.1.0

### Minor Changes

- f2569ab: 新增六条**值型格式命令**，把 M2 的选择器集群接到命令注册表上：
  `format.fontFamily` / `format.fontSize` / `format.textColor` / `format.border` / `format.lineSpacing` / `format.align`。
  
  - `run(id, value)` 的实参先过 `src/format.ts` 归一化，**交给宿主的实参与 `state(id).value` 是同一个值**。
    边框就是 `borderCss()` 的 CSS 简写（与 `OjBorderPicker` 的预览同一个函数），对齐编码成 `"center middle"`
    （用 `parseAlignValue()` 读回）。非法实参直接抛错，`registry.run()` 的结果里能定位。
  - 值型命令报 `value`、布尔命令报 `active`：`createMemoryEditor()` 也只对"实参不是字符串/数字"的命令翻 `active`，
    否则"把字号设成 16"会让字号控件显示成被选中。
  - Tiptap 桥新增六条映射；值型命令的可用性只看方法在不在（缺参调 `can()` 会把"装了扩展但选区分不出值"
    读成"没有这条命令"），`format.align` 只把水平方向透给 `setTextAlign`。
  - 四种语言的 `oj.command.*`、`oj.border.*`、`oj.align.*` 文案一并补上（新增 9 个 key × 4 语）；
    demo 的功能区新增格式组，字体/字号/颜色/边框/行距/对齐改完即时作用到文档区。
  
  升级方式：纯新增命令与文案，既有命令与 `OjEditorHost` 契约不变。
- 9347127: 新增 M3 第一批四件：`OjCommentThread`、`OjReviewPanel`、`OjPresenceAvatars`、`OjFileNameHeader`，
  以及它们的行为层（`shell/comments.ts` / `shell/review.ts` / `shell/people.ts` / `shell/file-name.ts`）。
  
  - **全是受控组件**：回复走 `reply` 事件、解决态走 `toggle-resolved`、修订决策走 `decide` / `decide-all`、
    收藏走 `update:favored`。组件不自己改传进来的数据——批注要落盘、要协同同步，内部藏一份状态就会与真值分叉。
  - **"全部接受/拒绝"只作用于当前筛选结果**（`decideAll(changes, filter)`），面板把筛选条件随事件带出，
    宿主用同一条件复算；在"只看某人"的筛选下连别人的修订一起处理是数据事故。
  - **头像颜色与首字母由 `id`/姓名派生**（`avatarTone()` / `initialsOf()`），不接受外部传样式：
    同一人在批注区与标题栏必须是同一个颜色；中日韩名字取首字（取末字会让"张伟/王伟"撞字）。
  - **文件名按 Windows 最严规则校验**（`fileNameProblem()`，`CON.txt` 也算保留名），非法名不退出编辑态。
  - **保存态三档**（`saved`/`saving`/`unsaved`）不可跳过，`isDirty('saving') === true`。
  - 文案全部由使用方给，`@jitoffice/i18n` 四语补 26 个 key（`oj.comment.*` / `oj.review.*` /
    `oj.presence.*` / `oj.fileName.*` / `oj.shell.review.title`），种类名与线型名走映射而不是拼接。
  
  升级方式：纯新增组件与函数，既有 API 不变。

### Patch Changes

- 9347127: 新增 `oj.shell.pane` 三个 key × 4 语（文件栏宽度 / 侧栏宽度 / 调整分栏宽度），供 `OjPaneGroup` 分隔条的可访问名使用。
