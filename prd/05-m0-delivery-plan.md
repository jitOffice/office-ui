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
   `typecheck → build → build:check`。另有 `visual.yml`（定时 + 手动）跑排版回归。
   **卡点**：stylelint / license-checker / size-limit / attw 四个门禁的依赖都还没进 catalog，
   `release.yml` 要先有 changesets 与 B3 的书面确认，两者都没有落地，所以没有写——写一个跑不起来的
   流水线比没有更糟。

当前 **107 个零依赖用例、14 条契约检查**通过；`tsc` 在五个包里 0 error；`build:check` 三个包逐字节同源。
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

**M0 八条 DoD 的现状**（哪条过了、哪条只是"产物有了但没验"）：

| # | DoD | 状态 |
|---|---|---|
| 1 | UMD 端到端，控制台无编译缺失警告 | **✅ 已过**：Chrome 151 本地跑通 + `packages/ui` 的 Playwright 用例守着，`visual.yml` 每日跑 |
| 2 | tree-shaking 后 gzip ≤ 8 KB（size-limit 断言） | ❌ 依赖未进 catalog |
| 3 | 按需引入下组件样式不丢 | ⚠️ 契约 13 守住了"样式变量都存在于 token 表"，没有 size/覆盖率断言 |
| 4 | 同一命令渲染在两处只重渲染一次 | ❌ 未验证（注册表侧有合帧用例，"两处渲染"没有） |
| 5 | token CSS/JS 同源 | ✅ 契约 4 + `parity` 用例 |
| 6 | 门禁可失败（三条故意破坏让 CI 红） | ⚠️ 契约 13/14 与图标门禁都实测红过；CI 层仍未跑过 |
| 7 | `ui` 的 `dependencies` 为空 | ✅ 契约 1 |
| 8 | ADR-0001~0004 已合入 | ✅ |

**结论没变**：M0 仍未完成，卡在 #2 / #4 / #6。但"能装依赖"这个前置**已经解除**——
本机换上 Node 24.14 + pnpm 12.5.1 后，`pnpm verify` / `pnpm typecheck` / `pnpm build:check` 三条链
**首次真正跑起来并全绿**（此前它们只被逐段手工验证过）。剩下的是三条都还没写的东西：
size-limit 与 license-checker 的依赖未进 catalog（#2）、"同一命令渲染两处只重渲染一次"没有用例（#4）、
CI 上的"故意破坏"未实跑（#6）。

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
| A3 CI 流水线 | **部分落地**（2026-10-26） | `.github/workflows/pull-request.yml`：`verify`（零依赖，**不 install**）与 `build`（typecheck → build → build:check）两条 job，末尾用 `git status --porcelain` 卡住"改了源码忘记提交生成物"。`visual.yml` 定时 + 手动跑 B5 排版回归。**未接入**：stylelint 魔法数、license-checker 白名单、size-limit 体积、attw 双解析——四个依赖都还没进 catalog；`release.yml`（changesets + provenance + publish）与 `preview.yml`（文档站预览）分别在等 changesets 依赖与文档站本体。**未验证**：本机没有 Actions runner，Workflow 只做过 YAML 解析与命令存在性校验，"故意破坏让 CI 红"这条验收仍未实跑。 |
| C1 图标构建管线 | **未开始** | 现有 29 枚图标是 `packages/ui/src/icons.ts` 里的内联 SVG 字符串，没有 `packages/icons` 包、没有 `sprite.svg`、没有 `manifest.json`。C1 是工程活，不依赖 B4；B4 只挡 C2（谁画那 40 枚）。 |
| C2 首批 40 图标 | **未开始 · 等 B4** | 设计产能决策没定。当前 29 枚覆盖 E1/E2 用到的命令，不足以铺满 M1 的 Ribbon。 |
| D2–D4 浮层与图标 | **部分落地** | `OjPopper` 的定位纯函数（`placePopper`，含边界翻转与夹取）＋ `OjTooltip`（400ms 延迟状态机）＋ `OjIcon` 已在 `@jitoffice/ui/vue`，且都有用例。**缺**：`OjPortal`（现在没有任何 `Teleport`）、`OjTrigger` 的 hover/click/focus/manual 组合、焦点陷阱与"关闭归还焦点"、SSR 下零 DOM 访问的验收。 |

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

**仍未开始**（都挂在 `packages/ui` 上）：
- `packages/ui` 脚手架与 SFC 链（`vue` + `@vitejs/plugin-vue` + `vue-tsc`）。
- **样式入口单独一趟 `treeshake: false` 构建**（02 §2.1）。
- CSS 双产物：`office-ui.css`（无 `@layer`）与 `office-ui.layered.css`。
- UMD 把 `vue` 设为 external 且产物里不含 Vue 源码（grep 校验）。
- 断言脚本：取 `dist/es/components/icon/style/css.js` 产物，正则检查其中仍含 `.css` 引用
  → **防止发布后组件无样式**。
- `npx attw` 对 ESM/CJS 双解析无 error。（顺带记一句实测：`attw` 这个包名在 registry 上
  按我在本机的查询取不到，所以这一条**至今没有真跑过**，别当成已过。）

#### A3 CI 流水线 · 2d
- `pull-request.yml`：lint → typecheck → unit → build → size-limit → license → stylelint 魔法数 → **产物外链 URL 扫描**。
- `release.yml`：changeset version → build → provenance → npm publish → GitHub Release。
- `preview.yml`：PR 预览部署文档站。
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
