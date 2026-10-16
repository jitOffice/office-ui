# office-ui

> A set of out-of-the-box Office component libraries that make it easy to build various office applications.
> 一套开箱即用的 Office 组件库，轻松构建各种办公类应用。

**状态 / Status: E1 已落地，尚未发布.** The design-token, i18n and command-registry packages
(`@jitoffice/tokens` / `i18n` / `shared`) are landed. `@jitoffice/ui` now has the command bridge,
table-grid picker and horizontal-rule adapter; nothing is published to npm yet.
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

**当前进度**：设计文档在 `prd/`（含 [E1 执行计划](./prd/06-e1-execution.md)）。**M0 地基已落地**——`packages/tokens`（163 个变量 → 6 个产物）、`packages/i18n`（44 个 key × 四语一致）、`packages/shared`（命令注册表）。**E1 已落地** `packages/ui`：三条命令（加粗 / 分隔线 / 插入表格）、表格框选、浮层与 Tooltip 延迟，以及 `@jitoffice/ui/vue` 上的六个组件。验证：89 个零依赖用例 + 契约检查 + `tsc` 0 error。**尚未开始**：`packages/icons` 图标管线、文档站与 CI。里程碑见 [prd/03-component-system.md §6](./prd/03-component-system.md)，E1 范围见 [prd/06-e1-execution.md](./prd/06-e1-execution.md)。

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
