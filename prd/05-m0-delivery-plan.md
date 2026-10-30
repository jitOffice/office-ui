# M0 交付计划（地基）

M0 的目标不是"做出组件"，而是**把后面所有组件都要依赖的五条契约钉死**：token 双产物、命名空间、构建两趟、命令注册表、质量门禁。M0 的返工成本远低于 M1 之后的返工成本。

工作量按 **2 名工程师 + 0.5 名设计** 估算，单位为人日。

---

## 实际进度

**2026-10-26 续执行的四项**（都在本机真跑过，含红绿两条分支）：

1. **`format.alignLeft` 的 Tiptap 桥补上了**。此前 `commands.ts` 声明了这条命令，`BRIDGE` 表里却没有，
   接真实 Tiptap 时 `can/exec/state` 会**静默返回 false**（按钮永远灰着，而所有测试用的是内存宿主，
   一条都看不见）。顺带加了 `bridgedCommandIds()` 并补一条"命令表 ↔ 桥没有漂移"的用例：
   以后漏映射会在测试里红，而不是在用户界面上表现为"点了没反应"。
2. **`packages/ui` 的兼容线产物落地**：`dist/umd/office-ui.js`（Vue 层，`vue` 外部化成全局 `Vue`）
   与 `office-ui-core.js`（框架无关入口，产物里 0 处 `vue`），`es-check es2018` 两个文件均通过，
   `unpkg`/`jsdelivr` 已挂。**样式改成双产物** `dist/styles/office-ui.css` 与 `office-ui.layered.css`
   （同一份源码，后者包 `@layer oj-ui`）——`@layer` 是 Chromium 99+ 才有的，
   而兼容线 floor 是 86，所以它不能是唯一形态。
3. **两条新契约（13、14）**：组件样式里的每个 `var(--oj-*)` 必须命中 token 产物或由组件源码赋值，
   且不许出现字面色值；`ui` 的 UMD 必须把 `vue` 留在外部，框架无关入口一处引用都不许有。
   契约 13 上线第一轮就抓到 `--oj-gp-cols`（组件自己赋值的局部变量），于是把"白名单"改成
   "谁赋的值"——白名单会漂移，数据不会。四条破坏性探针（拼错变量、字面色值、Vue 未外部化、
   框架无关产物拉进 vue）都实测红过。
4. **`.github/workflows/pull-request.yml`**：两条 job，`verify` 刻意**不 install**（零依赖契约），
   并在末尾用 `git status --porcelain` 卡住"改了源码忘记提交生成物"；`build` 跑
   `typecheck → build → build:check`，再串 `size → lint:package → lint:types → lint:license →
   lint:css-magic → lint:artifact-offline`。另有 `visual.yml`（定时 + 手动）跑排版回归。
   **卡点**：唯一没守的是**间距/圆角的魔法数**——不是缺依赖（`lint:css-magic` 是自研零依赖脚本，
   字号与时延已经守住），而是 token 标度覆盖不了样式表里真实的 2px / 7px / 28px / 56px，
   得先定标度。`attw`、许可、外链、覆盖率均于 2026-10-30 接入（各自故意破坏过一次确认会红），
   `release.yml` 与 changesets 已于 2026-10-30 落地（见第十四轮），
   但**首次真正发布仍等 B3 的书面确认**（主题权属）——在确认前，Version Packages PR 只开不合。

当前 **211 个零依赖用例、14 条契约检查**通过；`tsc` 在五个包里 0 error；`build:check` 三个包逐字节同源；
另有 141 个 Vue 层用例带覆盖率阈值（组件行 92.88%）。
本机 `pnpm verify` 跑不了（engines 要求 Node ≥24 / pnpm ≥12，本机是 23.9 / 9.15），
四步是逐个用 `node` 直跑验证的。

**2026-10-26 第二轮（照 PRD 逐条对账之后补的四项）**：

1. **DoD #1 终于有证据了**：新增 `examples/no-bundler/index.html` —— 两个 `<link>` + 两个 `<script>`，
   没有任何 import 与构建步骤。**真跑过**（本机 Chrome 151，用 Playwright 临时脚本，跑完即删）：
   UMD 渲染出 SVG 图标、两份 CSS 生效（按钮高度 32px 取自 `--oj-button-height`，圆角 6px）、
   键盘 focus 唤出 tooltip、框选 2×3 回传、控制台**零 warning / zero error**。
   页面刻意用 `vue.global.js`（含编译器的 **dev** 构建）+ `template` 字符串：换成 `vue.runtime.global.js`
   实测**直接白屏超时**，这正是 02 §4.1 警告的"template 字符串静默空白"。
   两条无效探针记在这里：第一次断言"按钮背景不是透明"是**假探针**——`--oj-button-bg` 本身就是
   `transparent`；换成对比 `--oj-button-height` 与 `.oj-button` 的计算高度后才真的在测两份 CSS。
   **已自动化**（同日）：用例落成 `packages/ui/test/visual/no-bundler.spec.ts`，`@playwright/test` 进
   `ui` 的 devDependencies；`test/visual` 与 `node --test` 两条线互不干扰（前者收 `*.spec.ts`，后者收 `*.test.ts`）。
   `.github/workflows/visual.yml` 改成 `turbo run test:visual`，一次跑 tokens 的排版 3 例 + ui 的 2 例。
   **破坏性验证**：页面换回 `vue.runtime.global.js` → 这条用例 30s 超时变红；恢复 → 2 passed。
   **踩到的坑**：turbo 2.11 的 strict env 模式会**过滤掉 `OJ_BROWSER_CHANNEL`**，
   于是 `turbo run test:visual` 下两个包都掉回默认 Chromium，报
   `Executable doesn't exist at .../chrome-headless-shell`——这个报错看着像"机器没装浏览器"，
   实际是"配置没让变量进去"。修法是 `turbo.json` 的 `test:visual.passThroughEnv` 显式声明
   （刻意不进 hash：它只决定本机用哪套内核，而这个任务本来就 `cache: false`）。
2. **`OjIcon` 的可访问名契约落地**（03 §2 已同步修订）：`iconLabelProblem()` 是纯函数，
   组件在 dev 下按图标名去重报一次；配套一条结构门禁——组件里每处 `h(OjIcon, …)` 必须带
   `label` 或 `decorative`。实测把 `decorative` 删掉，门禁变红。
   原文的"强制 label"落地时发现会误伤 `<button aria-label="关闭"><OjIcon/></button>` 这类**正确**用法，
   于是收紧成"必须声明意图"，这是对 PRD 的修订而不是偏离。
3. **`OjDialog` 有了 `teleport` prop**（03 §2「弹层归属」）：`'body' | '[selector]' | false`。
   `OjDropdown` 暂不加：它的面板定位用的是视口坐标 + `position: absolute`，
   真投到 body 会随滚动错位，得先把 `OjPopper` 的 `strategy: 'fixed'` 做出来。
4. **`exports` 三条通配子路径**（`./es/*`、`./cjs/*`、`./styles/*`）。`"./*"` 逃生门**刻意没开**，
   理由与一处已知欠缺（通配路径没有 `types` 条件）写进 02 §2.2。`packages/ui` 的每组件
   `components/<name>/index.ts` 结构仍未采纳，理由写进 02 §1。

**2026-10-29 第三轮：C1 图标管线（M0 轨道 C 的工程部分）**

`packages/icons` 从零建起来，形状与 `tokens` 同源：**手写源 → 生成器 → 生成物入库 → 新鲜度门禁**。

- 31 枚图标从 `packages/ui/src/icons.ts` 的内联表一次性抽成 `svg/*.svg`（一次性脚本跑完即删）。
- 四份生成物见上表 C1 行。`attrs` 与 `body` 分开存是为了 canvas：消费方拿 `body` 自己绘制，
  不该在运行时解析 `markup` 字符串。
- **跨包防漂移**：ui 的根入口必须零依赖（`pnpm verify` 要在没有 `node_modules` 时跑），
  所以它暂时不能 `import '@jitoffice/icons'`，两份图标数据并存。用例逐字节比对两边，
  谁改了不同步就红；M1 把 ui 切到生成物之后，这条用例随本包一起删。
- **验收证据**（Chrome 151）：31 个 `<symbol>` 逐个 `<use href="#…">` 量 `getBBox().width > 0`，
  对照用例证明"引用不存在的 id 得到 0"——如果只断言"页面没报错"，id 写错也照样绿。

**2026-10-29 第四轮：DoD #2 体积门禁（size-limit 接入）**

`.size-limit.jsonc` 四条，全部 `gzip: true`，接进 `pull-request.yml` 的 `build` job：

| 度量 | 阈值 | 实测（gzip） |
|---|---|---|
| `ui/vue` · `{ OjIcon }`（tree-shaken） | 8 KB | **1.97 kB** |
| `icons/vue` · `{ OjIconFormatBold }`（tree-shaken） | 1 KB | **836 B** |
| `ui` · 全量 ESM（框架无关入口） | 90 KB | **7.5 kB** |
| `ui` · 组件样式 | 16 KB | **1.92 kB** |

三个执行时才暴露的点：

1. **size-limit 14 默认报 brotli，而 PRD 的阈值是 gzip 口径**。差值约 15%，混着用等于门禁与规格
   各说各话，所以每条都显式开 `gzip: true`。配置文件因此用 `.jsonc` 而不是 `.json`——这些理由必须写进
   文件里，而 JSON 装不下注释。
2. **`import` + `ignore: ["vue"]` 是这个配置的灵魂**。前者让 size-limit 只引指定具名导出，
   tree-shaking 才真的发生；后者把框架划到外部，否则量的是 Vue。实测去掉 `ignore` 后
   OjIcon 从 1.97 kB 涨到 5.75 kB——这一条就是"探针是否在量我们要量的东西"的自检。
3. **门禁抓到的第一个真问题不在配置，在产品代码**：单图标第一次量到 **2.13 kB**，超阈值一倍。
   根因是 31 个顶层 `createIconComponent(...)` 调用被压缩器当成有副作用的语句全部保留，
   `import { OjIconFormatBold }` 的产物里躺着另外 30 枚图标。加 `/* @__PURE__ */` 后降到 **836 B**。
   顺带把组件里的 `icons[name].markup` 改成生成器内联字面量——esbuild 折不动函数参数，
   查表写法会拖上整张表。**这就是"体积门禁"存在的理由：它不是报表，它会改代码。**

**破坏性验证**：把 `{ OjIcon }` 的阈值从 8 KB 改成 1 KB → 报 `exceeded by 972 B`；
去掉 `ignore: ["vue"]` → 数值 1.97 → 5.75 kB。红绿两条分支都实测过。

**2026-10-29 第五轮：DoD #4 两处渲染只重渲染一次（Vitest 车道建起来）**

`packages/ui/test/unit/command-sync.spec.ts`，4 例。这条只能在 Vue 里做——它要的是**真实的重渲染次数**，
而零依赖那条链连 `vue` 都不加载。量法分三层：求值次数、通知次数、DOM 结果。

- 场景：一条 `format.bold` 命令同时渲染在「按钮」与「tooltip 文案」两处，引擎侧一次性改状态后连喊五次
  `refresh()`（典型：一次选区变化让多条命令失效）。
- 断言：`command.state()` 只求值 **1** 次、每个订阅方只被通知 **1** 次、每个渲染点只重渲染 **1** 次、
  两处 DOM（`aria-pressed` 与气泡文案）都换成新状态。
- 另三例：伪变化不重渲染（脏检查）、禁用态两处都不可用且点击不执行、卸载后不再收到通知。

**这一轮的教训比用例本身重要**：第一版只数「通知了几次」，把 `defaultSchedule` 改成同步执行
（等于拆掉合帧）后**照样全绿**——因为 `publish()` 里的脏检查会把后四次状态相同的推送挡掉，
通知数始终是 1。脏检查与合帧是两道不同的闸，拿前者的现象证明后者，是一条永远不会红的探针。
改成数 `command.state()` 的求值次数后，同一处破坏立刻报 `expected 5 to be 1`。
**这是本项目第 4 次同类错误**（前三次：`--oj-button-bg` 本来就是 transparent、`global.VueRuntime` 仍命中
`global\.Vue`、`stroke-width` 命中 `width=` 子串）。共同点都是"断言了一个恰好为真、但与被测行为无关的量"。

**2026-10-29 第六轮：DoD #3 按需引入的样式断言（`pnpm lint:styles`）**

02 §2.1 原文要求「构建后检查每个组件的 style 入口产物里仍含 CSS 引用」——那是"每组件一个 style 入口"
的架构才有的产物形态。本仓库按 ADR-0003 只发一份 CSS，没有入口可被摇掉，所以风险换了个方向，
`internal/scripts/check-component-styles.ts` 守两条：

1. **组件用了但没有规则**：`src/vue` 里出现的每个 block（`oj-stamp`）必须在样式表里有规则，
   否则按需引入之后这个组件是"裸的"——这正是 DoD #3 要防的事，只是发生原因不同。
2. **样式里有规则但没人用**：死规则不会报错，只会让后人以为那个类还活着，通常来自重命名漏改。

粒度取 **block**（`oj-dialog`）而不是完整类名（`oj-dialog__footer--dense`）：组件里的类名大量靠三元与
模板拼出来（`class: horizontal ? 'oj-ruler oj-ruler--h' : …`），按完整类名比对会被拼接写法整片漏掉。
当前基线：18 个组件 block、22 个样式 block、4 个已登记的**结构钩子**（`oj-tooltip-anchor` 这类只做定位、
不需要声明的钩子，每条都在脚本里写了理由）。

**这一轮抓到的两个真问题（都在门禁自己身上）**：
- 第一版按 `@jitoffice/icons` 的 manifest 剔除图标名，结果 `oj-ai`/`oj-code`/`oj-search`/`oj-signature`/
  `oj-stamp`/`oj-watermark` 六个名字**同时是图标 id 和组件根类名**，6 条活着的规则被报成"死规则"。
  改成"先取 class 上下文、再对剩余字面量剔除纯图标引用"后归零。
- 图标引用的识别只认 `name: 'oj-x'`，漏了 `name: open ? 'oj-chevron-down' : 'oj-chevron-right'`，
  两个图标名又被当成类名。改成"`name:` 之后整行取"。

**破坏性验证**：把 `.oj-stamp` 改名 → 同时报出「stamp.ts 的 .oj-stamp 没有规则」与「.oj-stamp-renamed 没人用」；
加一条 `.oj-ghost` → 报死规则。两条都红，恢复后绿。

**2026-10-29 第七轮：D2 的 `OjPortal` / `OjTrigger`（M0 组件清单最后两项）**

- **`OjPortal`**：`to: 'body' | '#selector' | false`、`zIndex` 走 `--oj-z-*`、滚动锁用**计数**
  （两个浮层同时开时先关的那个不能解锁，且解除时恢复原值而不是清空）、焦点陷阱含 Tab 首尾环绕、
  **卸载归还焦点**。所有 DOM 访问都在 `onMounted` 里 —— SSR 下 `setup` 阶段没有 `document`。
- **`OjTrigger`**：交互语义放在零依赖的 `createTriggerMachine()` 里，注入 scheduler 后 9 例把时序钉死
  （进入不立刻开 / 离开不立刻关 / 移进面板取消关闭 / escape 清定时器 / sync 纠正受控真值）。
  组件只负责把 DOM 事件接上，再组合 `OjPortal` + `OjPopper`。受控与非受控都给。
- **`closeDelay` 默认 120ms 不是随手写的**：指针从触发器移到面板必然先离开触发器，
  延迟为 0 时下拉菜单永远够不到 —— 这正是 03 §3 D 组点名的那条，现在有一条用例专门守它。

**实现时抓到的两个 bug（都在自己刚写的代码里）**：
1. `OjTrigger` 的根元素**没接 `onClick`**——四条 hover/focus 事件都接了，唯独漏掉点击，
   于是 `modes: ['click']` 完全没反应。三条用例同时红才暴露出来。
2. `createTriggerMachine` 的 `openDelay/closeDelay` 没写 `| undefined`，组件把 `Number` prop
   直接透传时被 `exactOptionalPropertyTypes` 拦下。**这是本项目第二次踩同一个坑**
   （上一次是 `IconNameOptions.label`），说明"仓库开了 exactOptionalPropertyTypes"这件事
   在写可选属性时还没形成肌肉记忆。

**2026-10-29 第八轮：M1 的语言层（`OjLocaleProvider` / `useLocale` / `OjLocaleSwitcher`）**

`@jitoffice/i18n` 早就有四语运行时，但**没有任何组件能拿到它**：`OjRibbon` 的折叠按钮、
`OjRibbonGroup` 的 `»`、`OjTooltip` 的默认文案全是写死的中文默认值。这一轮把接线端补上。

- **不引依赖**：Provider 按**结构类型**收运行时（`OjLocaleRuntime`），真实的 `createI18n()`
  返回值直接可传，`ui` 的 `dependencies` 仍为空（契约 1 不变）。与 `OjEditorHost` 收注册表、
  `OjCommandButton` 收 source 是同一个手法（ADR-0005）。
- **`html[lang]` / `html[dir]` 同步**：tokens 的语言覆写层选择器就是 `html[lang|="ja"]`
  （`packages/tokens/dist/index.css`），不写它就会出现"文案换了、字体栈与行高还留在旧语言"的半切换。
  卸载时**归还**宿主原来的值，且只在"当前值仍是我们写的"时归还——宿主中途自己改过，
  说明它接管了这件事，盖回去比不还更糟。
- **`t(key, fallback)` 的两级退回**：没有 Provider（UMD 用户可能压根不用 i18n）→ 组件自带的默认文案；
  Provider 在但语言包里缺这条 key → 同样退回默认文案，而不是把 key 印到界面上。
- **`OjLocaleSwitcher` 用原生 `<select>`**：它自带 IME、读屏角色与移动端原生选择器，自绘换不到东西。
  受控与非受控都给：不给 `modelValue` 就自己切运行时，给了只发事件（宿主可能要先存偏好再切）。
- **新 key `oj.common.language`（四语）**：语言切换器的可访问名必须跟着语言走，
  顺带让 `i18n:gen` 的"四语 key 与占位符一致"这条链真的跑了一次。
- **demo 真接上了**：全页包一层 Provider，状态栏右侧放切换器。demo 的文案仍直接读 `i18n.t()`
  （不是发布面，没必要逐个改成 `useLocale().t()`），所以在渲染函数里读一次 `locale.lang` 建立依赖——
  否则切语言只有 `html[lang]` 变，整页文字停在旧语言。

**这一轮自己刚写出来的两个 bug（都不是别人改坏的）**：
1. **样式门禁把 `Symbol('oj-locale')` 当类名**（注入 key 与 block 同名，纯属好找），
   于是报"`.oj-locale` 没有规则 · 按需引入后是裸的"。修的是**门禁**不是命名：按 `Symbol(...)`
   的调用上下文剔除，与图标 id 的处理同一手法（给命名加限制只会逼下一个人换名字绕过去，
   两种键名从此并存）。破坏性验证：往 `locale.ts` 塞一个 `'oj-ghost-probe'` 字面量 → 门禁照样红。
2. **受控 `OjLocaleSwitcher` 会"界面撒谎"**：用户选了 `ja-JP`、宿主不采纳（校验失败 / 异步保存），
   下拉停在 `ja-JP` 而运行时还是 `zh-CN`。原因很具体——Vue 只会把**变化了的** vnode value 写回 DOM，
   prop 没变就不会 patch，而 `<select>` 的值已经被用户改过。修法是选完立刻把 DOM 拨回 prop；
   另加一条 `v-model` 用例，证明"拨回"不会把正常路径弄坏。

当前基线：**172 个零依赖用例 · 76 个 Vitest 用例（11 个 spec）· 30 个组件 block / 33 个样式 block /
5 个结构钩子**；契约检查全绿（78 份入库 `.d.ts`、19 个发布面扁平字段、47 个样式变量、四语 ↔ tokens 三层）；
`build --check` 四个包与源码同源；`pnpm size` 四条均未超（`{ OjIcon }` 1.97 kB、单枚图标 836 B、
全量 ESM 9.57 kB、CSS 2.88 kB，gzip）。

**2026-10-29 第九轮：M1 最后两件组件（`OjCommandLauncher` / `OjContextMenu`）**

- **`OjCommandLauncher`**：Ribbon **组右下角的小箭头**，语义是 `aria-haspopup="dialog"`
  （打开一块面板，不是就地展开）。箭头由一条 `border-right` + 一条 `border-bottom` 构成，
  不进图标集——为 7×7 像素让每个宿主多背一份图标注册表不划算。`label` 必填：纯图形按钮
  没有可访问名，只能由使用方给。`OjRibbonGroup` 新增 `launcher` 插槽，定位放在
  `__launcher` 包裹层上（组件本身不带定位，放进工具条也能用）。
- **`OjContextMenu`**：PRD 点名"必须支持在 canvas 上按坐标弹出"。为此给 `OjPopper` 加了
  **`anchorBox`**（视口坐标的矩形，优先于元素锚点）——这正是 D 组原话"需支持锚定矩形区域（选区）
  而非仅元素"的落地形态，右键坐标只是矩形退化成零尺寸点的特例。
  键盘模型：开即聚焦第一个可选项、上下键**环绕**并跳过禁用项与分隔线、Home/End、
  Enter/空格执行、Esc/Tab 关闭；Esc **不冒泡**（否则一次 Esc 会把外层 `OjDialog` 一起关掉）；
  关闭归还焦点，但 `body` 不算"原来的位置"。
- 行为层抽出 `src/menu.ts`（`menuNeighbor` / `menuAction` / `menuSelectable*`），
  8 例零依赖用例钉死环绕与跳过规则；组件 8 例、启动器 4 例。
- demo 里**在文档区右键**就能弹出"格式"菜单（加粗/斜体/下划线/分隔线/插入表格），
  选一条直接走命令注册表。

**这一轮自己写出来的两个坑**：
1. **初次挂载就 `open: true` 会失联**：`watch` 没带 `immediate`，于是监听体没绑上 document 的
   `pointerdown`、也没聚焦——菜单画出来了，却点不掉、键盘也不动。改成 `onMounted` 里也走一次
   `activate()`。这恰好是"`v-model` 初值为 true"这种最常见的用法，用例现在钉住它。
2. **`OjMenuItem` 的 `id` 曾对分隔线也必填**：类型检查立刻报错——分隔线没有身份。
   改成 `OjMenuItemAction | OjMenuSeparator` 的**可辨识联合**，`menuSelectable` 变成类型守卫，
   于是"给分隔线编个假 id"这种会污染命令日志的写法在编译期就不成立。

当前基线：**180 个零依赖用例 · 88 个 Vitest 用例 · 32 个组件 block / 35 个样式 block /
5 个结构钩子 · 50 个组件样式变量**；`build --check` 四个包与源码同源；
`pnpm size`（`{ OjIcon }` 1.97 kB、单枚图标 836 B、全量 ESM 9.7 kB、CSS 3.13 kB，gzip）。
M1 的组件面至此收口，只剩图标产能（B4）与文档站骨架。

**2026-10-29 第十轮：文档站骨架（VitePress + 零外联断言）**

`docs/` 从"只有 ADR"变成能构建的站点（`vitepress build` → `docs/dist`，约 5.7s）：

- 主题从 **`vitepress/theme-without-fonts`** 继承。默认主题的 `fonts.css` 里有一句
  `@import url('https://fonts.googleapis.com/…')`，内网会静默挂住首屏（04 §1 的陷阱）。
- 样式**只用自家产物**：`theme/index.ts` 直接 import `packages/tokens/dist/index.css` 与
  `packages/ui/dist/styles/office-ui.css`——文档站是组件库的第一个真实消费者，
  "产出的 CSS 够不够用"要在这里先暴露。
- 毛玻璃按 04 §2 的双条件降级：`@supports (backdrop-filter)` + `prefers-reduced-transparency`，
  不满足就退回不透明 `--oj-bg-container`（Windows"透明效果"开关常年被办公用户关着）。
- 首页 / 指南（概览、安装三条路径）/ 组件总览 / `OjIcon` 页。`srcExclude: ['adr/**']`：
  ADR 与 PRD 里有大量指向 `prd/` 的相对链接，放进站点会直接死在死链检查上。
- **零外联断言**（`pnpm lint:docs-offline`）扫 `docs/dist` 里 `<script|link|img|iframe|source>`
  的 src/href、CSS `url()` 与 `@import`。第一次跑就抓到一处真的：默认主题把 social-link 的图标
  helper（`api.iconify.design/simple-icons/…`）**无条件**打进了 theme chunk。白名单只两条，
  并写明"将来配了 `socialLinks` 就必须换本地图标，否则守卫会替真实外联背书"。

**这一轮最重要的是一条负面结论**：`themeConfig.search.options.miniSearch.options.tokenize`
**接不上**。VitePress 1.6 把 `themeConfig` 序列化成 JSON 塞进客户端，函数在序列化时被丢掉——
构建照过，词法还是默认的按空格切。验证方式是对产物 grep 分词函数的特征串（`NFKC` / `tokenize:`），
一处都没有。所以 `docs/.vitepress/search/tokenize.ts`（CJK bigram + 驼峰拆词 + NFKC + 长音折叠）
现在有 9 条零依赖用例守着、**尚未接线**；接线只能自建搜索组件（自己 `new MiniSearch({ tokenize })`
吃 `hashmap.json`），排在下一轮。配置里保留的是能序列化的 `searchOptions`（boost / prefix / fuzzy）。

当前基线：**189 个零依赖用例**（+9 分词）、`tsc -p tsconfig.json` 0 error、契约与样式门禁不变、
`vitepress build` 通过、`lint:docs-offline` 通过。

**2026-10-29 第十一轮：组件文档自动生成（04 §5 的"必须自动化的点"）**

`pnpm docs:gen` 扫 `packages/ui/src/vue/*.ts`，为 35 个组件各生成一页（`docs/components/api/`）+ 索引：

- **Props 表**：prop 名、是否必填、默认值。解析走**行级缩进**而不是"顶层逗号切分"——后者会被
  `PropType<Record<string, string>>`、`(v: string) => void` 里的逗号与箭头切碎。代价是要求每个 prop
  各占一行，本库现状满足，且有"用真实源码断言"的用例守着（`OjIcon` / `OjRibbonGroup` / `locale.ts`）。
- **CSS 变量表**：该组件源码里出现的 `var(--oj-*)`。PRD 原话"手写文档一定漏"，所以不手写。
- **i18n key 表**：组件里出现的 `oj.*` 字面量（如语言切换器的 `oj.common.language`）。
- 生成物**入库** + `pnpm lint:docs` 新鲜度门禁，与 tokens / icons 同一套做法。
  **破坏性验证**：往 `docs/components/api/icon.md` 末尾追加一行 → 立刻报
  "1 份组件文档与源码不同步"，并给出修复命令；恢复后绿。
- 侧边栏不手维护：生成器同时产出 `docs/.vitepress/generated/components.ts`，config 直接 import。

**已知降级（写清楚，不当成已完成）**：PRD 指定 `vue-component-meta` 走 Volar 类型系统，
本轮是行级扫描——复杂类型（泛型、联合）在表里只给 prop 名与默认值，展开留给源码链接。
换来的是零新依赖、可在 `node --test` 里钉死；类型级精确展开排在下一轮。

当前基线：**197 个零依赖用例**（+8 文档生成）、35 份组件文档与源码同步、`lint:docs-offline` 通过、
站点 `vitepress build` 通过。

**2026-10-30 第十二轮：自托管 iframe Playground（04 §3）**

`/playground/` 真的能跑：`<textarea>` 改代码 → 点运行 → 沙箱 iframe 里挂载真组件。

- 沙箱 `sandbox="allow-scripts"`（**不给** `allow-same-origin`）：用户代码读不到宿主的 DOM /
  localStorage / cookie。
- 运行时全部本地：`vue.global.js`（含编译器）+ `office-ui.js`（UMD）+ tokens/ui 两份 CSS，
  由 `docs/.vitepress/scripts/prepare-playground.ts` 在构建前从各包 dist 复制进
  `docs/public/playground/`（该目录不入库，由脚本独占，避免手写文件被清理逻辑误删）。
- 协议：宿主 → `{ type: 'oj-playground:run', code }`；沙箱回 `ready` / `ok` / `height` / `error`。
  宿主只认 `event.source === iframe.contentWindow` 的消息——沙箱是跨源的，`origin` 不可靠。
- 高度由沙箱 `ResizeObserver` 上报、宿主跟着改：`OjRibbon` 这类长组件不能被固定高度截断。
- 三类错误（语法 / 运行时 / 挂载）都回传并显示在预览下方，不白屏。

**真浏览器实测**（Chrome 151，Playwright 临时脚本，跑完即删）：iframe 内渲染出按钮，
点击后文案从「当前加粗：开」变「关」，高度 200，**无 CORS 失败、无运行时错误**。

**这一轮最贵的教训——沙箱与 ESM 不可兼得**：第一版按 04 §3 用 import map + `dist/es` 整树，
真跑起来全是 `net::ERR_FAILED`。原因很确定：`sandbox="allow-scripts"` 让 iframe 的 origin 变成
`null`，模块请求带 `Origin: null`，静态服务器不会回 `Access-Control-Allow-Origin`。
出路只有两条：加 `allow-same-origin`（沙箱等于没有）或回到经典脚本（UMD）。选了后者，
于是"沙箱内现场跑 compiler-sfc"也不成立了，多文件 SFC 必须走宿主侧预编译。已回写进 04 §3。

**2026-10-30 第十三轮：把 bigram 搜索接上（04 §4），顺带抓到一处全站级 token 缺陷**

搜索不再是"分词器有测试、代码路径没接"。三段共用一份规则：

- **构建期** `docs/.vitepress/scripts/build-search-index.ts` 扫 `docs/**/*.md`（跳过 `adr/`），
  抽 `title / headings / text`，用 `tokenizeCJK` 建索引 → `docs/public/search/index.json`。
  41 页 / 97.4 KB，入库 + `pnpm lint:docs` 做**字节级**新鲜度比较（不加时间戳，否则门禁假红）。
- **运行时** `docs/.vitepress/theme/components/OjSearch.vue`：`import('minisearch')` 与索引都懒加载，
  `MiniSearch.loadJSON` 复原，↑↓ / `Enter` / `Esc` / `Ctrl+K` / `/`。
- **共享** `docs/.vitepress/search/options.ts`：`loadJSON` **不会**带出 `searchOptions`，
  三处各写一份就会变成"构建期算分一套、浏览器另一套"。

**覆盖内置搜索**：`app.component('VPNavBarSearch', …)` 无效——`VPNavBar.vue` 直接
`import VPNavBarSearch from './VPNavBarSearch.vue'`，不走全局注册。改用 `theme/Layout.vue` 包
`DefaultTheme.Layout`，塞进 `nav-bar-content-before` 插槽（`content-body` 是 `flex-end`，
位置正好是原来搜索的地方），并撤掉 `themeConfig.search`：不配 provider 时内置只渲染空容器
（`styles/search.css` 隐藏），顺带省掉内置索引与 `VPLocalSearchBox` 两个 chunk。

**排序改了两处，都是实测出来的**：客户端 `search()` 起初没传 `boost`，字段权重全是 1，
搜 `Ribbon` 时"指南"页（文档短、归一化后分数虚高）排第一；分组渲染又用了固定组序，
把分数顺序整个盖掉。现在组间顺序取"该组最高分结果"的位置，并加 `boostDocument`
（标题 ×4、小节 ×2，单字 token 不抬分）。

**本轮最值钱的发现是一处既有缺陷**：`glass.css` 把 `--vp-c-bg` 映射成 `var(--oj-bg-layout)`，
而 token 表里只有 `--oj-bg-page`。自定义属性解析成无效值后，**整站的 `--vp-c-bg` 一直是空的**
——白底页面看不出来，搜索浮层一出现就是一块透明面板。顺藤摸瓜还找到 `glass.css:51`、
`glass.css:86`、`OjPlayground.vue:94` 三处同样的错名。契约 13 当时只扫
`packages/*/src/style.css`，文档站是自建样式的法外之地；本轮把门禁扩到
`docs/.vitepress/theme/`，**破坏性验证过红绿**（塞一个 `--oj-does-not-exist` 立刻报红，
删掉转绿），现在报"文档站 32 个变量全部命中 token 表"。

另外两处小修：`/favicon.ico` 404（加 `docs/public/favicon.svg` + `head` 声明，真浏览器确认控制台干净）；
`docs` 有了自己的 `tsconfig.json` 与 `pnpm --filter @jitoffice/docs typecheck`（此前文档站的 TS
不在任何 `tsc` 覆盖下）。`.vitepress/theme/**` 暂时 exclude——`.vue` 要 `vue-tsc` 才看得懂，
为它引编译器需要单开 ADR，先记在这里。

**实测**：`node --test docs/test/search-index.test.ts` 7 例（中文整词"功能区"→ Ribbon 页、
子串"选择器"、`OjButton` 与 `button` 同页、`Ribbon` 首条正确、ADR 不入索引、入库索引与文档同源）；
`pnpm test:node` 204 例全过；Chrome 151 + Playwright 临时脚本（跑完即删）在 `vitepress preview` 上验收：
导航栏只有 1 个搜索入口、内置容器不可见、搜"表格"3 条、"OjButton"命中三个 Button 组件、
↑↓ + `Enter` 跳转、`Ctrl+K` 唤起、`Esc` 关闭、**控制台零错误**。

**已知降级**：索引只有一份（站点单语言 `zh-CN`），不是 04 写的三语独立索引；结果不给正文片段
（`storeFields` 不存 `text`，否则索引翻倍），只显示标题与**含查询词**的小节名——不显示无关小节名，
因为"表格"的提示曾出现 `ESM（推荐）`／`命令与工具栏`，比不显示更误导。

**2026-10-30 第十四轮：changesets + release.yml 落地（02 §A3）**

发布从"写在 PRD 里"变成"能跑的两段式"。人只做两个判断：写 changeset、看 Version PR。

- `.changeset/config.json`：`access: public`、`baseBranch: main`、`privatePackages: { version: false, tag: false }`
  ——私有包（docs / internal-build）不参与版本，否则文档站会因为"依赖了某个发布包"被连带升版，产生一串无意义 diff。
  `format: false` 是刻意的：默认 `auto` 会探测 prettier，仓库没装，但谁全局装了输出就会漂，而生成物是入库的。
- `changelog` 用默认的本地生成器，**不装** `@changesets/changelog-github`：它要从 GitHub API 拉 PR 标题，
  私有镜像/内网构建拿不到，且会用 PR 标题盖掉人写的说明。这个仓库的 changelog 质量靠人写保证。
- 脚本：`pnpm changeset`（写一条）、`pnpm version:packages`（`changeset version`）、
  `pnpm release`（`build && changeset publish`，本地兜底）。不叫 `version`——`pnpm version` 会被内置命令吃掉。
- **`.github/workflows/release.yml`**：push 到 main → changesets/action 开 "chore: version packages" PR
  → 合并后同一条流水线 `typecheck → build → build:check → 打包自检 → changeset publish`。
  `id-token: write` 给 npm provenance，`concurrency` 用 `cancel-in-progress: false`（发布不允许被打断）。

**一条 5 秒的实测推翻了一个默认假设**：`catalog:` 协议在打包时会不会被解析？

| 命令 | `peerDependencies.vue` |
|---|---|
| `pnpm pack` | `~3.5.43` ✅ |
| `npm pack` | `catalog:` ❌ |

所以"打包会解析协议"是错的，只有 pnpm 会。changesets v3 恰好按 `packageManager` 选 `pnpm publish`
（`getPublishTool` 里显式判断），CI 路径安全；但谁本地 `npm publish` 一次就发出装不上的包——
SECURITY.md 里"不接受本地直接发包"这条不是洁癖。

**新增两条门禁，都做了破坏性验证**

1. `internal/scripts/check-changeset.ts`（进 `verify` job 第一步）：PR 改动触及
   `packages/{ui,icons,tokens,i18n,shared}/src/**` 或包清单时必须附 `.changeset/*.md`；
   测试/dist/docs/CI 改动不强制（逼着为改一行测试写 changeset，人就会习惯性 `--empty`，门禁等于没有）。
   本地没有 `origin/main` 时**跳过并说明原因**，不制造"本机红、CI 绿"。7 例单测 + 用旧 commit 当基线
   实跑确认会红（列出 9 个改动文件、退出码 1）。
2. `internal/scripts/check-package-artifacts.ts`（release.yml 里跑）：真 `pnpm pack` 五个包，
   解 tarball 断言 —— 无 `src/` 与测试文件、无未解析协议、`repository.url` 齐全、
   `main/module/types/unpkg/jsdelivr` 五个入口文件都真的在包里。第 4 条是契约 12 覆盖不到的：
   契约看仓库里的文件，而 `files` 漏配的产物照样"字段同源"，只是包里没那个文件。
   破坏验证：把 tokens 的 `main` 指向 `./dist/missing.cjs`，立刻报红。

另外给五个发布包补了 `repository`（`git+https://github.com/jitOffice/office-ui.git` + `directory`）——
provenance 靠它与构建来源对齐，此前一个包都没有。

`pnpm test:node` 211 例（新增 7 例门禁规则）。

**没做完的**：`NPM_TOKEN` 未配置；B3（主题权属）未书面确认，**首次发布不可逆**（0.x 也得想清楚
包名与 scope），所以当前状态是"流水线就绪、发布闸关闭"。

**2026-10-30 第十五轮：无构建器 API（02 §4.2 / §4.3）**

目标用户 A 是"没有 bundler 的 jQuery 项目"，此前只有 `office-ui.js` 一个全局对象可用——
组件必须自己写 `createApp + template`。本轮补上两条入口：

- `OfficeUI.create(name, { anchor, props, on, i18n, theme, density })` → `{ el, setProps, destroy }`。
  每个实例是独立 `createApp`，容器插在 `anchor` **之后**（塞进按钮内部会把按钮文字顶走）。
- `OfficeUI.hydrate(root?)` → 扫描 `[data-oj]`，认 `data-oj-props`（JSON）与
  `data-oj-prop-*`（逐属性、支持 `max-rows` 这种嵌套、值做 JSON 类型推断）。
  已挂载的元素打 `data-oj-hydrated`，重复调用不会重复挂载。
- `OfficeUI.configure({ i18n })`：**这条是必须的**。每个 `create` 是独立 app，拿不到页面里
  `OjLocaleProvider` 的上下文——症状正是 02 里点出的"页面是日文、命令式弹层里文案是中文"。
  宿主启动时登记一次，之后所有实例自动套上同一个 i18n（`syncDocument: false`，不动 `html[lang]`）。
- `registry.ts`：34 个组件的**显式**名字表。不从导出推导——`'oj-table-grid-picker'` 是给没有 TS 的
  用户用的公开字符串契约，推导名会随重构静默变化。`resolveOjComponent` 同时接受 `ribbon` 这种省略
  `oj-` 前缀的简写（02 §4.3 的示例就是这么写的）。

**一个只有真跑才会发现的问题**：`root.querySelectorAll('[data-oj]')` 只查后代，
`hydrate('#toolbar')` 的根节点自己就是 `[data-oj]` 时，最常用的那种调用方式会**静默什么都不做**。
单测第一版就挂在这里（返回 0 个实例），修法是候选集里补上根节点自身。

事件名的映射也确认了一遍：`on: { 'update:open': fn }` 会被转成 `onUpdate:open` ——
冒号是合法的 props 键，Vue 的 `emit('update:open')` 正好按这个名字查。

**验证**：
- `packages/ui/test/unit/create-hydrate.spec.ts` 15 例（anchor 位置、setProps、destroy 幂等、
  destroy 后 setProps 不复活、未知组件报错、注册表齐全、hydrate 的 JSON 解析失败定位到元素、
  坏 JSON 不连累同页其它容器、重复 hydrate、`on-*` 指向不存在的全局函数只警告）。
- UMD 产物确认带出 `create` / `hydrate` / `configure` / `resolveOjComponent`；
  `build:check` 同源、`es-check es2018` 通过。
- 真浏览器（Chrome 151，`examples/no-bundler/index.html`）：`hydrate()` 挂载 2 个实例、
  图标 20px、点按钮弹出"命令式创建的对话框"、点关闭后容器被移除、**控制台零错误**。

**顺带修了两条门禁的盲区**（都是本轮新代码踩出来的，不是猜的）：

1. `check-component-styles.ts` 把注册表里的**对象键**当成了 class：`'oj-zoom-control': OjZoomControl`
   被读成"用了 `.oj-zoom-control` 这个类"，于是一次性把 34 个组件全报成"裸组件"。
   class 只可能出现在**值**的位置，所以剔除"字符串作为对象键"是语法事实而不是启发式；
   破坏性验证过没被放宽（组件里写 `class: 'oj-ghost-widget'` 照样红）。
2. `component-docs.ts` 扫到注释里的示例 `name: 'OjXxx'`，凭空生成 `xxx.md` 与 `command-root.md`。
   修法是扫描前剥注释，且块注释替换成**等量换行**——props 解析靠 4 空格缩进切行，行结构塌了会静默漏 prop。

顺带按新流程走了一遍：本轮改了 `packages/ui/src`，所以附了 `.changeset/no-bundler-entry.md`（`minor`）。

**没做的**：`web-types.json` / `tags.json` / `attributes.json`（02 §210 的"必须发布 IDE 元数据"）
还没生成脚本；它需要从组件 props 提取，与文档 API 表共用数据源，适合和 `vue-component-meta`
一起做，单独做一遍等于写两套提取逻辑。

**M0 八条 DoD 的现状**（哪条过了、哪条只是"产物有了但没验"）：

| # | DoD | 状态 |
|---|---|---|
| 1 | UMD 端到端，控制台无编译缺失警告 | **✅ 已过**：Chrome 151 本地跑通 + `packages/ui` 的 Playwright 用例守着，`visual.yml` 每日跑 |
| 2 | tree-shaking 后 gzip ≤ 8 KB（size-limit 断言） | **✅ 已过**：`.size-limit.jsonc` 四条阈值，实测 1.97 kB / 836 B / 7.5 kB / 1.92 kB，进了 `build` job |
| 3 | 按需引入下组件样式不丢 | **✅ 已过**：`pnpm lint:styles` 双向守（32 个组件 block 都有规则 / 35 个样式 block 都有使用者），另加契约 13 守变量层（组件与文档站都扫）。**不含**像素级视觉（B5 那批）与样式体积回归（属 DoD #2 的 CSS 阈值） |
| 4 | 同一命令渲染在两处只重渲染一次 | **✅ 已过**：`packages/ui/test/unit/command-sync.spec.ts` 4 例（Vitest + @vue/test-utils + happy-dom），实测求值 1 次 / 通知 1 次 / 重渲染 1 次；拆掉合帧立刻红 |
| 5 | token CSS/JS 同源 | ✅ 契约 4 + `parity` 用例 |
| 6 | 门禁可失败（三条故意破坏让 CI 红） | ⚠️ 契约 13/14、图标结构门禁、体积四条阈值都实测红过；**CI 层仍未跑过**（本机没有 Actions runner） |
| 7 | `ui` 的 `dependencies` 为空 | ✅ 契约 1 |
| 8 | ADR-0001~0004 已合入 | ✅ |

**结论**：八条过七条（1/2/3/4/5/7/8），**只剩 #6**。
#6 的缺口不是代码：本机没有 Actions runner，所有门禁都只在本地做过故意破坏，
"CI 上真的会红"这件事只能靠推一次 PR 来回答。

M1 之前欠的两件已于 2026-10-30 补上（都不属于 M0 的八条）：
- **覆盖率已接门禁**：`@vitest/coverage-v8` 进 catalog，`test:unit` 自带 `--coverage`，
  阈值卡 `src/vue/**` 行 ≥85 / `registry.ts` ≥95 / `popper.ts` ≥95。补了 4 个 spec（弹层、
  编辑器控件、树与框选、图标）共 34 例，组件行从 79.93% 抬到 92.88%（注册表 100%、
  `usePopper` 96.66%）。破坏方式是把阈值抬到 99，门禁立刻红并点名 glob，恢复后转绿。
- **`OjIcon` 的 `spin`**：只挂 `oj-icon--spin` 类名，动画写在样式表里（内联会绕开
  `prefers-reduced-motion`），周期取 `--oj-motion-duration-slow`；`reduce` 下停转。
  组件文档由生成器重出，`docs/test` 的 props 断言同步加了 `spin`。

（`OjPortal`/`OjTrigger` 已交付，见 D2 轮次。）

---

### 首轮执行记录

已完成的部分**全部能在没有 `node_modules` 的环境下验证**：`pnpm verify`
（= `tokens:gen` → `i18n:gen` → `node --test "packages/*/test/**/*.test.ts"` → `check-contracts`）
当前是 **81 个用例通过、十二条契约检查通过**；`pnpm install` 在本机已可用，
`pnpm typecheck`（tsc 7.0.2）在四个包上 **0 error**。
A2 之后多出一条**需要依赖**的链：`pnpm build`（turbo 三包，第二次跑 `3 cached`）与
`pnpm build:check`（源码重建进临时目录、与入库 `dist` 逐字节比对 + `es-check es2018` 扫兼容线），
两者都靠故意破坏验证过红绿两条分支，细节见下方 A2 行与偏差 14、15、16。
B5 新落的 `packages/tokens/test/visual/typography.spec.ts` 不在这两条链里：它不进 `node --test` 的
`*.test.ts` glob，也不受 `pnpm verify` 的零依赖约束。它**已经真跑过并全绿**（2026-10-09，
本机 Chrome 151 与 Edge 154 两套内核各跑一遍，走 `OJ_BROWSER_CHANNEL`，见 02 §7），
而且每条都做过故意破坏验证——第一次真跑就抓到两条用例其实是假锁。
仍要说清楚：Playwright 自带的 `chrome-headless-shell` 在本机没下载成功，
CI 里必须自己 `playwright install chromium`，否则这三条只能靠通道口子跑。

| 任务 | 状态 | 落点 |
|---|---|---|
| A1 工作区 | **完成**（验收两条本轮首次真跑通过） | `pnpm-workspace.yaml`、`tsconfig.base.json`、根/各包 tsconfig、`package.json`。根脚本 `clean` 是零依赖 Node 脚本（`internal/scripts/clean.ts`）而不是 `rm -rf`：后者在 Windows 开发机上跑不了，且会连入库的 `packages/tokens/dist` 一起删掉。实测：干净安装 6 个包全部走网络（`reused 0, downloaded 6`）、`pnpm install --frozen-lockfile` 通过、`turbo run typecheck` 三包 0 error 且**第二次运行命中缓存**（`2 cached`）。两条执行中发现：`turbo` 读不到 `catalog:` 声明的版本号，每次打一条 "No locally installed turbo" WARNING（无害，版本由 lockfile 保证；要消掉只能在根 `package.json` 写具体范围，暂不做）；`pnpm install --force` 会**绕过平台过滤**，把 aix/freebsd/darwin 等各平台的可选二进制全拉下来（30 包、2 分钟），本地与 CI 都不许用。另外补了 `.gitattributes`（`* text=auto eol=lf`）：`packages/tokens/dist` 是**入库的生成物**而新鲜度门禁逐字节比较，开发机默认 `core.autocrlf=true` 会让 Windows 克隆一检出就变成 CRLF、门禁必报"dist 已过期"，Linux CI 却永远绿。已实测这个失效模式（手工把 `dist/index.css` 换成 CRLF → `pnpm lint` 报"src 与 dist 不同源"；`tokens:gen` 恢复后转绿），理由与验证写进文件注释与 `CONTRIBUTING.md` §2。这条链已在**干净克隆**上验过（提交后 `git clone` 出一份没有 `node_modules`、没跑过 install 的树：九条契约通过、71 例全过、检出 0 个 CRLF 文件）——"装不上依赖也能验证产物与契约"从此是被跑过的事实，不是设计意图。A2 把 `packages/shared`、`packages/i18n` 的 `dist` 也变成入库产物之后，这条链在**没有 `node_modules` 的副本**上重跑过（加上门禁 12 之后再跑一次）：`pnpm verify` 退出码 0、81 例全过、十二条契约通过、三个 `dist` 树共 50 个产物文件里 **0 个 CR 字节**（44 个是 `git ls-files --others --exclude-standard` 眼里的新增文件，另 6 个 tokens 的已在 `a704a9d` 里；`git check-ignore -v` 对它们命中的是反忽略规则 `!packages/*/dist/**`，而已跟踪文件 check-ignore 一律报"未被忽略"，所以这两个数只能合起来看）。真正还缺的是 ESLint/Stylelint 配置（A3）与 `packages/ui` 的 SFC/样式构建链（A2 余下部分） |
| A4 ADR | 完成 | `docs/adr/` 五份；0002 浏览器基线已 **Accepted**（2026-10-09 负责人拍板：legacy 线 floor = Chromium 86，方案 C 成立；目标内核的**具体版本清单**仍未拿到） |
| A5 仓库治理文件 | 完成（**两处需负责人填空**） | `CONTRIBUTING.md`、`CODE_OF_CONDUCT.md`、`SECURITY.md`、`SUPPORT.md`、`.github/ISSUE_TEMPLATE/`（bug 强制复现链接 / a11y 独立模板 / feature / `config.yml`）、`.gitignore` 补反忽略与许可扫描中间产物。仍缺：**CoC 举报邮箱与治理小组名单**、**SECURITY 的邮件渠道与 PGP 指纹** —— 两处都以 `TODO(需仓库负责人确认)` 写在文件里 |
| B1–B3 tokens 双产物 | 完成 | `packages/tokens`，163 变量 → 6 产物，`parity` + `contrast` + `palette` + `typography` 32 用例 |
| B 系列门禁 | 完成 | 合帧/对比度/同源对账/产物新鲜度/框架中立/i18n 生成表新鲜度/**语言档位↔`html[lang\|="…"]` 层双向比对（变量覆写层与元素级排版层分别要求命中，产物里禁止 `[lang="` 精确匹配）**/**治理文档内部链接（区分大小写）**/**`exports` 不许指回 `./src/*.ts`**/**入库 `.d.ts` 的相对说明符必须在产物树里可解析**/**`main`/`module`/`types` 逐字等于 `exports["."]` 的对应条件，有 `dist/umd` 就必须挂 `unpkg`/`jsdelivr`**/**组件样式里每个 `var(--oj-*)` 必须命中 token 产物或由组件源码赋值，且不许字面色值**/**`ui` 的 UMD 必须把 `vue` 留在外部、框架无关入口一处都不许引用**等十四条，`internal/scripts/check-contracts.ts` |
| i18n 运行时（**计划外**，见下方偏差 6） | 完成 | `packages/i18n`，30 用例（24 例走 `src` + 6 例 `artifacts.test.ts` 走 `dist`）；41 个 key × 四语一致、消息文法、`Intl` 封装、`subscribe` 运行时，零框架依赖 |
| D1 命令注册表 | 完成 | `packages/shared/src/commands/`，19 用例（15 例走 `src` + 4 例 `artifacts.test.ts` 走 `dist`），含四条事故来源验收 |
| B4 中英日排版档 | 完成 | tokens 生成器：语言变量覆写层 + `resetSection()` 元素级排版层；`typography.test.ts` 6 例；计算样式在 Chromium 150 实测命中。**`line-break: strict` 与 `text-autospace: normal` 都实测生效**（后者每处中日韩↔拉丁边界插入 0.25em，16px 样本 +8.000px；该内核 UA 默认值就是 `no-autospace`，所以删不得）。两条此前都因**量法错误**被误判为"量不出效果"，教训见 01 §7 |
| B5 视觉基线 | **部分落地**（第一切片已实跑通过） | 已落 `packages/tokens/test/visual/typography.spec.ts` 三条用例（真解析器下四个声明的计算值、`text-autospace` 的 8px 差值、`line-break` 的行末违禁字符集），`turbo run test:visual` 已声明且 `cache: false`。页面侧逻辑此前在手工会话里跑通（`<link>` 直连 `dist/index.css`，读数 `8.000px`、`auto`=`ゥ止スト`、`strict`=`の末テト`，见 01 §7），本轮由 runner **真跑并全绿两次**：`OJ_BROWSER_CHANNEL=chrome`（151.0.7922.175）与 `=msedge`（154.0.4258.62）各 3 passed。第一次真跑立刻暴露一个假锁——两条行为用例在盒子上内联设值，读的是 UA 而不是产物，把 `line-break` 改成 `auto` 它们照样绿；改成"不声明、从 body 继承"后，`line-break` 与 `text-autospace` 各破坏一次（改值、整条删掉），红绿两条分支都实测过。剩下的仍是像素级项目：`text-spacing-trim` 的标点压缩（盒子坐标看不见，只能截图比对）、字体族首选项与行高 |
| A2 构建管线（两趟） | **基本落地**（三个发布包都有 ESM/CJS/types；`ui` 另有两条 UMD） | 新增 `internal/build`（`@jitoffice/internal-build`，private）：`specs.ts` 声明每包的入口与 UMD 目标，`jobs.ts` 把一趟展开成 **ESM / CJS / types / UMD** 四条产出链，`build.ts` 串行跑（并行会两趟抢同一个 outDir），`--check` 重建进临时目录与入库 `dist` 逐字节比对。`packages/shared`、`packages/i18n` 的 `exports` 已从 `./src/*.ts` 改指 `dist/*`（`types`/`import`/`require` 三条件），i18n 另加 `unpkg`/`jsdelivr` 与四条 `./locales/*` 子路径；两包 `dist` **入库**（`.gitignore` 的反忽略从 tokens 一包扩到 `packages/*/dist/**`）。三个发布包的 `main`/`module`/`types` 现在逐字等于各自 `exports["."]` 的条件目标——`packages/tokens` 此前**一个都没写**，是新增的门禁 12 抓出来的，见偏差 16。**实测到的**：`preserveModules` 两条链都保留模块结构（深路径 `require('dist/cjs/commands/registry.cjs')` 有用例锁）；兼容线真的降了级（源码里 `?.`/`??` 遍布，`dist/umd`+`dist/locale` 里 0 处，`dist/es` 保留 4 处；`es-check es2018` 扫 5 个文件通过）；UMD 三种加载形态（CJS/AMD/全局）与"没有 require 也没有 define 的空 `node:vm` 里靠全局跑通一次日文取值"都有用例；构建确定（`--check` 绿 + 同一份源码在仓库根 / `internal/build` / 包目录三种 cwd 下产出的四棵树逐字节相同）。**踩到并钉死的四条 vite/rolldown 行为**见偏差 14、15。**2026-10-26 补上**：`ui` 的两条 UMD（`vue` 外部化成全局 `Vue`、`es-check es2018` 通过、框架无关入口 0 处 `vue`）、`dist/styles/office-ui.css` 与 `office-ui.layered.css` 双产物、`unpkg`/`jsdelivr` 两个 CDN 字段。仍未做：`packages/ui` 的 SFC 链（现有组件是 `h()` 写的 `.ts`，`vue-tsc` 与 `@vitejs/plugin-vue` 都没用上）、`attw` 双解析。02 §2.1 的"样式入口单独一趟"在这套结构里**不适用**：ADR-0003 决定只有一份 CSS，没有逐组件样式入口可被摇掉，取而代之的是契约 13（样式变量必须命中 token 表）。 |
| A3 CI 流水线 | **部分落地**（2026-10-26） | `.github/workflows/pull-request.yml`：`verify`（零依赖，**不 install**）与 `build`（typecheck → test:unit → build → build:check → size）两条 job，末尾用 `git status --porcelain` 卡住"改了源码忘记提交生成物"。`visual.yml` 定时 + 手动跑 B5 排版回归。**已接入**：size-limit 体积（2026-10-29，四条 gzip 阈值进 `build` job，拒绝的阈值都实测破坏过）；tarball 产物（`lint:package`）、attw 四模式类型出口（`lint:types`）、生产依赖许可白名单（`lint:license`）三条于 2026-10-30 接入 `build` job，各自故意破坏过一次（改坏 `require.types` → `Masquerading as ESM`；从白名单删 `MIT` → 报出 `vue` 违规），恢复后转绿；产物外链扫描（`lint:artifact-offline`）同日接入 `build` job，破坏方式是往 `packages/tokens/dist/index.css` 追加一句 google fonts 的 `url()` → 报出 `index.css:316` 并退出 1，恢复后转绿；覆盖率阈值随 `test:unit --coverage` 进 `build` job（组件行 92.88% ≥ 85、注册表 100% ≥ 95、`usePopper` 96.66% ≥ 95，阈值抬到 99 实测会红）。同日还接入：字号/时延魔法数（`lint:css-magic`，自研零依赖，破坏方式是把一处 `var(--oj-fs-12)` 改回 `12px` 并给 `.oj-icon` 加 `transition: 150ms` → 报出 `style.css:43` / `style.css:91`，恢复后转绿；另验了"例外腐烂"：把 `.oj-ruler` 的 10px 换成 token 后门禁报"登记已不存在"）。**未守**：只剩**间距/圆角**的魔法数——不是缺依赖，而是 token 标度（4/8/12/16/20/24/32/40、4/6/8/12/20/9999）覆盖不了样式表里真实的 2px / 7px / 28px / 56px，得先定标度。`docs.yml` 于 2026-10-30 落地（文档站构建 + 生成物 `--check` + 构建产物离线扫描 + artifact，**不做在线部署**：托管目标未定，内网自托管优先）。**未验证**：本机没有 Actions runner，Workflow 只做过 YAML 解析与命令存在性校验（`docs.yml` 的四步在本地逐步真跑过：`install --frozen-lockfile` / `lint:docs` / `docs build` 9.85s / `lint:docs-offline` 564 KB 产物无外链），"故意破坏让 CI 红"这条验收仍未实跑。 |
| C1 图标构建管线 | **完成**（2026-10-29） | `packages/icons` 落地：`svg/*.svg` 是唯一手写源（31 枚，从 ui 的内联表一次性抽出），`scripts/generate.ts` 产出四份生成物——`src/generated/icons.ts`（常量，含 `viewBox`/`attrs`/`body`/`markup`，供 canvas 与无 DOM 环境）、`src/generated/vue.ts`（每枚图标一个具名组件，`preserveModules` 保证可单摇）、`generated/sprite.svg`（`<symbol>` 集合）、`generated/manifest.json`（去掉 `markup` 的机器可读清单，同一份数据不存两遍）。生成器内置四条硬规矩：必须有 `viewBox`、根元素不许写 `width`/`height`、不许出现 `<image>`/`<filter>`/`<script`/外链、必须继承 `currentColor`。**产物入库**并由用例守新鲜度；sprite/manifest 走 `specs.ts` 的 `assets` 复制进 dist（不直接写 dist，否则 `--check` 会报"已入库但构建不再产出"）。**验收**：sprite 的 31 个 `<symbol>` 在 Chrome 151 里逐个 `<use>` 引用并量到非零 `getBBox()`，且"引用不存在的 id 得到 0"作为对照 —— 只断言"没报错"是无效的。**2026-10-30 补齐余项**：`IconRegistry` 已落地（`registerIcon`/`registerIcons`/`unregisterIcon`/`registeredIconNames`/`resetRegisteredIcons`，根入口导出、框架无关），查表是注册表优先；注册期拒绝 `oj-*` 前缀、非 kebab-case、缺 `viewBox`、多根 `<svg>`、内联事件/`<script>`/`javascript:`/`<foreignObject>`/外链，`registerIcons` 原子写入，同名允许覆盖。零依赖用例 7 条 + 组件层 1 条（注册后 `OjIcon` 真能渲染出来）。单图标 ≤1 KB 的 size-limit 断言此前已在 `.size-limit.jsonc`（四条），`OjIcon` tree-shaken 实测 2.02 kB / 上限 8 kB，注册表只加了约 50 B gzip。 |
| C2 首批 40 图标 | **未开始 · 等 B4** | 设计产能决策没定。当前 29 枚覆盖 E1/E2 用到的命令，不足以铺满 M1 的 Ribbon。 |
| D2–D4 浮层与图标 | **基本完成**（2026-10-29） | `OjPopper`（`placePopper` 纯函数，翻转+夹取）、`OjPortal`（teleport 目标可配 / `--oj-z-*` 层级 / 滚动锁计数 / 焦点陷阱 + **归还焦点**）、`OjTrigger`（`createTriggerMachine` 的四种触发组合 + 离开延迟 + 移进面板取消关闭）、`OjTooltip`、`OjIcon` 均已交付，共 13 例覆盖。**仍缺**：多区间选区取包围盒（D 组 `OjPopper` 那条）、`OjSplitter`/`OjPaneGroup`/`OjDockPanel`/`OjVirtualList`（同组其他件）、SSR 渲染的实测（代码里 DOM 访问全在 `onMounted`，但没有服务端渲染用例守着）。 |

与计划的偏差，十六条都是执行时才暴露出来的：

1. **命令注册表落在 `packages/shared`，且它的根入口框架无关**。原计划把它当作 `ui` 的一部分，
   但它必须能被无 DOM、无 Vue 的协同服务端复用（校验前端发来的命令是否合法），
   留在 `ui` 里就做不到。决策与量化依据见 ADR-0005。
2. **D1 的验收"200 命令 × 1000 次选区变化 → `state()` 调用 ≤ 命令数"按增量口径实现**。
   200 次注册本身就会各触发一轮失效，绝对值必然是 400；测试取"通知前后的差值 ≤ 200"，
   这才是原条款要守的东西（原写法会被自己的前置步骤判假）。
3. **`en` 不是 token 语言维度**（与 `zh` 基底同值），因此语言覆写槽位只有 `zh-TW`/`ja`。
   `createTokens({ lang: 'en' })` 不报错，安静落回基底表。见 01 §7。
4. **`packages/shared` / `packages/i18n` 的 `exports` 曾指向 `./src/*.ts`**——workspace 内源码消费是成立的，
   但发布出去就是要求下游自己装 TypeScript。**A2 第一切片已闭合这条**（2026-10-09）：两包 `exports`
   改指 `dist/*`（`types`/`import`/`require`），产物入库，并且新增契约 10 让 `exports` 一旦以 `./src/`
   开头就红。故意把 `.` 的 `import` 改回 `./src/index.ts` 实测过会红、报出的是哪一条哪一项都能定位。
5. **对比度门禁逼出三处偏离实测基线的色值**，并新增一条结构门禁
   （`light` 写成十六进制的条目必须有 `dark`）。`--oj-text-danger` 曾因缺 `dark`
   在暗色下静默掉到 3.90:1，这类错误光靠配对表抓不住。见 01 §3。
6. **`packages/i18n` 的运行时不在 M0 任务表里**——04 §6 有完整方案，05 却没给它排任务，
   只有 D1 顺带提到"i18n key 解析"。本轮把它和 A5 一起当作"唯一不依赖 `node_modules` 就能推进的两条线"
   补上了。**M1 排期必须正式列入**：语言切换器、`OjLocaleProvider`/`useLocale`、以及日文译文的母语复核都还挂着。
7. **语言覆写层曾经静默失效，是本轮抓到的唯一真实产品缺陷**。选择器原写成精确匹配
   `html[lang="ja"]`，而语言包 `name` 是完整标签 `ja-JP` → 字体栈、13px 基准字号、1.5715 行高、
   `0.02em` 字距**整层**对日文界面不起作用；tokens 的产物一致测试和 i18n 的语言包测试各自全绿，
   谁都没发现。改为 `|=` 前缀匹配（繁体另挂 `zh-Hant` 别名），并把这条接缝做成门禁 8：
   直接解析**产物** `dist/index.css` 里的选择器与四语语言包双向比对（语言命不中层 / 层是死层 /
   基底档被误捞走三种情况都会失败），不读生成器的源码常量。见 01 §7。
8. **`OjLocale.fontStack` 改名 `tokenLang`**（那一档同时管字号、行高、字距与 `line-break`，
   叫 fontStack 会让人以为它只管 family），`formats` 增加 `time` 字段。日期方言定为
   **day.js 的子集**并刻意**不实现 `W`/`WW`**——day.js 里它们是周序号，而星期名改走
   `date.weekday()`；把 `W` 塞进格式串会让每个熟悉 day.js 的贡献者读错它。见 04 §6.1、§6.3。
9. **语言包从汇出桶 `./locales` 改为每语言一条子路径**。理由与 ADR-0001 的 tree-shaking 约束同源：
   只用中文的宿主不该为另外三语付体积，而 CJS/UMD 消费方根本没有 tree-shaking。
   `exports` 的 `./src/*.ts` 问题（偏差 4 同因）已随 A2 第一切片闭合。
10. **排版层不发 `@supports`，与 ADR-0002 的表述有出入**。该 ADR 要求老内核目标把 `text-autospace`
    用 `@supports` 包裹"并给出降级值"，但落地时发现这两条排版声明没有降级值可给：
    老内核会把 `text-autospace` 当未知声明丢弃，而丢弃的后果只是少插 0.25em 间隙、不会排错版；
    `text-underline-position: from-font` 不支持时退回 `auto` 也正是我们要避开的默认行为，
    包一层 `@supports` 不改变任何结果。
    因此 tokens 产物直接发裸声明。**B2 已拍板取 Chromium 86**，这条在信创内核上就是会被丢弃，
    接受的理由如上；**若还需要改写成别的写法，改写放在 ui 包的样式构建里**（A2/A3），不动 tokens。
    另外，本轮在 Chromium 150（Electron 43）里实测：作用域与计算样式全部正确，
    两条排版规则也都**生效**——`text-autospace: normal` 每处 CJK↔拉丁边界插入 0.25em
    （16px 样本实测 +8.000px，而该内核的 UA 默认值是 `no-autospace`，所以这条声明删不得），
    `line-break: strict` 改变了首行行末可落字符集。
    但这两条结论此前各自都被判过"量不出效果"，**两次都是量法错误**：比较逐行盒宽度看不见禁则
    （禁则移动断点而不是行宽），而用无效关键字 `none` 作对照等于拿 `normal` 比 `normal`。
    教训写进 01 §7：**验排版规则先确认测试值本身合法，并量字符位置而不是容器尺寸。**
    另有一条会咬人的值域限制：这个内核的 `text-autospace` 只认 `normal` 与 `no-autospace`，
    写成规范里的 `ideograph-alpha ideograph-numeric` 会被整条丢弃、静默失效，
    `typography.test.ts` 的 `deepEqual` 就是它的防线。`text-autospace` 的像素级复验仍归 B5。
11. **类型产物原先是手写的，只有 `tsc` 能发现**。`dist/index.d.ts` 的 `OjTokens` 写成了
    `[group: string]: Record<string, unknown>`：运行时值、CSS 变量、`tokenNames` 三者全对得上，
    用例一路绿，但用户敲 `tokens.bg.contaier` 照样编译通过并拿到 `unknown`，
    163 个变量对外等于没有类型。**装上前它不可能被发现**——零依赖门禁在结构上就看不见类型层。
    现在 `OjTokens` 与 JS 树一样由注册表推导（同一个 `path.split('.')`），
    `parity.test.ts` 增一条独立解析 d.ts 文本、把叶子路径集合与注册表对账的用例，
    故意删掉一个叶子或塞回索引签名都会失败（两条都实测过）。
    顺带被 `tsc` 抓出的还有 6 处：`resetSection()` 返回类型写错、`Palette['families'][string]` 索引不合法、
    `assert.notEqual(x, undefined)` 不缩窄、`Intl.PluralRules` 是只读属性而 `delete` 它报 TS2540
    （改走 `Object.defineProperty` 复位，**没有留任何 `ts-expect-error`**）、
    一个测试忘记给 `createCommandRegistry` 传泛型参数（`C` 落回 `unknown` 后 `OjCommand<Editor>` 被正确拒绝——
    这是逆变在设计，不是要压掉的报错）。**结论进验收环境**：M1 起"能装依赖的机器"是验收环境之一，
    零依赖那条链只保证"装不上依赖时也不是完全没法验证"。
12. **门禁自己也有解析缺陷，只有真的用到那条键才会暴露**。门禁 5 校验"`catalog:` 引用必须命中
    `pnpm-workspace.yaml` 里真实存在的键"，而它的 YAML 解析把键连引号一起收进集合——
    catalog 里写的是 `'@playwright/test': ^1.64.0`（单引号），正则只处理了双引号。
    此前所有 `catalog:` 引用都用的是不带引号的裸键名，所以缺陷一直潜伏；B5 第一次引用带作用域前缀的
    键就报"catalog 里没有这个键"，而 pnpm 自己装得好好的。现在两种引号都剥掉，
    并用故意引用 `@playwright/nope` 验证它仍能报错（失败与通过两条分支都实测过）。
    **它印证了 A5 里那条规矩的另一半**：门禁不仅要"故意破坏一次证明会红"，
    还要有人在真的用到它覆盖的每一种写法时再看一眼它报了什么。
13. **"跑绿了的用例"不等于"锁住了产物"**。B5 那三条首次实跑全绿，我按仓库规矩把产物
    `line-break: strict` 改成 `auto` 重跑，结果只有断计算值的那条红了——另外两条在测试自建的盒子上
    **内联**写了被测属性，内联优先于 body 继承，所以它们量的一直是 UA 的行为，
    `dist/index.css` 里写什么它们不知道。两条都改成"这条声明不写，让它从 body 继承下来"之后，
    改值与整条删掉两种破坏各自让对应的用例变红，恢复后复现全绿。
    顺带补上一件此前只有单内核证据的事：删掉声明后 computed 在 Chrome 151 与 Edge 154 上同样是
    `no-autospace`，所以"这条删不得"不只成立于我实测的那台 Electron。
    **规矩补一条**：浏览器用例里凡是锁"我们发出去的 CSS"的断言，被测值必须来自继承或选择器命中，
    显式设值只允许出现在对照组；每条锁都要真把产物那一行改掉或删掉，看它红不红。
14. **验"产物新鲜度"的第一次破坏是无效的，无效的原因值得写下来**。A2 的 `--check` 转绿之后，
    我按规矩去破坏它：往 `packages/i18n/src/formats.ts` 末尾加了一行注释。门禁**没红**。
    当时的第一反应是"门禁不可信"，实际结论相反——**注释根本进不了 bundle**，产物逐字节相同是真事，
    被破坏的那一侧才是假的。换成改一个会进产物的值（`confirm: '确定'` → `'确认'`），`--check` 立刻
    退出码 1，并且**只**点名三处受影响的产物面（`dist/es`、`dist/cjs`、`dist/umd`/`dist/locale` 里的
    对应文件），恢复后转绿。
    **规矩补一条（它是偏差 13 的另一半）**：破坏门禁要改的是"会出现在产物里的那部分源码"，
    注释、空白、`import type` 这类会被擦掉的东西不算破坏；先想清楚这一行为什么理应出现在输出里，
    再决定红不绿是不是证据。
    另外三条同类发现：
    - **`es-check` 对空 glob 退出码 1**（9.8.1 / acorn 8.18.0 实测）。所以兼容线那条门禁不可能
      "因为没匹配到文件而静默通过"——它匹配不到就直接失败。`pnpm build:check` 因此不需要额外的
      "至少扫了 N 个文件"断言。
    - **TypeScript 7.0.2 没有 JS AST API**：`createSourceFile`、`SyntaxKind` 在它的公开导出里是
      `undefined`。原本想用官方解析器写"产物语法下限"检查的路径不成立，这也是 ADR-0002 那条
      "配套动作：产物语法门禁"最后落在 es-check 上的原因，不是随手选的第三方依赖。
    - **`rewriteRelativeImportExtensions` 不会改写 emit 出来的 `.d.ts`**：源码里 `./x.ts` 的说明符
      原样留在 `dist/types/**/*.d.ts` 里（tsc 7.0.2 实测，16 份 d.ts 全是这样）。
      我先怀疑这是断链，就去按消费者口径量了一遍：另建一个**不开** `allowImportingTsExtensions` 的
      探针文件，`moduleResolution` 分别取 `bundler` / `node16` / `nodenext` 导入 `dist/types/index.js`
      并真的用其中的类型——三种都 0 error，`.ts` 说明符能落到同名 `.d.ts`。
      所以**没有**为此发明一遍改写（那是给产物加一层我们验不动的字符串替换），
      改成把"入库 `.d.ts` 的相对说明符必须在产物树里可解析"钉成契约 11：
      今天它不报东西，构建器或 emit 配置一变（这正是它会坏的方式）它就先红。
15. **vite 8（rolldown 1.2.13）有五处行为必须显式钉死，否则产物是错的或门禁是假的**。都不是文档里读来的，
    是这轮真跑出来的：
    - `build.lib.fileName` 会被 `output.entryFileNames` 覆盖，写成字符串参数**静默无效**；
      给 chunk 命名要用 `lib.entry` 的 record 形式（`{ 'office-ui-i18n': <abs> }`）。
    - `"type": "module"` 的包里 vite 把 umd 输出成 `office-ui-i18n.umd.cjs`。这同时坏了两件事：
      02 §4.1 的无构建器契约是 `<script src="…/dist/locale/ja-JP.js">`，而兼容线门禁的 glob 只收 `**/*.js`。
      于是显式写 `output.entryFileNames: '[name].js'`。
    - **多个 UMD 目标共用一个 outDir**：四趟都 `emptyOutDir: true` 时，实测 `dist/locale/` 只剩最后
      一趟写的 `en-US.js`，前三语被自己后面的趟次删掉；都不清空，上一轮的过期产物会跟着发布。
      现在按 outDir 分组，只有组内第一趟负责清空。四趟也不能并行——同一 outDir 会抢。
    - **`//#region` 标记让产物依赖调用目录**：rolldown 在每个模块前写一行 `//#region <相对 cwd 的路径>`，
      而 `cwd` 默认取 `process.cwd()`。症状是：turbo 以包目录为 cwd 跑构建、`--check` 以
      `internal/build` 为 cwd 跑，两边源码没动，`--check` 却报 `registry.js`/`registry.cjs` 不同源。
      把 `rolldownOptions.cwd` 钉到包目录后，仓库根 / `internal/build` / 包目录三种调用位置产出的
      四棵 `dist` 树逐字节相同（实测）。**这类"换个目录跑一次就红"的门禁比没有门禁更糟**，
      它会训练贡献者去跳过检查。
    - `rollupOptions` 在类型上已标 deprecated（vite 8 由 rolldown 驱动，改名 `rolldownOptions`）。
      实测两种写法产出**逐字节相同**，所以改名不改产物，只是不把管线押在一个随时可能被移除的别名上。
    顺带一条同形状的坑：`internal/build` 最初带一个 `build` 脚本，于是被 turbo 拉进构建图——它既重复
    了每个包自己的构建，又因为 turbo 的 `outputs: ["dist/**"]` 在它的目录下恒为空而**缓存命中时报成功、
    实际不产出任何文件**。改名 `build:all` 让它留在图外，`pnpm build` 现在是干净的 3 个任务。

16. **只校验"写了的字段"，等于奖励"不写"**。A2 把 `main`/`module`/`types` 变成发布面之后，我给契约 3
    加的是"这几个字段指向的文件必须存在、必须是 `./` 相对路径"，跑绿就收了。但它的循环第一行是
    `if (value === undefined) continue`——**三个字段全不写，检查面直接是空集**。这条盲区不是假设：
    `packages/tokens` 就是这么发的，`main`/`module`/`types` 一个都没有（只有 `exports`），
    而它的 `dist/index.cjs`、`dist/index.js`、`dist/index.d.ts` 三份产物都在库里躺着。
    新契约 12 因此不问"你写了什么"，而问"`exports["."]` 的条件要求你写什么"：
    `main`/`module`/`types` 必须逐字等于 `require`/`import`/`types` 的目标，条件存在而字段缺席就违反；
    `dist/umd` 里有产物就必须声明 `unpkg`/`jsdelivr` 且指向其中的文件（CDN 的裸包名 URL 靠这两个字段
    定位默认文件，否则那趟 legacy 构建对 `<script>` 用户等于没发生）。
    期望值全部从清单自己推出来，没有逐包白名单——白名单会在第四个人加进来时变成第二张需要维护的表。
    **六种破坏都实测过红绿**：字段缺失（tokens 三条，就是这条门禁上线时的第一手证据）、
    形状不合法（`main` 丢掉 `./`）、指向不存在的文件（`unpkg`）、
    **指向一个真实存在但不是 `require` 目标的文件**（`main` 改指 `dist/es/index.js`——这是契约 3
    结构上永远看不见的缺陷，文件存在、路径合法，只有两张脸不同源）、
    有 UMD 却不挂 `unpkg`、`unpkg` 挂到 `dist/umd` 外面。
    两条**无效探针**也记在这里，因为它们比有效探针更说明问题：
    第一条把 `office-ui-i18n.js` 改成 `office-ui-i18N.js` 想造"文件不存在"，在 NTFS 上没红——
    这两个名字是**同一个文件**，`existsSync` 返回 true 是正确行为；
    第二条把 `main` 指到 `dist/index.js` 想造"存在但不同源"，而那个路径根本不存在，
    于是它测到的是契约 3 而不是 12（`&&` 链在 `ls` 失败处断掉，退出码 2 来自 `ls` 而不是门禁）。
    **规矩补一句**：破坏性探针在跑之前要先验证自己改出来的值*确实*处在被测维度上——
    以为在测 A 实际在测 B 的绿，比没有测更糟。
    两条口径要说清楚：**"webpack4 / Jest 用户命中 `main`"是按打包器的文档化解析规则推出来的**，
    本机没有 webpack 4，这条没有实测（与 `attw` 同一档）；`packages/tokens` 与 `packages/shared`
    至今**没有 UMD 产物**，所以它们对无构建器的全局变量消费者仍缺一整张脸，
    要不要补（以及 tokens 是否只需要 CSS 那条路）归 A2 余下部分与负责人决策。

---

## 0. 前置阻塞（未解决不得开工）

| # | 阻塞项 | 为什么阻塞 M0 | 需要谁 |
|---|---|---|---|
| B1 | 命名空间 `oj` / `--oj-*` / npm scope `@jitoffice` 是否确认 | token 变量名与 class 前缀是 M0 的**直接产物**，一旦产出 CSS 就写死了 | 你 |
| B2 | ~~浏览器基线~~ **已拍板（2026-10-09）：legacy 线 floor = Chromium 86，方案 C** | 不再阻塞 A2：`modern`/`legacy` 两趟构建与 `@layer` / `color-mix()` / `text-autospace` / `EyeDropper` 的降级判断都按 86 配置。**仍缺的是可实测的内核清单**（360 / 红莲花 / 奇安信 / 麒麟 ESR 各自版本号，以及 Firefox ESR 78 是否真在范围内）——floor 是个数字，不是一个能装的环境 | 你 → 交付方 |
| B3 | 默认主题的书面权属确认（`NOTICE` 待办 #4） | M0 会产出并发布第一版 token 表，其中含从 JitWord 实测取来的色值 | 你 + 设计方 |
| B4 | 图标是否由内部设计承接，还是外包 | M0 要交付 40 个图标，这是设计产能问题不是工程问题 | 你 |

B2 已拍板。**B1 / B3 / B4 仍挂着**，都是**一天内可定却决定 M0 全部产出**的决策。其中 B1 的代价只会随时间上涨：`oj` / `--oj-*` / `@jitoffice` 已经写进 163 个变量名、产物 CSS、ADR-0001 与全部包的 `package.json`，而那条 ADR 自己标的是"首次公开 npm 发布后不可回退"——要改就是现在改最便宜。

---

## 1. 任务拆解

### 轨道 A：仓库与工程化

#### A1 工作区初始化 · 1.5d
- `pnpm-workspace.yaml`：`packages/*`、`docs`、`playground`、`internal/*`；`catalog:` 统一版本；`minimumReleaseAge: 1440`。
- Turborepo：`build` `dev` `lint` `test` `typecheck` 任务与依赖图，`outputs` 缓存正确配置（`dist/**`）。
- TS：`tsconfig.base.json` + 各包 project references；`verbatimModuleSyntax`、`isolatedModules`。
- ESLint / Prettier / simple-git-hooks / commitlint（Conventional Commits）。
- **验收**：`pnpm i` 在干净环境可复现；`pnpm turbo run build` 二次执行全部命中缓存。

#### A2 构建管线（两趟） · 3d ⚠️ 关键路径 — **第一切片已落地（两个纯 TS 包）**
转译目标按 §0 B2 的结论固定为两趟：`dist/es` + `dist/cjs` = **ES2022**（modern），
`dist/umd` + `dist/locale/*.js` = **ES2018**（legacy，floor = Chromium 86；取 ES2018 而不是 ES2020
是因为 Firefox ESR 78 不支持逻辑赋值，见 ADR-0002）。

**已落地并实测**：
- `internal/build`：ESM（`preserveModules`）、CJS（与 ESM 同一趟、`formats: ['cjs']`）、
  types（`tsc --emitDeclarationOnly`）、UMD 四条链；一趟 = 一个产物目录，串行跑。
- `exports` 映射（`types`/`import`/`require` 三条件 + `unpkg`/`jsdelivr` + 四条 `./locales/*`）。
  契约 10 现在禁止任何 `exports` 目标以 `./src/` 开头（故意改回源码形态已实测会红）。
- **兼容线语法门禁**：`es-check es2018 "packages/*/dist/umd/**/*.js" "packages/*/dist/locale/**/*.js"`
  （ADR-0002 的配套动作）。实测扫 5 个文件通过；`?.`/`??` 在 legacy 产物里 0 处、modern 里 4 处。
- **产物同源门禁**：`pnpm build:check` 把源码重建进临时目录，与入库 `dist` 逐字节比对。
- **验收已过的三条**：UMD 在 Node 里以 CJS/AMD/全局三种形态加载都有用例，含"空 `node:vm` 里
  两个 `<script>` 文件靠全局完成一次日文取值"；`preserveModules` 用深路径 `require` 锁住；
  构建确定性用三种不同 cwd 产出逐字节相同的四棵树锁住。

**原先列在这里的五条，实际状态（2026-10-30 复核）**：
- `packages/ui` 脚手架：**已落地**（35 个组件 + demo + 样式链），但**没有走 SFC**——
  组件一律 `.ts` + 渲染函数 `h()`，所以 `@vitejs/plugin-vue` 与 `vue-tsc` 至今没装，
  `typecheck` 用的是 `tsc --noEmit`。这条差异是事实而不是欠账：仓库里 `.vue` 文件数为 0，
  真引入 SFC 时必须同时补 `vue-tsc`，否则 `.vue` 里的模板错误一路漏到产物。
- **样式入口单独一趟 `treeshake: false`**：已落地，产物在 `dist/styles/`。
- CSS 双产物：**已产出** `office-ui.css` 与 `office-ui.layered.css`。
- UMD external `vue`：**已验**——`dist/umd/office-ui.js` 里 `__v_isRef` / `Vue warn` /
  `currentInstance` / `effectScope` 全部 0 处（grep 结果），71 KB / 137 KB 两个文件。
- 断言"逐组件 style 入口仍含 CSS 引用"：**按 ADR-0003 不成立**（只发一份 CSS，没有
  逐组件入口可被摇掉）。风险换了方向，由 `pnpm lint:styles` 双向守（组件用到的 block 必须有
  规则、样式表里的 block 必须有人用），见 DoD #3。
- `attw`：**已接入并真跑过**，即 `pnpm lint:types`（四种解析模式），见 A3 一行。

**这里原先列的两件也已补上（2026-10-30）**：`IconRegistry`（运行时注册业务图标，见 C1 行）与
单图标 ≤1 KB gzip 的 size-limit 断言（`.size-limit.jsonc` 四条之一，实测 836 B）。

#### A3 CI 流水线 · 2d
- `pull-request.yml`：lint → typecheck → unit（含覆盖率阈值）→ build → size-limit → lint:package → lint:types → lint:license → **字号/时延魔法数**（`lint:css-magic`，2026-10-30 自研接入，零依赖）→ **产物外链 URL 扫描**（`lint:artifact-offline`，同日）。**唯一未守的仍是间距/圆角魔法数**：token 标度（4/8/12/16/20/24/32/40、4/6/8/12/20/9999）覆盖不了样式表里真实的 2px / 7px / 28px / 56px，需要先定标度，硬塞会静默改版式。
- `release.yml`：changeset version → build → provenance → npm publish → GitHub Release。
- `preview.yml` → **落地为 `docs.yml`**：文档站构建 + 组件文档生成物 `--check` + 产物离线扫描 +
  上传 artifact（下载后可内网自托管）。**不做在线部署**：托管目标（Pages / 内网静态服务 / 对象存储）
  未定，且"内网自托管"是本项目的定位——写死 Pages 在内网环境里跑不通，还会替使用方做决定。
- **验收**：故意引入一个 GPL 依赖 / 一个 `color: #fff` / 一个 `https://fonts.googleapis.com` 引用，三条 CI 分别失败且报错信息能定位到行。
  > 门禁不做"故意破坏"验证等于没有门禁。这一步不要省。

#### A4 ADR 流程 · 0.5d
- 建 `docs/adr/`，模板见 §3。
- `ADR-0001`：命名空间与前缀策略（记录 B1 结论）。
- `ADR-0002`：浏览器基线与转译目标（记录 B2 结论）。
- `ADR-0003`：CSS 不做逐组件分包（02 §5.2 的反主流决策，必须留痕）。
- `ADR-0004`：零运行时依赖（02 §3）。
- **验收**：4 份 ADR 合入；`CONTRIBUTING.md` 说明"何种改动需新开 ADR"（判据：影响公开 API、包结构、产物格式、依赖面、浏览器支持范围之一者必须写）。

#### A5 仓库治理文件 · 0.5d
- `CONTRIBUTING.md`（环境要求、分支、changeset 要求、ADR 触发条件、图标贡献规范）
- `CODE_OF_CONDUCT.md`（Contributor Covenant）
- `SECURITY.md`（漏洞报告渠道 + 支持版本表）
- `.github/ISSUE_TEMPLATE/`：bug（强制要求复现 Playground 链接）/ feature / a11y 缺陷（单独模板，a11y 报告常被当普通 bug 淹没）
- `SUPPORT.md`（版本支持范围，避免无限支持承诺）
- 完善 `.gitignore`：补 `*.tsbuildinfo`（已有）、`.size-limit.json` 缓存、`docs/.vitepress/dist`（已有）、`NOTICE` 生成中间产物。

---

### 轨道 B：Tokens

#### B1 seed + 色板算法 · 2d
- `seed.ts` 唯一手写来源（01 §2）。
- `palette.ts`：HSL 亮度阶梯生成 1–10 档；第 6 档与 `--oj-brand-1`、`--oj-border-1` 按实测值硬钉。
- 单元测试：色板可复算、暗色索引镜像 `n → 11−n` 正确、钉值覆盖生效。
- **验收**：改 `seed.brandLight` 一个数，全部派生色板自动重算且测试通过。

#### B2 alias 层（light / dark / compact） · 2d
- 01 §3 全部变量落地，含 `--oj-z-*` 层阶与 `--oj-glass-*`。
- 选择器双写：`html[data-oj-theme="dark"], html.dark`。
- **对比度自动校验脚本**：遍历全部"前景/背景"配对，WCAG AA 不达标即构建失败（01 §8 第 3 条的前置）。
  - 已知会失败项：`--oj-text-4`（`#9A9CA6` on `#FFF` = 3.1:1）。需调深至 `#8A8C96` 以上，**并同步更新 01 文档的实测基线表**（这是"实测值"与"可用性"冲突的典型案例，结论是可用性赢，并在文档里注明偏离）。

#### B3 双产物生成器 · 2d ⚠️ 关键路径
- 从同一 `seed.ts` 产出：`index.css`（全量变量）、`themes/dark.css`、`themes/compact.css`、`index.js`（**已解析字面值**，不含 `var()`）、`index.d.ts`。
- JS 侧需完成 alias 展开（`--oj-bg-brand: var(--oj-brand-6)` → `bg.brand: '#165DFF'`）。
- **验收**：
  - 脚本比对 CSS 与 JS 的变量集合完全一致（数量与值），差异即失败。
  - `import { tokens } from '@jitoffice/tokens'` 后 `tokens.bg.container` 是 `#FFFFFF` 而非 `var(--oj-bg-container)`。
  - 禁止手写 `dist/index.js` **与 `dist/index.d.ts`**——CI 校验两者由生成器产出（产物新鲜度逐字节比对）。
    `OjTokens` 必须由注册表推导：写成索引签名时值与 CSS 全对得上，但用户侧拼错 token 路径不会报错（见偏差 11）。

#### B4 中英日字体与排版档 · 1d（**完成**）
- 语言覆写层的 token 部分（`font.sans`、`--oj-fs-14: 13px`、`--oj-lh-normal: 1.5715`、`--oj-letter-spacing: 0.02em`、繁体 `font.sans`）**已随 tokens 生成器落地**，选择器一律
  `html[lang|="…"]` 前缀匹配（01 §7；写成 `=` 会让带地区子标签的 `ja-JP` 整层落空）。
- **元素级重置层已落地**：`generate.ts` 的 `resetSection()` 发射 `html[lang|="ja"] body`
  （`line-break: strict`、`word-break: normal`、`text-underline-position: from-font`、`text-autospace: normal`）
  与 `html:not([lang|="ja"]) body`（`-webkit-font-smoothing: antialiased`）。
  `--oj-font-mono-cjk` 其实早就在注册表里（原文把它列为未完成是错的），`typography.test.ts` 补了断言防止被顺手删。
- `text-autospace` **不加** `@supports`（与 ADR-0002 的表述有出入，理由见偏差 10）。
- **验收**：`packages/tokens/test/typography.test.ts` 6 例 + 门禁 8 双向比对；
  计算样式已在 Chromium 150 实测（三种 `ja*` 标签全部命中、`not()` 作用域正确）。
  两条元素级规则**都已实测生效**：`line-break: strict` 改变了行末可落字符集
  （`auto`/`loose`/`normal` 都把半宽 `ゥ` 留在行末，`strict` 不出现——连 CSS 初始值 `normal`
  也不顶替它，所以这条声明删不得）；`text-autospace: normal` 对 `no-autospace`
  在 16px 混排样本上宽 `8.000px`（两处边界 × 0.25em），且该内核 UA 默认值就是 `no-autospace`。
  方法教训，两条都实际踩过：禁则移动的是**断点位置**不是行宽，标点压缩移动的是**字形在字身内的位置**
  不是字身盒位置——量容器或行盒尺寸只会得到假阴性；而对照用的声明值**必须先确认合法**，
  `text-autospace: none` 是无效关键字，拿它作对照等于自己跟自己比。
- **留给 B5 的验收**：三语各渲染一段测试文本，Playwright 快照 + 计算样式断言字体族首选项与行高符合预期；
  排版层剩下只能像素级验证的是 `text-spacing-trim` 的行首/行尾标点压缩（本轮的坐标量法看不见它）。
  字体族首选项**不能当硬门禁**：它取决于那台机器装了哪些字体，CI 与本机结果本就不同，
  只断言"首个可用族"或改为主张回退链末尾命中通用 sans 才可靠。
  并且**必须用带地区子标签的值**（`lang="ja-JP"`、`lang="zh-TW"`）验证覆写真的命中，
  只测 `lang="ja"` 抓不到 `=`/`|=` 这一类缺陷。

---

### 轨道 C：图标

#### C1 图标构建管线 · 2d
- 源：`packages/icons/svg/{name}.svg`（24×24 网格、1.5px 描边、`fill="currentColor"`）。
- 产出：Vue 组件（tree-shakable）、`sprite.svg`、`icons.ts` 常量（含 path 数据供 canvas）、`manifest.json`。
- SVGO 配置**不得**移除 `viewBox` 或改写 `fill`（canvas 消费方需要原始 path）。
- **验收**：`<use href="#oj-format-bold">` 在无构建器页面可渲染；`import { OjIconFormatBold }` 单独打包后 ≤ 1 KB gzip。

#### C2 首批 40 个图标 · 设计 5d / 工程 1d
覆盖 M1 的 Ribbon 必需集：字体（B/I/U/S、上下标、清除格式）、段落（左中右两端对齐、增加减少缩进、项目符号、编号、行距）、插入（表格、图片、图标、链接、批注、分页符）、视图（页面/Web/大纲、放大缩小、标尺）、文件（新建、保存、分享、打印、历史、下载）。
- **验收**：40 个图标在 16px 下肉眼可辨（Playwright 截图人工评审）；全部通过 SVGO 且无 `<image>`/`<filter>` 等位图依赖。
- ⚠️ 依赖 B4 决策。若设计产能不足，M0 先交付 20 个（仅 Ribbon 必需），40 推到 M1。

---

### 轨道 D：L1 首批组件

#### D1 命令注册表 · 3d ⚠️ 最高风险，最先写
- `register / unregister / get / list / run / bind / refresh`。
- `state()` 响应式订阅 + rAF 合帧 + 脏检查（03 §1）。
- `when(ctx)` 上下文过滤；`history` 三档（`undoable/transient/none`）。
- i18n key 解析（`label` 可为 `IntlMessage`）。
- **验收测试必须包含**（这几条是真实事故来源）：
  - 注册 200 个命令，模拟选区变化 1000 次，`state()` 实际调用次数 ≤ 命令数（验证记忆化生效）。
  - `run()` 抛错时不污染 `active` 状态。
  - 重复 `register` 同 id 在 dev 下告警、prod 下静默覆盖。
  - `history: 'none'` 的命令不出现在撤销栈（用一个 mock 栈断言）。

#### D2 `OjPortal` + `OjPopper` + `OjTrigger` · 4d ⚠️ 关键路径
- `OjPopper`：锚定**矩形**（不只是元素）、多区间包围盒、边界翻转、`strategy: fixed`、滚动容器内不抖动。
- `OjPortal`：`teleport` 目标可配、层级取 `--oj-z-*`、滚动锁、焦点陷阱、**关闭时归还焦点**（03 §8.2）。
- `OjTrigger`：`hover/click/focus/manual` 组合 + 离开延迟。
- SSR 安全：导入期零 DOM 访问。
- **验收**：
  - Playwright：在 `overflow: auto` 且已滚动的容器内，锚点元素在容器边缘时浮层正确翻转且不裁切。
  - 锚定一个 `{x,y,w,h}` 矩形（模拟选区）而非 DOM 元素，位置正确。
  - Nuxt/Ssr 模式构建无 warning、无 hydration mismatch。
  - 焦点：打开下拉 → `Tab` 不逃出面板 → `Esc` 关闭 → 焦点回到触发按钮（真实键盘操作验证）。

#### D3 `OjIcon` · 1d
- `name | component | size | spin | label`；`label` 缺失时 dev 告警（03 §5 第 5 条）。
- 三种消费形态（组件 / sprite `<use>` / canvas 常量）行为一致。
- **验收**：`<oj-icon name="oj-format-bold" />` 在无构建器页面可渲染；无 `label` 时控制台出现含组件路径的告警。

#### D4 `OjTooltip`（M0 只需最小版） · 2d
- 默认 400ms 延迟、`manual`、富内容插槽、走 D2 定位。
- **验收**：键盘 `Focus` 可唤出（不只是 hover）；快速划入划出 20 次不残留浮层节点（内存泄漏验证）。

---

## 2. M0 整体验收（Definition of Done）

**必须全部通过才算 M0 完成**，任一失败则 M1 不应启动：

1. **UMD 端到端**：一个纯静态 HTML（无构建器）用 `<script src>` 引 `vue.global.prod.js` + `office-ui.min.js` + 两个 CSS，渲染出带 tooltip 的图标按钮，**且控制台无 Vue 编译缺失警告**。
2. **Tree-shaking 实测**：`import { OjIcon } from '@jitoffice/ui'` 经 Vite 构建后产物 gzip ≤ 8 KB（size-limit 断言，非人工估算）。
3. **样式不丢**：按需引入路径下组件有样式（A2 的断言脚本进 CI）。
4. **命令状态一致**：同一命令分别渲染在按钮与 tooltip 文案中，改变 mock 状态后两处同步，且只触发一次重渲染。
5. **token 同源**：CSS 与 JS 变量集合一致性校验通过。
6. **门禁可失败**：A3 的三条"故意破坏"验证各自让 CI 红。
7. **零运行时依赖**：`packages/ui` 的 `dependencies` 为空对象，脚本断言。
8. **ADR-0001~0004 已合入**，B1/B2 决策有正式记录。

---

## 3. ADR 模板

```markdown
# ADR-NNNN: {标题}

- 状态：Proposed | Accepted | Superseded by ADR-MMMM
- 日期：YYYY-MM-DD
- 决策人：{名字}

## 背景
什么问题、为什么现在必须决定。

## 备选方案
列出真实考虑过的方案（≥2），各自代价。禁止只写被选中的那个。

## 决策
选了什么。

## 后果
正面 / 负面 / 需要配套的工程动作。
特别标注：这是可回退还是不可回退决策。若不可回退，说明未来若要改的迁移路径。

## 证据
引用实测数据、上游源码位置、benchmark 结果。不接受"某大库也这么做"作为唯一依据。
```

**为什么 M0 就要建 ADR**：本套设计文档里有若干**与主流相反**的决策（CSS 不分包、暗色靠索引镜像、零运行时依赖、token 双产物）。这类决策半年后一定会被人问"为什么不按需引样式？"——没有 ADR，答案会变成某个人凭记忆解释，然后被重新推翻，返工一次的成本就是几周。ADR 的作用是**给未来的反对者一个成本最低的说服路径**。

---

## 4. 排期与依赖

```
周1  A1 ─┬─ A2 ─────┐
    B1 决策 ─┘        │
周2  B2 决策 ── B3 ───┼── D1 ──┐
周3  C1 ── C2(设计并行)│        ├── M0 验收
周4  D2 ──────────────┘        │
周5  D3 D4 ── A3 A4 A5 ────────┘
```

- **关键路径**：`B1/B2 决策 → A2 构建管线 → B3 双产物 → D2 浮层底座`。
- D1（命令注册表）与 D2 可并行，分给不同人。
- C2 图标是唯一可被"推迟到 M1"而不阻塞验收的路径——把它设计成可插拔。
- 总计：工程约 **26 人日**（2 人 × 2.5 周），设计 5–10 人日（取决于 B4）。

**与 03 §6 的 2 周 M0 估算的差异说明**：原文档按"周"估里程碑，未计入 A3/A4/A5 治理工作与 B 系列决策等待。26 人日 ÷ 2 人 ≈ 2.6 周，加上决策等待，**建议对外承诺 3 周**。宁可第一周就把工期说准——M0 延期是组件库项目最常见的信誉损失。
