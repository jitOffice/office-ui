# @jitoffice/ui

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
- bc4b116: 新增运行时图标注册表（05 C1 余项）：`registerIcon` / `registerIcons` / `unregisterIcon` /
  `registeredIconNames` / `resetRegisteredIcons`，从 `@jitoffice/ui` 根入口导出（框架无关，不拖 vue）。
  
  用途：业务图标（客户 logo、行业符号、内部状态）不必再自己写 `v-html`——注册后直接用
  `<OjIcon name="acme-logo" label="…" />`，尺寸、`currentColor` 继承与无障碍行为全部复用同一条通道。
  `iconMarkup()` 的查表顺序是**注册表优先**。
  
  注册期就拒绝（抛错，而不是渲染成空白）：
  
  - 非 kebab-case 的名字，以及占用内置 `oj-*` 命名空间的名字（允许覆盖 `oj-close` 会让同一份代码
    在不同应用里长得不一样）；
  - 不是单个 `<svg>`、或缺少 `viewBox` 的 markup（缺 viewBox 会被压成 0×0，常被误判成打包问题）；
  - 含 `on*=` 内联事件、`<script>`、`javascript:`、`<foreignObject>`、外链 `href` 或 `<image>` 的 markup——
    组件用 `innerHTML` 渲染，业务图标的字符串常来自图标包或后端，不做这层检查等于把注入面开给调用方。
  
  `registerIcons` 是原子的：一条不合格则一条都不写入。同名重复注册**允许覆盖**（主题切换、
  微前端按需替换）。
- bc4b116: `OjIcon` 新增 `spin` 开关（默认 `false`），用于加载态旋转：
  
  - 组件只挂 `oj-icon--spin` 类名，动画写在样式表里——内联 `animation` 会绕开
    `prefers-reduced-motion` 的媒体查询，而持续旋转对前庭功能障碍用户是实际伤害；
    系统开了"减少动态效果"时该图标**停转**。
  - 周期取 token `--oj-motion-duration-slow`（300ms），不写死时延，主题改 token 即生效。
  
  升级方式：纯新增 prop，既有代码无需改动。
- 9347127: M3 收尾四件：`OjDragDropContext`、`OjShareDialog`、`OjVersionHistory`、`OjUploadProgress`，
  行为层分别是 `shell/drag-context.ts` / `shell/share.ts` / `shell/versions.ts` / `shell/upload.ts`。
  至此 M3 的 14 件全部交付。
  
  - **`OjDragDropContext`**：用私有 MIME 标记 `application/x-oj-drag` 区分内部拖拽与外部拖入——
    拖选区内文字同样带 `text/html`，只看标准类型永远分不开。`negotiateTransfer()` 只按 MIME 提前挡，
    扩展名规则一律放行到 drop 再由 `selectDropped` 细判；文本载荷默认不接管。通过
    `OJ_DRAG_CONTEXT` / `useOjDragContext()` 把只读拖拽状态注入子组件。
  - **`OjShareDialog`**：`resolveShare()` 是唯一真值——私有没有角色、有效期只跟链接、人数只跟指定人；
    切范围时角色当场降级（链接范围不给"可编辑"）。确认上抛的是归一化后的权限，不是界面状态的拷贝。
  - **`OjVersionHistory`**：排序只看时间（改名不改顺序）；恢复是 `idle → confirming → restoring` 状态机，
    确认条贴在被恢复的那一条下面（`role="alertdialog"`）；行内命名 Enter / 失焦提交、Esc 取消、
    清空退回自动版本。
  - **`OjUploadProgress`**：进度只增不减（暂停期间到达的分片回报直接丢弃）；失败保留断点，重试从
    `loaded` 续传；分片按字节对齐整片重发（分片 PUT 幂等）；每种状态只出一个动作按钮（暂停 / 续传 / 重试），
    失败原因写在进度条下面。
  
  升级方式：纯新增组件与函数，既有 API 不变。
- bc4b116: 新增无构建器入口（02 §4.2 / §4.3），UMD 上即 `OfficeUI.create` / `OfficeUI.hydrate` / `OfficeUI.configure`：
  
  - `create(name, { anchor, props, on })` 命令式创建组件，返回 `{ el, setProps, destroy }`；
    容器插在 `anchor` 之后，`on` 的键就是 Vue 的 emit 名（`'update:open'` → `onUpdate:open`）。
  - `hydrate(root?)` 扫描 `[data-oj]`，支持 `data-oj-props`（JSON）与 `data-oj-prop-*`（逐属性、
    嵌套写法 `data-oj-prop-max-rows`、`data-oj-prop-on-select="window.fn"`）；重复调用不会重复挂载。
  - `configure({ i18n })` 让上述独立实例与页面共用同一个语言上下文——不配的话，
    命令式创建的弹层会回落到默认语言，与页面不一致。
  
  升级方式：无需改动既有代码，纯新增导出。`resolveOjComponent` / `ojComponentNames` /
  `OfficeUI.components` 可用来查已注册的 34 个组件名。
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
- 9347127: 新增 M3 第二批五件：`OjSplitter`、`OjPaneGroup`、`OjVirtualList`、`OjDockPanel`、`OjDropZone`，以及行为层
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

### Patch Changes

- bc4b116: 组件样式里的字号改为走 token（16 处 `12px` / `14px` / `20px` → `var(--oj-fs-12|14|20)`），
  并新增门禁 `pnpm lint:css-magic` 防止回退。
  
  为什么值得改：字号写死后，`ja` 档位把 `--oj-fs-14` 覆写成 13px 时组件不会跟着降——
  日文界面下工具栏反而比中文大一号。改成 token 之后，语言档位与 `compact` 密度档位对字号的
  覆写才能真的生效（`compact` 下 14px → 13px 是预期变化，不是回归）。
  
  三处刻意保留字面量，并在门禁里逐条登记了理由：`.oj-ruler` 刻度 10px（读数要比正文小一档）、
  `.oj-watermark__layer` 48px（水印要横跨整页）、`.oj-ribbon__keytip` 11px（16px 方框内单字符）。
  间距与圆角的魔法数**仍未守**：token 标度覆盖不了 2px / 7px / 28px / 56px，需要先定标度。
