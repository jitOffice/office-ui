# ADR-0001: 命名空间与前缀策略

- 状态：Accepted
- 日期：2026-10-09
- 决策人：架构负责人（Qoder 代拟，待确认）
- 可回退性：**不可回退**（首次公开 npm 发布后）

## 背景

本库需要三类前缀：CSS 自定义属性（`--??-*`）、class（`??-button`）、Vue 组件（`Oj??`）、npm scope（`@??/`）。它们在第一次发布后即成为公开契约——用户会手写 `--oj-button-bg` 覆写主题、会用 `.oj-ribbon__group` 写业务样式。改名等于强制所有用户做迁移。

`prd/02` §9 把这条列为"改错代价最高"的第 2 项，M0 的 token 产出直接依赖它，因此必须在写第一行构建配置前定下。

## 备选方案

| 方案 | 优点 | 代价 |
|---|---|---|
| **A. `oj` / `--oj-` / `Oj` / `@jitoffice`**（选定） | 短（用户手写覆写时字符成本最低）；`oj` 与既有库前缀（`el` `arco` `t` `n` `ant`）无冲突；npm scope 与 GitHub org 一致 | `oj` 无语义，需靠文档建立认知 |
| B. `office` / `--office-` | 语义自解释 | `--office-button-bg` 过长，用户手写量大时明显累赘；`.office-` 易与业务系统里"办公室/工位"相关 class 撞名 |
| C. `jit` / `--jit-` | 与产品线品牌强绑定 | 把项目锁死在 jitOffice 品牌上；社区贡献者与外部企业用户对此无感，且 `jit` 在 JS 生态里已易与 JIT 编译概念混淆 |
| D. 提供可配置前缀（Arco 的 `@arco-vars-prefix` 构建期旋钮） | 灵活性最高 | Arco 实际几乎无人使用；配置化会让每份 CSS 都要跑两遍构建，且文档里每个变量名都要写成占位符 |

## 决策

采用方案 A：

- CSS 变量：`--oj-{类别}-{语义}-{状态}`
- class：`oj-{block}__{elem}--{mod}`（BEM）
- Vue 组件：`Oj` 前缀，模板中 `<oj-button>`
- npm scope：`@jitoffice/*`
- 全局 UMD 变量：`OfficeUI`（完整词，避免 `OJ` 与业务代码撞名）；命令式 API 短别名 `OJ.create()`

**前缀不提供运行时配置**（`prd/01` §4 已记录：Element Plus 的 `useNamespace` 能运行时换 class，但编译产物里的 `--el-*` 是字面量换不掉——五家没有一家解决了"运行时可换的变量命名空间"）。构建期旋钮同样不做，直到有真实需求。

## 后果

**正面**：变量名短，用户手写覆写成本低；与主流库零冲突；`@jitoffice` scope 与 org 一致，无需额外申请。

**负面**：`oj` 无语义，新用户第一眼不知其意——用文档首页与变量表注释弥补。

**配套动作**：
- `internal/lint` 增加规则：源码中出现的 `--(?!oj-)` 与 `\b(?!oj-)(el|arco|td|ant|van)-` 一律告警，防止误抄上游变量名。
- `NOTICE` 与文档首页注明前缀含义。
- 未来若真要支持构建期换前缀，属向后兼容的扩展（默认值不变），不破坏本决策。

## 证据

- 上游 class/变量前缀实测：`--el-*`（Element Plus）、`--arco-*` 与 `--arcoblue-*`（Arco）、`--td-*`（TDesign）、`--van-*`（Vant）。均与 `--oj-*` 无冲突。
- Arco 的前缀旋钮实现位置：`packages/web-vue/components/style/theme/global.less` 中 `@arco-vars-prefix` 与 `@arco-cssvars-prefix`。
- Element Plus 运行时命名空间的局限：`element-plus/es/hooks/use-namespace/index.mjs` 只影响 class 生成，CSS 产物为字面量。
- 参考：`prd/01-design-tokens.md` §3、§4；`prd/02-engineering-architecture.md` §9。
