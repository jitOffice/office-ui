# ADR-0003: CSS 不做逐组件分包

- 状态：Accepted
- 日期：2026-10-09
- 决策人：架构负责人（Qoder 代拟，待确认）
- 可回退性：**可回退**（增加 `exports` 子路径即可，向后兼容）

## 背景

主流 Vue 组件库都提供逐组件样式入口，用户按需引入时只加载用到的 CSS：

- Element Plus：`element-plus/es/components/button/style/css` 与 `.../style/index`（两种口味，前者引编译后 CSS，后者引 SCSS 供定制主题者用）
- Arco：`es/button/style/css.js`
- Vant：每组件目录内直接放 `index.css`

需求 7 要求 tree-shaking，直觉上样式也该跟着分。

## 备选方案

| 方案 | 优点 | 代价 |
|---|---|---|
| A. 逐组件样式分包（对齐主流） | 理论包体最小；符合用户从 Element Plus 带来的预期 | 需维护组件间样式依赖图；自动导入与手动导入混用时样式重复/丢失；SSR 注入顺序不可控 |
| **B. 两份 CSS，一次引入**（选定） | 心智模型极简；无依赖图；特异性顺序天然确定 | 全量 CSS 约 16 KB gzip，用户即使只用 3 个组件也要全引 |
| C. 运行时注入（Naive / antd-vue 的 cssinjs） | 天然按需 | 破坏三项硬需求：独立 `.css` 文件（`<script>` 场景）、打印样式、canvas 读 token；且 CSP 严格环境需 nonce 配置 |

## 决策

采用方案 B：

```ts
import '@jitoffice/tokens/style.css'   // ~4 KB gzip，必需，含全部变量
import '@jitoffice/ui/style.css'       // ~12 KB gzip，全部组件样式
```

**并在文档里诚实写明**："本库 JS 支持 tree-shaking，CSS 不支持逐组件分包，因为总量已小于拆分收益。"

## 理由（为什么收益小于成本）

本库与 Element Plus 的关键差异是：**所有视觉都来自 `@jitoffice/tokens` 的共享变量层**。

1. 用户只要用到任何一个组件，就必然需要完整 token 表（约 4 KB）——这部分**无法拆分**，是固定成本。
2. L1 全部 45 个组件的样式总量约 12 KB gzip。逐组件拆分最多省下其中未被使用的那部分，**上限收益约 10 KB**。
3. 而成本是：`OjRibbon` 依赖 `OjTooltip` 与 `OjPopper` 的样式、`OjDropdownButton` 依赖面板样式、`OjTableGridPicker` 依赖 `OjGallery` 样式……这张依赖图需要**人工维护**，且每新增一个组件都要更新一次。
4. 更现实的代价是 issue 面：Element Plus 的"按需引入后样式丢失"类工单长期存在，根因几乎都是自动导入（`unplugin-vue-components`）与手动 `import '.../style/css'` 混用导致的重复或遗漏。方案 B 从结构上消灭这一整类工单。

10 KB 换一张永久维护的依赖图 + 一类长期工单，不划算。

## 后果

**正面**：无样式依赖图；SSR 与 UMD 场景样式行为完全一致；文档只需说"引两个文件"。

**负面**：只用 2-3 个组件的重度 tree-shaking 用户会觉得 CSS 偏大。可预期会有此类 issue。

**配套动作**：
- `size-limit` 把 CSS 预算写死（`tokens.css` ≤ 5 KB、`ui/style.css` ≤ 16 KB，gzip），超标即 CI 失败——**方案 B 的前提是样式总量真的受控**，一旦失控本决策就不成立了。
- 文档"按需引入"页明确解释这个取舍，不要等用户自己发现。

## 触发重估的条件

组件数超过 **80** 或全量 CSS 超过 **40 KB gzip** 时，重新评估拆分。届时通过 `exports` 增加 `./styles/*.css` 子路径即可，属**向后兼容的扩展**，不会破坏现有用户——这正是现在可以安全选择 B 的原因。

## 证据

- Element Plus 的两种样式口味实现：`element-plus/es/components/button/style/css.mjs`（引编译 CSS）与 `style/index.mjs`（引 SCSS），二者均列在其 `sideEffects` 数组中；`components/base/style/css.mjs` 的存在正是为了让所有组件复用同一份 token/根样式表。
- Element Plus 的 `sideEffects` 数组：`["dist/*","theme-chalk/**/*.css","theme-chalk/src/**/*.scss","es/components/*/style/*","lib/components/*/style/*"]`。
- 参考：`prd/02-engineering-architecture.md` §5.2。
