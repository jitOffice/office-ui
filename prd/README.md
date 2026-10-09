# office-ui 架构与产品设计

对 `prd/base.md` 七项需求的设计响应。站在架构师与产品视角，聚焦"现在定错、以后改不动"的决策。

## 已确认的三条前提

| 决策 | 结论 |
|---|---|
| 组件库边界 | **分层**：L1 办公交互外壳（零重依赖）+ L2 文档/表格/演示外壳（可选内核适配） |
| 底座策略 | **完全自研**，参考主流范式但不依赖任何通用组件库；零运行时依赖 |
| 交付物 | 本套架构设计文档集 |

## 文档索引

| 文档 | 内容 | 关键结论 |
|---|---|---|
| [00-product-positioning.md](./00-product-positioning.md) | 定位、竞品边界、许可红线、非目标、风险 | 只做"通用组件库"与"文档引擎"之间的空白区；第一个采用者必须是 JitWord/JitKnow 自己 |
| [01-design-tokens.md](./01-design-tokens.md) | 三层 token、色板算法、主题维度、中英日视觉差异 | 以 jitword.com 实测值为事实来源；token 必须双产物（CSS + JS）供 canvas 使用 |
| [02-engineering-architecture.md](./02-engineering-architecture.md) | Monorepo、四套产物、两趟样式构建、UMD/jQuery、按需引入、质量门禁 | CSS 不做逐组件分包（与 Element Plus 相反的决策）；样式入口必须单独一趟 `treeshake:false` 构建 |
| [03-component-system.md](./03-component-system.md) | 命令系统、API 规范、45 组件清单、a11y、六期路线图、各组硬工程问题 | 命令注册表是全库基石；`OjTableGridPicker` 作为架构样板组件 |
| [04-docs-site-and-i18n.md](./04-docs-site-and-i18n.md) | 文档站视觉、Playground、搜索、语言包形状、消息文法与日文细节 | "内网可自托管"优先级高于一切，故否决 StackBlitz 与 Algolia；一语言一对象（含 `intl` 标签与 `tokenLang` 档位），并构建期生成 `IntlKey`/`IntlValues` 类型表 |
| [05-m0-delivery-plan.md](./05-m0-delivery-plan.md) | M0 可执行任务拆解、前置阻塞项、Definition of Done、排期与依赖 | 四条契约（token 双产物、命名空间、构建两趟、命令注册表）必须在 M0 钉死；工期对外建议承诺 3 周而非 2 周 |

## 调研依据

上述结论中的工程选型部分，经过一次针对 `element-plus` `@arco-design/web-vue` `naive-ui` `tdesign-vue-next` `ant-design-vue` `vant` `vue-devui` 的实证比对，证据取自 **npm registry 的 `license` 字段与实际 dist 产物**（`package.json`、`es/**`、`dist/*.css`、构建脚本），而非文档描述。视觉基线部分取自 `jitword.com` 与 `know.jitword.com` 的运行时 `getComputedStyle` 抓取。

调研推翻或修正了初稿的四处判断，均已回改并标注在正文：

1. **图标不产出字体**（原稿写了"字体（jQuery/老项目）"）——图标字体会静默合并各字形许可并丢失许可文件。见 00 红线 2、03 §3A。
2. **暗色模式采用色板索引镜像**（原稿同时写了"不反转 Seed"与"索引镜像"，自相矛盾）。见 01 §4。
3. **样式入口必须单独一趟构建**，否则压缩后组件无样式。见 02 §2.1。
4. **无构建器场景必须用含编译器的 Vue 全局构建**，否则 `template:` 字符串静默空白。见 02 §4.1。

## 需求 → 设计映射

| base.md 需求 | 落点 |
|---|---|
| 1 参考 jitword / jitknow 风格 | 01 §0 实测基线表（`#165DFF` `#151515` `#6C6F7D` `#E8ECFF` 圆角 4-6-8-10-12-20 `blur(40px)`）；04 §2 文档站沿用同一 token |
| 2 统一 Design Token + 中英日 | 01 全文；01 §7 语言驱动的视觉参数；04 §6 语言包与类型安全 |
| 3 文档站蓝白毛玻璃 + 搜索 + 在线预览 | 04 §2 视觉、§3 自托管 iframe Playground、§4 本地索引 + CJK bigram 搜索 |
| 4 企业级，参考主流组件库设计 | 03 §2 统一 API 规范与命名禁止清单；02 §7 质量门禁；03 §5 无障碍与键盘模型 |
| 5 围绕 office/wps 场景 | 03 §1 命令系统、§3 组件清单（Ribbon/选择器/审阅/网格外壳）；00 §2 空白区论证 |
| 6 Vue3 + 商用无风险 | 00 §4 许可矩阵（明确排除 AGPL 的 OnlyOffice、双许可的 CKEditor）；02 §3 零依赖策略；02 §7 许可 CI 卡关 |
| 7 UMD/CJS + jQuery + tree-shaking | 02 §2 产物矩阵、§4 三种接入路径（UMD / `OJ.create` / `data-oj` 水合 / importmap）、§5 tree-shaking |
| 初步组件：图标 / 按钮 / 表格选择器 | 03 §3 A/B/C 组；03 §4 `OjTableGridPicker` 专项设计；03 §6 M0-M2 前三期即覆盖 |

## 需要你拍板的开放问题

前四项是 **M0 开工阻塞项**（详见 [05 §0](./05-m0-delivery-plan.md#0-前置阻塞未解决不得开工)）——它们决定 M0 的直接产出物，一天内可定，但不定就没法写第一行构建配置。

| # | 问题 | 为什么阻塞 |
|---|---|---|
| **B1** | **命名空间 `oj` / class 前缀 `oj-` / npm scope `@jitoffice`** 是否确认？ | token 变量名与 class 前缀是 M0 的产物本身，产出 CSS 后即写死 |
| **B2** | **信创兼容基线**：~~Chromium 86 + Firefox ESR 78，还是放宽到 Chromium 100+？~~ **已拍板（2026-10-09）：legacy 线 floor = Chromium 86，走双轨** | 转译目标与 `@layer` / `color-mix()` / `backdrop-filter` / `text-autospace` / `EyeDropper` 的降级判断都按 86 配置；`text-autospace`（140+）在这一层必然失效，已接受。**仍缺一份可实测的内核版本清单**——floor 是数字，不是能装的环境（见 [ADR-0002](../docs/adr/0002-browser-baseline.md)） |
| **B3** | **默认主题的书面权属确认** | 本库 token 以 JitWord/JitKnow 实测值为种子。模仿视觉风格不侵权，但**发布含这些色值的 token 表**需要设计方书面确认（已在 `NOTICE` 待办 #4 标为 OUTSTANDING） |
| **B4** | **图标由内部设计承接还是外包？** | M0 要交付 40 个图标，这是设计产能问题不是工程问题。若不足，建议 M0 先 20 个、40 推到 M1 |

后两项可延后，但会影响对外承诺：

5. **L2 是否承诺？** 文档按"承诺但独立版本、允许长期 beta"处理。若 v1 只做 L1，可整体删掉 M4/M5，工期从 31 周压到 17 周。
6. **图标 120 个自绘**是 M0–M2 的最大单项工作量（估 3–4 周全职设计）。是否已有设计规范或设计师资源？
7. **第一个被改造的 JitWord/JitKnow 页面选哪个？** 建议 JitKnow 顶栏——结构简单、玻璃效果现成，且能一次验证 token + Popper + Tooltip + 命令注册表四件套。

## 建议的下一步

1. 你 review 本套文档，重点看 00 §4 许可矩阵、03 §6 路线图与 05 §2 的 DoD 是否符合实际资源。
2. 解掉 B1–B4（B1/B2 建议直接落成 `ADR-0001` / `ADR-0002`，见 05 §3）。
3. 按 [05-m0-delivery-plan.md](./05-m0-delivery-plan.md) 开工 M0。第一块砖选 `OjTableGridPicker` 打通全链路（token → 组件 → i18n → 文档站 → UMD），因为它能在最小面积上同时压测五套体系。
