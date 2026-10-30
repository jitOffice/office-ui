# ADR-0002: 浏览器支持基线与转译目标

- 状态：**Accepted**（2026-10-09 负责人拍板：信创按硬约束处理，legacy 线内核 floor = Chromium 86）
- 日期：2026-10-09
- 决策人：仓库负责人
- 仍开放：目标内核的**具体版本清单**（见"需要业务侧确认的点"第 2 条）——floor 已定，可实测的列表还没拿到
- 可回退性：难回退（影响产物数量与 CSS 架构）

## 背景

JitWord 的卖点是"支持主流浏览器和国产浏览器、企业内网、私有化部署"，因此本库可能被要求覆盖信创环境内核（360 安全浏览器为 Chromium 86 分支、麒麟自带 Firefox ESR 78）。

但基线一旦取到 Chromium 86，代价会扩散到整个 CSS 架构：`@layer`（Chromium 99+/Safari 15.4+）、`color-mix()`（Chromium 111+）、`text-autospace`（Chromium 140+）、`backdrop-filter`（Firefox 103+）、`EyeDropper`（Chromium 95+）全部不可直接用，且 `:focus-visible`、`aspect-ratio` 等在 ESR 78 上需 polyfill。

**单一基线是伪命题**：取低则现代用户承担无谓的降级实现成本，取高则丢掉信创市场。

## 备选方案

| 方案 | 优点 | 代价 |
|---|---|---|
| A. 单一基线 Chromium 86（最保守） | 一份产物通吃 | 全站 CSS 不能用 `@layer`/`color-mix()`，特异性战争只能靠 `!important` 或加倍选择器；约 +15% 工程量且**永久**拖累后续每个组件 |
| B. 单一基线 Chromium 100+（最激进） | 架构最干净 | 直接放弃信创承诺，与产品线定位冲突 |
| **C. 双轨：现代 ESM + 兼容 UMD**（选定） | 现代路径享受完整 CSS 能力；兼容成本被隔离在单独产物里 | 多一套构建目标与一份 CSS；测试矩阵翻倍 |

## 决策

采用方案 C，两条独立产物线：

| 产物 | 目标 | 语法 | 允许的 CSS 能力 |
|---|---|---|---|
| `dist/es/`、`dist/cjs/` | 有构建器的现代项目 | **ES2022** | `@layer`、`color-mix()`、`:has()`、顶层 await 之外的全部 |
| `dist/umd/`、`dist/styles/office-ui.css` | 信创 / 无构建器 / 老内核 | **ES2018** | 不使用 `@layer`；`backdrop-filter`、`text-autospace`、`EyeDropper` 一律 `@supports` 包裹并给出降级值 |

**关键约束：两条线的视觉结果必须一致**，差异只允许出现在"能力缺失时的降级表现"（如玻璃退回不透明底）。由 `prd/01` §8 的 12 组视觉回归在两个 target 上各跑一遍来保证。

> 上表里 `text-autospace` 这一项在 B4 落地时被实测否掉了"给出降级值"的要求：它没有替代值，
> 老内核丢弃声明的后果只是中日韩↔拉丁混排少插 0.25em 间隙，不会产生错误排版，
> 所以 tokens 产物直接发裸声明、两条线共用（理由与数字见 `prd/01` §7、`prd/05` 偏差 10）。
> B2 已拍板（floor = Chromium 86），事后确认这条**没有进双产物的实现成本**——tokens 只发一份 CSS，
> 真正需要分叉的是 `@layer` 与 `backdrop-filter`。

`@layer` 的处理方式：主样式表**不依赖** `@layer` 也能正确工作（即特异性设计本身要站得住），`office-ui.layered.css` 只是给现代用户提供"用户样式天然覆盖组件样式"的额外便利。这样 `@layer` 是增强而非前提——避免它变成兼容线的阻塞项。

## 后果

**正面**：现代项目不为老内核付账；信创承诺保住了；`@layer` 不进入核心架构依赖，降低未来回退成本。

**负面**：
- 构建配置从 1 套变 2 套，CI 时长增加约 40%。
- 测试矩阵需要真的装一个 Chromium 86 与 Firefox ESR 78 才能验证，Playwright 需配 `channel` 或自建 docker 镜像。`channel` 这条路已经在 `packages/tokens/playwright.config.ts` 里打通（`OJ_BROWSER_CHANNEL=chrome|msedge`）：它本来就是为老内核矩阵准备的，现在也用来在拉不到 `cdn.playwright.dev` 的机器上跑同一批断言。
- 文档必须写清"引哪个文件对应哪条线"，否则会出现"我引了 layered 版但内核不支持"的工单。

**配套动作**：
- ~~`internal/build` 拆 `modern` / `legacy` 两个 target~~ **已落地（2026-10-09，A2 第一切片）**：
  `internal/build/src/specs.ts` 里两个常量 `MODERN_TARGET = 'es2022'` / `LEGACY_TARGET = 'es2018'`，
  由 vite 的 `build.target` 承担降级（这一处不配 `browserslist`，也不走 esbuild：转译发生在
  rolldown 的 transform 里）。legacy 只给 `dist/umd` 与 `dist/locale/*.js`，modern 给 `dist/es`/`dist/cjs`。
- ~~CI 增加 `es-check es2018`~~ **已落地**：`pnpm --filter @jitoffice/internal-build check:legacy`，
  实际 glob 比原计划宽——`packages/*/dist/umd/**/*.js` **和** `packages/*/dist/locale/**/*.js`，
  因为语言包同样是给 `<script>` 用的。实测 5 个文件通过；`es-check` 对空 glob 退出码 1，
  所以这条不会因为"没匹配到文件"而静默通过。`attw` 已于 2026-10-30 接入并真跑过
  （`pnpm lint:types`，四种解析模式全绿；未接入前五个包全部 `Masquerading as ESM`）。
- 文档"安装"页第一屏给出选择表（M1）。

## 需要业务侧确认的点

1. ~~信创环境是否真的是**销售硬承诺**？~~ **已回答（2026-10-09）**：按硬约束处理，legacy 线 floor 取
   Chromium 86，方案 C 成立。因此 A2 的两趟构建（`modern` / `legacy`）不再是可选优化，而是交付前提。
   接受的具体后果：在这个 floor 上 `@layer`（99+）与 `text-autospace`（140+）**必然不被支持**，
   前者靠"主表不依赖 layer"的设计吸收，后者按 `prd/01` §7 的实测——中日韩↔拉丁混排少插 0.25em，
   排版不会错，但没有替代值可给。
2. 若确认要做，具体内核版本清单是什么（360 安全浏览器 / 红莲花 / 奇安信 / 麒麟 Firefox ESR 各自的版本号），需要一份能实测的目标列表——**没有真实环境的兼容承诺是无法验证的口号**。floor 已定，但**这条仍未解决**：Chromium 86 是分支号而非可下载的构建，本机也没有任何 ≤ 140 的 Chromium 可跑，兼容线的断言目前一条都验证不了（A3 的 CI 需要 docker 镜像而不是 `channel`，见"后果·负面"）。

## 证据

- 特性可用性（除注明者外均为规划阶段的登记值，**逐条未复核，拍板前须回源确认**）：
  `@layer` Chromium 99 / Safari 15.4 / Firefox 97；`color-mix()` Chromium 111 / Safari 16.2 / Firefox 113；
  `EyeDropper` Chromium 95。
  `text-autospace` **已复核（2026-10-09，caniuse/MDN）：Chrome 与 Edge 140、Firefox 145、Safari 18.4**，
  Baseline 状态为"2025 年 11 月起广泛可用"——原先登记的 127 是错的，它比 `@layer`、`color-mix()`
  都晚得多，因此对信创老内核而言它属于**必然不被支持**的一条。
- 本机实测补充（Chromium 150 / Electron 43）：`text-autospace` 只接受 `normal` 与 `no-autospace`
  两个关键字，规范里的细分值（`ideograph-alpha` 等）会被整条丢弃；UA 默认值是 `no-autospace`。
  数字与量法见 `prd/01` §7。
- Element Plus 与 Arco 均在 `html` 上全局应用 `-webkit-font-smoothing: antialiased`，未做语言作用域划分（`prd/01` §7 记录了这对日文的负面影响），说明"照抄大库"在细节上并不可靠，需自行验证。
- 参考：`prd/02-engineering-architecture.md` §4.4、`prd/01-design-tokens.md` §7。
