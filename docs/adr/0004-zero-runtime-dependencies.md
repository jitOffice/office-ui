# ADR-0004: 零运行时依赖

- 状态：Accepted
- 日期：2026-10-09
- 决策人：架构负责人（Qoder 代拟，待确认）
- 可回退性：难回退（一旦引入，移除即为破坏性变更）

## 背景

需求 6 要求"商用无风险"，需求 7 要求能在 `<script>`/jQuery 项目中使用。这两条共同决定了运行时依赖面的上限。

## 备选方案

| 方案 | 优点 | 代价 |
|---|---|---|
| A. 允许轻量工具依赖（`@popperjs/core`、`lodash-es`、`dayjs`、`@vueuse/core`） | 少写约 1500 行代码 | UMD 体积失控；许可审计面扩大；供应链风险面扩大 |
| **B. 零运行时依赖**（选定） | 审计面最小；UMD 可控；无版本冲突 | 浮层定位/虚拟滚动/快捷键/日期格式化全部自研 |
| C. 依赖 `@vueuse/core`（同为 MIT，Vue 官方推荐生态） | 质量高、维护活跃 | 它自身依赖树较大且部分能力面向通用场景；UMD 场景仍需打包进去 |

## 决策

采用方案 B。`packages/ui`、`packages/tokens`、`packages/icons`、`packages/i18n`、`packages/shared` 的 `dependencies` 字段**必须为空对象**，CI 脚本断言。`vue` 为 `peerDependencies`。

必须自研的能力（约 1500 行，含测试）：

| 能力 | 为什么不引现成的 |
|---|---|
| 浮层定位 | Popper.js 只锚定元素，办公场景需锚定**选区矩形**与多区间包围盒；且需 `strategy: fixed` 适配 canvas 滚动容器。引入后仍要 fork |
| 日期/数字/复数格式化 | 委托原生 `Intl`，无依赖。注意信创老内核 `Intl` 完整度需实测 |
| 深比较 / 节流 / 防抖 / 边界 | `shared/` 内约 200 行，比 `lodash-es` 的按需路径配置更简单 |
| 快捷键解析 | `'mod+shift+b'` 语法 + 平台映射 + 冲突检测 + 捕获阶段拦截，现成库均不覆盖 Windows 裸 `Alt` 被系统菜单吞掉这一情形（`prd/03` §8.2） |
| 虚拟滚动 | 需变高 + 锚点稳定（上方插入不跳动），通用库只解决等高/单变高 |

## 例外规则

允许进 `dependencies` 的例外：**无**。若某天必须引入，需新开 ADR，覆盖：许可证、完整传递依赖树、UMD 体积增量、以及"为什么自研成本更高"的量化说明。

**引擎类依赖的硬性边界**：任何编辑器引擎或重型渲染库（ProseMirror、表格引擎、Monaco、ECharts、katex）只能是某个独立 `@jitoffice/*` 包的 `peerDependencies`，永不进 UI 包的 `dependencies`。

## 后果

**正面**：许可审计面几乎为零；UMD 体积可控；用户不会遇到"组件库和你项目的 dayjs 版本冲突"；供应链风险面最小。

**负面**：
- 工程量真实增加约 1500 行 + 对应测试，这是 M0–M3 排期里的实际成本。
- 浮层定位与虚拟滚动是自研里最容易做不好的两块，且它们的 bug 会以"其他组件的行为异常"形式呈现，排查成本高。因此 `OjPopper` / `OjPortal` 的测试覆盖率门槛单独提到 95%（`prd/02` §7）。

**配套动作**：
- `internal/lint` 脚本断言五个包的 `dependencies` 为空。
- `license-checker --onlyAllow` 仍保留（防 devDependency 引入不合规许可证并被间接打包）。

## 证据

反面教材 `vue-devui`：`package.json` 的 `main` 直指 UMD 文件、**无 `exports`、无 `sideEffects`、无 `types`**，且 `dependencies` 含 `monaco-editor, echarts, codemirror, katex, mermaid, diff2html, rxjs, xss, markdown-it-*, fs-extra`。一个浏览器组件库把 `fs-extra` 与 Monaco 写成运行时依赖的结果是任何人装它都躲不掉这些引擎，按需安装变成不可能——这正是方案 A/C 的滑坡终点。

对比：`@element-plus/icons-vue` 的 `sideEffects: false` 且无运行时依赖，是图标包的正确形态。

参考：`prd/02-engineering-architecture.md` §3。
