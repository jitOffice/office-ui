# office-ui

> A set of out-of-the-box Office component libraries that make it easy to build various office applications.
> 一套开箱即用的 Office 组件库，轻松构建各种办公类应用。

**状态 / Status: 外壳已可演示，尚未发布.** The design-token, i18n and command-registry packages
(`@jitoffice/tokens` / `i18n` / `shared`) are landed. `@jitoffice/ui` now renders an office shell
(tabs, dialog, search, zoom, file tree, rulers, watermark, signature, stamp, AI dock) on top of the
command bridge, and ships the no-bundler line too: `dist/umd/office-ui.js` (Vue layer, global `Vue`
externalised) plus framework-free `office-ui-core.js`, and two stylesheets
(`office-ui.css` / `office-ui.layered.css`). Nothing is published to npm yet.
Design docs are below — 当前仓库包含 M0 地基与产品/架构设计文档，见下方 [设计文档](#设计文档-design-docs)。

English | [简体中文](#简体中文)

---

## Why

Building a web-based document / spreadsheet / presentation app means rewriting the same layer over and over: the ribbon, the table-grid picker, the color and font pickers, the ruler and zoom chrome, comment threads, version history, the command palette.

General-purpose libraries (Element Plus, Arco Design Vue, TDesign, Naive UI) are designed for admin dashboards — forms, tables, dialogs. Document engines (Univer, OnlyOffice) ship their own UI that serves their own kernel. **The layer in between is empty.** That is what `office-ui` fills.

```
admin dashboard          office interaction layer         document engines
Element Plus      →      【 office-ui 】          ←       Univer / OnlyOffice
Arco Design Vue                                    (we integrate, we don't compete)
```

## Highlights (planned)

- **Vue 3 + TypeScript**, zero runtime dependencies, Apache-2.0.
- **Command registry as the keystone** — one command definition drives the ribbon, context menu, keyboard shortcut, command palette, undo history and script API, with no state drift between them.
- **Design tokens emitted twice** (CSS variables *and* a resolved JS object) because canvas-rendered grids and rulers cannot read CSS variables at 60fps.
- **Works everywhere**: ESM with tree-shaking, CJS for SSR, UMD for `<script>` tags, plus an imperative and a declarative (`data-oj`) API for jQuery-era projects.
- **zh-CN / zh-TW / ja-JP / en-US** first-class, including the Japanese typography details every mainstream library currently misses.
- **Offline-capable by default** — no external CDN, no Algolia, no Google Fonts, no StackBlitz. Built for intranet and 信创 deployments.

## Design docs

| Doc | Covers |
|---|---|
| [prd/README.md](./prd/README.md) | Index, requirement → design mapping, open questions |
| [prd/00-product-positioning.md](./prd/00-product-positioning.md) | Positioning, competitive boundary, license red lines, non-goals |
| [prd/01-design-tokens.md](./prd/01-design-tokens.md) | Three-tier tokens, palette algorithm, theme axes, CJK typography |
| [prd/02-engineering-architecture.md](./prd/02-engineering-architecture.md) | Monorepo, build output matrix, UMD/no-build usage, quality gates |
| [prd/03-component-system.md](./prd/03-component-system.md) | Command system, API conventions, 45-component inventory, roadmap |
| [prd/04-docs-site-and-i18n.md](./prd/04-docs-site-and-i18n.md) | Docs site, self-hosted playground, search, locale pack shape |

## Planned install

```bash
npm install @jitoffice/ui @jitoffice/tokens @jitoffice/icons
```

```ts
import { createApp } from 'vue'
import '@jitoffice/tokens/style.css'
import '@jitoffice/ui/style.css'
import { OjButton, OjTableGridPicker } from '@jitoffice/ui'
```

Package names and the `oj` namespace are **not yet frozen** — see [open questions](./prd/README.md#需要你拍板的开放问题).

## Related projects

- [JitWord](https://jitword.com) — collaborative document editor whose visual language seeds our default theme.
- [JitKnow](https://know.jitword.com) — enterprise AI knowledge base.

The first adopter of `office-ui` will be these two products.

## Contribute

Governance files are in place: [CONTRIBUTING.md](./CONTRIBUTING.md),
[the ADR process](./docs/adr/README.md), [CODE_OF_CONDUCT.md](./CODE_OF_CONDUCT.md),
[SECURITY.md](./SECURITY.md), [SUPPORT.md](./SUPPORT.md).

Everything checkable today runs **without `node_modules`** — required for air-gapped and 信创
environments, where "install dependencies before you can verify" is no verification at all:

```bash
pnpm verify    # tokens:gen → i18n:gen → node --test → 9 structural contract checks
pnpm typecheck # needs node_modules; tsc over all three packages
```

The type layer earns its place: `dist/index.d.ts` was once a hand-written index signature that
passed every runtime case while offering consumers no typo checking at all. Only `tsc` caught it,
so the emitted types are now derived from the token registry and compared against it.

Issue templates: **bug** (a reproduction link is mandatory), **a11y** (its own template —
accessibility reports get buried when filed as ordinary bugs), **feature**.

## License

[Apache License 2.0](./LICENSE). See [NOTICE](./NOTICE) for upstream copyright and license notices.

---

## 简体中文

`office-ui` 是一套面向 Office / WPS 类场景的 Vue 3 组件库。

**它不做后台管理组件，也不做文档引擎内核。** 它做的是所有办公应用都要重写一遍的那层交互外壳：Ribbon 功能区、表格网格选择器、颜色与字体拾取器、标尺与缩放、批注与审阅面板、版本历史、命令面板。

用通用组件库做办公应用，最终会写出几百行 `:deep()` 样式覆盖——因为 Ribbon 里的按钮要求 24px 高、图标主导、按下后保持 active、Tooltip 延迟 400ms 且可键盘唤出，这些差异无法靠主题配置弥合。而文档引擎自带的 UI 又只服务于它自己的内核。

**当前进度**：设计文档在 `prd/`（含 [E1 执行计划](./prd/06-e1-execution.md)）。**M0 地基已落地**——`packages/tokens`（163 个变量 → 6 个产物）、`packages/i18n`（87 个 key × 四语一致）、`packages/shared`（命令注册表）、`packages/icons`（31 枚自绘图标：`svg/*.svg` 手写源 → 常量 / 每图一个 Vue 组件 / `sprite.svg` / `manifest.json`）。**`packages/ui` 外壳已可演示**：标题、引用、列表、代码块、分隔线和表格命令、31 枚自绘图标、表格框选，以及 Ribbon 功能区与工具条（含溢出降级与组启动器）、右键菜单（可按 canvas 坐标弹出）、状态栏、快捷键、选项卡、弹窗、查找替换、缩放、文件树、标尺、水印、签名、印章和 AI 侧栏。节点扩展对齐 [Tiptap Nodes](https://tiptap.dev/docs/editor/extensions/nodes)：段落、标题、引用、列表、代码块、硬换行、分隔线和图片共用 name / group / content / parseHTML / 命令 / 输入规则。命令桥仍然只调用编辑器自己的 `commands.*`。`@jitoffice/ui/vue` 上共 34 个组件（含 `OjPortal` 与 `OjTrigger`，另有 `OjLocaleProvider` + `useLocale` 与语言切换器 `OjLocaleSwitcher`：切语言会把 `html[lang]` 一起带过去，tokens 的语言覆写层才跟得上）。**兼容线也已打通**：`dist/umd/office-ui.js`（Vue 层，`vue` 作为全局外部依赖）与 `office-ui-core.js`（框架无关入口，产物里一处 `vue` 都没有），样式双产物 `dist/styles/office-ui.css` 与 `office-ui.layered.css`（后者把同一批规则放进 `@layer oj-ui`，供现代浏览器压特异性）。验证：218 个零依赖用例 + 14 条契约检查 + `tsc` 0 error + 三条视觉车道（排版 / 无构建器 / sprite）+ 四条体积阈值（`pnpm size`，gzip：`{ OjIcon }` 2.02 kB / 单枚图标 836 B / 全量 ESM 10.53 kB / CSS 3.23 kB）+ 一条 Vitest 车道（`pnpm test:unit`，142 例，**带覆盖率阈值**：组件行 92.88% ≥ 85、注册表 100% ≥ 95、`usePopper` 96.66% ≥ 95）+ 样式双向门禁（`pnpm lint:styles`，32 个组件 block 都有规则、35 个样式 block 都有使用者）+ 字号/时延魔法数门禁（`pnpm lint:css-magic`）；`.github/workflows/pull-request.yml` 已落地「零依赖链」与「类型 + 产物同源」两条 job，`build` 里串 `size → lint:package → lint:types → lint:license → lint:css-magic → lint:artifact-offline`，另有 `docs.yml` 构建文档站并上传可自托管的 artifact。无构建器场景有可跑的证据：`examples/no-bundler/index.html` 用两个 `<link>` + 两个 `<script>` 引 `vue.global.js` 与 UMD 产物，`packages/ui/test/visual/no-bundler.spec.ts` 在 Chrome 151 实测渲染、tooltip、框选与控制台零告警（换成 runtime-only 构建则白屏超时，正是 02 §4.1 那条坑）；`pnpm test:visual`（turbo）一次跑 tokens 的排版 3 例与 ui 的 2 例。文档与表格内核不在这个仓库里。**文档站骨架已上线**（`pnpm --filter @jitoffice/docs dev`）：VitePress + `theme-without-fonts`（不引 Google Fonts）、样式直接引自家 tokens/ui 产物、毛玻璃按 `@supports` + `prefers-reduced-transparency` 双条件降级，`pnpm lint:docs-offline` 扫产物保证零外联资源；35 份组件 API 表（Props / `--oj-*` 变量 / `oj.*` 文案 key）由源码扫描生成，`pnpm lint:docs` 守新鲜度（组件文档 + 搜索索引，字节级比较）——手写文档一定漏。`/playground/` 是自托管的沙箱 iframe（`allow-scripts`、UMD 运行时、高度跟随内容），真浏览器里验证过能改代码并交互。**搜索是自建的**：构建期用 bigram 分词器（`docs/.vitepress/search/tokenize.ts`）建 `docs/public/search/index.json`，客户端 `MiniSearch.loadJSON` 复原，`Ctrl+K` / `/` 唤起——中文"表格"能命中"表格选择器"，`OjButton` 与 `button` 命中同一批页面（VitePress 内置本地搜索的分词函数没法通过 `themeConfig` 传进去，这也是自建的原因）。**无构建器也有第二条路**：`OfficeUI.create('oj-table-grid-picker', { anchor, props, on })` 命令式创建（返回 `setProps` / `destroy`），`OfficeUI.hydrate()` 扫描 `[data-oj]` 声明式挂载（认 `data-oj-props` 的 JSON 与 `data-oj-prop-*` 逐属性写法），`OfficeUI.configure({ i18n })` 让这些独立实例与页面同一语言。`examples/no-bundler/` 是真跑过的样例，34 个组件名都在 `OfficeUI.components` 里。**业务图标不必 fork**：`registerIcon('acme-logo', markup)` 在运行时注册，`OjIcon` 的查表优先命中，注册期就拒绝 `oj-*` 前缀、缺 `viewBox`、多根 `<svg>`、内联事件/`<script>`/`javascript:`/外链（组件用 `innerHTML` 渲染，放过一条就是注入面）。**发布流水线已就绪**：changesets 两段式——合并进 `main` 后由 `release.yml` 开 Version Packages PR，合并它才 `npm publish`（带 provenance）。改发布包源码不写 changeset 会当场红（`pnpm lint:changeset`），发布前还会真打一遍包检查 tarball（`pnpm lint:package`：无 `src` 泄漏、`catalog:` 已解析、五个入口文件都在）。**尚未开始**：图标产能（管线已就绪，31/120 枚）、M1 组件；首个版本等 B3 主题权属的书面确认。里程碑见 [prd/03-component-system.md §6](./prd/03-component-system.md)。

**许可**：Apache-2.0。所有依赖限定为 MIT / Apache-2.0 / BSD / ISC / OFL，图标一律自绘且只发 SVG（不发图标字体，避免字形许可被静默合并），字体仅捆绑 OFL 许可字族。合规清单见 [prd/00-product-positioning.md §4](./prd/00-product-positioning.md)。

## 贡献

治理文件已落地：[`CONTRIBUTING.md`](./CONTRIBUTING.md)（环境要求、TS 严格开关的实际影响、
token/文案/图标的具体规范、ADR 触发条件）、[`docs/adr/`](./docs/adr/README.md) 决策留痕、
[`CODE_OF_CONDUCT.md`](./CODE_OF_CONDUCT.md)、[`SECURITY.md`](./SECURITY.md)、
[`SUPPORT.md`](./SUPPORT.md)，以及 `.github/ISSUE_TEMPLATE/` 下的 bug / a11y / feature 三份模板。

门禁与测试**不需要装依赖就能跑**：`pnpm verify`（Node 24 原生类型剥离直接执行 `.ts`）。
装上依赖后再加 `pnpm typecheck`——推 PR 前两条都要跑，类型层只有 `tsc` 能看住。
设计阶段的意见请直接提到 [开放问题](./prd/README.md#需要你拍板的开放问题) 上。

## 许可与致谢

本项目采用 Apache License 2.0。第三方组件的许可与版权归属见 [`NOTICE`](./NOTICE)。
